import {matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

export const greekArticle:GrammarTableDefinition={
  id:"article",language:"grc",category:"Function Words",title:"Definite Article",subtitle:"ὁ, ἡ, τό",
  description:"The Attic definite article by case, number, and gender.",tags:["article","case","gender"],
  relatedGrammarTopics:["article","definite article","ὁ ἡ τό"],
  sections:[matrix("forms","ὁ, ἡ, τό",[
    {label:"Masculine",group:"Singular"},{label:"Feminine",group:"Singular"},{label:"Neuter",group:"Singular"},
    {label:"Masculine",group:"Plural"},{label:"Feminine",group:"Plural"},{label:"Neuter",group:"Plural"},
  ],[
    ["Nominative","ὁ","ἡ","τό","οἱ","αἱ","τά"],
    ["Genitive","τοῦ","τῆς","τοῦ","τῶν","τῶν","τῶν"],
    ["Dative","τῷ","τῇ","τῷ","τοῖς","ταῖς","τοῖς"],
    ["Accusative","τόν","τήν","τό","τούς","τάς","τά"],
  ])],
  notes:["There is no vocative form of the definite article.","Neuter nominative and accusative forms are identical."],
  source:{label:"Reading Greek: Language Reference Book, p. 10",url:"https://fass.open.ac.uk/sites/fass.open.ac.uk/files/files/classical-studies/Reading_Greek_Language_Reference_Book_May_2022.pdf"},
};
