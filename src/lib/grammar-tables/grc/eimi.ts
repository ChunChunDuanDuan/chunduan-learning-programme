import {matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

export const greekEimi:GrammarTableDefinition={
  id:"eimi",language:"grc",category:"Verbs",title:"εἰμί — Basic Paradigm",subtitle:"Present and imperfect indicative",
  description:"The irregular Attic verb ‘to be’ shown separately from regular -ω verbs.",
  tags:["verb","irregular","present","imperfect"],relatedGrammarTopics:["εἰμί","to be","irregular verbs"],
  sections:[matrix("indicative","Indicative forms",["Present","Imperfect"],[
    ["1st singular","εἰμί","ἦ(ν)"],["2nd singular","εἶ","ἦσθα"],["3rd singular","ἐστί(ν)","ἦν"],
    ["1st plural","ἐσμέν","ἦμεν"],["2nd plural","ἐστέ","ἦτε"],["3rd plural","εἰσί(ν)","ἦσαν"],
  ])],
  notes:["Present infinitive: εἶναι. Present participle: ὤν, οὖσα, ὄν.","The optional movable ν is shown in parentheses."],
  source:{label:"Reading Greek: Language Reference Book, p. 56",url:"https://fass.open.ac.uk/sites/fass.open.ac.uk/files/files/classical-studies/Reading_Greek_Language_Reference_Book_May_2022.pdf"},
};
