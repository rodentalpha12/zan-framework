import path from "path";

import { SystemDatabase } from "../lib/Db.lib";
import { Process } from "../lib/Process.lib";
import { HTTPServer } from "../lib/Server.lib";
import { hash, Store } from "../class/Var.class";
import { File } from "../lib/FS.lib";
import { print } from "../lib/Console.lib";
import { checkIsPortUsed } from "../lib/Util.lib";

Process.init({ 
    embaqued_database:'data.db3', 
    silent:true, 
    pid:'pid-manager-server', 
    title:'Zan Framework Manager', 
    version:'1.0.0', 
    clear_console:false, 
    show_pid:true, 
    show_os:true,
    arg_help:'-h',
    args:[],
    help:{
        name:'ZF - Manager server',
        synopsis:'ts-node manager.ts / node manager.js',
        description: 'Launch Manager HTTP WebServer'
    }    
});

var server1 = new HTTPServer({
    name:'server-manager',
    port: SystemDatabase.db.is_connected ? 0 : 8081,
    webroot: path.join(Store.man('path:app'), 'public', 'manager')
});

server1.addRoute('/manager/get-application-info', (p:hash) => {
    p.res.statusCode = 200;
    p.res.setHeader('Content-Type', 'text/plain');
    
    if(!SystemDatabase.db.is_connected){
        p.res.end('0');
        return;
    } 

    var obj:any = {};
    var data = SystemDatabase.db.select('registry');
    
    for(var i in data.result){
        obj[data.result[i].name] = data.result[i].value;
    }

    p.res.end(JSON.stringify(obj));
});

server1.listen();