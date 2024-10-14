import { int } from "../class/Var.class";

export interface ServerRouteOrEventParams {
    id?:int;
    server_id:int;
    name:string;
    description?:string;
    route_or_event:string;
    code?:string;
}