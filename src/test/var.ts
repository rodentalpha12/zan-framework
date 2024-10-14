import { getVarType, hash } from "../ZAN_Framework/lib/Var";

class Test {

}

function funcTest (arg1:string,arg2:number) {};

console.log(getVarType(1));
console.log(getVarType('test'));
console.log(getVarType(1.7));
console.log(getVarType(null));
console.log(getVarType(undefined));
console.log(getVarType(function(){}));
console.log(getVarType(funcTest));
console.log(getVarType((test:any) => {}));
console.log(getVarType(Test));
console.log(getVarType(true));
console.log(getVarType({ obj:1 }));