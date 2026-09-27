import {environmentMetadata} from "@/lib/pwa";
export const metadata=environmentMetadata("languages");
export default function LanguagesLayout({children}:{children:React.ReactNode}){return children;}
