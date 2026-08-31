import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"Veriq — Before you trust it, check it.",description:"A transparent digital trust engine for websites, messages and claims."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}