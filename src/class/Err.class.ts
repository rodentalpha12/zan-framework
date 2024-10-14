import { hash, index } from "../class/Var.class";

export interface ErrParams {
    code:index;
    message?:string;
    args?:any[];
    additionnal_data?:hash;
    is_critical?:boolean;
    e?:Error;
}