/**
 * @description Configurations Class and Interface
 * @update 2024-10-04
 */

import { Moment } from "moment";
import { int } from "../class/Var.class";

export interface DebugTodoParams {
    id?:int;
    priority?:int;
    date?:Moment;
    name:string;
    file?:string;
    function?:string;
    status?:string;
    value:string;
}