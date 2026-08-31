import {NextResponse} from "next/server";
import {analyze,CheckType} from "@/lib/analyzer";
export async function POST(req:Request){
 try{
  const body=await req.json(); const type=body?.type as CheckType; const input=String(body?.input??"");
  if(!["url","message","claim"].includes(type)) return NextResponse.json({error:"Unsupported check type."},{status:400});
  return NextResponse.json({analysis:analyze(type,input)});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Analysis failed."},{status:400})}
}