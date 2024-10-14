/**
 * @description Functionnalities for manipulate database (MySQL, SQLite, ...) Synchronous and Asynchronous and ZF Embarqued Database
 * @update 2024-09-21
 */

import moment from "moment";
import { Err } from "./Err.lib";
import { stringReplace } from "./Util.lib";
import { hash, int, literal } from "../class/Var.class";
import { File } from "./FS.lib";
import { Trace } from "./Debug.lib";
import { ConnectionMySQLParams, DbSyncParams } from "../class/Db.class";
import { checkParam, getVarType } from "./Var.lib";

import base_conf from '../data/base.conf.json';

var MySqlS = require('sync-mysql');
var sqliteS = require('sqlite-sync');

/**
 * @description Return computed table name with prefix (setting base.conf.json)
 * @param {string} table_name Name of table
 * @return {string|undefined}
 */
export function getTableName (table_name:string):string {
    // @ts-ignore
    var t:string|undefined = base_conf.system_db_tables[table_name];

    if(!t){
        return '';
    }

    t = base_conf.system_db_tables_prefix + t;
    return t;
}

/**
 * @description Represent result for synchronous and asynchronous databases connections
 * @notice Uniq for all sgbd (MySQL, SQLIte, ...)
*/
export class DbResult {
    /**
     * @description SGBD used MySQL, SQLite, ...
     * @var {string} 
     */
    public sgbd:string='';

    /**
     * Multiple value setted by Db Manager used DbResult
     * @var {string}
     * @value SELECT
     * @value INSERT
     * @value UPDATE
     * @value DELETE
     * @value TRUNCATE
     * @value SPECIAL
     */
    public request_type:string = '';

    /**
     * @description Query request full generated executed
     * @var {string}
     */
    public query:string = '';

    /**
     * @description Length of row result retourned, computed after executing query
     * @var {int}
     */
    public length:int = 0;

    /**
     * @description Setted after insert request query, represend LAST INSERT ID
     * @var {Err|null}
     */
    public last_insert_id:int = 0;

    /**
     * @description Represent Err Object contain query error details, null if ok
     * @var {Err|null}
    */
    public error:Err|null = null;

    /**
     * @description Contains result row returned or empty any array
     * @var {array}
     */
    public result:any[] = [];

    /**
     * @description Create new instance of DbResult with or not result set
     * @param {array} result [OPTIONNAL] Result of query
     */
    constructor(result:any[]=[]){
        this.length = result.length;
    }
}

/**
 * @description Class for compute Criteria for multiple sgbd comptability, simple ex col operator value (col1 = 'text')
 */
export class DbCriteria {

    /**
     * @description Column name (ex 'col1')
     * @var {string}
     */
    public col:string = '';

    /**
     * @description Searching Operator (ex '=', '!=', 'LIKE', ...)
     * @var {string}
     */
    public op:string='';

    /**
     * @description Value to research (ex 'val1', 1, '%Like%', ...)
     * @var {literal}
     */
    public val:literal='';

    /**
     * @description Character use for separator using in query generate, default '
     * @value {string}
     */
    public string_sep = "'";

    /**
     * @description Create new DbCriteria
     * @param {strng} col Column name 
     * @param {string} op Searrching operator
     * @param {literal} val Value to research 
     * @param {string} string_sep [OPTIONNAL] Default character for using separator, default '
     * @use var criteria1 = new DbCriteria('user_id', '=', 1) 
     */
    constructor (col:string, op:string, val:literal, string_sep="'") {
        this.col = col;
        this.op = op;
        this.val = val;
        this.string_sep = string_sep;
    }

    /**
     * @description Generate code for request encastred in ()
     * @use criteria1.toString() => Final request
     * @return {string}
     */
    public toString ():string {
        return `(${this.col} ${this.op} ${getVarType(this.val)=='string'?`${this.string_sep}${this.val}${this.string_sep}'`:this.val})`;
    }
}

/**
 * @description Use for engroup DbCriteria object (ex SELECT * FROM TABLE WHERE ('user_id'=1 AND / OR 'user_id' = 2))
 */
export class DbCriteriaGroup {
    /**
     * @description Final query generated
     * @var {string}
     */
    public query:string='';

