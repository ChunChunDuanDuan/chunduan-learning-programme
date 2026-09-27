import {matrix} from "../helpers";
import type {GrammarTableDefinition,VocabularyMatcher} from "../types";

const adjective=(...values:string[]):VocabularyMatcher=>({partOfSpeech:"adjective",metadataKeys:["adjective_class","adjectiveClass"],values});
const columns=[
  {label:"Masculine",group:"Singular"},{label:"Feminine",group:"Singular"},{label:"Neuter",group:"Singular"},
  {label:"Masculine",group:"Plural"},{label:"Feminine",group:"Plural"},{label:"Neuter",group:"Plural"},
];
export const greekAdjectives:GrammarTableDefinition={
  id:"adjectives",language:"grc",category:"Nominals",title:"Adjective Paradigms",subtitle:"Three- and two-termination patterns",
  description:"Case, number, and gender forms for a regular first/second-declension adjective and a common two-termination adjective.",
  tags:["adjective","gender","case"],relatedGrammarTopics:["adjectives","adjective paradigms","first second declension adjective"],
  sections:[
    matrix("first-second","ἀγαθός, ἀγαθή, ἀγαθόν",columns,[
      ["Nominative","ἀγαθός","ἀγαθή","ἀγαθόν","ἀγαθοί","ἀγαθαί","ἀγαθά"],
      ["Genitive","ἀγαθοῦ","ἀγαθῆς","ἀγαθοῦ","ἀγαθῶν","ἀγαθῶν","ἀγαθῶν"],
      ["Dative","ἀγαθῷ","ἀγαθῇ","ἀγαθῷ","ἀγαθοῖς","ἀγαθαῖς","ἀγαθοῖς"],
      ["Accusative","ἀγαθόν","ἀγαθήν","ἀγαθόν","ἀγαθούς","ἀγαθάς","ἀγαθά"],
      ["Vocative","ἀγαθέ","ἀγαθή","ἀγαθόν","ἀγαθοί","ἀγαθαί","ἀγαθά"],
    ],{vocabularyMatcher:adjective("1/2","first/second","2-1-2")}),
    matrix("two-termination","ἀληθής, ἀληθές",[
      {label:"Masculine / Feminine",group:"Singular"},{label:"Neuter",group:"Singular"},
      {label:"Masculine / Feminine",group:"Plural"},{label:"Neuter",group:"Plural"},
    ],[
      ["Nominative","ἀληθής","ἀληθές","ἀληθεῖς","ἀληθῆ"],
      ["Genitive","ἀληθοῦς","ἀληθοῦς","ἀληθῶν","ἀληθῶν"],
      ["Dative","ἀληθεῖ","ἀληθεῖ","ἀληθέσι(ν)","ἀληθέσι(ν)"],
      ["Accusative","ἀληθῆ","ἀληθές","ἀληθεῖς","ἀληθῆ"],
      ["Vocative","ἀληθές","ἀληθές","ἀληθεῖς","ἀληθῆ"],
    ],{vocabularyMatcher:adjective("two-termination","2-2"),notes:["The same masculine/feminine forms are shown in one column."]}),
  ],
  notes:["Adjectives agree with the noun in gender, number, and case; the examples here are reference forms, not generated Vocabulary entries."],
  source:{label:"Reading Greek: Language Reference Book, pp. 21–24",url:"https://fass.open.ac.uk/sites/fass.open.ac.uk/files/files/classical-studies/Reading_Greek_Language_Reference_Book_May_2022.pdf"},
};
