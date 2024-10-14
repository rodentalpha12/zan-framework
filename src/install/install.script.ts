/**
 * @description Installer script
 * @use (dev env only) ts-node install.script.ts
 * @update 2024-09-20
 */

import moment from "moment";
import { confirm, print, prompt, table } from "../lib/Console.lib";
import { Process } from "../lib/Process.lib";
import { getParam, hash } from "../class/Var.class";
import { SQLiteSync } from "../lib/Db.lib";
import { Dir, File } from "../lib/FS.lib";

var clc = require("cli-color");

import consts_install from './consts.install.json';

import base_conf from '../data/base.conf.json';

import { 
    zf_source,
    zf_version,

    build_mode,
    build_mode_update_data_path,
    build_mode_update_env,
    build_mode_archive_target,
    
    date_timezone,
    date_locale,
    
    system_db_installation_write,
    system_db_installation_dbname,
    system_db_sgbd,
    system_db_encryption_key,

    var_db_sqlite_path,
    var_db_sqlite_password,

    system_db_mysql_connection,
    system_db_mysql_user,

    system_db_copy_mode,
    system_db_copy_export_path,
    system_db_tables_prefix,
    system_db_tables_erase_all,
    system_db_tables_default_engine,
    system_db_tables_default_charset,
    system_db_tables_default_collate,
    system_db_tables,
    
    use_local_data_registry,
    use_local_data_conf,
    use_local_data_server_conf,
    use_local_data_route_or_event_conf,
    use_local_data_mail_server,
    use_local_data_db_mysql_server,
    use_local_data_manager_user 
} from "./data.install";
import { DbSyncParams } from "../class/Db.class";


Process.init({ pid:false, title:'Zan Framework Install Script', clear_console:true, help:{
    name:'ZF - Installer script',
    synopsis:'ts-node install.script.ts',
    description: 'Initialize or update ZF Application (code and/or db)'
}});

// Test System DB Connection
print('Test System DB Connection', [], base_conf.consts.CONSOLE.PRINT.INFORMATION);

var db:DbSyncParams|hash = {};
if(system_db_sgbd == consts_install.SGBD.MYSQL){

}
else if(system_db_sgbd == consts_install.SGBD.SQLITE){
    if(File.isExist(var_db_sqlite_path)){
        db = new SQLiteSync(var_db_sqlite_path, true);
    }
}
console.log(db.is_connected);

print('');

print('======================== ' + clc.underline('General Configuration and Environment'));

print('');

var p1:string[][] = [
    [ 'ZF Location', zf_source ],
    [ 'ZF Version', zf_version ],
    [ 'Build Mode', build_mode ],
    [ 'Build OS', getParam(use_local_data_registry, 'name', '/SYSTEM/OS_BUILD', 'value') ],
    [ 'Encryption Key', system_db_encryption_key ? system_db_encryption_key : clc.yellow('N/A') ],
    [ 'Environnment', build_mode_update_env ],
    [ 'Date timezone', date_timezone ],
    [ 'Date locale', date_locale ]
];

table({
    data: p1,
    table_params: { colWidths:[ 30 ] },
    style: base_conf.consts.CONSOLE.TABLES.STYLES.NO_BORDER,
    orientation: base_conf.consts.CONSOLE.TABLES.ORIONTATION.VERTICAL
});

print('');

if(build_mode != consts_install.TARGET.UPDATE_DB){

    print('======================== ' + clc.underline('Application Configuration'));

    print('');

    var p2:string[][] = [
        [ 'ID', getParam(use_local_data_registry, 'name', '/SYSTEM/APPLICATION_ID', 'value') ],
        [ 'Name', getParam(use_local_data_registry, 'name', '/SYSTEM/APPLICATION_NAME', 'value') ],
        [ 'Description', getParam(use_local_data_registry, 'name', '/SYSTEM/APPLICATION_DESCRIPTION', 'value') ],
        [ 'Location', getParam(use_local_data_registry, 'name', '/SYSTEM/APPLICATION_LOCATION', 'value') ],
        [ 'Version', getParam(use_local_data_registry, 'name', '/SYSTEM/APPLICATION_VERSION', 'value') ],
        [ 'Init Date', getParam(use_local_data_registry, 'name', '/SYSTEM/APPLICATION_DATE_INITIALIZE', 'value') ],
        [ 'Type', getParam(use_local_data_registry, 'name', '/SYSTEM/APPLICATION_TYPE', 'value') ]
    ];

    table({
        data: p2,
        table_params: { colWidths:[ 30 ] },
        style: base_conf.consts.CONSOLE.TABLES.STYLES.NO_BORDER,
        orientation: base_conf.consts.CONSOLE.TABLES.ORIONTATION.VERTICAL
    });
}

