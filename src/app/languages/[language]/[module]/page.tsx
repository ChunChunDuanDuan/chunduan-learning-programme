import {notFound} from "next/navigation";
import {isLanguageCode} from "@/lib/languages/config";
import {LanguageModule} from "@/components/languages/language-module";
import {LanguageLearningWorkspace} from "@/components/language-learning/language-learning-workspace";
import EnglishReference from "@/components/languages/references/en";
import GermanReference from "@/components/languages/references/de";
import RussianReference from "@/components/languages/references/ru";
import type {EntryKind} from "@/lib/languages/model";
import {LanguageSearch} from "@/components/languages/language-search";
import {GrammarTablesIndex} from "@/components/grammar-tables/tables-index";
import {isGrammarTableLanguage} from "@/lib/grammar-tables/types";
const modules:Record<string,EntryKind>={vocabulary:"vocabulary",sentences:"sentence",texts:"text",grammar:"grammar",concepts:"concept"};
const references={en:<EnglishReference/>,de:<GermanReference/>,ru:<RussianReference/>};
export default async function ModulePage({params}:{params:Promise<{language:string;module:string}>}){
  const {language,module}=await params;if(!isLanguageCode(language))notFound();
  if(module==="grammar-tables"){
    if(!isGrammarTableLanguage(language))notFound();
    return <GrammarTablesIndex language={language}/>;
  }
  if(language==="ja"&&(module==="kana"||module==="analysis"||module==="anki"))return <LanguageLearningWorkspace key={module} initialView={module}/>;
  if(module==="search")return <LanguageSearch key={language} language={language}/>;
  if(!Object.hasOwn(modules,module))notFound();
  const reference=module==="grammar"&&language in references?references[language as keyof typeof references]:undefined;
  return <LanguageModule key={`${language}/${module}`} language={language} kind={modules[module]} reference={reference}/>;
}
