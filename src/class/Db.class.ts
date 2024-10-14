/**
 * @description Configurations Class and Interface
 * @update 2024-10-04
 */

import { DbCriteria, DbCriteriaGroup, DbResult } from "../lib/Db.lib";
import { hash, int, literal } from "../class/Var.class";

export interface FieldDefinitionParams {
    name:string;
    type:string;
    lenght?:int;
    null?:boolean;
    default?:literal;
    unique?:boolean;
    primary_key?:boolean;
    auto_increment?:boolean;
}

export interface TableDefinitionParams {
    name:string;
    erase?:boolean;
    merge?:boolean;
    engine?:string;
    charset?:string;
    collate?:string;
    comment?:string;
    fields:FieldDefinitionParams[];
}

export interface DbSyncParams {
    is_connected:boolean;
    connection:any;
    encryptyon_key?:string;

    connect():boolean;
    query (q:string, args?:literal[], type?:string, no_log?:boolean):DbResult;
    select (table:string, where?:DbCriteria|DbCriteriaGroup|hash|null, string_sep?:string):DbResult;
    insert (table:string, data:hash, string_sep?:string):DbResult;
    update (table:string, data_to_update:hash, where:DbCriteria|DbCriteriaGroup|hash, string_sep?:string):DbResult;
    delete (table:string, where:DbCriteria|DbCriteriaGroup|hash, string_sep?:string):DbResult;
    truncate (table:string):DbResult;
} 

export interface ConnectionMySQLParams {
    host:string;
    port?:int;
    user:string;
    password:string;
    database?:string;
}

export interface ConnectionSQLiteParams {
    path:string;
    password?:string;
}