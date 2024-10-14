/**
 * @description Main Process functionnalities
 * @update 2024-09-28
 */

import os from 'os';
import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import moment, { Moment } from "moment";

import { print, helpPage } from "./Console.lib";
import { SystemDatabase, getTableName } from "./Db.lib";
import { Err } from "./Err.lib";
import { File } from "./FS.lib";
import { getOsPlatform } from "./Util.lib";
import { hash, index, int } from "../class/Var.class";

import { ProcessArgParams, ProcessHelpParams, ProcessInitParams } from '../class/Process.class';

import base_conf from '../data/base.conf.json';
import { checkParam, Store } from './Var.lib';

var figlet = require("figlet");
const clear = require('console-clear');
var getos = require('getos');

/**
 * @description Absract Class to manage current process
 */
export abstract class Process {

    /**
     * @description Indicator, set true after success calling function Process.init()
     * @var {int}
     */
    public static is_init:boolean=false;
    
    /**
     * @description Function called on Process.stop() function or null if not function
     * @var {Function|boolean}
     */
    public static exit_function:Function|boolean;

    public static date_initialize:Moment;

    /**
     * @description Path to pid_file (text file contain only system process ID) or '' is Process pid file not writting
     * @var {string}
     */
    public static pid_file:string|boolean;

    /**
     * @description Enable or disable silent mode
     * @var {boolean}
     */
    public static silent:boolean=false;

    /**
     * @description Enable or disable log
     * @var {boolean}
     */
    public static log:boolean=true;

