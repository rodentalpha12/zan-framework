/**
 * @description Contain functionnalities for manipulate file and directory
 * @update 2024-09-21
 */

import { Err } from "./Err.lib";
import { hash } from "../class/Var.class";

import fs from 'fs';
import path from 'path';

/**
 * @description Represent one File on OS FS (Manipulate in Synchronous mode)
 */
export class File {

    /**
     * @description Path to file
     * @var {string}
     */
    public path:string;

    /**
     * @description fs.Stats object or false if not loaded or not existed in FS
     * @var {fs.Stats|boolean}
     */
    public stats:fs.Stats|boolean=false;

    /**
     * @description File extension, computed on constructor
     * @var {string}
     */
    public ext:string;

    /**
     * Create new File instance and load stat automaticly
     * @param {string} path Path to file in os FS 
     * @param {boolean} required [OPTIONNAL] If required and not found in FS, declench new Err
     * @use var file1 = new File('/path/to/file') 
     */
    constructor (path:string, required:boolean=false){
        this.path = path;
        var a_file = path.split('.');
        this.ext = a_file[a_file.length-1];
    } 

    /**
     * @description Load stats object from current file
     * @param {boolean} required [OPTIONNAL] If true, declench new Err if file not exist in FS 
     * @use file1.loadStats() => void
     * @return {void}
     */
    loadStats (required:boolean=false):undefined|Err{
        try{
            this.stats = fs.statSync(this.path);
        }catch(e:any){
            if(required){
                var e = new Err({ code:'FS01', message:'File $0 not found but required', args:[ this.path ], additionnal_data:{ path:this.path } });
                return e;
            }
        }
    }

    /**
     * @description Check file is existing in FS with use loadStats function
     * @param {boolean} force_reload [OPTIONNAL] loadStats function is automatictly called on create new File, but if true, reload stats in current file 
     * @use file1.isExist(true)
     * @return {boolean} true if exist, false elseif 
     */
    isExist (force_reload:boolean=false):boolean {
        if(force_reload){
            this.loadStats();
        }
        
        if(this.stats){
            return true;
        }
        return false;
    }

    /**
     * @description Static function version for check if file path exist in os FS
     * @param {string} path Path to file 
     * @use File.isExist('/path/to/file') => true if exist, false elseif 
     * @return {boolean}
     */
    static isExist(path:string):boolean{
        var r = new File(path, true);
        var e = r.loadStats(true);
        
        if(e instanceof Err){
            return false;
        }
        return true;
    }

    /**
     * @description Write / Add string content in file in os FS
     * @param {string} content Content to wrtie or add 
     * @param {boolean} add [OPTIONNAL] If true, add content to end of file 
     * @param {boolean} required [OPTIONNAL] If required, declench new Err if not exist
     * @use file1.write('data') => void
     * @return {void}
     */
    write (content:string, add:boolean=false, required:boolean=false):void{
        if(required && !this.isExist(true)){
            var e = new Err({ code:'FS01', message:'File $0 not found but required', args:[ this.path ], additionnal_data:{ path:this.path } });
        }

        if(add){
            fs.writeFileSync(this.path, content, { flag:'a' });
        }
        else{
            fs.writeFileSync(this.path, content, { flag:'w' });
        }
    }

    /**
     * Load and return DATA content (string text format) on file
     * @param {boolean} required [OPTIONNAL] If true, delcench new Err if not eixst before add
     * @use file1.read() => string (text file data)
     * @return {string}
     */
    read (required:boolean=false):string|Err {
        if(required && !this.isExist(true)){
            var e = new Err({ code:'FS01', message:'File $0 not found but required', args:[ this.path ], additionnal_data:{ path:this.path } });
            return e;
        }
        return fs.readFileSync(this.path).toString();
    }

}

/**
 * @description Represent one Directory on os FS
 */
export class Dir {
    
    /**
     * @description Path to directory
     * @var {string}
     */
    public path:string;

    /**
     * @description fs.Stats object or false if not loaded or not existed in FS
     * @var {fs.Stats|boolean}
     */
    public stats:fs.Stats|boolean=false;

    /**
     * @description Create new instance of Directory, stats load automaticly
     * @param {string} path Path to directory 
     * @param {boolean} required [OPTIONNAL] If true, declench new Err if not exist in os FS
     * @use var dir1 = new Dir('/path/to/dir', true) => Dir, declench new Err if not exist
     */
    constructor (path:string, required:boolean=false){
        this.path = path;
    }

    /**
     * @description Load stats object from current directory
     * @param {boolean} required [OPTIONNAL] If true, declench new Err if directory not exist in FS 
     * @use dir1.loadStats() => void
     * @return {void}
     */
    loadStats (required:boolean=false):undefined|Err{
        try{
            this.stats = fs.statSync(this.path);
        }catch(e:any){
            if(required){
                var e = new Err({ code:'FS02', message:'Directory $0 not found but required', args:[ this.path ], additionnal_data:{ path:this.path } });
                return e;
            }
        }
    }

    /**
     * @description Check directory is existing in FS with use loadStats function
     * @param {boolean} force_reload [OPTIONNAL] loadStats function is automatictly called on create new Dir, but if true, reload stats in current directory 
     * @use dir1.isExist(true)
     * @return {boolean} true if exist, false elseif 
     */
    isExist (force_reload:boolean=false) {
        if(force_reload){
            this.loadStats();
        }
        
        if(this.stats){
            return true;
        }
        return false;
    }

    /**
     * @description Static function version for check if directory path exist in os FS
     * @param {string} path Path to directory 
     * @use Dir.isExist('/path/to/directory') => true if exist, false elseif 
     * @return {boolean}
     */
    static isExist(path:string):boolean{
        var r = new Dir(path, true);
        var e = r.loadStats(true);
        if(e instanceof Err){
            return false;
        }
        return true;
    }

}