    /**
     * @description Use for engroup DbCriteria on format DbCriteria1, 'AND', DbCriteria2, parameters is defined by context utiisation
     * @param1 DbCriteria
     * @param2 AND / OR
     * @param3 DbCriteria, ...
     * @use var criteria_group1 = new DbCriteriaGroup(new DbCriteria('user_id','=',5), 'AND', new DbCriteria('user_account_active', '=', 1))
     */
    constructor (...args:any) {
        var a = arguments;
        for(var v in a){
            this.query += `${a[v].toString()} `;
        }

        this.query = this.query.substring(0,this.query.length-1);
    }

    /**
     * @description Generate code for request encastred in ()
     * @use criteria_group1.toString() => Final request
     * @return {string}
     */
    public toString () {
        return `(${this.query})`;
    }
}

/**
 * @description Used for manipulate MySQL Databases in synchrounous mode
 */
export class MySQLSync implements DbSyncParams {

    /**
     * @description Hostname / IP to MySQL Server
     * @var {string}
     */
    public host:string='';

    /**
     * @description Port used of MySQL Server
     * @var {int}
     */
    public port:int=0;

    /**
     * @description MySQL Username for login
     * @notice Password, is not saved after connection
     * @var {string}
     */
    public user:string='';

    public password:string='';

    /**
     * @description Database to connect
     * @var {string}
     */
    public database:string='';

    /**
     * @description Represent nodejs module 'sync-mysql' connection object
     * @todo 1 Afine var type for this variable
     * @var {any} 
     */
    public connection:any;

    /**
     * @description Indicator specify is connected on current server or not
     * @var {boolean}
     */
    public is_connected:boolean=false;

    /**
     * @description Param for disable logging system
     * @var {boolean}
     */
    public disabled_log:boolean=false;

    /**
     * @description Create new MySQL Synchronous connection, Execute simple operation on server for testing validation connection
     * @param {ConnectionMySQLParams} params
     *  - host {string} [OPTIONNAL] Hostname or IP of server, default 'localhost'
     *  - port {int} [OPTIONNAL] Port of server, default 3306
     *  - user {string} Username for connection
     *  - password {string} Password for connection
     *  - database [OPTIONNAL] Default database to connect
     * @use var dbMySQLSync1 = new MySQLSync({ user:'root', password:'1234' })
     */
    constructor (params:ConnectionMySQLParams) {
            this.host = checkParam({ v:params.host, default_value:'127.0.0.1', type:[ base_conf.consts.VAR.TYPES.STRING ] });
            this.port = checkParam({ v:params.port, default_value:3306, type:[ base_conf.consts.VAR.TYPES.INT ] });
            this.user = checkParam({ v:params.user, required:true, type: [ base_conf.consts.VAR.TYPES.STRING ] });
            this.database = checkParam({ v:params.database, default_value:'', type: [ base_conf.consts.VAR.TYPES.STRING ] });
            this.password = checkParam({ v:params.password, required:true, type: [ base_conf.consts.VAR.TYPES.STRING ] });
    }

    connect () {
        try {
            this.connection = new MySqlS({
                host: this.host,
                port: this.port,
                user: this.user,
                password: this.password,
                database: this.database
            });

            const result = this.connection.query('SELECT 1 + 1 AS solution');

            this.is_connected = true;
            this.password = '';
            return true;
        } catch (e:any) {
            new Err({ code:'DB01', message:'Error in MySQL database connection', additionnal_data: { host:this.host, port:this.port, user:this.user, database:this.database }, is_critical:true, e:e });
            this.is_connected = false;
            return false;
        }
    }

    /**
     * @description Execute SQL Query request on this current MySQL Server connection
     * @param {string} q Request (if arg, ex SELECT $0 FROM ...) 
     * @param {array} args [OPTIONNAL] Literals array contains parameter to replace in final query
     * @param {string} type [OPTIONNAL] Type of request
     *  @value SELECT
     *  @value INSERT
     *  @value UPDATE
     *  @value DELETE
     *  @value TRUNCATE
     *  @value SPECIAL
     * Default SPECIAL 
     * @param {boolean} no_log [OPTIONNAL] if false, not enable system and query loggingg, default false
     * @use dbMySQLSync1.query('SELECT $0 FROM $1 WHERE $2 = $3', [ 'col', 'table', 'user_id', 1 ], 'SELECT') => SELECT col FROM table WHERE user_id = 1
     * @return {DbResult}
     */
    public query (q:string, args:literal[]=[], type:string=base_conf.consts.SQL_QUERY.SPECIAL):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.MYSQL;
        db_result.request_type = type;
        if(!this.is_connected){
            db_result.error = new Err({ code:'DB02', message:'Database not connected' });
            return db_result;
        }

