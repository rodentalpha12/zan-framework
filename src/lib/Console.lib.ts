/**
 * @description Functionalities for managing CLI Current Process Console
 * @update 2024-09-21
 */

import { Process } from "./Process.lib";
import { stringReplace } from "./Util.lib";
import { checkParam, parseOptionsString } from "./Var.lib";

import { hash, index, int, literal } from "../class/Var.class";
import { ProcessHelpParams } from "../class/Process.class";

import base_conf from '../data/base.conf.json';
import { PrintParams, PromptParams, TableModParams, TableParams } from "../class/Console.class";

var promptSync = require('prompt-sync')();
var setTitle = require('console-title');
var Table = require('cli-table3');
var clc = require("cli-color");

export var force_silent_mode:boolean = false;

/**
 * @description Print message in console with or without message notficiation template style
 * @param {string} message Message to print in console without argument value (ex Message $0)
 * @param {array} args [OPTIONNAL] Literals array contains args to replace in message 
 * @param {string} type [OPTIONNAL] Type of message for applyng style
 *  @value consts.CONSOLE.PRINT.INFORMATION : cyan
 *  @value consts.CONSOLE.PRINT.ANOMALY : magenta
 *  @value consts.CONSOLE.PRINT.ERROR : red
 *  @value consts.CONSOLE.PRINT.SUCCESS : green
 *  @value consts.CONSOLE.PRINT.DEBUG : white
 *  @value consts.CONSOLE.PRINT.WARNING : yellow
 *  @value consts.CONSOLE.PRINT.EMERGENCY : blue
 *  @notice No font color specified
 * @use Console.print('Hello World In $0', [ cls.bold('Console') ], consts.CONSOLE.PRINT.INFORMATION) => [INFO] Hello World In Console {in bold} with information message template
 * @return {void}
 */
export function print (params:PrintParams){
    var message = checkParam({ v:params.message, required:true, type: [ base_conf.consts.VAR.TYPES.STRING ] })
    var args = checkParam({ v:params.args, default_value:[], type:[ base_conf.consts.VAR.TYPES.ARRAY ] });
    var type = checkParam({ v:params.type, type:[ base_conf.consts.VAR.TYPES.STRING ] });
    var print_mode = checkParam({ v:params.mode, type:[ base_conf.consts.VAR.TYPES.STRING ] })
    
    message = stringReplace(message, args);
    type = type.toLowerCase();
    var log_level = parseOptionsString(base_conf.log_level);

    switch(type.toUpperCase()){
        case base_conf.consts.CONSOLE.PRINT.INFORMATION: 
            message = `${clc.cyan('[INFO]')} ${message}`;
            if(log_level[0].info == false || log_level[0].info){
                return;
            }
        break;
        
        case base_conf.consts.CONSOLE.PRINT.ANOMALY:
            message = `${clc.magenta('[ANOMALY]')} ${message}`;
            if(log_level[0].anomaly == false || log_level[0].anomaly){
                return;
            }
        break;
        
        case base_conf.consts.CONSOLE.PRINT.ERROR:
            message = `${clc.red('[ERROR]')} ${message}`;
            if(log_level[0].error == false || log_level[0].error){
                return;
            }
        break;
        
        case base_conf.consts.CONSOLE.PRINT.SUCCESS:
            message = `${clc.green('[SUCCESS]')} ${message}`;
            if(log_level[0].success == false || log_level[0].success){
                return;
            }
        break;

        case base_conf.consts.CONSOLE.PRINT.DEBUG:
            message = `${clc.underline('[DEBUG]')} ${message}`;
            if(log_level[0].debug == false || log_level[0].debug){
                return;
            }
        break;

        case base_conf.consts.CONSOLE.PRINT.WARNING:
            message = `${clc.yellow('[WARN] ')} ${message}`;
            if(log_level[0].warn == false || log_level[0].warn){
                return;
            }
        break;

        case base_conf.consts.CONSOLE.PRINT.EMERGENCY:
            message = `${clc.blue('[EMERGENCY] ')} ${message}`;
            if(log_level[0].emergency == false || log_level[0].emergency){
                return;
            }
        break;
    }

    if((print_mode || Process.getArg(base_conf.arg_silent))){
        return;
    }

    console.log(message);
}

/**
 * @description Prompt date in syncchrounous mode in console with information and error template style
 * @param {string} message Message to print
 *  @notice No carriage return (ex Message:) => Message:{PROMPT DATA}
 * @param {boolean} required [OPTIONNAL] If true and if prompted data is empty string, declench automatic iteration in main boucle, default falee 
 * @param {boolean} hidden [OPTIONNAL] If true, hide prompted data in console (echo *), default false 
 * @param {boolean} confirm [OPTIONNAL] If confirm is true, demand new saisie and compare value 
 * @use Console.prompt('Password : ', true, true, true) => Prompt1 ******** - Promp2 ********
 * @return {void}
 */
export function prompt (params:PromptParams): string {
    var message = checkParam({ v:params.message, required:true });
    var required = checkParam({ v:params.required, default_value:false });
    var hidden = checkParam({ v:params.hidden, default_value:false });
    var confirm = checkParam({ v:params.confirm, default_value:false });

    let exit:boolean=false;
    while(!exit){
        var data = promptSync('[PROMPT] ' + message, hidden?{echo: '*'}:{});
        if(data == '' && required){
            print({ message:'Incorect value', type: base_conf.consts.CONSOLE.PRINT.ERROR });
        }
        else{
            if(confirm){
                // @{ts-}ignore
                var data_confirm = promptSync('[PROMPT] ' + ' Retype ' + message, hidden?{echo: '*'}:{});
                if(data == data_confirm){
                    return data;
                }
                print({ message:'Not identical', type:base_conf.consts.CONSOLE.PRINT.ERROR });        
            }
            else{
                return data;
            }
        }
    }

    return '';
}

