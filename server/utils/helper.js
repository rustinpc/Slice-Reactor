var https = require('https');
var db = require('../db/sequelize');
var crypto = require('crypto');

// test if user is authenticated
var ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// make post request to Slice to renew accessToken
var sliceRefreshRequest = function(refreshToken, callback, userId) {
  var postData = {
    client_id: process.env.SLICE_CLIENT_ID,
    client_secret: process.env.SLICE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token' 
  };
  var apiPath = '/oauth/token?';
  for (var key in postData) {
    apiPath += '&' + key + '=' + postData[key];
  }
  var options = {
    host: 'api.slice.com',
    path: apiPath,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  var req = https.request(options, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      callback(JSON.parse(body), userId);
    });
  });

  // req.write(postData);
  req.end();

  req.on('error', function(e) {
    console.error(e);
  });
};

var saveUpdatedTokens = function(tokens, userId, callback) {
  var cipher1 = crypto.createCipher(process.env.CIPHER_ALGORITHM, process.env.CIPHER_KEY);
  var cipher2 = crypto.createCipher(process.env.CIPHER_ALGORITHM, process.env.CIPHER_KEY);
  var encryptedAccessToken = cipher1.update(tokens.access_token, 'utf8', 'hex') + cipher1.final('hex');
  var encryptedRefreshToken = cipher2.update(tokens.refresh_token, 'utf8', 'hex') + cipher2.final('hex');
  db.Users.find({where:{id: userId}})
    .then(function(user) {
      user.accessToken = encryptedAccessToken;
      user.refreshToken = encryptedRefreshToken;
      user.save().then(function() {
        // once new token is saved update the users data
        getUserData(userId);
      });
    });
};

// make api call for items to Slice
var sliceGetRequest = function(resourceType, accessToken, callback, userId, parameter, getRequestOrReq, response) {
  var apiPath = '/api/v1/' + resourceType;
  if (parameter) {
    apiPath += '?';
    for (var key in parameter) {
      apiPath += '&' + key + '=' + parameter[key];
    }
  }
  var options = {
    host: 'api.slice.com',
    path: apiPath,
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  };

  var req = https.request(options, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      callback(JSON.parse(body), userId, getRequestOrReq, response);
    });
  });
  req.end();

  req.on('error', function(e) {
    console.error(e);
  });
};

var createItemObject = function(rawItem, userId) {
  var processedItem = {"UserId": userId, "updateTime": rawItem.updateTime, "href": rawItem.href, "OrderHref": rawItem.order.href, "purchaseDate": rawItem.purchaseDate, "price": rawItem.price, "productUrl": rawItem.productUrl, "returnByDate": rawItem.returnByDate, "imageUrl": rawItem.imageUrl, "quantity": rawItem.quantity, "description": rawItem.description};
  if (rawItem.category) {
    processedItem["categoryName"] = rawItem.category.name;
    processedItem["CategoryHref"] = rawItem.category.href;
  }
  return processedItem;
};

var itemsHandler = function(items, userId, req, orderHrefs){
  db.Items.findAll({
   attributes: ['href'],
   where: {UserId: userId}
   }).complete(function(err, userItems) {
    var itemHrefs = {};
    var validItems = [];
    var invalidItems = [];
    if (userItems) {
      for (var i = 0; i < userItems.length; i++) {
        itemHrefs[userItems[i].href] = true;
      }
      for (var i = 0; i < items.result.length; i++) {
        if (!orderHrefs[items.result[i].order.href] || itemHrefs[items.result[i].href]) {
          invalidItems.push(createItemObject(items.result[i], userId));
        } else {
          validItems.push(createItemObject(items.result[i], userId));
          itemHrefs[items.result[i].href] = true;
        }
      }
    }
    if (validItems.length > 0) {
      db.Items.bulkCreate(validItems).then(function() {
        req.session.dataStatus = 'updated';
        req.session.newUser = false;
        req.session.save();
        // res.redirect('/');
        db.Users.find({where:{id: userId}}).then(function(user) {
          user.updateItems = items.currentTime;
          user.save();
        });
      });
    } else {
      req.session.dataStatus = 'notupdated';
      req.session.save();
      // res.redirect('/');
    }
    console.log('INVALID ITEMS: (', invalidItems.length,') ', invalidItems);
  });
};

var createOrderObject = function(rawOrder, userId) {
  var processedOrder = {"UserId": userId, "updateTime": rawOrder.updateTime, "href": rawOrder.href, "orderNumber": rawOrder.orderNumber, "orderDate": rawOrder.orderDate, "orderTitle": rawOrder.orderTitle, "orderTotal": rawOrder.orderTotal, "shippingCost": rawOrder.shippingCost, "orderTax": rawOrder.orderTax, "PurchaseTypeHref": rawOrder.purchaseType.href, "MerchantHref": rawOrder.merchant.href};

  return processedOrder;
};

