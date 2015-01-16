// jest.dontMock('../chartHelpers');
// jest.dontMock('react/lib/merge');

var helper = require('../chartHelpers');

describe('chartHelpers', function() {
  describe('formatDonutChartData', function() {
    it('returns an array of 2 arrays', function() {
      var filteredData = {
        primaryLabel: "Electronics",
        secondaryLabel: "Amazon",
        price: 999 / 100,
        date: "2014-12-20"
      };
      var response = helper.formatDonutChartData(filteredData);
      expect(typeof response).toEqual('Array');
      expect(typeof response[0]).toEqual('Array');
      expect(typeof response[1]).toEqual('Array');
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
