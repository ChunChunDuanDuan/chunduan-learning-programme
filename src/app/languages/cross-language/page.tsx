import {CrossLanguageWorkspace} from "@/components/languages/cross-language-workspace";
import {LocalNavigation} from "@/components/layout/local-navigation";
export const metadata={title:"Cross-language | Learning Programme"};
export default function CrossLanguagePage(){return <><LocalNavigation className="language-navigation-surface" label="Cross-language navigation" returnLink={{label:"Languages Home",href:"/languages"}} links={[]}/><CrossLanguageWorkspace/></>;}
