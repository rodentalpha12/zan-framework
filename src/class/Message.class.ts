/**
 * @description Messages manipulation
 * @update 2024-10-04
 */

import { int } from "../class/Var.class";

export interface MessageParams {
    id?:int;
    lang:string;
    code:string;
    message:string;
}