/**
 * @description Functionnalities for manage Error
 * @update 2024-09-21
 */

import moment, { Moment } from "moment";

import { computeBacktrace, Trace } from "./Debug.lib";
import { hash, literal } from "../class/Var.class";
import { SystemDatabase } from "./Db.lib";
import { stringReplace } from "./Util.lib";
import { print } from "./Console.lib";
import { Process } from "./Process.lib";
import { ErrParams } from "../class/Err.class";
import { checkParam, parseOptionsString } from "./Var.lib";

import base_conf from '../data/base.conf.json';

/**
 * @description (Err) Error Class (!!! not Error Javascript Internal Class !!!) And not herited Error
 */
export class Err {
    /**
     * @description Javascript Error Object
     * @var {Error} 
     */
    // @ts-ignore
    public error:Error;

    /**
     * @description Time (Moment Object) on delcench error
     * @var {Moment}
     */
    public time:Moment;

    /**
     * @description Message of error
     * @var {string}
     */
    public message:string='';

    /**
     * @description Code of error
     * @var {string}
     */
    public code:string='';

    /**
     * @description Array contain backtrace previously called before create error (Err Object)
     * @var {array}
     */
    public backtrace:Trace[];

    /**
     * @description Additionnal data for add custom or contextual variables and informations
     * @var {hash}
     */
    public additionnal_data:hash;

    /**
     * @description Arguments for added in message with Util stringReplace function (see Util.ts)
     * @var {array}
     */
    public args:any[];

    /**
     * @description Create new Err Object instance
     * @param {string} code Code of error 
     * @param {string} message [OPTIONNAL] Message of error
     * @param {array} args [OPTIONNAL] literal array contain argument to add in message
     * @param {hash} additionnal_data [OPTIONNAL] Hash contain custom or contextual variables and informations relative of error created 
     * @param {boolean} is_critical [OPTIONNAL] If true, emit stop process signal and stop program or scritpt 
     * @param {Error|undefined} e [OPTIONNAL] If undefined, create Javascript Error Object instance (using for computing backtrace of create Err)
     * @use new Err('INT01'), throw new Err('INT02', 'Critical Error', {}, true)
     */
    //constructor(code:string, message:string='', args:literal[]=[], additionnal_data:hash={}, is_critical:boolean=false, e:Error|undefined=undefined) {
    constructor(params:ErrParams) {
        var code = checkParam({ v:params.code, required:true, type:[ base_conf.consts.VAR.TYPES.STRING ] });
        var message = checkParam({ v:params.message, default_value:'', type:[ base_conf.consts.VAR.TYPES.STRING ] });
        var args = checkParam({ v:params.args, default_value: [], type:[ base_conf.consts.VAR.TYPES.ARRAY ] });
        var additionnal_data = checkParam({ v:params.additionnal_data, default_value: {}, type:[ base_conf.consts.VAR.TYPES.HASH ] });
        var is_critical = checkParam({ v:params.is_critical, default_value:false, type:[ base_conf.consts.VAR.TYPES.BOOLEAN ] });
        var e = checkParam({ v:params.e })
        
        if(!e){
            try{
                this.error = new Error();
            }
            catch(e){}
        }
        else{
            this.error = e;
        }
        this.code = code;
        this.args = args;      
        this.message = message;
        this.additionnal_data = additionnal_data;
        this.backtrace = [];
        this.time = moment();

        let backtrace = computeBacktrace();
        backtrace.splice(0,2);
        for(var i in backtrace){
            if(backtrace[i].function == 'Module._compile'){
                break;
            }
            this.backtrace.push(backtrace[i]);
        }   

        /*if(!Process.db_is_init){
            Process.loadEmbarquedDB();
        }
        var sqlite = Store.man('embarqued_db');
        sqlite.insert('log', { date:moment().format(Store.man('conf:moment_db_date_format')), type:'ERROR', message:stringReplace(this.message, this.args), additionnal_data:JSON.stringify({ code:this.code, additionnal_data:this.additionnal_data, backtrace:this.backtrace }) });*/
        
        var options = parseOptionsString(base_conf.log_level);
        var print_option = parseOptionsString(base_conf.print_error_mode);
        if(options[1].err){
            if(print_option[1].consoleSimple){
                this.printConsoleSimple();
            }
            else if(print_option[1].consoleDetailled){
                this.printConsole();
            }
        }

        if(is_critical){
            if(!Process.is_init){
                Process.stop(1);
            }
            
            process.exit(1);
        }
    }

    /**
     * @description Print Error details in console
     * @use err1.printConsole()
     * @return {void}
     */
    printConsole ():void {
        let message = stringReplace(this.message, this.args);

        // @ts-ignore
        print({ message:'$0', args:[ 'ERROR' ], type:base_conf.consts.CONSOLE.PRINT.ERROR });
        // @ts-ignore
        print({ message:'$0 : $1', args:[ 'Code', this.code ], type:base_conf.consts.CONSOLE.PRINT.ERROR });
        // @ts-ignore
        print({ message:'$0 : $1', args:[ 'Message', message ], type:base_conf.consts.CONSOLE.PRINT.ERROR });
        
        for(var i in this.backtrace){
            // @ts-ignore
            print({ message:'------- START TRACE $0', args:[ i.toString() ], type:base_conf.consts.CONSOLE.PRINT.ERROR });
            
            // @ts-ignore
            print({ message:'$0 : $1', args:[ 'Time', this.backtrace[i].time.format('YYYY-MM-DD HH:mm:ss:SSS') ], type:base_conf.consts.CONSOLE.PRINT.ERROR });
            
            // @ts-ignore
            print({ message:'$0 : $1', args:[ 'Function', this.backtrace[i].function ], type:base_conf.consts.CONSOLE.PRINT.ERROR });
        
            // @ts-ignore
            print({ message:'$0 : $1', args:[ 'File', this.backtrace[i].file ], type:base_conf.consts.CONSOLE.PRINT.ERROR });

            // @ts-ignore
            print({ message:'$0 : $1', args:[ 'Line', this.backtrace[i].line ], type: base_conf.consts.CONSOLE.PRINT.ERROR });

            // @ts-ignore
            print({ message:'$0 : $1', args:[ 'Char', this.backtrace[i].char ], type: base_conf.consts.CONSOLE.PRINT.ERROR });

            // @ts-ignore
            print({ message:'------- END TRACE $0', args:[ i.toString() ], type:base_conf.consts.CONSOLE.PRINT.ERROR });
            
        }
    }

    printConsoleSimple ():void {
        let message = stringReplace(this.message, this.args);

        print({ message:'Error ($0), $1', args:[ this.code, message ], type:base_conf.consts.CONSOLE.PRINT.ERROR });
    }
}