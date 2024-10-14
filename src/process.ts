import { Process } from "./lib/Process.lib";
import { File } from "./lib/FS.lib";
import path from "path";
import { Store } from "./lib/Var.lib";
import { Err } from "./lib/Err.lib";
var cp = require('child_process');

var script:any = Process.getArg('--script');
var action:any = Process.getArg('--action');
var type:any = Process.getArg('--type');

Process.init({ pid:false, embaqued_database:'data.db3' });

var result:any = null;

if(type=='ts'){
    var script:any = path.join(Store.man('path:bin'), script + '.ts');
    if(!File.isExist(script)){
        new Err('PRC01', 'Script $0 not found in bin dir', [ script ], { action:action, type:'ts' }, true);
    }   

    result = cp.execSync('ts-node ');
}

