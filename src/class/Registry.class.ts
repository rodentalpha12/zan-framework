/**
 * @description Configurations Class and Interface
 * @update 2024-10-04
 */

import { Moment } from "moment";
import { hash, int } from "../class/Var.class";

export interface RegistryParams {
    id?:int;
    date?:Moment;
    name:string;
    value:string;
    locked?:int;
}