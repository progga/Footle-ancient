
/**
 * Debugger object that talks to a dbgp debugger.
 *
 * @version 2011-10-13
 */


/**
 * Debugger class.
 */
function debugger7()
{
    this.command_queue = [];
    this.command_counter = 0;
    this.protocol_manager = null;

    // Possible states - on-air, off-air, breakpoint
    this.current_state = 'off-air';
}


/**
 * Want to send any command to the debugger?  Give it to me.
 */
debugger7.prototype.queue_command = function(command, args)
{
    var command_data = { 'command' : command, 'args' : args };
    this.command_queue.push(command_data);
}


/**
 * Send a command to the debugger.
 */
debugger7.prototype.send_single_command = function(command)
{
    this.command_counter++;
    var dbgp_command = command + ' -i ' + this.command_counter;

    if (null !== this.protocol_manager)
    {
        this.protocol_manager.send(dbgp_command + "\0");
    }
}


/**
 * Send all queued commands to the debugger.
 */
debugger7.prototype.send_commands = function()
{
    var command = '';
    var dbgp_command = '';
    var args    = [];
    var command_data = {}

    while (command_data = this.command_queue.shift())
    {
        command = command_data.command;
        args    = command_data.args;

        dbgp_command = command + ' ' + args.join(' ');
        this.send_single_command(dbgp_command);
    }
}


/**
 * Setter function for protocol_manager.
 */
debugger7.prototype.set_protocol_manager = function(proto_manager)
{
    this.protocol_manager = proto_manager;

    //this.protocol_manager.set_outreach(this.command_dispatcher);
}


/**
 * Receives data from xdebug.  Decides what to do next with the
 * received data.
 */
debugger7.prototype.command_dispatcher = function(data)
{
    console.log(data);
}


/**
 * Setter function for current_state.
 */
debugger7.prototype.set_state = function(state)
{
    this.current_state = state;
}


/**
 * These commands are sent at the beginning of the debugging session.
 */
debugger7.prototype.init_commands = function()
{
    var command = {'command' : '', args : ''};
    this.command_queue.push(command);
}


