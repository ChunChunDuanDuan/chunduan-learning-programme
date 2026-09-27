import {LocalNavigation} from "@/components/layout/local-navigation";
import {environmentMetadata} from "@/lib/pwa";
import {environments} from "@/lib/environments";
export const metadata=environmentMetadata("record");
export default function RecordLayout({children}:{children:React.ReactNode}){return <><LocalNavigation label="Record" links={environments.record.localNavigation}/>{children}</>;}
