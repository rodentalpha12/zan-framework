import { int } from "../class/Var.class";

export interface ServerConnectionParams {
    port?:int;
    webroot?:string;
    name?:string;
}