        try{
            db_result.query = stringReplace(q, args);
            db_result.result = this.connection.query(stringReplace(q, args));
            
            db_result.length = db_result.result.length;
        }
        catch(e:any){
            db_result.error = new Err({ code:'DB03', message:'Query error, query: $0', args:[ stringReplace(q, args) ], e:e });
        }

        if(!this.disabled_log && SystemDatabase.isConnected()){
            SystemDatabase.addLogSQL(base_conf.consts.SGBD.MYSQL, this.host, db_result.query, db_result.error?'ERROR':'OK');
        }
        
        return db_result;
    }

    /**
     * @description Use for execute rapid SQL SELECT request
     * @param {string} table Table to execute query SELECT
     * @param {DbCriteria|DbCriteriaGroup|hash|null} where [OPTIONNAL] Multiples possible values for search
     *  - DbCriteria : new DbCriteria('user_id', '=', 1)
     *  - DbCriteriaGroup : new DbCriteriaGroup(new DbCriteria('user_id', '=', 1), 'AND', new DbCriteria('user_account_active', '=', 1))
     *  - hash : Use for simple search (ex dbMySQLSync1.select('user', { user_id:1, user_account_active:1 })) => SELECT ... WHERE user_id = 1 AND user_account_active = 1
     *  - null : Use for selected all row in table 
     *  default, null 
     * @param {string} string_sep [OPTIONNAL] String separator (see DbCriteria and DbCriteriaGroup for details)
     * @use dbMySQLSync1.select('user', { user_account_active: 1 }) => SELECT * FROM user WHERE user_account_actie = 1
     * @return {DbResult} Result after execute query, or stopped by not connected
     */
    public select (table:string, where:DbCriteria|DbCriteriaGroup|hash|null=null, string_sep:string="'"):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.MYSQL;
        db_result.request_type = base_conf.consts.SQL_QUERY.SELECT;

        var query = `SELECT * FROM ${table}`;

        if(where instanceof DbCriteria || where instanceof DbCriteriaGroup){
            query += ` WHERE `;
            query += where.toString();
        }
        else if(where!=null){
            query += ` WHERE `;
            for(var colname in where){
                query += `${colname}=${getVarType(where[colname])==base_conf.consts.VAR.TYPES.STRING?`${string_sep}${where[colname]}${string_sep}`:where[colname]} AND `;
            }
            query = query.substring(0, query.length-5);
        }

        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);
        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        db_result.result = r.result;
        db_result.length = r.length;

        return db_result;
    }

    /**
     * @description Use for execute rapid SQL INSERT request and get last insert id on table
     * @param {string} table Table to execute query INSERT 
     * @param {hash} data Associative object template (colname: colvalue) => INSERT ... VALUE ('colname' = 'colvalue')
     * @param {string} string_sep [OPTIONNAL] String separator, default '
     * @use dbMySQLSync1.insert('log', { time:moment(), message:'Message'  }) => INSERT INTO log SET time,message VALUE (time='DateTime', message='Message')
     * @return {DbResult} Result after execute query and get last indest id, or stopped by not connected
     */
    public insert (table:string, data:hash, string_sep:string="'"):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.MYSQL;
        db_result.request_type = base_conf.consts.SQL_QUERY.INSERT;

        var query = `INSERT INTO ${table}`;
        var cols = '';
        var values = '';

        for(var colname in data){
            cols += `${colname},`;
            var var_type = getVarType(data[colname]);
            if(var_type == 'string'){
                values += `${string_sep}${data[colname]}${string_sep},`;
            }else{
                values += `${data[colname]},`;
            }
        }

        cols = cols.substring(0, cols.length-1);
        values = values.substring(0, values.length-1);

        query += ` (${cols}) VALUES (${values})`;
        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);
        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        var r = this.query('SELECT LAST_INSERT_ID() AS id');
        db_result.last_insert_id = r.result[0]['id'];

        return db_result;
    }

    /**
     * @description Use for execute rapid SQL UPDATE request on table
     * @param {string} table Table to execute query UPDATE
     * @param {hash} data_to_update Associative object template (colname: colvalue) => UPDATE ... SET colname = 'colvalue'
     * @param {DbCriteria|DbCriteriaGroup|hash|null} where Multiples possible values for search
     *  - DbCriteria : new DbCriteria('user_id', '=', 1)
     *  - DbCriteriaGroup : new DbCriteriaGroup(new DbCriteria('user_id', '=', 1), 'AND', new DbCriteria('user_account_active', '=', 1))
     *  - hash : Use for simple search (ex dbMySQLSync1.update('user',{ user_name:'Toto' }, { user_id:1, user_account_active:1 })) => UPDATE ... WHERE user_id = 1 AND user_account_active = 1
     * @param {string} string_sep [OPTIONNAL] String separator, default '
     * @use dbMySQLSync1.update('user', { user_name:'Toto' }, { user_id:1, user_account_active:1 }) => UPDATE user SET user_name='Toto' WHERE user_id = 1 AND user_account_active = 1
     * @return {DbResult} Result after execute query, or stopped by not connected
     */
    public update (table:string, data_to_update:hash, where:DbCriteria|DbCriteriaGroup|hash, string_sep:string="'"):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.MYSQL;
        db_result.request_type = base_conf.consts.SQL_QUERY.UPDATE;

        var query = `UPDATE ${table} SET `;

        for(var colname in data_to_update){
            var var_type = getVarType(data_to_update[colname]);
            if(var_type == 'string'){
                query += `${colname}=${string_sep}${data_to_update[colname]}${string_sep},`;
            }else{
                query += `${colname}=${data_to_update[colname]},`;
            }
        }

        query = query.substring(0, query.length-1);
        query += ` WHERE `;

        if(where instanceof DbCriteria || where instanceof DbCriteriaGroup){
            query += where.toString();
        }
        else{
            for(var colname in where){
                query += `${colname}=${getVarType(where[colname])==base_conf.consts.VAR.TYPES.STRING?`${string_sep}${where[colname]}${string_sep}`:where[colname]} AND `;
            }
            query = query.substring(0, query.length-5);
        }

        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);
        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        return db_result;
    }

    /**
     * @description Use for execute rapid SQL DELETE request on table
     * @param {string} table Table to execute query DELETE
     * @param {DbCriteria|DbCriteriaGroup|hash|null} where Multiples possible values for search
     *  - DbCriteria : new DbCriteria('user_id', '=', 1)
     *  - DbCriteriaGroup : new DbCriteriaGroup(new DbCriteria('user_id', '=', 1), 'AND', new DbCriteria('user_account_active', '=', 1))
     *  - hash : Use for simple search (ex dbMySQLSync1.delete('user', { user_id:1, user_account_active:1 })) => DELETE ... WHERE user_id = 1 AND user_account_active = 1
     * @param {string} string_sep [OPTIONNAL] String separator, default '
     * @use dbMySQLSync1.delete('user', { user_id:1 }) => DELETE FROM user WHERE user_id = 1
     * @return {DbResult} Result after execute query, or stopped by not connected
     */
    public delete (table:string, where:DbCriteria|DbCriteriaGroup|hash, string_sep:string="'"):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.MYSQL;
        db_result.request_type = base_conf.consts.SQL_QUERY.DELETE;

        var query = `DELETE FROM ${table} WHERE `;

        if(where instanceof DbCriteria || where instanceof DbCriteriaGroup){
            query += where.toString();
        }
        else{
            for(var colname in where){
                query += `${colname}=${getVarType(where[colname])==base_conf.consts.VAR.TYPES.STRING?`${string_sep}${where[colname]}${string_sep}`:where[colname]} AND `;
            }
            query = query.substring(0, query.length-5);
        }

        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);
        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        return db_result;
    }

    /**
     * @description Use for ececute rapid TRUNCATE table
     * @param {string} table Table to execute query TRUNCATE
     * @use dbMySQLSync1.truncate('log') => TRUNCATE TABLE log
     * @return {DbResult} Result after execute query, or stopped by not connected
     */
    public truncate (table:string):DbResult{
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.MYSQL;
        db_result.request_type = base_conf.consts.SQL_QUERY.TRUNCATE;

        var query = `TRUNCATE TABLE ${table}`;

        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);
        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        return db_result;
    }

}

