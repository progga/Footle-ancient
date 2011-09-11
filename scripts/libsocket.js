/*
suck -- A socket server library for mozilla/spidermonkey

These pages helped me out, when creating this library.
http://www.flaco.org/file/tags/0.2.8/html/js/jslib/network/socket.js
http://www.xulplanet.com/tutorials/mozsdk/sockets.php
*/
suck = {};

suck.Server = function(onconnect, port, binary) {
  this.onconnect = onconnect;
  this.port = port || 9000;
  this.binary = !!binary;
  this.serverSocket = null;
};

suck.Server.prototype.start = function() {
  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  if (this.serverSocket) {
    return;
  }
  this.serverSocket = Components.classes["@mozilla.org/network/server-socket;1"].createInstance(Components.interfaces.nsIServerSocket);
  this.serverSocket.init(this.port, false, -1);
  this.serverSocket.asyncListen(this);
};

suck.Server.prototype.stop = function() {
  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  if (!this.serverSocket) {
    return;
  }
  this.serverSocket.close();
  this.serverSocket = null;
};

suck.Server.prototype.restart = function() {
  this.stop();
  this.start();
};

suck.Server.prototype.onStopListening = function(serverSocket, status) {
  this.serverSocket = null;
};

suck.Server.prototype.onSocketAccepted = function(serverSocket, transport) {
  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  // todo: blocking/nonblocking?
  var ostream = transport.openOutputStream(0, 0, 0);
  var istream = transport.openInputStream(0, 0, 0);
  if (ostream && istream) {
    var connection = new suck.StreamConnection(istream, ostream, this.binary);
    var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
    pump.init(istream, -1, -1, 0, 0, false);
    this.onconnect(connection);
    pump.asyncRead(connection, null);
  }
};

suck.StreamConnection = function(inputStream, outputStream, binary) {
  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  this.binary = binary;
  if (this.binary) {
    this.inputInterface = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
    this.inputInterface.setInputStream(inputStream);
  } else {
    this.inputInterface = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
    this.inputInterface.init(inputStream);
  }
  this.inputStream = inputStream;
  this.outputStream = outputStream;
  this.listeners = [];
  this.onclose = function() {};
};

suck.StreamConnection.prototype.listen = function(callback) {
  this.listeners.push(callback);
};

suck.StreamConnection.prototype.close = function() {
  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  var trigger = this.outputStream || this.inputStream;
  if (this.outputStream) {
    this.outputStream.close();
    this.outputStream = null;
  }
  if (this.inputStream) {
    this.inputStream.close();
    this.inputStream = null;
  }
  if (trigger) {
    this.onclose();
  }
};

suck.StreamConnection.prototype.write = function(message) {
  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  this.outputStream.write(message, message.length);
  this.outputStream.flush();
};

suck.StreamConnection.prototype.onStartRequest = function(request, context) {};

suck.StreamConnection.prototype.onStopRequest = function(request, context, status) {
  this.close();
};

suck.StreamConnection.prototype.onDataAvailable = function(request, context, inStream, offset, count) {
  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
  var data;
  if (this.binary) {
    data = this.inputInterface.readBytes(count);
  } else {
    data = this.inputInterface.read(count);
  }
  for (var i=0; i < this.listeners.length; i++) {
    var listener = this.listeners[i];
    listener(data);
  }
};
