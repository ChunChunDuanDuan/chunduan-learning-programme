import {matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

export const latinPrepositions:GrammarTableDefinition={
  id:"prepositions",language:"la",category:"Syntax & Cases",title:"Prepositions + Cases",subtitle:"Accusative, ablative, and two-case contrasts",
  description:"Latin prepositions are grouped by governed case; in and sub are shown twice because case changes the core meaning.",
  tags:["preposition","accusative","ablative","case"],relatedGrammarTopics:["prepositions","prepositions and cases","accusative","ablative"],
  sections:[
    matrix("accusative","With accusative",["Case","Core meaning","Note"],[
      ["ad","Accusative","to, toward","direction"],["ante","Accusative","before","space or time"],
      ["apud","Accusative","at, among","location near people"],["inter","Accusative","among, between",""],
      ["per","Accusative","through",""],["post","Accusative","after, behind",""],
      ["propter","Accusative","because of, near",""],["trāns","Accusative","across",""],
    ],{tableType:"case-preposition"}),
    matrix("ablative","With ablative",["Case","Core meaning","Note"],[
      ["ā / ab","Ablative","from, by","agent or separation"],["cum","Ablative","with","accompaniment"],
      ["dē","Ablative","down from, about",""],["ē / ex","Ablative","out of",""],
      ["prō","Ablative","in front of, for",""],["sine","Ablative","without",""],
    ],{tableType:"case-preposition"}),
    matrix("both","Case changes meaning",["Case","Core meaning","Contrast"],[
      ["in","Accusative","into, onto","motion toward a place"],["in","Ablative","in, on","position in a place"],
      ["sub","Accusative","to beneath, up to","motion"],["sub","Ablative","under, beneath","position"],
    ],{tableType:"comparison"}),
  ],
  notes:["The core meanings are guides to reading; idiomatic uses depend on context."],
  source:{label:"Dickinson College Commentaries, Allen and Greenough: uses of prepositions",url:"https://dcc.dickinson.edu/grammar/latin/uses-prepositions"},
};
