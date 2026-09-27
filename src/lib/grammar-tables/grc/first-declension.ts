import {greekNoun,matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

const cases=["Nominative","Genitive","Dative","Accusative","Vocative"];
function noun(id:string,title:string,forms:readonly (readonly string[])[],note:string){
  return matrix(id,title,["Singular","Plural"],cases.map((caseName,index)=>[caseName,...forms[index]]),{vocabularyMatcher:greekNoun(id),notes:[note]});
}
export const greekFirstDeclension:GrammarTableDefinition={
  id:"first-declension",language:"grc",category:"Nominals",title:"First Declension",subtitle:"Reading Greek types 1a–1d",
  description:"Representative Attic α/η-stem nouns. The subtype labels follow Reading Greek; 1a–1c are feminine and 1d is masculine.",
  tags:["noun","declension","1a","1b","1c","1d"],relatedGrammarTopics:["first declension","1a","1b","1c","1d"],
  sections:[
    noun("1a","1a · ἡ βοή (η-stem)",[["βοή","βοαί"],["βοῆς","βοῶν"],["βοῇ","βοαῖς"],["βοήν","βοάς"],["βοή","βοαί"]],"Feminine; singular η, but plural α forms."),
    noun("1b","1b · ἡ ἀπορία (α after ι)",[["ἀπορία","ἀπορίαι"],["ἀπορίας","ἀποριῶν"],["ἀπορίᾳ","ἀπορίαις"],["ἀπορίαν","ἀπορίας"],["ἀπορία","ἀπορίαι"]],"Feminine; α is retained in genitive and dative singular after ε, ι, or ρ."),
    noun("1c","1c · ἡ θάλαττα (short α)",[["θάλαττα","θάλατται"],["θαλάττης","θαλαττῶν"],["θαλάττῃ","θαλάτταις"],["θάλατταν","θαλάττας"],["θάλαττα","θάλατται"]],"Feminine; singular genitive/dative change to η."),
    noun("1d","1d · ὁ ναύτης (masculine -ης)",[["ναύτης","ναῦται"],["ναύτου","ναυτῶν"],["ναύτῃ","ναύταις"],["ναύτην","ναύτας"],["ναῦτα","ναῦται"]],"Masculine; genitive singular -ου and vocative singular -α."),
    matrix("1d-as","1d · ὁ νεανίας (masculine -ας)",["Singular","Plural"],cases.map((caseName,index)=>[caseName,...[["νεανίας","νεανίαι"],["νεανίου","νεανιῶν"],["νεανίᾳ","νεανίαις"],["νεανίαν","νεανίας"],["νεανία","νεανίαι"]][index]]),{vocabularyMatcher:greekNoun("1d"),notes:["Another 1d nominative singular pattern; plural endings align with other first-declension nouns."]}),
  ],
  notes:["Vocative plural equals nominative plural in these paradigms.","These are representative forms, not a declension generator."],
  source:{label:"Reading Greek: Language Reference Book, pp. 11–12",url:"https://fass.open.ac.uk/sites/fass.open.ac.uk/files/files/classical-studies/Reading_Greek_Language_Reference_Book_May_2022.pdf"},
};
