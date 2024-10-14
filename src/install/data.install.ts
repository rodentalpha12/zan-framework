/**
 * @description Configuration file for exporting or update zan-framework for one application
 * @update 2024-09-20
 */

import os from 'os';

import moment from "moment";

import { hash, literal } from "../class/Var.class";
import { getOsPlatform } from "../lib/Util.lib";
import { ConfigurationMailServerParams, ConfigurationMySQLServerParams, ConfigurationParams, HTTPOrUDPServerParams } from '../class/Configuration.class';
import { ServerRouteOrEventParams } from '../class/ServerRouteOrEvent.class';
import { ManagerUserParams } from '../class/ManagerUser.class';
import { MessageParams } from '../class/Message.class';
import { RegistryParams } from '../class/Registry.class';
import { TableDefinitionParams } from '../class/Db.class';

import consts from './consts.install.json';

var getos = require('getos');

/* ========================== ZF SOURCE ========================== */

/**
 * @description Folder contain zan framework dir
 * @var {string}
 */
export var zf_source:string = '/Volumes/DevProjects/zan-framework/1.0.1';

/**
 * @description ZF Version
 * @var {string}
 */
export var zf_version:string = "1.0.1";

/* ========================== BUILD ========================== */

/**
 * @description Specify build target, updating local data on this computer or build archive mode
 * @var {string}
 * @alue UPDATE : Update on this computer for specific folder (code and db)
 * @value UPDATE_FILE : Update only file 
 * @value UPDATE_DB : Update only db
 * @value ARCHIVE : Create archive for deployement
 */
export var build_mode:string = consts.TARGET.UPDATE;

/* ========================== BUILD UPDATE MODE ========================== */

/**
 * @description Directory contain zf application to updating
 * @var {string}
 */
export var build_mode_update_data_path:string = '/Volumes/DevProjects/zan-framework/1.0.1';

/**
 * @description Specify directory if application on dev env or prod env
 * @var {string}
 * @value DEV : Target zf application is not builded (typescrit format)
 * @alue PROD : Target zf application is builded (nodejs format)
 */
export var build_mode_update_env:string = consts.ENV.DEV;

/* ========================== BUILD ARCHIVE MODE ========================== */

/**
 * @description Full path to creating archive file name
 * @var {string}
 * Supported format
 * zip, tar, tar.gz, tar.xz
 */
export var build_mode_archive_target:string = '/Volumes/DevProjects/zan-framework/1.0.1/src/build/zan.zip';

/* ========================== DATE MOMENT PARAMS ========================== */

/**
 * @description Default timezone
 * @var {string}
 */
export var date_timezone:string = 'Europe/Paris';

/**
 * @description Default moment locale
 * @var {string}
 */
export var date_locale:string = consts.LANGS.FR;

/* ========================== FRAMEWORK SYSTEM DATABASE ========================== */

/**
 * @description Script Write mode for embarqued database
 * @var {string}
 * @value REWRITE : If exist, existing data is removeved and recreated
 * @value MERGE : If exist, merging new and old data
 */
export var system_db_installation_write:string = consts.SYSTEM_DB.MODE.REWRITE;

export var system_db_installation_dbname:string = 'zan-nodejs-framework';

/**
 * @description SGBD For embarqued db
 * @var {string}
 * @value SQLITE
 * @value MYSQL
 */
export var system_db_sgbd:string = consts.SGBD.SQLITE;

/**
 * @description Encryption key for crypt / uncrypt chiffred system database, if empty, system database is not chiffred
 * @var {string}
 */
export var system_db_encryption_key:string = '';

/* ========================== EMBARQUED SQLITE DATABASE ========================== */

export var var_db_sqlite_path:string = '/Volumes/DevProjects/zan-framework/1.0.1/src/data/data2.db3';

export var var_db_sqlite_password:string = '';

/* ========================== EMBARQUED MYSQL DATABASE ========================== */

/**
 * @description Connection data for MySQL
 * @var {ConfigurationMySQLServerParams}
 */
export var system_db_mysql_connection:ConfigurationMySQLServerParams = {
    host:'135.125.1.92',
    port:3306,
    user:'root',
    password:'1234'
}

/**
 * @description Connection data for system user for MySQL
 * @var {ConfigurationMySQLServerParams}
 */
export var system_db_mysql_user:ConfigurationMySQLServerParams = {
    host:'135.125.1.92',
    port:3306,
    user:'zan-nodejs-framework',
    password:'1234',
}

/**
 * @description Mode for copy (if exist)
 * @var {string}
 * @value NO_COPY : No system DB copy
 * @value EXPORT_FILE : Create SQL file
 * @value EXPORT_FILE_IN_ARCHIVE Create SQL file in archive (need build_mode is ARCHIVE)
 */
