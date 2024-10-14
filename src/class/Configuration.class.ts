/**
 * @description Configurations Class and Interface
 * @update 2024-10-04
 */

import { int } from "../class/Var.class";

export interface ConfigurationParams {
    id?:int;
    name:string;
    description?:string;
    type:string;
    value:string|null
}

export interface ConfigurationMailServerParams {
    id?:int;
    secure?:int;
    name:string;
    host:string;
    service_is_gmail?:int;
    user:string;
    password:string;
    mail_from_name:string;
}

export interface ConfigurationMySQLServerParams {
    id?:int;
    enable?:int;
    name?:string;
    host:string;
    port:int;
    user:string;
    password:string;
    database?:string;
}

export interface HTTPOrUDPServerParams {
    id?:int;
    enable?:int;
    name:string;
    protocol:string;
    host:string;
    port:int;
    webroot?:string;
}