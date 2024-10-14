/**
 * @description Configurations Class and Interface
 * @update 2024-10-04
 */

import { Moment } from "moment";
import { hash, int } from "../class/Var.class";
import { Trace } from "../lib/Debug.lib";

export interface LogErrorParams {
    id?:int;
    date?:Moment;
    code:string;
    message:string;
    backtrace:Trace[];
    addionnal_data?:hash;
}

export interface LogServerParams {
    id?:int;
    date?:Moment;
    type:string;
    method:string;
    origin:string;
    request:string;
    status?:int;
}

export interface LogSQLParams {
    id?:int;
    date?:Moment;
    sgbd:string;
    server:string;
    query:string;
    result?:string;
}

export interface LogSystemParams {
    id?:int;
    date?:Moment;
    type:string;
    message:string;
    additionnal_data?:hash;
}