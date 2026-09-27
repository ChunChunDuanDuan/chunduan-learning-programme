import {greekArticle} from "./grc/article";
import {greekFirstDeclension} from "./grc/first-declension";
import {greekSecondDeclension} from "./grc/second-declension";
import {greekThirdDeclension} from "./grc/third-declension";
import {greekAdjectives} from "./grc/adjectives";
import {greekLuo} from "./grc/luo";
import {greekEimi} from "./grc/eimi";
import {greekPrepositions} from "./grc/prepositions";
import {latinDeclensions} from "./la/declensions";
import {latinAdjectives} from "./la/adjectives";
import {latinConjugations} from "./la/conjugations";
import {latinSum} from "./la/sum";
import {latinIrregular} from "./la/irregular";
import {latinPrepositions} from "./la/prepositions";
import type {GrammarTableDefinition,GrammarTableLanguage} from "./types";

export const grammarTables:readonly GrammarTableDefinition[]=[
  greekArticle,greekFirstDeclension,greekSecondDeclension,greekThirdDeclension,
  greekAdjectives,greekLuo,greekEimi,greekPrepositions,
  ...latinDeclensions,latinAdjectives,...latinConjugations,latinSum,latinIrregular,latinPrepositions,
];
export function tablesForLanguage(language:GrammarTableLanguage){return grammarTables.filter(table=>table.language===language);}
export function tableById(language:GrammarTableLanguage,id:string){return grammarTables.find(table=>table.language===language&&table.id===id);}
