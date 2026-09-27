import {latinNoun,matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

const cases=["Nominative","Genitive","Dative","Accusative","Ablative","Vocative"];
function noun(id:string,title:string,forms:readonly (readonly string[])[],values:readonly string[],notes:readonly string[]=[]){
  return matrix(id,title,["Singular","Plural"],cases.map((caseName,index)=>[caseName,...forms[index]]),{vocabularyMatcher:latinNoun(...values),notes});
}
const source={label:"Dickinson College Commentaries, Allen and Greenough: noun declensions",url:"https://dcc.dickinson.edu/grammar/latin/rules-noun-declension"};
export const latinDeclensions:GrammarTableDefinition[]=[
  {id:"first-declension",language:"la",category:"Nominals",title:"First Declension",subtitle:"puella, puellae",
    description:"A regular ā-stem feminine noun with all six cases.",tags:["noun","declension","1st"],relatedGrammarTopics:["first declension","1st declension"],
    sections:[noun("1","puella — girl",[["puella","puellae"],["puellae","puellārum"],["puellae","puellīs"],["puellam","puellās"],["puellā","puellīs"],["puella","puellae"]],["1","1st","first"])],source},
  {id:"second-declension",language:"la",category:"Nominals",title:"Second Declension",subtitle:"-us, -er, and -um",
    description:"The common masculine -us/-er and neuter -um patterns, each with full singular and plural cases.",tags:["noun","declension","2nd","neuter"],relatedGrammarTopics:["second declension","2nd declension"],
    sections:[
      noun("2-us","servus — -us masculine",[["servus","servī"],["servī","servōrum"],["servō","servīs"],["servum","servōs"],["servō","servīs"],["serve","servī"]],["2","2nd","second","2-us"],["The vocative singular of -us is normally -e."]),
      noun("2-er","puer — -er masculine",[["puer","puerī"],["puerī","puerōrum"],["puerō","puerīs"],["puerum","puerōs"],["puerō","puerīs"],["puer","puerī"]],["2","2nd","second","2-er"]),
      noun("2-neuter","bellum — -um neuter",[["bellum","bella"],["bellī","bellōrum"],["bellō","bellīs"],["bellum","bella"],["bellō","bellīs"],["bellum","bella"]],["2","2nd","second","2-um","2-neuter"],["Neuter nominative, accusative, and vocative are identical."]),
    ],source},
  {id:"third-declension",language:"la",category:"Nominals",title:"Third Declension",subtitle:"Consonant and i-stem patterns",
    description:"Representative consonant, mixed i-stem, and neuter i-stem nouns; third declension has many additional stem changes.",tags:["noun","declension","3rd","i-stem"],relatedGrammarTopics:["third declension","3rd declension","i-stem"],
    sections:[
      noun("3-consonant","rēx, rēgis — consonant stem",[["rēx","rēgēs"],["rēgis","rēgum"],["rēgī","rēgibus"],["rēgem","rēgēs"],["rēge","rēgibus"],["rēx","rēgēs"]],["3","3rd","third","3-consonant"]),
      noun("3-mixed","cīvis, cīvis — mixed i-stem",[["cīvis","cīvēs"],["cīvis","cīvium"],["cīvī","cīvibus"],["cīvem","cīvēs"],["cīve","cīvibus"],["cīvis","cīvēs"]],["3","3rd","third","3-mixed","3-i-stem"],["The genitive plural uses -ium; the ablative singular shown here is -e."]),
      noun("3-neuter-i","mare, maris — neuter i-stem",[["mare","maria"],["maris","marium"],["marī","maribus"],["mare","maria"],["marī","maribus"],["mare","maria"]],["3","3rd","third","3-neuter-i","3-i-stem"],["Neuter i-stems use -ī in the ablative singular and -ia in the nominative/accusative plural."]),
    ],source},
  {id:"fourth-declension",language:"la",category:"Nominals",title:"Fourth Declension",subtitle:"manus and cornū",
    description:"A common -us noun and a neuter -ū noun.",tags:["noun","declension","4th","neuter"],relatedGrammarTopics:["fourth declension","4th declension"],
    sections:[
      noun("4-us","manus, manūs — feminine",[["manus","manūs"],["manūs","manuum"],["manuī","manibus"],["manum","manūs"],["manū","manibus"],["manus","manūs"]],["4","4th","fourth","4-us"]),
      noun("4-neuter","cornū, cornūs — neuter",[["cornū","cornua"],["cornūs","cornuum"],["cornū","cornibus"],["cornū","cornua"],["cornū","cornibus"],["cornū","cornua"]],["4","4th","fourth","4-neuter"]),
    ],source},
  {id:"fifth-declension",language:"la",category:"Nominals",title:"Fifth Declension",subtitle:"rēs, reī",
    description:"The common fifth-declension noun rēs, with all six cases.",tags:["noun","declension","5th"],relatedGrammarTopics:["fifth declension","5th declension"],
    sections:[noun("5","rēs — thing, matter",[["rēs","rēs"],["reī","rērum"],["reī","rēbus"],["rem","rēs"],["rē","rēbus"],["rēs","rēs"]],["5","5th","fifth"])],source},
];
