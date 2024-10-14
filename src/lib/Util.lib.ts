/**
 * Contains Utilitary functions, diverses functionality
 * @update 2024-09-21
 */

import { Err } from "./Err.lib";
import { execCommandSync } from "./Process.lib";
import { hash, int, literal } from "../class/Var.class";

var os = require('os');
const { encrypt, decrypt } = require('node-encryption');
var portscanner = require('portscanner');

/**
 * @description Replace arguments in string phrase with identifier, ex: Hello $0 => Hello World ([ 'World' ])
 * @param {string} message Phrase contain message with argument number $0, $1, ...
 * @param {array} args [OPTIONNAL] Arguments to replace in phrase
 * @param {string} identifier [OPTIONNAL] '$' Define identifier associate to arguments number, ex: arg identifier = . (.0, .1, ...)
 * @use stringReplace('Message $0, Hello $1', [ 'Message Test'.toUpperCase(), parseInt('5') ]) => 'Message MESSAGE TEST', Hello 5
 * @return {string} Message with arguments integred
 */
export function stringReplace (message:string, args:literal[], identifier:string='$'):string {
    for(var i in args){
        // @ts-ignore
        message = message.replace(`${identifier}${i}`, args[i].toString());
    }
    return message;
}

/**
 * Generate random integer number with limit between 0 and argument specified
 * @param {int} max [OPTIONNAL] Max number for limit, ex: 9 => 0 to 9, 100 => 0 to 100
 * @return {int} Randoming number
 */
export function makeRandomInt(max:int=9):int {
    return Math.floor(Math.random() * max);
}

/**
 * @description Generate difference between two date (default formate Date)
 * @param {Date} Date 1 
 * @param {Date} Date 2
 * @use dateDiff(new Date(), date2) => { sec:5, min:4, hour:1, day:0 }
 * @returns {hash} JSON Ojbect contains day(s), hour(s), min(s), and second(s)
 */
export function dateDiff(date1:Date, date2:Date):hash{
	var diff:hash = {};							// Initialisation du retour
	// @ts-ignore
	var tmp = date2 - date1;

	tmp = Math.floor(tmp/1000);             // Nombre de secondes entre les 2 dates
	diff.sec = tmp % 60;					// Extraction du nombre de secondes

	tmp = Math.floor((tmp-diff.sec)/60);	// Nombre de minutes (partie entière)
	diff.min = tmp % 60;					// Extraction du nombre de minutes

	tmp = Math.floor((tmp-diff.min)/60);	// Nombre d'heures (entières)
	diff.hour = tmp % 24;					// Extraction du nombre d'heures
	
	tmp = Math.floor((tmp-diff.hour)/24);	// Nombre de jours restants
	diff.day = tmp;
	
	return diff;
}

/**
 * @description Return Os Name (use for label format)
 * @use getOSPlatform() => Linux (if process launched in Liunx OS)
 * @return {string} OS Name
 */
export function getOsPlatform():string{
	var type = os.type(); 
	switch(type) { 
		case 'Darwin': 
			return "MacOS"; 
			break; 
		case 'Linux':  
			return "Linux"; 
			break; 
		case 'Windows_NT': 
			return "Windows"; 
			break;     
		default:  
			return process.platform;
	} 
}

/**
 * @description Encrypt string phrase to AES (AES-256-GCM) with encryption key
 * @param {string} text Text to encrypt 
 * @param {string} key Encryption Key use for encrypt
 * @use encryptAES('Text to encrypt', 'Encryption KEY') => Encrypted key
 * @return {string} Encrypted phrase
 */
export function encryptAES(text:string, key:string):string {
	return encrypt(text, key);
}

/**
 * @descriptio Uncrypt string crypted with encryptAES local function or encrypted for AES-256-GCM with encryption key
 * @param {string} text Text encrypted to uncrypt 
 * @param {string} key Encryption key use for uncrypt
 * @use uncryptAES('Encrypted phrase', 'Encryption KEY') 
 * @return {string} Uncrypted chiffred phrase normalely if correct encryption key
 */
export function uncryptAES(text:string, key:string):string {
	try{
		return decrypt(text, key).toString();
	}
	catch(e){
		return '';
	}
}

/**
 * Check is port used by system
 * @param {int} port 
 * @param {Function} f
 * @return {boolean|string} false is port is opening, UDP, HTTP, OTHER
 */
export function checkIsPortUsed(port:int) {
	var type = getOsPlatform();
	
	if(type == 'Windows'){
		var r = execCommandSync('netstat -ano | findstr ' + port);
		if(r instanceof Err){
			return false;
		}
		return true;
	}
}