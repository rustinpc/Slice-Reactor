var ServerActionCreators = require('../actions/ServerActionCreators');

module.exports = {
  getAllGraphData: function() {
    $.get('/userdata', function(data, textStatus, xhr) {
      if (xhr.status === 200 && data === 'empty') {
        window.location = './newuser';
      } else {
        if (xhr.status === 202) {
          module.exports.getUpdatedChartData();
        }
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
