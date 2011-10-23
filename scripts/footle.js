
/**
 * The main Footle script.  Footle is an xdebug client that runs
 * inside Firefox.  All the jQuery code used here relies on the
 * jquery-xul library from https://github.com/ilyakharlamov/jquery-xul
 *
 * @version 2011-10-23
 */

var debugger_obj = new debugger7();


/**
 * Initialization function.
 */
jQuery().ready(function() {

    /**
     * Event handler for the 'Exit' menu item.
     */
    jQuery('#exit-menuitem').bind('command', function(event) {
        jQuery('#foo-table').attr("border", "1");
    });

    /**
     * Event handler for the 'Open' menu item.
     */
    jQuery('.file-open-button').bind('command', function(event) {

        var code_block = document.createElementNS('http://www.w3.org/1999/xhtml', 'html:div');
        code_block.setAttribute('class', 'thecode');

        var file_data = getFileData();
        if (file_data)
        {
            var line_list = file_data.content.split(/\n/);

            for (line_number in line_list) {
                line_div = createLine(line_number, line_list[line_number]);
                code_block.appendChild(line_div);
            }

            // Create a new tab.
            jQuery('tabpanels').append(jQuery('<tabpanel>').append(code_block));
            jQuery('tabs').append(jQuery('<tab>').attr('label', file_data.filename));

            // Now select this tab.
            jQuery('tabs tab:last').click();
        }
    });


    /**
     * Event handler for the 'click' event on any line of source code
     * displayed in the debugger.  This is used to setup a breakpoint.
     */
    jQuery('.code-line').live('click', function(event_obj) {
        jQuery(this).css('background', 'lightgreen');

        //random_number = Math.floor(Math.random() * (300+ 1)) + 0;
        //debugger_obj.set_breakpoint(random_number, file_obj.filename);
    });


    /**
     * Event handler for the "Plus" tab.  This adds a new tab.
     */
    jQuery('#new-tab-opener').bind('command', function(event_obj) {
        var time_obj = new Date();
        var sec = time_obj.getSeconds();
        var panel_id = 'tab-panel-' + sec;
        jQuery('tabpanels').append(jQuery('<tabpanel>').attr('id', panel_id).append(jQuery('<label>').attr('value', sec)));

        var tab_attr = {'label' : 'Empty', 'context' : 'tab-menu-popup', 'class' : 'code-tab',
            'linkedPanel' : panel_id, }
        jQuery('tabs').append(jQuery('<tab>').attr(tab_attr));

        jQuery('tab.code-tab:last').click();
    });


    /**
     * Event handler for the tab closing menu item.
     */
    jQuery('#current-tab-closer').bind('command', function(event_obj) {

        var tab_item_to_close = jQuery(document.popupNode);
        var panel_id = tab_item_to_close.attr('linkedPanel');

        jQuery('tabpanel#' + panel_id).remove();
        jQuery(tab_item_to_close).remove();

        jQuery('tabpanels').attr('selectedIndex', 0);
        jQuery('tabbox').attr('selectedIndex', 0);

        jQuery('tab.code-tab:first').click();
    })
});


/**
 * Return a file handler.  The file has been opened by the
 * user.
 *
 * @return bool/nsIFile
 */
function getFileData()
{
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Select a File", nsIFilePicker.modeOpen);

    var res = fp.show();

    if (res === nsIFilePicker.returnOK) {
        var path_parts = fp.file.path.split('/');
        var filename = path_parts[path_parts.length - 1];

        var file_content = getFileContent(fp.file);

        return { 'filepath' : fp.file.path,
            'filename' : filename,
            'content' : file_content,
        };
    }
    else
    {
        return false;
    }
}


/**
 * Reads the contents of a local file.
 *
 * @param nsIFile file
 *    This is the file to open.
 * @return string
 */
function getFileContent(file)
{
    var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
    var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);

    fstream.init(file, 1, 00004, null);
    sstream.init(fstream);

    var output = sstream.read(sstream.available());

    sstream.close();
    fstream.close();

    return output;
}


/**
 * Creates the HTML code for a single line of source code.  Each line looks
 * like the following:
 *
 * <div class="code-line" style="display : block;">
 *   <span id="line-no-N" class="line-number">line_number</span>
 *   <span id="code-line-N" class="code-snippet">line</span>
 * </div>
 *
 * @param integer line_number
 * @param string line
 *    A single line of source code.
 * @return string
 *    HTML snippet.
 */
function createLine(line_number, line)
{
    var padded_line_num = spacify(line_number);

    var ns = 'http://www.w3.org/1999/xhtml';

    var line_number_element = document.createElementNS(ns, 'html:span');
    line_number_element.setAttribute('class', 'line-number');
    var line_number_attr = { class : "line-number" };
    line_number_element.appendChild(document.createTextNode(padded_line_num));

    var line_content_element = document.createElementNS(ns, 'html:span');
    line_content_element.appendChild(document.createTextNode(line));
    line_content_element.setAttribute('class', 'code-snippet');
    var line_content_style = "border-left-style : thin ;";
    line_content_element.setAttribute('style', line_content_style);

    var line_element = document.createElementNS(ns, 'html:div');
    line_element.setAttribute('class', 'code-line');

    line_element.appendChild(line_number_element);
    line_element.appendChild(line_content_element);

    return line_element;
}


/**
 * Returns a padded number.  The goal is to occupy 4 characters.
 * If a single digit number is passed, 3 padding characters are returned
 * in front of the number.
 *
 * @param integer line_number
 * @return string
 *    Example: '...3', '..10', '.999', '7007'.
 */
function spacify(line_number)
{
    if (10 > line_number)
    {
        return '...' + line_number;
    }
    else if (100 > line_number)
    {
        return '..' + line_number;
    }
    else if (1000 > line_number)
    {
        return '.' + line_number;
    }
    else
    {
        return line_number;
    }
}


/**
 * Debugger class.
 *
 * Talks to both the debugger UI and xdebug.
 */
function debugger7()
{
    this.pending_breakpoints = new Array();
}


/**
 * Setter method for breakpoints.
 */
debugger7.prototype.set_breakpoint = function(line_number, filename)
{
    var breakpoint_data = {'line_number' : line_number, 'filename' : filename};

    this.pending_breakpoints.push(breakpoint_data);
};



