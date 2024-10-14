/**
 * @description Defined Server functionnality (HTTPServer, UPDServer)
 * @update 2024-09-21
 */

import os from 'os';
import fs from 'fs';

import moment, { Moment } from "moment";
import { print } from "./Console.lib";
import { hash, int } from "../class/Var.class";
import http from 'http';
import { Process } from "./Process.lib";
import { Err } from "./Err.lib";
import { SystemDatabase } from "./Db.lib";
import { File, Dir } from "./FS.lib";
import path from "path";
import { checkIsPortUsed, getOsPlatform } from "./Util.lib";
import { ServerConnectionParams } from '../class/Server.class';
import { checkParam, getVarType } from './Var.lib';

import base_conf from '../data/base.conf.json';

var ipModule = require('ip');
const url = require('url');
var qs = require('querystring');
var getos = require('getos');

/**
 * @description Provide HTTP Server class for create HTTP Server for API or WebServer
 */
export class HTTPServer {

    /**
     * @description Name of server, default server1
     * @var {string}
     */
    public name:string = '';

    /**
     * @description IP of server (ip of machine executing server script(s))
     * @var {string}
     */
    public ip:string='';

    /**
     * @description Hash contain name (index) with function
     * @var {hash} contain function (() => {}, function test(){}, ...)
     */
    public routes:hash = {};

    /**
     * @description Status of server, 1 for init OK, 0 else
     * @var {boolean}
     */
    public is_init:boolean=false;

    /**
     * @description Status of server, 1 for online OK, 0 if server is offline
     * @var {boolean}
     */
    public is_listenning:boolean=false;

    /**
     * @description Moment object date specify on call server.listen function, undefined if not listening
     * @var {Moment|undefined}
     */
    public start_time:Moment|undefined;

    /**
     * @description HTTP Server object for current instance
     * @var {http.Server}
     */
    // @ts-ignore
    public server:http.Server;

    /**
     * @description Port to listening for HTTP Server
     * @var {int}
     */
    public port:int=0;

    /**
     * @description WebRoot Folder, neccessary for create HTTP WebServer (documentroot in apache equivalent)
     * @var {string}
     */
    public webroot:string='';

    /**
     * @description Create new instance of HTTP Server
     * @param {hash} params Parameter of server
     *  - port {int} Port of HTTP Server
     *  - webroot {string} [OPTIONNAL] Directory of HTTP Server webroot (default: '')
     *  - name {string} [OPTIONNAL] Name or identifiant of HTTP Server (default: 'server1') 
     * @use var server1 = new HTTPServer({ port:8080 })
     */
    constructor (params:ServerConnectionParams={}) {
        this.ip = ipModule.address();
        this.port = checkParam({ v:params.port, required:true, type: [ base_conf.consts.VAR.TYPES.INT ] });
        this.webroot = checkParam({ v:params.webroot, default_value:'', type: [ base_conf.consts.VAR.TYPES.STRING ] });
        this.name = checkParam({ v:params.name, default_value:'server1', type: [ base_conf.consts.VAR.TYPES.STRING ] });

        if(getVarType(this.port) != 'int'){
            var e = new Err({ code:'SERV01', message:'Port must be typeof int', additionnal_data: { port:this.port }  });
            return;
        }

        // Check port
        if(checkIsPortUsed(this.port)){
            var e = new Err({ code:'SERV02', message:'Port already use', additionnal_data: { port:this.port }  });
            return;
        }

        // @ts-ignore
        this.server = http.createServer((req:http.ClientRequest, res:http.ServerResponse) => {
            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', '*');

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', 'true');

            const url_params = new URL('http://127.0.0.1/' + req.path).searchParams;

            var p:hash = {};
            p.client_ip = 'unknow';
            if(req.socket){
                p.client_ip = req.socket.remoteAddress;
            }

            var pa = req.path;
            if(pa===undefined){
                // @ts-ignore
                pa = req.url;
            }

            p.url = pa?.split('?')[0];
            p.data_get = Object.fromEntries(url_params);
            p.data_post = {};
            p.method = req.method;
            p.req = req;
            p.res = res;
                
            if(this.routes[p.url] instanceof Function){
                if(p.method == 'POST'){
                    parsePostData(req, (post_data:hash) => {
                        p.data_post = post_data;
                        this.routes[p.url].call(this, p);
                    });
                }else{
                    this.routes[p.url].call(this, p);
                }
            }
            else{
                if(Dir.isExist(this.webroot)){
                    // Recherche dans le webroot
                    var content = '';
                    var content_type = 'text/plain';
                    var file = null;
                    if(p.url == '/'){
                        file = new File(path.join(this.webroot, 'index.html'));
                        if(!file.isExist()){
                            p.res.statusCode = 404;
                            p.res.setHeader('Content-Type', 'text/plain');
                            p.res.end('404');
                            return;
                        }
                        p.res.statusCode = 200;
                        // @ts-ignore
                        content = file.read();
                        content_type = 'text/html';
                    } 
                    else{
                        file = new File(path.join(this.webroot, p.url));
                        if(!file.isExist){
                            p.res.statusCode = 404;
                            p.res.setHeader('Content-Type', 'text/plain');
                            p.res.end('404');
                            return;
                        }

                        p.res.statusCode = 200;

                        switch(file.ext){
                            case 'css':
                                // @ts-ignore
                                content = file.read();
                                content_type = 'text/css';
                            break;
                            case 'js':
                                // @ts-ignore
                                content = file.read();
                                content_type = 'text/javascript';
                            break;
                            case 'png':
                                // @ts-ignore
                                content = file.read();
                                content_type = 'image/png';
                                p.res.setHeader('Content-Type', content_type);
                                fs.createReadStream(path.join(this.webroot, p.url)).pipe(res);
                                //p.res.end(content, 'binary');
                                return;
                            break;
                            case 'gif':
                                // @ts-ignore
                                content = file.read();
                                content_type = 'image/gif';
                                p.res.setHeader('Content-Type', content_type);
                                fs.createReadStream(path.join(this.webroot, p.url)).pipe(res);
                                //p.res.end(content, 'binary');
                                return;
                            break;
                        }
                    }

                    p.res.setHeader('Content-Type', content_type);
                    p.res.end(content);
                }
                else{
                    p.res.statusCode = 404;
                    p.res.setHeader('Content-Type', 'text/plain');
                    p.res.end('404');
                }
            }
        });

        this.server.on('connection', (socket:any) => {
            //console.log(socket);

            // Remove the socket when it closes
            socket.on('close', () => {
                //console.log('HTTP Server stop');
            });
        });

        // Ajout des routes systeme
        this.addRoute('/system/get-server-info', (p:hash) => {
            p.res.statusCode = 200;
            p.res.setHeader('Content-Type', 'text/plain');
            p.res.end(JSON.stringify({ start_time: this.start_time, port:this.port }));
        });

        this.addRoute('/system/get-system-info', (p:hash) => {
            p.res.statusCode = 200;
            p.res.setHeader('Content-Type', 'text/plain');
            getos((e:any, os_data:any) => {
                p.res.end(JSON.stringify({  os:getOsPlatform(), os_version:os.release(), hostname:os.hostname(), distribution:(os_data.os=='linux'?os_data.dist:''), embarqued_db_connected:SystemDatabase.isConnected() ? 1 : 0 }));
            });
        });

        this.is_init = true;
    }

