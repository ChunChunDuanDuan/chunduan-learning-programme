import {redirect} from "next/navigation";
import {legacyLanguageDestination} from "@/lib/languages/legacy-redirect";
export default async function LegacyPage({searchParams}:{searchParams:Promise<{language?:string}>}){redirect(legacyLanguageDestination("texts",(await searchParams).language));}
