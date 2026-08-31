import {NextResponse} from "next/server";import {analyze,CheckType} from "../../../lib/analyzer";
export const runtime="nodejs";
const allowed=["url","message","claim"] as const;
export async function POST(req:Request){
 try{
  const length=Number(req.headers.get("content-length")||0);if(length>30000)return NextResponse.json({error:"Input is too large."},{status:413});
  const body=await req.json();const type=body?.type as CheckType;const input=String(body?.input??"").trim();
  if(!allowed.includes(type as typeof allowed[number]))return NextResponse.json({error:"Unsupported check type."},{status:400});
  if(!input||input.length>20000)return NextResponse.json({error:"Please provide between 1 and 20,000 characters."},{status:400});
  const analysis=await analyze(type,input);return NextResponse.json({analysis,meta:{engineVersion:"mvp-1.1",scoringVersion:"v1"}},{headers:{"cache-control":"no-store"}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Analysis failed."},{status:400})}
}