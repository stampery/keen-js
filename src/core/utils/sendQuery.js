var request = require('superagent');

var getContext = require('../helpers/get-context'),
    getXHR = require('../helpers/get-xhr-object'),
    responseHandler = require('../helpers/superagent-handle-response');

module.exports = function(path, params, callback){
  var url = this.client.url(path);

  if (!this.client.projectId()) {
    this.client.trigger('error', 'Query not sent: Missing projectId property');
    return;
  }

  if (!this.client.readKey()) {
    this.client.trigger('error', 'Query not sent: Missing readKey property');
    return;
  }

  if (getContext() === 'server' || getXHR()) {
    if (typeof $ !== 'undefined' && 'ajax' in $) {
      $.ajax({
        method: 'post',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.client.readKey()
        },
        data: JSON.stringify(params || {}),
      }).done(function(data){
        handleResponse(null, data);
      }).fail(function(error){
        handleResponse(error, null);
      });
    } else {
      request
      .post(url)
        .set('Content-Type', 'application/json')
        .set('Authorization', this.client.readKey())
        .timeout(this.timeout())
        .send(params || {})
        .end(handleResponse);
    }
  }

  function handleResponse(err, res){
    callback(err, res);
    callback = null;
  }

  return;
}