    /**
     * @description Start HTTP Server
     * @use server1:HTTPServer.listen() => void
     * @return {void}
     */
    public listen ():undefined|Err {
        if(!this.is_init){
            var e = new Err({ code:'SERV03', message:'Server is not initialized', additionnal_data: { port:this.port }  });
            return e;
        }

        this.server.listen(this.port, this.ip, () => {
            this.start_time = moment();
            print({ message:'HTTP Server ($0) started at $1', args:[ this.name, this.start_time.format(SystemDatabase.getConf('moment_default_date_format')).toUpperCase() ], type:base_conf.consts.CONSOLE.PRINT.INFORMATION });
            //var sqlite = Store.man('embarqued_db');
            //sqlite.insert('log', { date:this.start_time.format(Store.man('conf:moment_db_date_format')), type:'SERVER', message:'HTTP Server started', additionnal_data:JSON.stringify({ ip:ip, port:port }) });
            print({ message:`HTTP Server ($0) running at ` + `http://${this.ip}:${this.port}/`.bold, args:[ this.name ], type:base_conf.consts.CONSOLE.PRINT.INFORMATION });
            this.is_listenning = true;
        });
    }

    /**
     * @description Stop HTTP Server
     * @use server1:HTTPServer.stop() => void
     * @return {void}
     */
    public stop ():void {

    }

    /**
     * @description Add new route in current HTTP Server, route is index / path (URL) assiciate function
     * @notice By default dynamic route added with this function is priority called before HTTP WebServer folder route 
     * @param {string} path Path to add (/http/url) 
     * @param {Function} f Function called on moment of route is called by HTTP Client (arg = p:hash)
     *  Arguments (p) of function
     *  - p.client_ip {string} Public IP HTTP Client Adress (234.555.32.23)
     *  - p.url {string} Path of HTTP request (/test)
     *  - p.data_get {hash} Hash contain GET HTTP client request parameters ({ ex:1 }) (http://SERVER_IP:PORT/test?ex:1)
     *  - p.data_post {hash} Hash contain POST HTTP client request parameters ({ post_p:'data' })
     *  - p.method {string} Method GET, POST, PUT, DELETE, ...
     *  - p.req {http.ClientRequest} Object Client HTTP request
     *  - p.res {http.ServerResponse} Object for response
     * @use server1:HTTPServer.addRoute('/test', (p:hash) => {})
     * @return {void}
     */
    public addRoute (path:string, f:Function):void {
        this.routes[path] = f;
    }

}

/**
 * @description Function called automaticly case in POST Client HTTP Request by server for parsing posting data in flux
 * @param {http.ClientRequest} req Request object contain POST data
 * @param {Function} f Function called on ending collect data process 
 * @return {void}
 * @use View HTTPServer constructor createServer function
 */
export function parsePostData (req:http.ClientRequest, f:Function):void {
    var body = '';

    req.on('data', function (data:any) {
        body += data;

        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6){
            if(req.connection){
                req.connection.destroy();
            }
        }
    });

    req.on('end', function () {
        var post = qs.parse(body);
        f.call(null, post);
    });
}