    /**
     * @description Process.init function, show or not diverses informations
     * @param {ProcessInitParams} params [OPTIONNAL] Parameters for initialize Process
     *  - arg_help {string} [OPTIONNAL] default (defined in base.conf.json), Specify CLI arg to print help page
     *  - args {array} {ProcessArgParams} [OPTIONNAL] list of arguments
     *      - args {string} Arguments list
     *      - required {boolean} [OPTIONNAL] If true, arg value is obligatoiry
     *      - message_error {string} [OPTIONNAL] If not null, print this message if argument not exist
     *      - message_help {string} [OPTIONNAL] If not null, print this data in help page
     *  - help {ProcessHelpParams} [OPTIONNAL] Data for alimented help page
     *      - name {string} Name of script / command
     *      - synopsis {string} Call definition of script / command
     *      - description {string} Descripton of script / command
     *  - embarqued_database {string|boolean} [OPTIONNAL] Path to local Embarqued SQLite DB or false if launch process witout DB
     *  - pid {string|boolean} [OPTIONNAL] Name of pid_file or false if launch process without pid_file
     *  - title {string} [OPTIONNAL] Figlet title, phrase to print with figlet module, if '', notinh print
     *  - version {string} [OPTIONNAL] Program Version
     *  - clear_console {boolean} [OPTIONNAL] If true, clear console before print informations
     *  - show_pid {boolean} [OPTIONNAL] If true, print process pid in console
     *  - silent {boolean} [OPTIONNAL] If true, nothing printing
     *  - show_os {boolean} [OPTIONNAL] If true, show OS System and show OS release
     *  - exit_function {Function:boolean} [OPTIONNAL] Function called on Process.stop() or null
     *  - log {boolean} [OPTIONNAL] Enable or disable log  
     *  - path_app {string} [OPTIONNAL] Path to current application (using for computing all next paths)
     *  - path_install {string} [OPTIONNAL] Path to install folder
     *  - path_class {string} [OPTIONNAL] Path to class folder
     *  - path_build {string} [OPTIONNAL] Path to build folder
     *  - path_bin {string} [OPTIONNAL] Path to bin folder (contains script(s))
     *  - path_data {string} [OPTIONNAL] Path to data folder (contains configurations)
     *  - path_public {string} [OPTIONNAL] Path to public folder (using for manager application and webserver applications)
     *  - path_pid {string} [OPTIONNAL] Path to pid folder (contains pid application files)
     * @return {int} System Processs pid
     * @use Process.init({ 'title':'My ZF Application' });
     */
    public static init (params:ProcessInitParams={}) {
        var arg_help:string = checkParam({ v:params.arg_help, default_value:base_conf.arg_help, type:[ base_conf.consts.VAR.TYPES.STRING ]});
        var args:ProcessArgParams[] = checkParam({ v:params.args, default_value: [], type: [ base_conf.consts.VAR.TYPES.ARRAY ]});
        var help:ProcessHelpParams = checkParam({ v:params.help, default_value: {}, type: [ base_conf.consts.VAR.TYPES.HASH ]})
        var embaqued_database:string|boolean = checkParam({ v:params.embaqued_database, default_value: false, type: [ base_conf.consts.VAR.TYPES.STRING, base_conf.consts.VAR.TYPES.BOOLEAN ]});
        var pid:string|boolean = checkParam({ v:params.pid, default_value:'pid', type:[ base_conf.consts.VAR.TYPES.STRING, base_conf.consts.VAR.TYPES.BOOLEAN ]});
        var title:string = checkParam({ v:params.title, default_value:'', type: [ base_conf.consts.VAR.TYPES.STRING ]});
        var version:string = checkParam({ v:params.version, default_value:'', type: [ base_conf.consts.VAR.TYPES.STRING ]});
        var clear_console:string = checkParam({ v:params.clear_console, default_value: false, type: [ base_conf.consts.VAR.TYPES.BOOLEAN ]});
        var show_pid:boolean = checkParam({ v:params.show_pid, default_value: false, type: [ base_conf.consts.VAR.TYPES.BOOLEAN ]});
        var silent:boolean = checkParam({ v:params.silent, default_value: false, type: [ base_conf.consts.VAR.TYPES.BOOLEAN ]});
        var show_os:boolean = checkParam({ v:params.show_os, default_value: false, type:[ base_conf.consts.VAR.TYPES.BOOLEAN ]});
        var exit_function:Function|boolean = checkParam({ v:params.exit_function, default_value:false, type: [ base_conf.consts.VAR.TYPES.FUNCTION, base_conf.consts.VAR.TYPES.FUNCTION_ANONYMOUS, base_conf.consts.VAR.TYPES.BOOLEAN ]});
        var log:boolean = checkParam({ v:params.log, default_value: true, type: [ base_conf.consts.VAR.TYPES.BOOLEAN ]});

        this.log = log;

        var path_app:string = checkParam({ v:params.path_app, default_value: path.join(__dirname, '..', '..'), type: [ base_conf.consts.VAR.TYPES.STRING ]});
        var path_install:string = checkParam({ v:params.path_install, default_value: path.join(path_app, 'src', 'install'), type: [ base_conf.consts.VAR.TYPES.STRING ]});
        var path_class:string = checkParam({ v:params.path_class, default_value: path.join(path_app, 'src', 'class'), type: [ base_conf.consts.VAR.TYPES.STRING ]});
        var path_build:string = checkParam({ v:params.path_build, default_value: path.join(path_app, 'src', 'build'), type: [ base_conf.consts.VAR.TYPES.STRING ]});
        var path_bin:string = checkParam({ v:params.path_bin, default_value:path.join(path_app, 'src', 'bin'), type:[ base_conf.consts.VAR.TYPES.STRING ]});
        var path_data:string = checkParam({ v:params.path_data, default_value:path.join(path_app, 'src', 'data'), type:[ base_conf.consts.VAR.TYPES.STRING ]});
        var path_public:string = checkParam({ v:params.path_public, default_value:path.join(path_app, 'src', 'public'), type:[ base_conf.consts.VAR.TYPES.STRING ]});
        var path_pid:string = checkParam({ v:params.path_pid, default_value:path.join(path_app, 'src', 'pid'), type:[ base_conf.consts.VAR.TYPES.STRING ]});

        Store.man('path:app', path_app);
        Store.man('path:install', path_install);
        Store.man('path:class', path_class);
        Store.man('path:build', path_build);
        Store.man('path:bin', path_bin);
        Store.man('path:data', path_data);
        Store.man('path:public', path_public);
        Store.man('path:pid', path_pid);

        // Check obligatoiry args
        var print_h:boolean = false;
        var data = null;
        for(var i in args){
            var arg_or = false;
            for(var iv in args[i].args){
                if(Process.getArg(args[i].args[iv])){
                    arg_or = true;
                }
            }

            if(args[i].required && !arg_or){
                var e = new Err({ code:'ARG01', message:args[i].message_error });
                process.exit(-1);
            }
        }

        if(this.getArg(arg_help) || print_h){
            var name = checkParam({ v:help.name, required:true, type: [ base_conf.consts.VAR.TYPES.STRING ] });
            var synopsis = checkParam({ v:help.synopsis, default_value: '', type: [ base_conf.consts.VAR.TYPES.STRING ] });
            var description = checkParam({ v:help.description, default_value:'', type: [ base_conf.consts.VAR.TYPES.STRING ] });

            helpPage({
                name:name,
                synopsis:synopsis,
                description:description,
                args:args
            });
            this.silent = true;
            Process.stop(1);
        }

        if(embaqued_database){
            if(File.isExist(path.join(Store.man('path:data'), embaqued_database.toString()))){
                SystemDatabase.connect('sqlite',path.join(Store.man('path:data'), embaqued_database.toString()));
            }
        }

        if(pid){
            // Create pid file
            fs.writeFileSync(path.join(Store.man('path:pid'), `.${pid}`), process.pid.toString());
        }
        this.pid_file = pid;

        if(clear_console && !this.getArg('-s')){
            clear(true);
        }

        if(title != '' && !silent){
            print(figlet.textSync(title));
        }

        if(show_pid && !silent){
            print({ message:`Process ID ${process.pid}`, type: base_conf.consts.CONSOLE.PRINT.INFORMATION });
            print({ message:`Process ID file : $0`, args:[ pid ], type:base_conf.consts.CONSOLE.PRINT.INFORMATION });
        }

        var os_type = getOsPlatform();
        var os_version = os.release();
        if(show_os && !silent){
            getos((e:any, os_data:any) => {
                print({ message:`OS ${os_type}${os_data.os=='linux'?' (' + os_data.dist + ')':''} Version ${os_version}`, type: base_conf.consts.CONSOLE.PRINT.INFORMATION });
                print({ message:'OS Name : $0', args:[ os.hostname() ], type: base_conf.consts.CONSOLE.PRINT.INFORMATION });
            });
        }

        if(version != '' && !silent){
            print({ message:`Program Version ${version}`, type: base_conf.consts.CONSOLE.PRINT.INFORMATION });
        }

        var moment_locale = base_conf.moment_locale;
        if(SystemDatabase.isConnected()){
            moment_locale = SystemDatabase.getConf('moment_locale'); 
        }

        moment.locale(moment_locale);
        //moment.tz.setDefault(Store.man('conf:timezone'));

        this.date_initialize = moment();

        this.exit_function = exit_function;

        if (process.platform === "win32") {
            var rl = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout
            });
        
