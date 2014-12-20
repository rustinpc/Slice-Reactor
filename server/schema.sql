DROP TABLE sliceDatabase;

CREATE DATABASE sliceDatabase;

USE sliceDatabase;

CREATE TABLE users (
  userId int NOT NULL AUTO_INCREMENT,
  currentTime int,
  createTime int,
  firstName varchar(50) NOT NULL,
  lastName varchar(50) NOT NULL,
  href varchar(400),
  updateTime int,
  userEmail varchar(100) NOT NULL,
  userName varchar(100) NOT NULL,
  PRIMARY KEY (userId)
);

CREATE TABLE orders (
  orderId int NOT NULL AUTO_INCREMENT,
  currentTime int,
  createTime int,
  updateTime int,
  merchant int,
  href varchar(400),
  orderDate varchar(25),
  orderNumber varchar(100),
  orderTitle varchar(200),
  orderTotal int,
  shippingCost int,
  orderTax int,
  orderItems int,
  orderShipments int,
  purchaseType int,
  PRIMARY KEY (orderId)
);

CREATE TABLE items (
  itemsId int NOT NULL AUTO_INCREMENT,
  currentTime int,
  href varchar(400),
  createTime int,
  updateTime int,
  order int,
  FOREIGN KEY (order) REFERENCES orders(orderId),
  purchaseDate varchar(50), 
  price int, 
  priceHistory varchar(300),
  productUrl varchar(300),
  returnByDate null, 
  shipmentEmails varchar(100), 
  imageUrl varchar(400),
  quantity int,
  PRIMARY KEY (itemsId)
);

CREATE TABLE merchants (
  merchantId int NOT NULL AUTO_INCREMENT,
  updateTime int,
  href varchar(400),
  name varchar(100),
  createTime int,
  logoUrl varchar(400),
  serviceFormUrl varchar(400),
  serviceEmail varchar(100),
  servicePhoneNumber varchar(30),
  priceDropPolicyUrl varchar(400),
  returnPolicyUrl varchar(400),
  websiteUrl varchar(400),
  editable boolean,
  PRIMARY KEY (merchantId)
  );

CREATE TABLE categories (
  categoriesId int NOT NULL AUTO_INCREMENT,
  name varchar(100),
  PRIMARY KEY (categoriesId)
  );

CREATE TABLE productTypes (
  productId int NOT NULL AUTO_INCREMENT,
  name varchar(100),
  PRIMARY KEY (productId)
  );