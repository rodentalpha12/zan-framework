import { Console } from "../lib/Console.lib";
import { Process } from "../lib/Process.lib";
import { encryptAES, uncryptAES } from "../lib/Util.lib";

Process.init({ 
    embaqued_database:'data.db3', 
    silent:true, 
    arg_help:'-h',
    args:[
        { args:[ '--mode', '-m' ], required:true, message_error:"arg '--mode/-m' is required, value is 'crypt' or 'uncrypt'", message_help:'--mode/-m {crypt/uncrypt} : Specify if crypt or uncrypt mode' },
        { args:[ '--text', '-t' ], required:true, message_error:"arg '--text/-t' is required, value is world or phrase to 'crypt' or 'uncrypt'", message_help:'--text/-t {TextToCryptOrUncrypt} : World or phrase to crypt or uncrypt' },
        { args:[ '--key', '-k' ], required:true, message_error:"arg '--key/-k' is required, value is encryption key for crypt or uncrypt", message_help:'--key/-k {EncryptionKey} : Encryption key' }
    ],
    help:{
        name:'ZF - Crypt or Uncrypt world of phrase AES (AES-256-GCM)',
        synopsis:'ts-node crypt.ts / node crypt.js --mode crypt / uncrypt --text TextToCryptOrUncrypt --key EncryptionKey',
        description: 'Crypt or Uncrypt phrase or world with encryption key'
    }    
});

var mode = Process.getArgWithSpace('--mode');
var text = Process.getArgWithSpace('--text');
var key = Process.getArgWithSpace('--key');

if(mode == 'crypt'){
    // @ts-ignore
    Console.print(encryptAES(text, key));
}
else if(mode == 'uncrypt'){
    // @ts-ignore
    Console.print(uncryptAES(text, key));
}
else{
    Console.print('Invalid mode, possible values is crypt or uncrypt');
}

Process.stop(1);