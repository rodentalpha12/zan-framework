/**
 * @description NCurses functionnalities used with blessed and blessed-contrib nodejs module
 * @update 2024-09-21
 */

import { Widgets } from "blessed";
import { hash } from "../class/Var.class";
import { Process } from "./Process.lib";
import { Err } from "./Err.lib";
import { MainScreenParams } from "../class/NCurses.class";

import base_conf from '../data/base.conf.json';
import { checkParam } from "./Var.lib";

var blessed = require('blessed');

/**
 * @description Abstract class for control base NCurses MainScreen
 */
export abstract class NCurses {
    /**
     * @description NCurse Blessed Screen object
     * @var {Widgets.Screen}
     */
    public static screen:Widgets.Screen;

    /**
     * @description Blessed Box for use background bg color
     * @var  {Widgets.BlessedElement} Blessed Box
     */
    public static background:Widgets.BlessedElement;

    /**
     * @description Indicator is NCurse Screen is initialized or not
     * @var {boolean}
     */
    public static is_init:boolean=false;

    /**
     * @description NCurses.init function and start ncurse application 
     * @param {hash} params [OPTIONNAL] Parameters for ncurse application 
     *  - quit {string} Key control for quit / exit program
     *  - bg {string} Background bg color
     * @use 
     * @return {NCurses} Return NCurses class
     */
    public static init(params:MainScreenParams={}){
        if(!Process.is_init){
            var e = new Err({ code:'INT03', message:'Process not initialized, launch Process.init before use or init NCurses libs' });
            return;
        }
        
        this.screen = blessed.screen({
            smartCSR: true
        });

        this.screen.key([checkParam({ v:params.quit, default_value: 'C-q', type: [ base_conf.consts.VAR.TYPES.STRING ] })], function(ch:any, key:any) {
            return process.exit(0);
        });

        this.background = blessed.box({
            parent:this.screen,
            top: 0,
            left: 0,
            right: 0,
            bottom:0,
            tags: true,
            style: {
                bg: checkParam({ v:params.bg, default_value: '#000000', type:[ base_conf.consts.VAR.TYPES.STRING ])
                // border: {
                // fg: '#f0f0f0'
                // },
                // hover: {
                // bg: 'green'
                // }
            }
        });
    
        this.screen.render();
    
        this.is_init = true;

        return this;
    }
}

// export function info (text:string, label:string=''){
//     var box = blessed.box({
//         parent:screen,
//         top: 'center',
//         left: 'center',
//         width: 'shrink',
//         height: 'shrink',
//         padding:1,
//         content: text,
//         label:label,
//         tags: true,
//         border: {
//             type: 'line'
//         },
//         style: {
//             fg: 'white',
//             bg: 'blue'
//             // border: {
//             // fg: '#f0f0f0'
//             // },
//             // hover: {
//             // bg: 'green'
//             // }
//         }
//     });

//     screen.render();

//     screen.on('keypress', function(key:any) {
//         box.destroy();
//         screen.render();
//     });
// }