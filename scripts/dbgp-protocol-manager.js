
/**
 * Class file for the dbgp class.  Just as the name
 * suggests, this class can speak the dbgp protocol.
 *
 * @version 2011-10-20
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
        // First part is command length, second part is command data.
        var command_parts = data.split("\0")

        // Get rid of the "<?xml version="..."?>" directive.  The XML class
        // cannot process it.
        var command_xml = command_parts[1].replace(
            /^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/, "");
        var response_xml = new XML(command_xml);

        var parsed_response = orig_this.parse_dbgp_xml(response_xml);
        var state_data =
          orig_this.determine_state_machine_state(parsed_response);

        orig_this.outreach(state_data);
    }
}


/**
 * Sends a command to xdebug.
 */
dbgp.prototype.send = function(data)
{
    this.connection_obj.write(data);
}


/**
 * Possible states - off-air, arrival, on-air, at-breakpoint, error, departure.
 *
 *
 * @param object response
 * @return object
 *    This object has two properties - 'state', and 'data'.
 */
dbgp.prototype.determine_state_machine_state = function(response)
{
    var state = {
        'name' : null,
        'data' : null,
    };

    if ('init' === response.name)
    {
        state.name = 'arrival';
    }
    else if ('response' === response.name && 'stopping' === response.status)
    {
        state.name = 'departure';
    }
    else if ('response' === response.name && 'stopped' === response.status)
    {
        state.name = 'off-air';
    }
    else if ('response' === response.name && 'break' === response.status)
    {
        state.name = 'at-breakpoint';
    }
    else if ('response' === response.name && response.error.length)
    {
        state.name = 'error';
        state.data = response.error;
    }

    return state;
}


/**
 * Parses XML data received from xdebug.
 */
dbgp.prototype.parse_dbgp_xml = function(dbgp_xml_obj)
{
    var result = {
        'name'           : null,
        'status'         : null,
        'transaction_id' : null,
        'reason'         : null,
        'command_id'     : null,
        'error'          : null,
    };

    result.name = dbgp_xml_obj.name().localName;

    if (dbgp_xml_obj.@command.length())
    {
        result.command = dbgp_xml_obj.@command.toString();
    }

    if (dbgp_xml_obj.@status.length())
    {
        result.status = dbgp_xml_obj.@status.toString();
    }

    if (dbgp_xml_obj.@transaction_id.length())
    {
        result.transaction_id = dbgp_xml_obj.@transaction_id.toString();
    }

    if (dbgp_xml_obj.@reason.length())
    {
        result.reason = dbgp_xml_obj.@reason.toString();
    }

    if (dbgp_xml_obj.@id.length())
    {
        result.command_id = dbgp_xml_obj.@id.toString();
    }

    if (dbgp_xml_obj.*::error.length())
    {
        result.error = dbgp_xml_obj.*::error.*::message.text();
    }

    return result;
}


