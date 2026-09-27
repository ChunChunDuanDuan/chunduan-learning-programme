import {matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

export const latinIrregular:GrammarTableDefinition={
  id:"irregular-verbs",language:"la",category:"Irregular Forms",title:"Basic Irregular Verbs",subtitle:"Principal-part overview",
  description:"A concise reference to common irregular verbs and their key dictionary forms. Full tense/mood paradigms can be added as separate sections later.",
  tags:["verb","irregular","principal parts"],relatedGrammarTopics:["irregular verbs","possum","ferō","eō","volō","nōlō","mālō","fīō"],
  sections:[matrix("overview","Key forms",["Infinitive","Other key forms","Note"],[
    ["possum","posse","potuī","be able"],
    ["ferō","ferre","tulī, lātum","carry; suppletive perfect/supine"],
    ["eō","īre","iī / īvī, itum","go"],
    ["volō","velle","voluī","wish, want"],
    ["nōlō","nōlle","nōluī","be unwilling"],
    ["mālō","mālle","māluī","prefer"],
    ["fīō","fierī","factus sum","become; used as passive of faciō"],
  ],{tableType:"comparison"})],
  notes:["Principal parts here are for recognition and lookup; this table does not claim to list every irregular form."],
  source:{label:"Dickinson College Commentaries, Allen and Greenough: irregular verbs",url:"https://dcc.dickinson.edu/grammar/latin/irregular-verbs-compounds-sum"},
};
