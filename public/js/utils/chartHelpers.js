var lineChartProcessing = function(data) {
  var sliceDataMonthly = {};
  for (var i = 0; i < data.length; i++) {
    if (data[i].price > 0) {
      var purchaseDateArray = data[i].purchaseDate.split('-');
      var monthYear = purchaseDateArray[0] + '-' + purchaseDateArray[1] + '-01';
      if (!sliceDataMonthly[monthYear]) {
        sliceDataMonthly[monthYear] = data[i].price / 100;
      } else {
        sliceDataMonthly[monthYear] += data[i].price / 100;
      }
    }
  }
  lineChartData = [];
  for (var key in sliceDataMonthly) {
    var lineGraphItem = {};
    lineGraphItem['purchaseDate'] = key;
    lineGraphItem['price'] = sliceDataMonthly[key].toFixed(2);
    lineChartData.push(lineGraphItem);
  }
  return lineChartData;
};

var barChartProcessing = function(data) {
  var sliceDataByCategoryOrMerchant = {};
  for (var i = 0; i < data.length; i++) {
    if (data[i].price > 0) {
      var itemLabel = data[i].secondaryLabel;
      if (itemLabel === null) {
        itemLabel = 'Other';
      }
      if (!sliceDataByCategoryOrMerchant[itemLabel]) {
        sliceDataByCategoryOrMerchant[itemLabel] = data[i].price;
      } else {
        sliceDataByCategoryOrMerchant[itemLabel] += data[i].price;
      }
    }
  }
  barChartAll = [];
  for (var key in sliceDataByCategoryOrMerchant) {
    var barChartItem = {};
    barChartItem['categoryOrMerchantName'] = key;
    barChartItem['price'] = sliceDataByCategoryOrMerchant[key].toFixed(2);
    barChartAll.push(barChartItem);
  }
  barChartAll.sort(function(a, b) {
    return b.price - a.price;
  });
  barChartData = [];
  var barChartOther = {
    categoryOrMerchantName: 'All Others',
    price: 0
  }
  for (var i = 0; i < barChartAll.length; i++) {
    if (i < 6) {
      barChartData.push(barChartAll[i]);
    } else {
      barChartOther.price += parseFloat(barChartAll[i].price);
    }
  }
  if (barChartOther.price > 0) {
    barChartData.push(barChartOther);
  }
  return barChartData;
};

module.exports.lineChartProcessing = lineChartProcessing;
module.exports.barChartProcessing = barChartProcessing;