export var system_db_copy_mode:string = consts.SYSTEM_DB.COPY_MODE.EXPORT_FILE;

/**
 * @description Path to SQL export file (for EXPORT_FILE mode, see prev value) (if exist)
 * @var {string}
 */
export var system_db_copy_export_path:string = '/Volumes/DevProjects/zan-framework/1.0.1/build/db-copy-' + moment().format('YY-MM-DD-HH-ss') + '.sql';

/**
 * @description Prefix for tables in embarqued db
 * @var {string}
 */
export var system_db_tables_prefix:string = 'zf101_';

/**
 * @description If true, drop database and recreate all
 * @var {boolean}
 */
export var system_db_tables_erase_all:boolean = true;

/**
 * @description Default engine for table defnition in system DB
 */
export var system_db_tables_default_engine:string = 'InnoDB';

/**
 * @description Default charset for table defnition in system DB
 * @var {string}
 */
export var system_db_tables_default_charset:string = 'utf8mb4';

/**
 * @description Default collate for table defnition in system DB
 * @var {string}
 */
export var system_db_tables_default_collate:string = 'utf8mb4_unicode_ci';

/**
 * @description Framework and CMS tables
 * @notice _TD (Tables Definition)
 * @var {array} {TableDefinitionParams} => { fields:{FieldDefinitionParams} }
 */
