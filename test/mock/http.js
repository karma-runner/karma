var ServerResponse = function() {
  var headSent = false;
  var bodySent = false;

  this._headers = {};
  this._body = null;

  this._isFinished = function() {
    return headSent && bodySent;
  };

  this.setHeader = function(name, value) {
    if (headSent) {
      throw new Error("Can't set headers after they are sent.");
    }

    this._headers[name] = value;
  };

  this.removeHeader = function(name) {
    delete this._headers[name];
  };

  this.writeHead = function(status) {
    if (headSent) {
      throw new Error("Can't render headers after they are sent to the client.");
    }

    headSent = true;
  };

  this.end = function(body) {
    if (bodySent) return;

    bodySent = true;
    this._body = body;
  };
};

exports.ServerResponse = ServerResponse;
