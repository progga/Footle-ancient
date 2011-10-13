
/**
 * Class file for the dbgp class.  Just as the name
 * suggests, this class can speak the dbgp protocol.
 *
 * @version 2011-10-13
 */


/**
 * Constructor.
 */
function dbgp(socket_obj)
{
    this.outreach = null;
    this.connection_obj = null;
    this.server_obj = null;

    this.server_obj =
        new socket_obj.Server(this.connection_handler_closure(), 9000, true);
}


/**
 * Open socket.  Get ready to receive connections from xdebug.
 */
dbgp.prototype.start = function()
{
    this.server_obj.start();
}


/**
 * Close socket.
 */
dbgp.prototype.stop = function()
{
    this.server_obj.stop();
}


/**
 * Setter method.
 */
dbgp.prototype.set_outreach = function(func)
{
    this.outreach = func;
}


/**
 * Callback method.  This is called by the server socket as soon
 * as the server has heard from xdebug.
 */
dbgp.prototype.connection_handler_closure = function()
{
    var orig_this = this;

    return function(connection_obj)
    {
        orig_this.connection_obj = connection_obj;
        orig_this.connection_obj.listen(orig_this.receptionist_closure());
    }
}


/**
 * Receives data from xdebug.  Passes on the data to the relevant method.
 */
dbgp.prototype.receptionist_closure = function()
{
    var orig_this = this;

    return function(data)
    {
        var command_parts = data.split("\0")
        var command_xml = command_parts[1].replace(
            /^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/, "");
        var response_xml = new XML(command_xml);

        orig_this.outreach(response_xml.toXMLString());
    }
}


/**
 * Sends a command to xdebug.
 */
dbgp.prototype.send = function(data)
{
    this.connection_obj.write(data);
}


