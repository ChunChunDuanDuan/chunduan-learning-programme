import type {Metadata,MetadataRoute} from "next";
import {createHash} from "node:crypto";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {pwaEntries,type PwaKey} from "./environments";
export function visualAsset(asset:string):string|null {return existsSync(path.join(process.cwd(),"public",asset))?asset:null;}
export function isPwaKey(value:string):value is PwaKey {return Object.hasOwn(pwaEntries,value);}
function iconVersion(key:PwaKey):string {
  const hash=createHash("sha256");
  for(const size of [180,192,512]){
    try{hash.update(readFileSync(path.join(process.cwd(),"public",pwaEntries[key].icon,`icon-${size}.png`)));}
    catch{/* Missing sizes use the 512px source or a generated placeholder. */}
  }
  return hash.digest("hex").slice(0,12);
}
function iconUrl(key:PwaKey,size:number,version:string){return `/pwa/${key}/icon?size=${size}&v=${version}`;}
export function environmentMetadata(key:PwaKey):Metadata {
  const entry=pwaEntries[key];
  const version=iconVersion(key);
  return {title:key==="main"?entry.title:`${entry.title} | Learning Programme`,applicationName:entry.title,manifest:`/pwa/${key}/manifest.webmanifest?v=${version}`,
    appleWebApp:{capable:true,title:entry.title,statusBarStyle:"default"},icons:{apple:[{url:iconUrl(key,180,version),sizes:"180x180",type:"image/png"}],icon:[{url:iconUrl(key,192,version),sizes:"192x192",type:"image/png"}]}};
}
export function buildManifest(key:PwaKey):MetadataRoute.Manifest {
  const entry=pwaEntries[key];
  const version=iconVersion(key);
  return {id:`/pwa/${key}`,name:entry.title,short_name:entry.title,start_url:entry.startUrl,scope:"/",display:"standalone",background_color:"#ffffff",theme_color:"#ffffff",
    icons:[192,512].map(size=>({src:iconUrl(key,size,version),sizes:`${size}x${size}`,type:"image/png",purpose:"any"}))};
}
