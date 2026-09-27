import {matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

const persons=["1st singular","2nd singular","3rd singular","1st plural","2nd plural","3rd plural"];
const verb=(id:string,title:string,forms:readonly string[])=>matrix(id,title,["Form"],persons.map((person,index)=>[person,forms[index]]),{vocabularyMatcher:{partOfSpeech:"verb",metadataKeys:["verb_class","verbClass"],values:["thematic -ω","regular -ω","ω-verb"]}});
export const greekLuo:GrammarTableDefinition={
  id:"luo",language:"grc",category:"Verbs",title:"λύω — Basic Verb Paradigm",subtitle:"Present and imperfect indicative",
  description:"A reference for a regular thematic -ω verb. The forms are written explicitly; this is not a conjugator.",
  tags:["verb","present","imperfect","active","middle passive"],relatedGrammarTopics:["λύω","present indicative","imperfect indicative","middle passive"],
  sections:[
    verb("present-active","Present indicative active",["λύω","λύεις","λύει","λύομεν","λύετε","λύουσι(ν)"]),
    verb("present-middle-passive","Present indicative middle/passive",["λύομαι","λύῃ / λύει","λύεται","λυόμεθα","λύεσθε","λύονται"]),
    verb("imperfect-active","Imperfect indicative active",["ἔλυον","ἔλυες","ἔλυε(ν)","ἐλύομεν","ἐλύετε","ἔλυον"]),
  ],
  notes:["The imperfect has an augment ἐ-; 1st singular and 3rd plural share ἔλυον.","Middle/passive forms can have distinct meanings in context."],
  source:{label:"Dickinson College Commentaries, Ancient Greek verb reference",url:"https://dcc.dickinson.edu/grammar/age/imperfect-tense-%CF%89-verbs"},
};
