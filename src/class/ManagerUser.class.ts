/**
 * @description Manager user Class and Interface
 * @update 2024-10-04
 */

import { int } from "../class/Var.class";

export interface ManagerUserParams {
    id?:int;
    name:string;
    groups?:string;
    login:string;
    password:string;
}