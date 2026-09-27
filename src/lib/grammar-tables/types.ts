import type {LanguageCode} from "@/lib/languages/config";

export type GrammarTableLanguage=Extract<LanguageCode,"grc"|"la">;
export type GrammarTableType="paradigm"|"comparison"|"case-preposition";
export type GrammarTableCategory="Nominals"|"Verbs"|"Syntax & Cases"|"Function Words"|"Sound & Accent"|"Irregular Forms";
export type GrammarTableCell=string|{text:string;colSpan:number};
export type GrammarTableColumn={label:string;group?:string};
export type VocabularyMatcher={partOfSpeech:string;metadataKeys:readonly string[];values:readonly string[]};
export type GrammarTableSection={
  id:string;title:string;description?:string;tableType:GrammarTableType;
  columns:readonly GrammarTableColumn[];
  rows:readonly {label:string;cells:readonly GrammarTableCell[];group?:string}[];
  notes?:readonly string[];
  vocabularyMatcher?:VocabularyMatcher;
};
export type GrammarTableDefinition={
  id:string;language:GrammarTableLanguage;category:GrammarTableCategory;
  title:string;subtitle?:string;description:string;tags:readonly string[];
  sections:readonly GrammarTableSection[];notes?:readonly string[];
  relatedGrammarTopics?:readonly string[];
  source?:{label:string;url:string};
};

export const GRAMMAR_CATEGORIES:Record<GrammarTableLanguage,readonly GrammarTableCategory[]>={
  grc:["Nominals","Verbs","Syntax & Cases","Function Words","Sound & Accent"],
  la:["Nominals","Verbs","Syntax & Cases","Irregular Forms"],
};
export function isGrammarTableLanguage(value:string):value is GrammarTableLanguage{return value==="grc"||value==="la";}
