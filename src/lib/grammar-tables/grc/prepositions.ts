import {matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

export const greekPrepositions:GrammarTableDefinition={
  id:"prepositions",language:"grc",category:"Syntax & Cases",title:"Prepositions + Cases",subtitle:"Core Attic contrasts",
  description:"The same preposition may govern more than one case and change meaning. Each case use has its own row.",
  tags:["preposition","case","genitive","dative","accusative"],relatedGrammarTopics:["prepositions","prepositions and cases"],
  sections:[matrix("uses","Case-governed meanings",["Case","Core meaning","Notes / contrast"],[
    ["διά","Genitive","through","Path or means"],["διά","Accusative","because of","Cause"],
    ["ἐπί","Genitive","on, upon","Position or contact"],["ἐπί","Dative","on, at","Position or purpose"],["ἐπί","Accusative","onto, against","Motion or direction"],
    ["κατά","Genitive","down from, against","Separation or opposition"],["κατά","Accusative","down, according to","Direction or standard"],
    ["μετά","Genitive","with","Accompaniment"],["μετά","Accusative","after","Sequence"],
    ["παρά","Genitive","from beside","Source"],["παρά","Dative","beside, with","Position"],["παρά","Accusative","alongside, to beside","Motion"],
    ["περί","Genitive","concerning","Topic"],["περί","Accusative","around, about","Spatial or topical"],
    ["πρός","Genitive","from, in the name of","Source or appeal"],["πρός","Dative","near, in addition to","Position or addition"],["πρός","Accusative","toward","Direction"],
    ["ὑπέρ","Genitive","for, on behalf of","Benefit or representation"],["ὑπέρ","Accusative","over, beyond","Extent"],
    ["ὑπό","Genitive","by, at the hands of","Agent with passive verbs"],["ὑπό","Dative","under, beneath","Position"],["ὑπό","Accusative","under, beneath","Motion toward/under"],
  ],{tableType:"case-preposition"})],
  notes:["These are core glosses, not every idiomatic use. Read the surrounding sentence before choosing a translation."],
  source:{label:"Reading Greek: Language Reference Book, p. 74; Smyth, Prepositions",url:"https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.04.0007%3Apart%3D4%3Achapter%3D43"},
};
