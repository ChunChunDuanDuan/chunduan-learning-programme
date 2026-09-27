import {greekNoun,matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

export const greekSecondDeclension:GrammarTableDefinition={
  id:"second-declension",language:"grc",category:"Nominals",title:"Second Declension",subtitle:"Reading Greek types 2a and 2b",
  description:"The -ος masculine/feminine pattern and -ον neuter pattern, with complete singular and plural cases.",
  tags:["noun","declension","2a","2b"],relatedGrammarTopics:["second declension","2a","2b"],
  sections:[
    matrix("2a","2a · ὁ ἄνθρωπος",["Singular","Plural"],[
      ["Nominative","ἄνθρωπος","ἄνθρωποι"],["Genitive","ἀνθρώπου","ἀνθρώπων"],["Dative","ἀνθρώπῳ","ἀνθρώποις"],
      ["Accusative","ἄνθρωπον","ἀνθρώπους"],["Vocative","ἄνθρωπε","ἄνθρωποι"],
    ],{vocabularyMatcher:greekNoun("2a"),notes:["Mostly masculine; some 2a nouns are feminine while keeping these endings."]}),
    matrix("2b","2b · τὸ ἔργον",["Singular","Plural"],[
      ["Nominative","ἔργον","ἔργα"],["Genitive","ἔργου","ἔργων"],["Dative","ἔργῳ","ἔργοις"],
      ["Accusative","ἔργον","ἔργα"],["Vocative","ἔργον","ἔργα"],
    ],{vocabularyMatcher:greekNoun("2b"),notes:["Neuter: nominative, accusative, and vocative coincide in each number."]}),
  ],
  source:{label:"Reading Greek: Language Reference Book, pp. 13–14",url:"https://fass.open.ac.uk/sites/fass.open.ac.uk/files/files/classical-studies/Reading_Greek_Language_Reference_Book_May_2022.pdf"},
};
