
/**
 * Debugger object that talks to a dbgp debugger.
 *
 * @version 2011-10-20
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
    this.current_state = {'state' : 'off-air', 'data' : {}};
}


/**
 * These commands are sent at the beginning of the debugging session.
 */
debugger7.prototype.init_commands = function()
{
    var command = {'command' : '', 'args' : []};
    this.command_queue.push(command);
}


debugger7.prototype.run = function()
{
    var command = {'command' : 'run', 'args' : []};
    this.command_queue.push(command);

    this.send_all_commands();
}


debugger7.prototype.end = function()
{
    var command = {'command' : 'stop', 'args' : []};
    this.command_queue.push(command);

    this.send_all_commands();
}


debugger7.prototype.set_breakpoint = function(filepath, line_num)
{
    var args = ['-f', filepath, '-l', line_num];
    var command = {'breakpoint_set' : '', 'args' : args};
    this.command_queue.push(command);

    this.send_all_commands();
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
 * Send all queued commands to the debugger.
 */
debugger7.prototype.send_all_commands = function()
{
    var command              = '';
    var dbgp_command         = '';
    var trimmed_dbgp_command = '';
    var args                 = [];
    var joined_args          = '';
    var command_data         = {}

    while (command_data = this.command_queue.shift())
    {
        command = command_data.command;
        args    = command_data.args;
        joined_args = args.join(' ');

        dbgp_command = command + ' ' + args.join(' ');

        /**
         * The call to jQuery.trim() is necessary because any
         * trailing space character here will produce an unacceptable
         * command string later.  Example - "run -i 6" is allowed, but
         * "run  -i 6" is not.
         */
        trimmed_dbgp_command = jQuery.trim(dbgp_command);
        this.send_single_command(trimmed_dbgp_command);
    }
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
 * Setter function for protocol_manager.
 */
debugger7.prototype.set_protocol_manager = function(proto_manager)
{
    this.protocol_manager = proto_manager;

    this.protocol_manager.set_outreach(this.command_dispatcher);
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
debugger7.prototype.set_state = function(state_data)
{
    this.current_state.state = state_data.name;
    this.current_state.data  = state_data;
}


