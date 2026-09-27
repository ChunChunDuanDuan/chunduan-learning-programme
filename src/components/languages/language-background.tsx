import type {CSSProperties,ReactNode} from "react";
import {DEFAULT_LANGUAGE_BACKGROUND_OPACITY,type LanguageBackgroundConfig} from "@/lib/languages/config";

type Props={background:LanguageBackgroundConfig;source:string|null;children?:ReactNode;fallbackColor?:string};

export function LanguageBackground({background,source,children,fallbackColor="var(--background)"}:Props){
  const opacity=Math.min(1,Math.max(0,background.opacity??DEFAULT_LANGUAGE_BACKGROUND_OPACITY));
  const position=background.position??"top center";
  const repeat=background.repeat??"no-repeat";
  return <div className="language-environment" style={{backgroundColor:fallbackColor}}>
    {source?<div className="language-background-layer" aria-hidden="true">
      {repeat==="no-repeat"?(
        // Native image preserves the artwork's intrinsic height; no missing asset is rendered.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={source} alt="" decoding="async" className="language-background-artwork" style={{opacity,objectPosition:position}}/>
      ):<div className="language-background-repeated" style={{backgroundImage:`url("${source}")`,backgroundPosition:position,backgroundRepeat:repeat,opacity} as CSSProperties}/>}
    </div>:null}
    <div className="language-environment-content">{children}</div>
  </div>;
}
