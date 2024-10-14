/**
 * @description Process classes and interface
 * @update 2024-09-21
 */

export interface ProcessArgParams {
    args:string[];
    required?:boolean;
    message_help:string;
    message_error:string;
}

export interface ProcessHelpParams {
    name:string;
    synopsis:string;
    description?:string;
    args?:ProcessArgParams[];
    
}

export interface ProcessInitParams {
    arg_help?:string;
    args?:ProcessArgParams[];
    help?:ProcessHelpParams;
    embaqued_database?:boolean|string;
    pid?:string|boolean;
    title?:string;
    version?:string;
    clear_console?:boolean;
    show_pid?:boolean;
    silent?:boolean;
    show_os?:boolean;
    exit_function?:Function|boolean;
    log?:boolean;
    path_app?:string;
    path_install?:string;
    path_class?:string;
    path_build?:string;
    path_bin?:string;
    path_data?:string;
    path_public?:string;
    path_pid?:string;
}