jest.dontMock('../chartHelpers');
jest.dontMock('react/lib/merge');

describe('chartHelpers', function() {
  var helper = require('../chartHelpers');
  describe('formatDonutChartData', function() {
    var filteredData = [{primaryLabel: "Electronics", price: 999 / 100},{primaryLabel: "Books", price: 899 / 100},{primaryLabel: "Household", price: 10099 / 100},{primaryLabel: "Payments", price: 399 / 100},{primaryLabel: "Travel", price: 1000087 / 100},{primaryLabel: "Electronics", price: 10002 / 100},{primaryLabel: "Other", price: 1499 / 100},{primaryLabel: "Movies", price: 799 / 100},{primaryLabel: "Restaurants", price: 199 / 100},{primaryLabel: "Rent", price: 1299 / 100}];
    it('returns an array of 2 arrays', function() {
      var response = helper.formatDonutChartData(filteredData);
      expect(Array.isArray(response)).toEqual(true);
      expect(Array.isArray(response[0])).toEqual(true);
      expect(Array.isArray(response[1])).toEqual(true);
      expect(response.length).toEqual(2);
    });
    it('both arrays are arrays of arrays', function() {
      var response = helper.formatDonutChartData(filteredData);
      expect(Array.isArray(response[0][1])).toEqual(true);
      expect(response[0][0][0]).toEqual('Travel');
      expect(response[0][1][1]).toEqual('110.01');
      expect(Array.isArray(response[0][0])).toEqual(true);
      expect(response.length).toEqual(2);
    });
  });

  // it('contains emitChange function', function() {
  //   expect(typeof GraphDataStore.emitChange).toEqual('function');
  // });

  // it('contains addChangeListener function', function() {
  //   expect(typeof GraphDataStore.addChangeListener).toEqual('function');
  // });

  // it('contains removeChangeListener function', function() {
  //   expect(typeof GraphDataStore.removeChangeListener).toEqual('function');
  // });

  // it('contains getData function', function() {
  //   expect(typeof GraphDataStore.getData).toEqual('function');
  // });

  // it('intializes with no graph data', function() {
  //   var graphData = GraphDataStore.getData();
  //   expect(graphData).toEqual({});
  // });

  // it('receives orders', function() {
  //   callback(ordersPayload);
  //   var orders = GraphDataStore.getData();
  //   expect(orders[0]).toEqual({foo: 'foo'});
  // });

});
