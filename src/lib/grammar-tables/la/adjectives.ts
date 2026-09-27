import {matrix} from "../helpers";
import type {GrammarTableDefinition,VocabularyMatcher} from "../types";

const adjective=(...values:string[]):VocabularyMatcher=>({partOfSpeech:"adjective",metadataKeys:["adjective_class_declension_pattern","adjectiveClass","declension"],values});
const genders=[
  {label:"Masculine",group:"Singular"},{label:"Feminine",group:"Singular"},{label:"Neuter",group:"Singular"},
  {label:"Masculine",group:"Plural"},{label:"Feminine",group:"Plural"},{label:"Neuter",group:"Plural"},
];
const two=[
  {label:"Masculine / Feminine",group:"Singular"},{label:"Neuter",group:"Singular"},
  {label:"Masculine / Feminine",group:"Plural"},{label:"Neuter",group:"Plural"},
];
export const latinAdjectives:GrammarTableDefinition={
  id:"adjectives",language:"la",category:"Nominals",title:"Adjective Paradigms",subtitle:"First/second and third declension",
  description:"Regular first/second-declension adjectives and representative third-declension one-, two-, and three-termination patterns.",
  tags:["adjective","gender","case","third declension"],relatedGrammarTopics:["adjectives","adjective paradigms","third declension adjectives"],
  sections:[
    matrix("first-second","bonus, bona, bonum",genders,[
      ["Nominative","bonus","bona","bonum","bonī","bonae","bona"],
      ["Genitive","bonī","bonae","bonī","bonōrum","bonārum","bonōrum"],
      ["Dative","bonō","bonae","bonō","bonīs","bonīs","bonīs"],
      ["Accusative","bonum","bonam","bonum","bonōs","bonās","bona"],
      ["Ablative","bonō","bonā","bonō","bonīs","bonīs","bonīs"],
      ["Vocative","bone","bona","bonum","bonī","bonae","bona"],
    ],{vocabularyMatcher:adjective("1/2","first/second","2-1-2")}),
    matrix("third-one","fēlīx, fēlīcis — one termination",two,[
      ["Nominative","fēlīx","fēlīx","fēlīcēs","fēlīcia"],
      ["Genitive","fēlīcis","fēlīcis","fēlīcium","fēlīcium"],
      ["Dative","fēlīcī","fēlīcī","fēlīcibus","fēlīcibus"],
      ["Accusative","fēlīcem","fēlīx","fēlīcēs","fēlīcia"],
      ["Ablative","fēlīcī","fēlīcī","fēlīcibus","fēlīcibus"],
      ["Vocative","fēlīx","fēlīx","fēlīcēs","fēlīcia"],
    ],{vocabularyMatcher:adjective("3-one","one-termination")}),
    matrix("third-two","fortis, forte — two terminations",two,[
      ["Nominative","fortis","forte","fortēs","fortia"],
      ["Genitive","fortis","fortis","fortium","fortium"],
      ["Dative","fortī","fortī","fortibus","fortibus"],
      ["Accusative","fortem","forte","fortēs","fortia"],
      ["Ablative","fortī","fortī","fortibus","fortibus"],
      ["Vocative","fortis","forte","fortēs","fortia"],
    ],{vocabularyMatcher:adjective("3-two","two-termination")}),
    matrix("third-three","ācer, ācris, ācre — three terminations",genders,[
      ["Nominative","ācer","ācris","ācre","ācrēs","ācrēs","ācria"],
      ["Genitive","ācris","ācris","ācris","ācrium","ācrium","ācrium"],
      ["Dative","ācrī","ācrī","ācrī","ācribus","ācribus","ācribus"],
      ["Accusative","ācrem","ācrem","ācre","ācrēs","ācrēs","ācria"],
      ["Ablative","ācrī","ācrī","ācrī","ācribus","ācribus","ācribus"],
      ["Vocative","ācer","ācris","ācre","ācrēs","ācrēs","ācria"],
    ],{vocabularyMatcher:adjective("3-three","three-termination")}),
  ],
  notes:["The labels one/two/three termination describe nominative singular gender forms, not separate declensions.","These are regular reference patterns, not a list of every irregular adjective."],
  source:{label:"Dickinson College Commentaries, Allen and Greenough: adjectives",url:"https://dcc.dickinson.edu/grammar/latin/formation-adjectives"},
};