export var system_db_tables:TableDefinitionParams[] = [
    {
        name:'configuration',
        erase:true,
        comment:'General configuration',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'name', type:'varchar', lenght:100, unique:true },
            { name:'description', type:'text', null:true },
            { name:'type', type:'varchar', lenght:100, default:'string' },
            { name:'value', type:'text', null:true }
        ]
    },
    {
        name:'configuration_mail_server',
        erase:true,
        comment:'List of Mail Server(s) for COM functions',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'enable', type:'int', lenght:1, default: 0 },
            { name:'name', type:'varchar', lenght:100, unique:true },
            { name:'secure', type:'int', lenght:1, default: 0 },
            { name:'host', type:'varchar', lenght:100 },
            { name:'service_is_gmail', type:'int', lenght:1, default: 0 },
            { name:'user', type:'varchar', lenght:100 },
            { name:'password', type:'varchar', lenght:100 },
            { name:'mail_from_name', type:'varchar', lenght:100 }
        ]
    },
    {
        name:'configuration_mysql_server',
        erase:true,
        comment:'List of MySQL Server(s)',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'enable', type:'int', lenght:1, default: 0 },
            { name:'name', type:'varchar', lenght:100, unique:true },
            { name:'host', type:'varchar', lenght:100 },
            { name:'port', type:'int' },
            { name:'user', type:'varchar', lenght:100 },
            { name:'password', type:'varchar', lenght:100 },
            { name:'database', type:'varchar', lenght:100 }
        ]
    },
    {
        name:'configuration_api_or_web_server',
        erase:true,
        comment:'List of HTTP or UDP Server(s)',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'enable', type:'int', lenght:1, default: 0 },
            { name:'protocol', type:'varchar', lenght:100 },
            { name:'name', type:'varchar', lenght:100, unique:true },
            { name:'host', type:'varchar', lenght:100 },
            { name:'port', type:'int' },
            { name:'webroot', type:'varchar', lenght:100, null:true }
        ]
    },
    {
        name:'debug_todo',
        erase:true,
        comment:'Todo and Debug data using for updating, comparing and installing data',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'priority', type:'int', lenght:1, default: 0 },
            /**
             * @value LOW
             * @value MEDIUM
             * @value HIGHT
             * @value CRITICAL
             */
            { name:'priority_text', type:'varchar', lenght:10, default:consts.LEVELS.MEDIUM },
            { name:'date', type:'datetime', default:'CURRENT_TIMESTAMP' },
            { name:'name', type:'varchar', lenght:100 },
            { name:'file', type:'varchar', lenght:100 },
            { name:'function', type:'varchar', lenght:100 },
            /**
             * @value OPENING
             * @value IN_PROCESS
             * @value FINISHED
             */
            { name:'status', type:'varchar', lenght:100, default:consts.STATUS.OPENING },
            { name:'message', type:'text', null:true }
        ]
    },
    {
        name:'log_error',
        erase:true,
        comment:'Errors Log data',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'date', type:'datetime', default:'CURRENT_TIMESTAMP' },
            { name:'enable', type:'int', lenght:1, default: 0 },
            { name:'protocol', type:'varchar', lenght:100 },
            { name:'code', type:'varchar', lenght:10 },
            { name:'message', type:'text' },
            { name:'backtrace', type:'text', null:true },
            { name:'addionnal_data', type:'text', null:true }
        ]
    },
    {
        name:'log_server',
        erase:true,
        comment:'Server Access Log data',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'server_id', type:'int' },
            { name:'date', type:'datetime', default:'CURRENT_TIMESTAMP' },
            { name:'type', type:'varchar', lenght:50, default:consts.TYPES.INFORMATION },
            { name:'method', type:'varchar', lenght:10 },
            { name:'origin', type:'varchar', lenght:100 },
            { name:'request', type:'varchar', lenght:100 },
            { name:'status', type:'int', default:200 },
            { name:'addionnal_data', type:'text', null:true }
        ]
    },
    {
        name:'log_sql',
        erase:true,
        comment:'SQL Query Log data',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'sgbd_server_id', type:'int' },
            { name:'date', type:'datetime', default:'CURRENT_TIMESTAMP' },
            { name:'sgbd', type:'varchar', lenght:100 },
            { name:'query', type:'text' },
            { name:'status', type:'int', default:200 },
            { name:'result', type:'varchar', lenght:10, default:consts.OK },
            { name:'addionnal_data', type:'text', null:true }
        ]
    },
    {
        name:'log_system',
        erase:true,
        comment:'System Log data',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'date', type:'datetime', default:'CURRENT_TIMESTAMP' },
            { name:'type', type:'varchar', lenght:50, default:consts.TYPES.INFORMATION },
            { name:'message', type:'varchar', lenght:100, null:true },
            { name:'addionnal_data', type:'text', null:true }
        ]
    },
    {
        name:'manager_user',
        erase:true,
        comment:'User for managing application',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'name', type:'varchar', lenght:100, unique:true },
            { name:'groups', type:'text', default:'user' },
            { name:'login', type:'varchar', lenght:100, unique:true },
            { name:'password', type:'text' },
        ]
    },
    {
        name:'message',
        erase:true,
        comment:'List of system messages',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'lang', type:'varchar', lenght:2, default: date_locale },
            { name:'code', type:'varchar', lenght:100 },
            { name:'message', type:'text' },
        ]
    },
    {
        name:'mail',
        erase:true,
        comment:'List of mail sending or in sending process',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'mail_server_id', type:'int' },
            { name:'sending_date', type:'datetime', null:true },
            { name:'delayed_date', type:'datetime', null:true },
            { name:'to', type:'text' },
            { name:'message_html', type:'text' }
        ]
    },
    {
        name:'registry',
        erase:true,
        comment:'System Core parameters (protected value)',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'date', type:'datetime', default:'CURRENT_TIMESTAMP' },
            { name:'name', type:'varchar', lenght:100, unique:true },
            { name:'value', type:'text', null:true },
            { name:'locked', type:'int', lenght:1, default:0 },
        ]
    },
    {
        name:'var_hash',
        erase:true,
        comment:'Static General variables',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'name', type:'varchar', lenght:100, unique:true },
            { name:'value', type:'text', null:true }
        ]
    },
    {
        name:'server_route_or_event',
        erase:true,
        comment:'List of routes (HTTP) or event (UDP)',
        fields:[
            { name:'id', type:'int', unique:true, primary_key:true, auto_increment:true },
            { name:'server_id', type:'int' },
            { name:'name', type:'varchar', lenght:100, unique:true },
            { name:'route_or_event', type:'varchar', lenght:100 },
            { name:'code_or_file', type:'text', null:true },
        ]
    }
];

/**
 * @description Registry system value
 * @var {array} {RegistryParams}
 */