export class SQLiteSync implements DbSyncParams {

    public file:string='';
    public required:boolean=false;
    public connection:any;
    public is_connected:boolean=false;
    public disabled_log:boolean=false;
    public encryptyon_key:string='';

    constructor (file_path:string, required:boolean=false){
        this.file = file_path;
        this.required = required;
    }

    public connect ():boolean {
        if(this.required && !File.isExist(this.file)){
            new Err({ code:'DB04', message:'Error in SQLite database connection, file not found, path : $0', args:[ this.file ], is_critical: true });
            this.is_connected = false;
            return false;
        }
        else{
            this.connection = sqliteS.connect(this.file);
            this.is_connected = true;
            return true;
        }
    }
    
    public query (q:string, args:literal[]=[], type:string=base_conf.consts.SQL_QUERY.SPECIAL):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.SQLITE;
        db_result.request_type = type;
        if(!this.is_connected){
            db_result.error = new Err({ code:'DB02', message:'Database not connected' });
            return db_result;
        }

        db_result.query = stringReplace(q, args);
        db_result.result = this.connection.run(stringReplace(q, args));
        
        if(!this.disabled_log && SystemDatabase.isConnected()){
            SystemDatabase.addLogSQL('SQLite', 'EMMARQUED_DB', db_result.query, db_result.error?'ERROR':'OK');
        }
        
