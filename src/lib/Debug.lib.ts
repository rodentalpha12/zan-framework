/**
 * @description Functionnalities for debug functions, scanner and manipulator debug
 * @update 2024-09-21
 */

import moment, { Moment } from "moment";
import { hash, int } from "../class/Var.class";

/**
 * @description Trace object, using and manipulate for tracing function details
 */
export class Trace {
    /**
     * @description Moment object created in constructor specify exact date and time of launch error
     * @var {Moment}
     */
    public time:Moment;

    /**
     * @description Specify file in error declenched
     * @var {string}
     */
    public file:string;

    /**
     * @description Specify function in error declenched
     * @var {string}
     */
    public function:string;

    /**
     * @description Specify line number in error declenched
     * @var {int}
     */
    public line:int;

    /**
     * @description Specify character number in error declenched
     * @var {int}
     */
    public char:int;

    /**
     * @description Additionnal data to add in Trace
     * @var {hash}
     */
    public additionnal_data:hash;

    /**
     * @description Create new Trace
     * @param additionnal_data 
     * @param fixed_backtrace_increment_val  
     */
    constructor (additionnal_data:hash={}, fixed_backtrace_increment_val:int=1) {
        this.time = moment();
        this.additionnal_data = additionnal_data;
        let stack = new Error().stack;

        var regxpFunc = new RegExp(/at (.*) /gmi);
        var regxpFile = new RegExp(/\((.*)\)/gmi);

        // @ts-ignore
        var funcs:string[] = stack.match(regxpFunc);
        // @ts-ignore
        var files:string[] = stack.match(regxpFile);

        let tr_file:string[]=[];

        let trace = funcs[fixed_backtrace_increment_val];
        let trace_file = files[fixed_backtrace_increment_val];

        this.function = trace.toString().substring(3, trace.length-1);
        let traceLine = trace_file.toString().substring(1, trace_file.length-1);
        
        tr_file = traceLine.split(':');
        
        this.file = tr_file[0];
        this.line = parseInt(tr_file[1]);
        this.char = parseInt(tr_file[2]);
    }   
}

export function computeBacktrace ():Trace[] {
    let backtrace:Trace[] = [];
    let stack = new Error().stack;

    var regxpFunc = new RegExp(/at (.*) /gmi);
    var regxpFile = new RegExp(/\((.*)\)/gmi);

    // @ts-ignore
    var funcs:string[] = stack.match(regxpFunc);
    // @ts-ignore
    var files:string[] = stack.match(regxpFile);

    let tr_file:Array<string>=[];

    for(var i in funcs){
        let trace = new Trace;
        
        trace.function = funcs[i].toString().substring(3, funcs[i].length-1);
        let traceLine = files[i].toString().substring(1,files[i].length-1);
        
        tr_file = traceLine.split(':');
        
        if((tr_file[0].length == 1 && process.platform === "win32") || tr_file[0] == 'node'){
            tr_file[0] += ':' + tr_file[1];
            tr_file.splice(1,1);
        }

        trace.file = tr_file[0];;
        trace.line = parseInt(tr_file[1]);
        trace.char = parseInt(tr_file[2]);

        backtrace.push(trace);
    }

    return backtrace;
}