import {languageCode} from "./config";
export function legacyLanguageDestination(module:"vocabulary"|"sentences"|"texts",value:unknown){
  const code=typeof value==="string"?languageCode(value):undefined;
  return code?`/languages/${code}/${module}`:"/languages";
}