        // @ts-ignore
        if(db_result.result.error){
            // @ts-ignore
            db_result.error = new Err({ code:'DB03', message:'Query error, query: $0', args:[ stringReplace(q, args) ], e: db_result.result.error });
            db_result.result = [];
            return db_result;
        }

        db_result.length = db_result.result.length;
        return db_result;
    }

    public select (table:string, where:DbCriteria|DbCriteriaGroup|hash|null=null, string_sep:string="'"):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.SQLITE;
        db_result.request_type = base_conf.consts.SQL_QUERY.SELECT;

        var query = `SELECT * FROM ${table}`;

        if(where instanceof DbCriteria || where instanceof DbCriteriaGroup){
            query += ` WHERE `;
            query += where.toString();
        }
        else if(where!=null){
            query += ` WHERE `;
            for(var colname in where){
                query += `${colname}=${getVarType(where[colname])==base_conf.consts.VAR.TYPES.STRING?`${string_sep}${where[colname]}${string_sep}`:where[colname]} AND `;
            }
            query = query.substring(0, query.length-5);
        }

        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);

        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        db_result.result = r.result;
        db_result.length = r.length;

        return db_result;
    }

    public insert (table:string, data:hash, string_sep:string="'"):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.SQLITE;
        db_result.request_type = base_conf.consts.SQL_QUERY.INSERT;

        var query = `INSERT INTO ${table}`;
        var cols = '';
        var values = '';

        for(var colname in data){
            cols += `${colname},`;
            var var_type = getVarType(data[colname]);
            if(var_type == 'string'){
                values += `${string_sep}${data[colname]}${string_sep},`;
            }else{
                values += `${data[colname]},`;
            }
        }

        cols = cols.substring(0, cols.length-1);
        values = values.substring(0, values.length-1);

        query += ` (${cols}) VALUES (${values})`;
        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);
        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        // @ts-ignore
        db_result.last_insert_id = r.result;

        return db_result;
    }

    public update (table:string, data_to_update:hash, where:DbCriteria|DbCriteriaGroup|hash, string_sep:string="'"):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.SQLITE;
        db_result.request_type = base_conf.consts.SQL_QUERY.UPDATE;

        var query = `UPDATE ${table} SET `;

        for(var colname in data_to_update){
            var var_type = getVarType(data_to_update[colname]);
            if(var_type == 'string'){
                query += `${colname}=${string_sep}${data_to_update[colname]}${string_sep},`;
            }else{
                query += `${colname}=${data_to_update[colname]},`;
            }
        }

        query = query.substring(0, query.length-1);
        query += ` WHERE `;

        if(where instanceof DbCriteria || where instanceof DbCriteriaGroup){
            query += where.toString();
        }
        else{
            for(var colname in where){
                query += `${colname}=${getVarType(where[colname])==base_conf.consts.VAR.TYPES.STRING?`${string_sep}${where[colname]}${string_sep}`:where[colname]} AND `;
            }
            query = query.substring(0, query.length-5);
        }

        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);
        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        return db_result;
    }

    public delete (table:string, where:DbCriteria|DbCriteriaGroup|hash, string_sep:string="'"):DbResult {
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.SQLITE;
        db_result.request_type = base_conf.consts.SQL_QUERY.DELETE;

        var query = `DELETE FROM ${table} WHERE `;

        if(where instanceof DbCriteria || where instanceof DbCriteriaGroup){
            query += where.toString();
        }
        else{
            for(var colname in where){
                query += `${colname}=${getVarType(where[colname])==base_conf.consts.VAR.TYPES.STRING?`${string_sep}${where[colname]}${string_sep}`:where[colname]} AND `;
            }
            query = query.substring(0, query.length-5);
        }

        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);
        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        return db_result;
    }

    public truncate (table:string):DbResult{
        var db_result = new DbResult();
        db_result.sgbd = base_conf.consts.SGBD.SQLITE;
        db_result.request_type = base_conf.consts.SQL_QUERY.TRUNCATE;

        var query = `DELETE FROM ${table}`;

        db_result.query = query;
        
        var r = this.query(query, [], db_result.request_type);
        if(r.error){
            db_result.error = r.error;
            return db_result;
        }

        var r2 = this.update('sqlite_sequence', { seq:0 }, { name:table });

        return db_result;
    }

}

