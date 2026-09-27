import type {GrammarTableColumn,GrammarTableSection,GrammarTableType,VocabularyMatcher} from "./types";

// This only shapes explicitly listed reference cells. It never derives word forms.
export function matrix(id:string,title:string,columns:readonly (string|GrammarTableColumn)[],rows:readonly (readonly string[])[],options:{tableType?:GrammarTableType;description?:string;notes?:readonly string[];vocabularyMatcher?:VocabularyMatcher}={}):GrammarTableSection{
  return {id,title,tableType:options.tableType??"paradigm",description:options.description,
    columns:columns.map(column=>typeof column==="string"?{label:column}:column),
    rows:rows.map(([label,...cells])=>({label,cells})),notes:options.notes,vocabularyMatcher:options.vocabularyMatcher};
}
export const greekNoun=(...values:string[]):VocabularyMatcher=>({partOfSpeech:"noun",metadataKeys:["declension_noun_class","declensionClass"],values});
export const latinNoun=(...values:string[]):VocabularyMatcher=>({partOfSpeech:"noun",metadataKeys:["declension"],values});
