import {notFound} from "next/navigation";
import {isLanguageCode} from "@/lib/languages/config";
import {LanguageModule} from "@/components/languages/language-module";
import type {EntryKind} from "@/lib/languages/model";
import {isGrammarTableLanguage} from "@/lib/grammar-tables/types";
import {tableById} from "@/lib/grammar-tables/registry";
import {GrammarTableDetail} from "@/components/grammar-tables/table-detail";

const modules:Record<string,EntryKind>={vocabulary:"vocabulary",sentences:"sentence",texts:"text",grammar:"grammar",concepts:"concept"};

export default async function EntryPage({params}:{params:Promise<{language:string;module:string;entryId:string}>}){
  const {language,module,entryId}=await params;
  if(module==="grammar-tables"){
    if(!isGrammarTableLanguage(language))notFound();
    const table=tableById(language,entryId);
    if(!table)notFound();
    return <GrammarTableDetail table={table}/>;
  }
  if(!isLanguageCode(language)||!Object.hasOwn(modules,module)||!/^[-0-9a-f]{36}$/i.test(entryId))notFound();
  return <LanguageModule key={`${language}/${module}/${entryId}`} language={language} kind={modules[module]} entryId={entryId}/>;
}
