import {greekNoun,matrix} from "../helpers";
import type {GrammarTableDefinition} from "../types";

export const greekThirdDeclension:GrammarTableDefinition={
  id:"third-declension",language:"grc",category:"Nominals",title:"Third Declension Overview",subtitle:"Selected Reading Greek patterns",
  description:"A compact guide to several common third-declension stems. The family is broader than these representative patterns.",
  tags:["noun","declension","3a","3b","3c","3e","3g"],relatedGrammarTopics:["third declension","3a","3b","3c","3e","3g"],
  sections:[
    matrix("3a","3a · ὁ λιμήν (consonant stem)",["Singular","Plural"],[
      ["Nominative","λιμήν","λιμένες"],["Genitive","λιμένος","λιμένων"],["Dative","λιμένι","λιμέσι(ν)"],["Accusative","λιμένα","λιμένας"],
    ],{vocabularyMatcher:greekNoun("3a"),notes:["3a includes several consonant stems; the nominative and dative plural can vary by stem."]}),
    matrix("3a-dental","3a · ἡ νύξ (νυκτ-, dental cluster)",["Singular","Plural"],[
      ["Nominative","νύξ","νύκτες"],["Genitive","νυκτός","νυκτῶν"],["Dative","νυκτί","νυξί(ν)"],["Accusative","νύκτα","νύκτας"],
    ],{vocabularyMatcher:greekNoun("3a"),notes:["νυκτ- + σ gives the characteristic ξ form."]}),
    matrix("3b","3b · τὸ πρᾶγμα (neuter -μα)",["Singular","Plural"],[
      ["Nominative","πρᾶγμα","πράγματα"],["Genitive","πράγματος","πραγμάτων"],["Dative","πράγματι","πράγμασι(ν)"],["Accusative","πρᾶγμα","πράγματα"],
    ],{vocabularyMatcher:greekNoun("3b"),notes:["Neuter nominative and accusative are identical."]}),
    matrix("3c","3c · τὸ πλῆθος (-ος neuter)",["Singular","Plural"],[
      ["Nominative","πλῆθος","πλήθη"],["Genitive","πλήθους","πληθῶν"],["Dative","πλήθει","πλήθεσι(ν)"],["Accusative","πλῆθος","πλήθη"],
    ],{vocabularyMatcher:greekNoun("3c")}),
    matrix("3e","3e · ἡ πόλις (-ι stem)",["Singular","Plural"],[
      ["Nominative","πόλις","πόλεις"],["Genitive","πόλεως","πόλεων"],["Dative","πόλει","πόλεσι(ν)"],["Accusative","πόλιν","πόλεις"],
    ],{vocabularyMatcher:greekNoun("3e")}),
    matrix("3g","3g · ὁ βασιλεύς (-ευς)",["Singular","Plural"],[
      ["Nominative","βασιλεύς","βασιλῆς / βασιλεῖς"],["Genitive","βασιλέως","βασιλέων"],["Dative","βασιλεῖ","βασιλεῦσι(ν)"],["Accusative","βασιλέα","βασιλέας"],
    ],{vocabularyMatcher:greekNoun("3g")}),
  ],
  notes:["Vocatives are omitted from this overview because third-declension vocative forms vary by pattern.","Types 3d, 3f, and 3h can be added as further sections without changing the renderer."],
  source:{label:"Reading Greek: Language Reference Book, pp. 15–19",url:"https://fass.open.ac.uk/sites/fass.open.ac.uk/files/files/classical-studies/Reading_Greek_Language_Reference_Book_May_2022.pdf"},
};
