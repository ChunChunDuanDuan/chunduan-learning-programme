import {ImageResponse} from "next/og";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {isPwaKey} from "@/lib/pwa";
import {pwaEntries} from "@/lib/environments";
const pngSignature=Buffer.from([137,80,78,71,13,10,26,10]);
function matchesSize(source:Buffer,size:number){
  return source.length>=24&&source.subarray(0,8).equals(pngSignature)&&source.readUInt32BE(16)===size&&source.readUInt32BE(20)===size;
}
export async function GET(request:Request,{params}:{params:Promise<{entry:string}>}){
  const {entry}=await params;if(!isPwaKey(entry))return new Response("Not found",{status:404});
  const requested=Number(new URL(request.url).searchParams.get("size"));
  const size=[180,192,512].includes(requested)?requested:512;
  for(const candidate of size===512?[512]:[size,512]){
    try{
      const source=await readFile(path.join(process.cwd(),"public",pwaEntries[entry].icon,`icon-${candidate}.png`));
      if(matchesSize(source,size))return new Response(source,{headers:{"Content-Type":"image/png","Cache-Control":"public, max-age=300"}});
      return new ImageResponse(
        <div style={{display:"flex",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",background:"#f5f5f5"}}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rasterized by ImageResponse */}
          <img alt="" src={`data:image/png;base64,${source.toString("base64")}`} width={size} height={size} style={{objectFit:"contain"}}/>
        </div>,
        {width:size,height:size}
      );
    }catch{/* Try the 512px source, then the neutral placeholder. */}
  }
  // Neutral installation placeholder, separate from all page cover assets.
  return new ImageResponse(<div style={{display:"flex",width:"100%",height:"100%",background:"#f5f5f5",color:"#525252",alignItems:"center",justifyContent:"center",fontSize:size/3}}>{entry==="main"?"LP":pwaEntries[entry].title[0]}</div>,{width:size,height:size});
}
