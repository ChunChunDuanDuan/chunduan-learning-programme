import {ImageResponse} from "next/og";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {isPwaKey} from "@/lib/pwa";
import {pwaEntries} from "@/lib/environments";
export async function GET(request:Request,{params}:{params:Promise<{entry:string}>}){
  const {entry}=await params;if(!isPwaKey(entry))return new Response("Not found",{status:404});
  const requested=Number(new URL(request.url).searchParams.get("size"));
  const size=[180,192,512].includes(requested)?requested:512;
  try {
    const icon=await readFile(path.join(process.cwd(),"public",pwaEntries[entry].icon,`icon-${size}.png`));
    return new Response(icon,{headers:{"Content-Type":"image/png","Cache-Control":"public, max-age=300"}});
  }catch{
    // A single Phase 2 512px icon can also supply the smaller installation sizes.
    if(size!==512){
      try{
        const source=await readFile(path.join(process.cwd(),"public",pwaEntries[entry].icon,"icon-512.png"));
        return new ImageResponse(
          // eslint-disable-next-line @next/next/no-img-element -- rasterized by ImageResponse
          <img alt="" src={`data:image/png;base64,${source.toString("base64")}`} width={size} height={size}/>,
          {width:size,height:size}
        );
      }catch{/* Fall through to the neutral installation placeholder. */}
    }
    // Neutral installation placeholder, separate from all page cover assets.
    return new ImageResponse(<div style={{display:"flex",width:"100%",height:"100%",background:"#f5f5f5",color:"#525252",alignItems:"center",justifyContent:"center",fontSize:size/3}}>{entry==="main"?"LP":pwaEntries[entry].title[0]}</div>,{width:size,height:size});
  }
}
