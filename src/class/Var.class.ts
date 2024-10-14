/**
 * Simple Variables Types definitions
 */
export type index = string|number;
export type char = string;
export type int = number;
export type float = number;
export type literal = string|number|boolean|null;

/**
 * Type for JSON object { ex:value, ... } 
 */
export interface hash {
    [index:index]:any;
}

export interface CheckParamParams {
    v?:any;
    required?:boolean;
    default_value?:any;
    type?:index[];
}