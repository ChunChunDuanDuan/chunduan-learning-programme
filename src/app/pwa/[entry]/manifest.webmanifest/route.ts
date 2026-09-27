import {buildManifest,isPwaKey} from "@/lib/pwa";
export async function GET(_request:Request,{params}:{params:Promise<{entry:string}>}){
  const {entry}=await params;if(!isPwaKey(entry))return new Response("Not found",{status:404});
  return Response.json(buildManifest(entry),{headers:{"Content-Type":"application/manifest+json","Cache-Control":"public, max-age=300"}});
}