            rl.on("SIGINT", function () {
                process.emit("SIGINT");
            });
        }
        
        process.on("SIGINT", () => {
            //graceful shutdown
            Process.stop(0);
        });

        if(SystemDatabase.isConnected() && this.log){
            SystemDatabase.addLogSystem('SYSTEM INFO', 'Process start', { pid:process.pid, program_version:version, os:os_type + ' ' + os_version } );
        }
        else if(log){

        }

        if(!silent){
            print({ message: 'Process started at $0', args: [ this.date_initialize.format(base_conf.system_db_moment_date_format1) ], type: base_conf.consts.CONSOLE.PRINT.INFORMATION });
            print({ message: 'Initialization complete', type: base_conf.consts.CONSOLE.PRINT.SUCCESS });
        }

        this.silent = this.getArg('-s') || silent ? true : false;

        this.is_init = true;

        return process.pid;
    }

    /**
     * @description Stop system process
     * @param {int|string} code [OPTIONNAL] Exit code
     * @use Process.stop(1);
     */
    static stop (code:int|string=1):int{
        if(SystemDatabase.isConnected() && this.log){
            SystemDatabase.addLogSystem('SYSTEM INFO', 'Process stop', { exit_code:code });
        }
        
        if(!this.silent){
            print({ message:'Stop process detected, exit $0', args:[ code ], type:base_conf.consts.CONSOLE.PRINT.INFORMATION });
        }
        
        if(this.exit_function instanceof Function){
            this.exit_function.call(this);
        }
        if(this.pid_file){
            try{
                fs.unlinkSync(path.join(Store.man('path:pid'), '.'+this.pid_file));
            }
            catch(e:any){
                var e = new Err({ code:'INT01', message:'Process PID file exist in memory but not found in disk', additionnal_data: { pid_file:this.pid_file } });        
            }
        }
        process.exit(1);
    } 

    /**
     * @description Get CLI process argument with format arg=value (return value) or arg is exist return true, return undefined if not exist
     * @param {index} arg Name of argument 
     * @return {string|boolean|undefined} Return value of argument name or true if just argument specified in command
     * @use Process.getArg('-s') => if (cmd: script.ts/js -s) true, undefined elseif, Process.getArg('toto') (cmd: script.ts/js toto=val) true, return 'val', undefined elseif
     */
    static getArg(arg:index){
        let args = process.argv;
        
        for(var i in args){
            let arg_with_value = args[i].split('=');
            if(arg_with_value[0] == arg && arg_with_value[1]){
                return arg_with_value[1];
            }
            
            if(args[i] == arg){
                return true;
            }
            
        }
    
        return undefined;
    }
    
    /**
     * @description Get CLI process argument with format arg value (argument with space)
     * @param {index} arg Name of argument
     * @return {string|undefined} Return value espaced of argument name or undefined
     * @use Process.getArgWithSpace('arg1') => if (cmd: script.ts/js arg1 valueOfArg1) true, return valueOfArg1
     */
    static getArgWithSpace(arg:index){
        let args = process.argv;
        
        for(var i in args){
            if(arg==args[i]){
                return args[parseInt(i)+1];
            }
        }
    
        return undefined;
    }
    
    /**
     * @description Get CLI process argument with number index, 0 for first argument, ...
     * @param {int} n Index of arg
     * @return {string|undefined} Value of arg number if exist, undefined elseif
     * @use Process.getArgNumber(1) => if (cmd: script.ts/js arg1 arg2 arg3=toto) true, return arg2
     */
    static getArgNumber(n:int):string|undefined{
        let args = process.argv;
        return args[n];
    }

}

/**
 * @description Execute sync command on system and return result
 * @param {string} command_or_file
 * @param {string} [OPTIONNAL] type
 *  - cmd : Execute command
 *  - file : Execute scripts file
 */
export function execCommandSync (command_or_file:string, type:string='cmd') {
    if(type=='cmd'){
        try{
            const stdout = execSync(command_or_file, { stdio:'pipe', encoding:'utf8' });
            return stdout;
        }
        catch(e:any){
            return new Err({ code:'INT02', message:'Error in execution command', additionnal_data: { command:command_or_file }, e: e });
        }
    }
    else if(type=='file'){

    }
}