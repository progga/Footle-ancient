
/**
 * The main Footle script.  Footle is an xdebug client that runs
 * inside Firefox.  All the jQuery code used here relies on the
 * jquery-xul library from https://github.com/ilyakharlamov/jquery-xul
 *
 * @version 2011-10-02
 */

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
    jQuery('#open-menuitem').bind('command', function(event) {
        jQuery('tabs').append(jQuery('<tab>').attr('label', 'Code'));

        var code_block = document.createElementNS('http://www.w3.org/1999/xhtml', 'html:div');
        code_block.setAttribute('class', 'thecode');
        jQuery('tabpanels').append(jQuery('<tabpanel>').append(code_block));
;
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var nsIFilePicker = Components.interfaces.nsIFilePicker;
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
        fp.init(window, "Select a File", nsIFilePicker.modeOpen);

        var res = fp.show();
        if (res == nsIFilePicker.returnOK) {
            var file_content = getFile(fp.file);
            var line = '';
            var line_div = '';
            var line_number = 0;

            var line_list = file_content.split(/\n/);

            jQuery('#thecode').empty();
            for (line_number in line_list) {
                line_div = createLine(line_number, line_list[line_number]);
                code_block.appendChild(line_div);
            }
        }
    });


    /**
     * Event handler for the 'click' event on any line of source code
     * displayed in the debugger.  This is used to setup a breakpoint.
     */
    jQuery('.code-line').live('click', function(event_obj) {
        jQuery(this).css('background', 'lightgreen');
    });
});


/**
 * Reads the contents of a local file.
 *
 * @param nsIFile file
 *    This is the file to open.
 * @return string
 */
function getFile(file)
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