export var use_local_data_registry:RegistryParams[] = [
    { name:'/SYSTEM/BIN_PATH', value:'./bin;./test' },
    { name:'/SYSTEM/GROUPS', value:'user;admin' },

    /**
     * Features enabled
     * Possible values : 
     * HTTP_SERVER : 
     * UDP_SERVER
     * COM_MAIL_SERVER
     * COM_SMS_SERVER
     * NCURSES
     */
    { name:'/SYSTEM/FEATURES', value:'[HTTP_SERVER];UDP_SERVER;[COM_MAIL_SERVER];COM_SMS_SERVER;[NCURSES]' },
    //{ name:'/SYSTEM/ENCRRYPTION_KEY', value: system_db_encryption_key },
    { name:'/SYSTEM/APPLICATION_DATE_INITIALIZE', value:moment().format('YYYY-MM-DD hh:mm:ss'), locked:1 },
    //{ name:'/SYSTEM/APPLICATION_ID', value: }
    { name:'/SYSTEM/APPLICATION_NAME', value:'Application name' },
    { name:'/SYSTEM/APPLICATION_DESCRIPTION', value:'Application description' },
    { name:'/SYSTEM/APPLICATION_LOCATION', value:'/path/to/app' },

    /**
     * Project Code Template
     * Possible values :
     * API_HTTP_SERVER : API Server with HTTP
     * API_UDP_SERVER : API Server with UDP (WebSocket)
     * WEBSERVER : HTTP WebServer 
     * DESKTOP_ELECTRON : Electron Application
     * SCRIPT_MAC : Sctipt(s) for mac OS
     * SCRIPT_WIN : Script(s) for windows OS
     * MAIL_SERVER : COM Mail Server
     */
    { name:'/SYSTEM/APPLICATION_TYPE', value:consts.CODE_TEMPLATES.API_HTTP_SERVER },
    { name:'/SYSTEM/APPLICATION_VERSION', value:'1.0.0' },
    { name:'/SYSTEM/OS_BUILD', value:getOsPlatform() + '-(' + os.hostname() + ')-' + os.release() },
    // @ts-ignore
    { name:'/SYSTEM/APPLICATION_ID', value:getOsPlatform().substring(0,1).toUpperCase() + os.hostname().substring(0,1) + os.release().replaceAll('.', '') + moment().format('YYMMDDHHMMSS') },
    { name:'/SYSTEM/ZF_VERSION', value:zf_version },
    { name:'/SYSTEM/MODERATORS_ADDRESS', value:'[p.margalef.zananiri@gmail.com];[p.margalef@zan-softwares.fr];[services@zan-softwares.fr]' },
];

/**
 * @description General Data in configuration table
 * @var {array} {ConfigurationParams} 
 */
export var use_local_data_conf:ConfigurationParams[] = [
    { name:'timezone', type:'string', value: date_timezone },
    { name:'date_locale', type:'string', value: date_locale },
    { name:'moment_db_date_format', type:'string', value: 'DD-MM-YY HH:mm:ss' },
    { name:'moment_default_date_format', type:'string', value: 'dddd DD MMMM HH:mm:ss' },
];

/**
 * @description HTTP or UDP Server(s)
 * @var {array} {HTTPOrUDPServerParams}
 */
export var use_local_data_server_conf:HTTPOrUDPServerParams[] = [
    { id:1, enable:0, name:'server-manager', host:'127.0.0.1', protocol:'HTTP', port:3232, webroot:'./public/manager' }
];

/**
 * @description HTTP or UDP Server(s) Routes
 * @var {array} {ServerRouteOrEventParams}
 */
export var use_local_data_route_or_event_conf:ServerRouteOrEventParams[] = [
    { server_id:1, name:'GetApplicationInfo', description:'ZF MANAGER, Return Applications infos, data puised in registry', route_or_event:'/manager/get-application-info' },
    { server_id:1, name:'EmitShutdownServer', description:'ZF MANAGER, If user is admin, emit shutdown server manager', route_or_event:'/manager/emit-manager-server-shutdown' },
    { server_id:1, name:'EmitRestartServer', description:'ZF MANAGER, If user is admin, emit restart server manager', route_or_event:'/manager/emit-manager-server-restart' },
];

/**
 * @description Mail Server(s)
 * @var {array} {ConfigurationMailServerParams}
 */
export var use_local_data_mail_server:ConfigurationMailServerParams[] = [
    { name:'ComCoreUserSystem', secure:0, host:'ex5.mail.ovh.net', service_is_gmail:0, user:'services@zan-softwares.fr', password:'', mail_from_name:'services@zan-softwares.fr' }
];

/**
 * @description MySQL Connection(s)
 * @var {array} {ConfigurationMySQLServerParams}
 */
export var use_local_data_db_mysql_server:ConfigurationMySQLServerParams[] = [
    //{ enable:1, name:'TestVilleConnection', host:'localhost', port:3306, user:'test', password:'fZ1vWonqv1JCjKKLNzex', database:'test' }
];

/**
 * @description Manager user(s)
 * @var {array} {ManagerUserParams}
 */
export var use_local_data_manager_user:ManagerUserParams[] = [
    { name:'admin', groups:'user;admin', login:'admin', password:'1234' }
];

/**
 * @description Message list
 * @var {array} {MessageParams}
 */
export var use_local_data_message:MessageParams[] = [
    { lang:'US', code:'ERR/INT01', message:'Process PID file exist in memory but not found in disk' },
    { lang:'US', code:'ERR/INT02', message:'Error in execution command, command : $0' }
];