import {matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

const persons=["1st singular","2nd singular","3rd singular","1st plural","2nd plural","3rd plural"];
const source={label:"Dickinson College Commentaries, Allen and Greenough: Latin conjugations",url:"https://dcc.dickinson.edu/grammar/latin/four-conjugations"};
const conjugationValues:Record<string,string[]>={
  "first-conjugation":["1","1st","first","1st conjugation"],
  "second-conjugation":["2","2nd","second","2nd conjugation"],
  "third-conjugation":["3","3rd","third","3rd conjugation"],
  "third-io-conjugation":["3io","3-io","3rd-io","third-io","third-io conjugation"],
  "fourth-conjugation":["4","4th","fourth","4th conjugation"],
};
function conjugation(id:string,title:string,subtitle:string,description:string,forms:readonly string[],tags:readonly string[]):GrammarTableDefinition{
  return {id,language:"la",category:"Verbs",title,subtitle,description,tags,
    relatedGrammarTopics:[title,subtitle,"present indicative"],
    sections:[matrix("present-active","Present indicative active",["Form"],persons.map((person,index)=>[person,forms[index]]),{vocabularyMatcher:{partOfSpeech:"verb",metadataKeys:["conjugation"],values:conjugationValues[id]}})],
    notes:["The six present active forms are explicit reference data, not generated from a Vocabulary lemma."],source};
}
export const latinConjugations:GrammarTableDefinition[]=[
  conjugation("first-conjugation","First Conjugation","amō, amāre","The regular -āre present active pattern.",["amō","amās","amat","amāmus","amātis","amant"],["verb","present","1st conjugation"]),
  conjugation("second-conjugation","Second Conjugation","moneō, monēre","The regular -ēre present active pattern.",["moneō","monēs","monet","monēmus","monētis","monent"],["verb","present","2nd conjugation"]),
  conjugation("third-conjugation","Third Conjugation","regō, regere","The consonant-stem -ere present active pattern.",["regō","regis","regit","regimus","regitis","regunt"],["verb","present","3rd conjugation"]),
  conjugation("third-io-conjugation","Third-io Conjugation","capiō, capere","The -iō subtype of the third conjugation.",["capiō","capis","capit","capimus","capitis","capiunt"],["verb","present","3rd-io"]),
  conjugation("fourth-conjugation","Fourth Conjugation","audiō, audīre","The regular -īre present active pattern.",["audiō","audīs","audit","audīmus","audītis","audiunt"],["verb","present","4th conjugation"]),
];