export abstract class SystemDatabase {

    public static db:DbSyncParams;

    public static isConnected () {
        if(this.db && this.db.is_connected){
            return true;
        }
        return false;
    }

    public static connect (sgbd:string=base_conf.system_db_sgbd, path_or_dsn_obj:string|hash=''):int|Err {
        sgbd = sgbd.toLowerCase();
        if(path_or_dsn_obj === ''){
            if(sgbd == 'mysql'){
                path_or_dsn_obj = base_conf.system_db_mysql;
            }
            else if(sgbd == 'sqlite'){
                path_or_dsn_obj = base_conf.system_db_sqlite;
            }
        }

        if(sgbd == 'mysql' && getVarType(path_or_dsn_obj) == 'hash'){
            // @ts-ignore
            this.db = new MySQLSync(path_or_dsn_obj);
            return 1;
        }
        else if(sgbd == 'sqlite' && getVarType(path_or_dsn_obj) == 'string'){
            // @ts-ignore
            this.db = new SQLiteSync(path_or_dsn_obj, true);
            return 1;
        }
        else{
            //var e = new Err('DB05', 'Unknow SGBD ($0) for system database', [ sgbd ], { sgbd:sgbd, path_or_dsn_obj:path_or_dsn_obj });
            //return e;
            return 0;
        }
    }

    public static getConf (confname:string):any {
        if(!this.isConnected()){
            //var e = new Err('DB06', 'System database not connected', [], { function:'getConf', confname:confname });
            return 0;
        }

        var r = this.db.select(getTableName('configuration'), { name:confname });
        if(r.length > 0){
            var val = null;
            switch(r.result[0].type.toLowerCase()){
                case 'string':
                    val = r.result[0].value.toString();
                break;
                case 'int':
                    val = parseInt(r.result[0].value);
                break;
                case 'float':
                    val = parseFloat(r.result[0].value);
                break;
                case 'json':
                    val = JSON.parse(r.result[0].value);
                default:
                    val = r.result[0].value;
                break;
            }
            
            return val;
        }
        return undefined;
    }

