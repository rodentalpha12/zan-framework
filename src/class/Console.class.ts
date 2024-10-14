import { hash, int, literal } from "../class/Var.class";

export interface TableModParams {
    head?:string[];
    colWidths?:int[];
    chars?:hash;
    style?:hash;
}

export interface TableParams {
    data:string[][];
    table_params?:TableModParams;
    style?:string;
    orientation?:string;
    table_vertical_show_line?:boolean;
    table_vertical_line_char?:string;
    table_vertical_line_end_sep?:string;
}

export interface PrintParams {
    message:string;
    args?:literal[];
    type?:string;
    mode?:string;
}

export interface PromptParams {
    message:string;
    required?:boolean;
    hidden?:boolean;
    confirm?:boolean;
}