var ordersHandler = function(orders, userId, getRequest, merchantHrefs) {
  var validOrders = [];
  var invalidOrders = [];
  db.Orders.findAll({
    attributes: ['href'],
    where: {UserId: userId}
    }).complete(function(err, userOrders) {
      var orderHrefs = {};
      if (userOrders) {
        for (var i = 0; i < userOrders.length; i++) {
          orderHrefs[userOrders[i].href] = true;
        }
        for (var i = 0; i < orders.result.length; i++) {
          if (!merchantHrefs[orders.result[i].merchant.href] || orderHrefs[orders.result[i].href]) {
            invalidOrders.push(createOrderObject(orders.result[i], userId));
          } else {
            validOrders.push(createOrderObject(orders.result[i], userId));
            orderHrefs[orders.result[i].href] = true;
          }
        }
      }
      if (validOrders.length > 0) {
        db.Orders.bulkCreate(validOrders).then(function() {
          getRequest(orderHrefs);
          db.Users.find({where:{id: userId}}).then(function(user) {
            user.updateOrders = orders.currentTime;
            user.save();
          });
        });
      } else {
        getRequest(orderHrefs);
      }
      console.log('INVALID ORDERS: (', invalidOrders.length,') ', invalidOrders);
    });
};

var merchantsHandler = function(merchants, userId, getRequest){
  var sequelizeInsert = merchants.result;
  var merchantHrefs = {};
  var newMerchants = [];
  db.Merchants.findAll().complete(function(err, existingMerchants) {
    if (existingMerchants) {
      for (var i = 0; i < existingMerchants.length; i++) {
        merchantHrefs[existingMerchants[i].href] = true;
      }
      for (var i = 0; i < sequelizeInsert.length; i++) {
        if (!merchantHrefs[sequelizeInsert[i].href]) {
          newMerchants.push(sequelizeInsert[i]);
          merchantHrefs[sequelizeInsert[i].href] = true;
        }
      }
      if (newMerchants.length > 0) {
        db.Merchants.bulkCreate(newMerchants).then(function(){
          getRequest(merchantHrefs);
        });
      } else {
        getRequest(merchantHrefs);
      }
    } else {
      db.Merchants.bulkCreate(sequelizeInsert).then(function() {
        getRequest(merchantHrefs);
      });
    }
  });
};

// decrypt access token and call function to make GET request of Slice API
var getUserData = function(userId, req, encryptedAccessToken) {
  var ordersGetRequestParameter = false;
  var itemsGetRequestParameter = false;
  var request = req || false;
  // response = res || false;

  db.Users.find({where: {id: userId}})
    .then(function (user) {
      encryptedAccessToken = user.accessToken || encryptedAccessToken;
      var decipher = crypto.createDecipher(process.env.CIPHER_ALGORITHM, process.env.CIPHER_KEY);
      var decryptedAccessToken = decipher.update(encryptedAccessToken, 'hex', 'utf8') + decipher.final('utf8');

      if (user.updateOrders && user.updateItems) {
        ordersGetRequestParameter = {since: user.updateOrders};
        itemsGetRequestParameter = {since: user.updateItems};
      }
      // Parameter argument handles since and limit, ie. {limit: 1, since: timeInMillisecondsSince1970}
      var itemsGetRequest = sliceGetRequest.bind(null, 'items', decryptedAccessToken, itemsHandler, userId, itemsGetRequestParameter, request);
      var ordersGetRequest = sliceGetRequest.bind(null,'orders', decryptedAccessToken, ordersHandler, userId, ordersGetRequestParameter, itemsGetRequest);
      sliceGetRequest('merchants', decryptedAccessToken, merchantsHandler, userId, false, ordersGetRequest);
    });
};

// decrypt refresh token, renew access token, and update data in database
var refreshUserAccessToken = function() {
  db.Users.findAll()
    .then(function (users) {
      var apiInterval = 0;
      users.forEach(function(user, key, collection) {
        var decipher = crypto.createDecipher(process.env.CIPHER_ALGORITHM, process.env.CIPHER_KEY);
        var decryptedRefreshToken = decipher.update(user.refreshToken, 'hex', 'utf8') + decipher.final('utf8');
        setTimeout(function() {sliceRefreshRequest(decryptedRefreshToken, saveUpdatedTokens, user.id);}, apiInterval);
        apiInterval += 15000; // space the API request for each user out by 15 seconds
      });
    });
};

module.exports.getUserData = getUserData;
module.exports.refreshUserAccessToken = refreshUserAccessToken;
module.exports.ensureAuthenticated = ensureAuthenticated;
