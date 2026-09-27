import {normalizePartOfSpeech,type LanguageCode} from "@/lib/languages/config";
import type {LanguageEntry} from "@/lib/languages/model";
import type {GrammarTableDefinition,VocabularyMatcher} from "./types";

const comparable=(value:unknown)=>String(value??"").normalize("NFC").trim().toLocaleLowerCase();
export function matchesVocabulary(entry:LanguageEntry,language:LanguageCode,matcher:VocabularyMatcher):boolean{
  if(entry.kind!=="vocabulary"||entry.language!==language||normalizePartOfSpeech(entry.partOfSpeech)!==matcher.partOfSpeech)return false;
  const allowed=new Set(matcher.values.map(comparable));
  return matcher.metadataKeys.some(key=>allowed.has(comparable(entry.languageMetadata[key]))&&comparable(entry.languageMetadata[key])!=="");
}
export function relatedVocabulary(definition:GrammarTableDefinition,entries:readonly LanguageEntry[]){
  const related=definition.sections.flatMap(section=>section.vocabularyMatcher?entries.filter(entry=>matchesVocabulary(entry,definition.language,section.vocabularyMatcher!)).map(entry=>({sectionId:section.id,entry})):[]);
  return related.filter((item,index)=>related.findIndex(other=>other.entry.id===item.entry.id&&other.entry.table===item.entry.table)===index);
}
export function relatedGrammarNotes(definition:GrammarTableDefinition,entries:readonly LanguageEntry[]){
  const topics=new Set((definition.relatedGrammarTopics??[]).map(comparable));
  return entries.filter(entry=>entry.language===definition.language&&entry.kind==="grammar"&&(
    [entry.id,entry.topic,...entry.tags].some(value=>topics.has(comparable(value)))||
    [...topics].some(topic=>topic!==""&&comparable(entry.title).includes(topic))
  ));
}
export function searchGrammarTables(definitions:readonly GrammarTableDefinition[],language:LanguageCode,query:string,category:string){
  const terms=comparable(query).split(/\s+/).filter(Boolean);
  return definitions.filter(table=>table.language===language&&(category==="All"||table.category===category)&&terms.every(term=>comparable([table.title,table.subtitle,table.category,...table.tags].join(" ")).includes(term)));
}
