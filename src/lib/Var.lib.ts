/**
 * @description Contains variables definition (typescript) and functions using variables
 * @update 2024-09-21
 */

import { Err } from "./Err.lib";

import base_conf from '../data/base.conf.json';
import { CheckParamParams, hash, index, literal } from "../class/Var.class";

const util = require('util');

/**
 * @description Return detailled type of specified argument variable
 * @param {any} v Variable
 * @use getVarType(1) => int, getVarType('Toto') => string, getVarType(() => {}) => function, ...
 * @value string String variable
 * @value boolean Boolean variable
 * @value int Integer number variable
 * @value float Floating number variable
 * @value array Object Array ([1,2,...])
 * @value null Null variable
 * @value function:anonymous [Function (anonymous)] (() => {})
 * @value function:{Name} Return name of function declared with (function test() {}) => function:test
 * @value class:{Name} Return class name of class declared with (class ClassName {}) => class:ClassName
 * @value hash Hash Object (JSON Object) ({ index1:1, index2:'test' })
 * @value null Null Value (absolutely null) (null)
 * @value undefind Undefined Value (absolutely undefined) (undefined)
 * @value unknow Other values
 * @return {string} Detailled variable type 
 */
export function getVarType (v:any):string {
    let type = typeof v;
    switch (type) {
        case 'string':
            if(v.length == 1){
                return base_conf.consts.VAR.TYPES.CHAR;
            }
            return base_conf.consts.VAR.TYPES.STRING;
        break;
        case 'boolean':
            return base_conf.consts.VAR.TYPES.BOOLEAN;
        break;
        case 'number':
            if(Number.isInteger(v)){
                return base_conf.consts.VAR.TYPES.INT;
            }
            return base_conf.consts.VAR.TYPES.FLOAT;
        break;
        case 'function':
        case 'object':
            let inspect = util.inspect(v);

            if(Array.isArray(v)){
                return base_conf.consts.VAR.TYPES.ARRAY;
            }

            if(v == null){
                return base_conf.consts.VAR.TYPES.NULL;
            }
            
            if(inspect == '[Function (anonymous)]'){
                return base_conf.consts.VAR.TYPES.FUNCTION_ANONYMOUS;
            }

            var match = inspect.match(/\[Function\: (.*)\]/);
            if(match){
                return base_conf.consts.VAR.TYPES.FUNCTION + '/' + match[1];
            }

            match = inspect.match(/\[class (.*)\]/);
            if(match){
                return base_conf.consts.VAR.TYPES.CLASS + '/' + match[1];
            }

            return base_conf.consts.VAR.TYPES.HASH;
        break;
        case 'undefined':
            if(v === null){
                return base_conf.consts.VAR.TYPES.NULL;
            }
            return base_conf.consts.VAR.TYPES.UNDEFINED;
        break;
    }

    return base_conf.consts.VAR.TYPES.UNKNOW;
}

/**
 * @description Using for checking variable in {hash} object (frequently used for checking and assignate variable parameters in process code, function, ...), check is required or not, default value for optionnal parameter and checking variable type (use Var getVarType function), optionnal
 * @param {any} v Variable to indentify 
 * @param {boolean} required Specify if index in hash is required 
 * @param {any} default_value [OPTIONNAL] Specify default value returned if not required
 * @param {array} type [OPTIONNAL] Array contain literals type, type defined in Var getVarType function 
 * @use checkParamInHash ({ test:1 }, 'test', true, null, [ 'string', 'int' ]) => 1, ({ test2:'string' }, 'test', false, 1, [ 'string', 'int' ]) => 1
 * @return {any} Return value of index in hash
 */
export function checkParam (params:CheckParamParams):any{
    var v = params.v;
    var required = params.required;
    var default_value = params.default_value;
    var type = params.type ? params.type : [];
    
    if((v === undefined || v === null) && required){
        // @ts-ignore
        var e = new Err({ code:'INT01', message:'Error in check params, value is required but is null', additionnal_data:{ hash:h }, is_critical:true });
    }

    if(v === undefined || v === null){
        v = default_value;
    }

    let vt = getVarType(v);
    
    if(type.length > 0 && type.indexOf(vt) == -1){
        // @ts-ignore
        var e = new Err({ code:'INT02', message:'Error in check params, type value passed must be $1, value passed is type $0', args:[ vt.toString(), type.join(',') ], type:{ required:required, default_value:default_value, type:type }, is_critical: true });
        // TODO:2:5 Checking error, logging necessary, IN PROCESS
    }

    return v;
}

/**
 * @description Parse options string and returned array with two hash contains option with or without value, first hash is all options not selected, second hash is options selected (with [])
 * @param {string} text Text for parsing 
 * @param {string} sep Value separator (;)
 * @use parseOptionsString('option1,[option2],option3=value1,[option4=value2]') => [ { option1:false, option3:value1 }, { option2:true, option4:value2 } ]
 * @return {array} {hash}
 */
export function parseOptionsString(text:string,sep:string=';'):hash[] {
    var options:string[] = text.split(sep);
    var f_options:hash = {};
    var f_options_enabled:hash = {};
    for(var i in options){
        let first_char = options[i].substring(0,1);
        let last_char = options[i].substring(options[i].length-1,options[i].length);

        if(first_char == '[' && last_char == ']'){
            let option = options[i].substring(1,options[i].length-1);
            var option_with_value = option.split('=');

            f_options_enabled[option_with_value.length == 2 ? option_with_value[0] : option] = (option_with_value.length == 2 ? option_with_value[1] : true);
        }
        else{
            var option_with_value = options[i].split('=');
            f_options[option_with_value.length == 2 ? option_with_value[0] : options[i]] = (option_with_value.length == 2 ? option_with_value[1] : false);
        }
    }
    return [ f_options, f_options_enabled ];
}

/**
 * Abstract Class (Global in process) Provide cloud storage for partaging variable variables
 */
export abstract class Store {
    /**
     * @description Data contain variables, hash with index
     * @var {hash}
     */
    protected static data:hash = {};

    /**
     * @description Manipulation of internal value data
     * @param {index} index Index in hash 
     * @param {any} v [OPTIONNAL] Value to assign, undefined for just use getter
     * @use Store.man('index') => value (getter) Store.man('index', 'value') => value (setter)
     * @return {any} Return value of index in hash
     */
    public static man(index:index, v:any=undefined):any{
        if(v !== undefined){
            this.data[index] = v;
        }
        return this.data[index];
    }
}

/**
 * 
 * @param obj 
 * @param col 
 * @param col_value 
 * @param col_to_return 
 * @returns 
 */
export function getParamInHash (obj:hash[], col:string, col_value:literal, col_to_return:string=''){
    for(var i in obj){
        if(obj[i][col] == col_value){
            if(col_to_return != '' && obj[i][col_to_return] !== undefined){
                return obj[i][col_to_return];
            }
            else{
                return obj[i];
            }
        }
    }
}