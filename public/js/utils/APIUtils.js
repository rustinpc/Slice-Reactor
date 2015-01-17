var ServerActionCreators = require('../actions/ServerActionCreators');

module.exports = {
  getAllGraphData: function() {
    module.exports.getUpdatedChartData();
    $.get('/userdata', function(data, textStatus, xhr) {
      if (xhr.status === 200 && data === 'empty') {
        window.location = './newuser';
      } else {
        ServerActionCreators.receiveAllChartData(JSON.parse(data));
      }
    });
  },
  getUpdatedChartData: function() {
    $.get('/updateuserdata', function(data, textStatus, xhr) {
      if (xhr.status === 202) {
        setTimeout(function() {module.exports.getUpdatedChartData();}, 2000);
      } else if (data !== 'empty') {
        ServerActionCreators.receiveAllChartData(JSON.parse(data));
      }
    });
  }
};
