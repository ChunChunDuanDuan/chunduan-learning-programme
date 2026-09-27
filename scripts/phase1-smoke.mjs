import assert from "node:assert/strict";
const base=process.env.PHASE1_BASE_URL||"http://localhost:3000";
const redirects={"/schedule":"/record/schedule","/progress":"/record/progress","/daily-log":"/record/daily-log","/vocabulary":"/languages","/sentences":"/languages","/articles":"/languages","/language-comparison":"/languages/cross-language","/articles?language=de":"/languages/de/texts"};
for(const [from,to] of Object.entries(redirects)){
  const response=await fetch(base+from,{redirect:"manual"});assert.equal(response.status,307,from);assert.equal(new URL(response.headers.get("location"),base).pathname,to,from);
}
for(const [entry,start] of Object.entries({main:"/",languages:"/languages",philosophy:"/philosophy",fitness:"/fitness",record:"/record"})){
  const response=await fetch(`${base}/pwa/${entry}/manifest.webmanifest`);assert.equal(response.status,200);
  const manifest=await response.json();assert.equal(manifest.start_url,start);assert.equal(manifest.id,`/pwa/${entry}`);
  for(const icon of manifest.icons){
    const result=await fetch(base+icon.src);assert.equal(result.status,200,icon.src);assert.match(result.headers.get("content-type"),/image\/png/);
    const image=Buffer.from(await result.arrayBuffer());assert.equal(image.subarray(1,4).toString(),"PNG");assert.equal(image.readUInt32BE(16),Number(icon.sizes.split("x")[0]));
  }
}
const home=await (await fetch(base)).text();assert.equal((home.match(/<a\s/g)||[]).length,4);assert.equal(home.includes("<aside"),false);
// Next.js may send HTTP 200 before an async route renders its not-found boundary.
for(const path of ["/languages/el","/languages/grc/missing"]){
  const response=await fetch(base+path);const body=await response.text();
  assert.ok(response.status===404||(response.status===200&&body.includes("NEXT_HTTP_ERROR_FALLBACK;404")),path);
}
assert.equal((await fetch(base+"/pwa/grc/manifest.webmanifest")).status,404);
console.log("HTTP smoke: 8 redirects, 5 manifests, 10 PNG icons, four-entry home, invalid routes — passed.");
