import type {Metadata,MetadataRoute} from "next";
import {existsSync} from "node:fs";
import path from "node:path";
import {pwaEntries,type PwaKey} from "./environments";
export function visualAsset(asset:string):string|null {return existsSync(path.join(process.cwd(),"public",asset))?asset:null;}
export function isPwaKey(value:string):value is PwaKey {return Object.hasOwn(pwaEntries,value);}
export function environmentMetadata(key:PwaKey):Metadata {
  const entry=pwaEntries[key];
  return {title:key==="main"?entry.title:`${entry.title} | Learning Programme`,applicationName:entry.title,manifest:`/pwa/${key}/manifest.webmanifest`,
    appleWebApp:{capable:true,title:entry.title,statusBarStyle:"default"},icons:{apple:[{url:`/pwa/${key}/icon?size=180`,sizes:"180x180",type:"image/png"}],icon:[{url:`/pwa/${key}/icon?size=192`,type:"image/png"}]}};
}
export function buildManifest(key:PwaKey):MetadataRoute.Manifest {
  const entry=pwaEntries[key];
  return {id:`/pwa/${key}`,name:entry.title,short_name:entry.title,start_url:entry.startUrl,scope:"/",display:"standalone",background_color:"#ffffff",theme_color:"#ffffff",
    icons:[192,512].map(size=>({src:`/pwa/${key}/icon?size=${size}`,sizes:`${size}x${size}`,type:"image/png",purpose:"any"}))};
}