print('');

print('======================== ' + clc.underline('System Database Configuration'));

print('');

var p3:string[][] = [
    [ 'DB Mode', system_db_installation_write ],
    [ 'Copy Mode', system_db_copy_mode ]
];

if(system_db_sgbd != consts_install.SGBD.SQLITE){
    p3.push([ 'DB Name or Path', system_db_installation_dbname ]);
}

p3.push([ 'System DB SGBD', system_db_sgbd ]);
p3.push([ 'Tables prefix', system_db_tables_prefix ]);
p3.push([ 'Tables Default Engine', system_db_tables_default_engine ]);
p3.push([ 'Tables Default Charset', system_db_tables_default_charset ]);
p3.push([ 'Tables Default Collate', system_db_tables_default_collate ]);

table({
    data: p3,
    table_params: { colWidths:[ 30 ] },
    style: base_conf.consts.CONSOLE.TABLES.STYLES.NO_BORDER,
    orientation: base_conf.consts.CONSOLE.TABLES.ORIONTATION.VERTICAL
});

print('');

if(system_db_sgbd == consts_install.SGBD.SQLITE){
    
    print('======================== ' + clc.underline('SQLite Connection'));
    
    var p4:string[][] = [
        [ 'Path',     var_db_sqlite_path ],
        [ 'Password', var_db_sqlite_password ? var_db_sqlite_password : clc.yellow('N/A') ]
    ];

    print('');

    table({
        data: p4,
        table_params: { colWidths:[ 30 ] },
        style: base_conf.consts.CONSOLE.TABLES.STYLES.NO_BORDER,
        orientation: base_conf.consts.CONSOLE.TABLES.ORIONTATION.VERTICAL
    });

    print('');
}
else if(system_db_sgbd == consts_install.SGBD.MYSQL && build_mode != consts_install.TARGET.UPDATE_FILE){

    print('======================== ' + clc.underline('MySQL Connection for DDL'));

    print('');

    var p4:string[][] = [
        [ 'Host', system_db_mysql_connection.host ],
        [ 'Port', system_db_mysql_connection.port.toString() ],
        [ 'User', system_db_mysql_connection.user ],
    ];

    table({
        data: p4,
        table_params: { colWidths:[ 30 ] },
        style: base_conf.consts.CONSOLE.TABLES.STYLES.NO_BORDER,
        orientation: base_conf.consts.CONSOLE.TABLES.ORIONTATION.VERTICAL
    });

    print('');

    print('======================== ' + clc.underline('MySQL Connection for system user'));

    print('');

    var p5:string[][] = [
        [ 'Host', system_db_mysql_user.host ],
        [ 'Port', system_db_mysql_user.port.toString() ],
        [ 'User', system_db_mysql_user.user ]
    ];

    table({
        data: p5,
        table_params: { colWidths:[ 30 ] },
        style: base_conf.consts.CONSOLE.TABLES.STYLES.NO_BORDER,
        orientation: base_conf.consts.CONSOLE.TABLES.ORIONTATION.VERTICAL
    });

    print('');

}

if(system_db_copy_mode == consts_install.SYSTEM_DB.COPY_MODE.EXPORT_FILE){


    print('======================== ' + clc.underline('Copy Existing Database'));

    print('');

    var p6:string[][] = [
        [ 'Path to SQL Copy file', system_db_copy_export_path ],
    ];

    table({
        data: p6,
        table_params: { colWidths:[ 30 ] },
        style: base_conf.consts.CONSOLE.TABLES.STYLES.NO_BORDER,
        orientation: base_conf.consts.CONSOLE.TABLES.ORIONTATION.VERTICAL
    });

    print('');

}

print('======================== ' + clc.underline('System Tables'));

var p7:string[][] = [] 
for(var i in system_db_tables){
    // @ts-ignore
    p7.push([ system_db_tables_prefix + system_db_tables[i].name, system_db_tables[i].comment ]);
}

print('');

table({
    data: p7,
    table_params: { colWidths:[ 45 ] },
    style: base_conf.consts.CONSOLE.TABLES.STYLES.NO_BORDER,
    orientation: base_conf.consts.CONSOLE.TABLES.ORIONTATION.VERTICAL
});

print('');

// if(!confirm('Data is correct ? continue ? : ')){
//     Process.stop(0);
// }

Process.stop(0);