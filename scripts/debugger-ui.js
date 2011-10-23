
/**
 *
 */

function debugger_ui()
{
    var current_file = {};
    var open_file_list = [];
    var open_file_data_list = {};

    var tab_container = new Object();

    var xul_functionalities = new Object();
}


debugger_ui.prototype.set_tab_container = function(tab_container)
{
    this.tab_container = tab_container;
}


debugger_ui.prototype.set_xul_funcs = function(xul_obj)
{
    this.xul_functionalities = xul_obj;
}


debugger_ui.prototype.open_file = function(filepath)
{
    this.current_file = filepath;
    this.open_file_list.push(filepath);

    var file_content = this.xul_functionalities.get_file_content(filepath);

    var file_record = {}
    file_record.filepath = filepath;
    file_record.tab_obj = this.create_tab(file_content);

    this.open_file_data_list[filepath] = file_record;
}


debugger_ui.prototype.create_tab = function(file_content)
{
}