/**
 * @description User CLI Console Confirm method, prompted data is automaticly toLowerCase() and value must be (y/yes n/no) format
 * @param {string} message Message to print
 * @use Console.confirm('Erase database ? (y/yes n/no) : '); 
 * @return {boolean|int} return true if confirm valided, false is confirm refused, -1 if anomaly
 */
export function confirm (message:string):boolean|int{
    let exit:boolean=false;
    while(!exit){
        let response = prompt({ message: message });
        if(response.toLowerCase() == 'y' || response.toLowerCase() == 'yes'){
            return true;
        } 
        // @{ts-}ignore
        else if(response.toLowerCase() == 'n' || response.toLowerCase() == 'no'){
            return false;
        }
        // @{ts-}ignore
        print({ message:'Input not valid, y/yes or n/no', type:base_conf.consts.CONSOLE.PRINT.ERROR });
    }
    return -1;
}

/**
 * @description Set Window console title
 * @param {string} title Title for window
 * @use Console.setConsoleTitle('Titre de la fenêtre')
 * @return {void} 
 */
export function setConsoleTitle (title:string):void {
    setTitle(title);
}

/**
 * @description Print help page in console
 * @param {ProcessHelpParams} params 
 *  - name {string} Name of program
 *  - synopsis {string} [OPTIONNAL] Example calling function
 *  - description {string} [OPTIONNAL] Description of function
 *  - args {array} {string} String array list with arg definition
 * @return {void}
 */
export function helpPage (params:ProcessHelpParams):void {
    var name = checkParam({ v:params.name, required:true, type: [ base_conf.consts.VAR.TYPES.STRING ]});
    var synopsis = checkParam({ v:params.synopsis, required:false, type: [ base_conf.consts.VAR.TYPES.STRING ]});
    var description = checkParam({ v:params.description, required:false, type: [ base_conf.consts.VAR.TYPES.STRING ]});
    var args = checkParam({ v:params.args, required: false, type: [ base_conf.consts.VAR.TYPES.ARRAY ]});

    print({ message:'NAME' });
    print({ message:`\t${name}` });

    if(synopsis != ''){
        print({ message:'\n' });
        print({ message:'SYNOPSIS' });
        print({ message:`\t${synopsis}` });
    }

    if(description != ''){
        print({ message:'\n' });
        print({ message:'DESCRIPTION' });
        print({ message:`\t${description}` });
    }

    if(args.length > 0){
        print({ message:'\n' });
        print({ message:'ARGUMENTS' });
        for(var i in args){
            var arg_message = `\t`;

            for(var i2 in args[i].args){
                arg_message += args[i].args[i2] + ',';
            }

            arg_message = arg_message.substring(0, arg_message.length - 1);

            if(args[i].required){
                arg_message += ' [REQUIRED]';
            }else{
                arg_message += ' [OPTIONNAL]';
            }

            arg_message += ' ' + args[i].message_help;
            print({ message:arg_message });
        }
    }

    print({ message:'\n' });
}

export function table(params:TableParams) {
    var data = checkParam({ v:params.data, required:true, type: [ base_conf.consts.VAR.TYPES.ARRAY ] });
    var tableParams = checkParam({ v:params.table_params, default_value:{}, type: [ base_conf.consts.VAR.TYPES.HASH ] });
    var style = checkParam({ v:params.style, default_value:base_conf.consts.CONSOLE.TABLES.STYLES.NORMAL, type: [ base_conf.consts.VAR.TYPES.STRING ] });
    var orientation = checkParam({ v:params.orientation, default_value:base_conf.consts.CONSOLE.TABLES.ORIONTATION.HORIZONTAL, type: [ base_conf.consts.VAR.TYPES.STRING ] });
    var table_vertical_show_line = checkParam({ v:params.table_vertical_show_line, default_value:true, type:[ base_conf.consts.VAR.TYPES.BOOLEAN ] });
    var table_vertical_line_char = checkParam({ v:params.table_vertical_line_char, default_value: '-', type: [ base_conf.consts.VAR.TYPES.CHAR ] });
    var table_vertical_line_end_sep = checkParam({ v:params.table_vertical_line_end_sep, default_value: '>', type: [ base_conf.consts.VAR.TYPES.CHAR ] });

    if(style == base_conf.consts.CONSOLE.TABLES.STYLES.NO_BORDER){
        tableParams.chars = { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
            , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
            , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
            , 'right': '' , 'right-mid': '' , 'middle': ' ' };
        tableParams.style = { 'padding-left': 0, 'padding-right': 0 };
    }

    var table_var = new Table(tableParams);

    for(var i in data){
        if(orientation == base_conf.consts.CONSOLE.TABLES.ORIONTATION.VERTICAL){
            if(tableParams.colWidths && tableParams.colWidths[0] && table_vertical_show_line){
                data[i][0] = clc.underline.cyan(data[i][0]) + computeLineForVerticalTable(data[i][0].length, tableParams.colWidths[0], table_vertical_line_char, table_vertical_line_end_sep);
            }
        }

        table_var.push(data[i]);
    }

    print(table_var.toString());
}

export function computeLineForVerticalTable (text_lenght:int, col_lenght:int, char:string='-', endchar:string='>'):string {
    var str = ' ';
    var lenght = col_lenght - text_lenght - 2;
    for(var i=0;i<lenght;i++){
        str += char;
    }

    str += endchar;

    return str;
}