    public static setConf (confname:string, conftype:string, confvalue:string, description:string=''):int|Err{
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'setConf', confname:confname });
            return e;
        }

        var r1 = this.db.select(getTableName('configuration'), { name:confname });
        if(r1.length > 0){
            var r2 = this.db.update(getTableName('configuration'), { type:conftype, value:confvalue, description:description }, { name:confname });
            return r1.result[0].id;
        }else{
            var r2 = this.db.insert(getTableName('configuration'), { name:confname, type:conftype, value:confvalue, description:description });
            return r2.last_insert_id;
        }
    }

    public static getRegistryValue (registry_name:string, return_date:boolean=false):string[]|string|Err|undefined{
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'getRegistryValue', registry_name:registry_name });
            return e;
        }

        var r = this.db.select(getTableName('registry'), { name:registry_name });
        if(r.length == 0){
            return undefined;
        }

        if(return_date){
            return [ r.result[0].date, r.result[0].value ];
        }

        return r.result[0].value;
    }

    public static setRegistryValue (registry_name:string, registry_value:string):int|Err{
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'setRegistryValue', registry_name:registry_name });
            return e;
        }

        var r1 = this.db.select(getTableName('registry'), { name:registry_name });
        if(r1.length > 0){
            var r2 = this.db.update(getTableName('registry'), { date:computeDBDate(true), value:registry_value }, { name:registry_name });
            return r1.result[0].id;
        }else{
            var r2 = this.db.insert(getTableName('registry'), { date:computeDBDate(true), value:registry_value });
            return r2.last_insert_id;
        }
    }

    public static getMessage (code:string, lang:string):string|boolean|Err {
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'getMessage', code:code, lang:lang });
            return e;
        }

        var r1 = this.db.select(getTableName('message'), { code:code, lang:lang });
        if(r1.length > 0){
            return r1.result[0].message;
        }
        return false;
    }

    public static setMessage (code:string, lang:string, message:string):int|Err {
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'setMessage', code:code, lang:lang });
            return e;
        }

        var r1 = this.db.select(getTableName('message'), { code:code, lang:lang });
        if(r1.length > 0){
            var r2 = this.db.update(getTableName('message'), { lang:lang, message:message }, { code:code, lang:lang });
            return r1.result[0].id;
        }else{
            var r2 = this.db.insert(getTableName('message'), { code:code, lang:lang, message:message });
            return r2.last_insert_id;
        }
    }

    public static addLogSystem (type:string, message:string, additionnal_data:hash={}):int|Err {
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'addLogSystem', type:type, message:message });
            return e;
        }

        var r1 = this.db.insert(getTableName('log_system'), { time:computeDBDate(true), type:type, message:message, additionnal_data:JSON.stringify(additionnal_data) });
        return r1.last_insert_id;
    }

    public static addLogError (code:string, message:string, backtrace:Trace[]=[], additionnal_data:hash={}):int|Err {
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'addLogError', code:code, message:message });
            return e;
        }
        
        var r1 = this.db.insert(getTableName('log_error'), { time:computeDBDate(true), code:code, message:message, backtrace:JSON.stringify(backtrace), additionnal_data:JSON.stringify(additionnal_data) });
        return r1.last_insert_id;
    }

    public static addLogServer(type:string, method:string, origin:string, request:string, status:int):int|Err {
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'addLogServer', type:type, method:method, origin:origin, request:request, status:status });
            return e;
        }

        var r1 = this.db.insert(getTableName('log_server'), { time:computeDBDate(true), type:type, method:method, origin:origin, request:request, status:status });
        return r1.last_insert_id;
    }

    public static addLogSQL (sgbd:string, server:string, query:string, result:string):int|Err {
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'addLogSQL', sgbd:sgbd, server:server, query:query });
            return e;
        }
        
        var query = `INSERT INTO ${getTableName('log_sql')} (time, sgbd, server, query, result), VALUES ('${computeDBDate(true)}','${sgbd}','${server}','${query}', '${result}')`;
        
        var r = this.db.connection.run(query);
        if(r.error){
            var error = new Err('DB03', 'Query error, query: $0', [ query ], {}, false, r.error);
            return error;
        }

        return r[0].id;
    }
    
    public static getLog (logname:string, where:DbCriteria|DbCriteriaGroup|hash, limit:int[] = [ 0, 500 ], string_sep:string="'"):Err|undefined {
        if(!this.isConnected()){
            var e = new Err('DB06', 'System database not connected', [], { function:'getLog', logname:logname });
            return e;
        }
    }

    

}

export function computeDBDate (time:boolean=false) {
    if(!time){
        return moment().format(base_conf.system_db_moment_date_format);
    }
    else{
        return moment().format(base_conf.system_db_moment_date_time_format);
    }
}