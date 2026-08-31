import dns from "node:dns/promises";import {isIP} from "node:net";

export type CheckType="url"|"message"|"claim";
export type Signal={label:string;detail:string;kind:"positive"|"warning"|"neutral";confidence:number};
export type Analysis={type:CheckType;subject:string;score:number;confidence:number;risk:"low"|"medium"|"high"|"unknown";headline:string;summary:string;signals:Signal[];recommendation:string;limitations:string[]};

const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));

export async function analyze(type:CheckType,input:string):Promise<Analysis>{
 const value=input.trim(); if(!value) throw new Error("Input is required.");
 if(type==="url") return urlCheck(value);
 if(type==="message") return messageCheck(value);
 return claimCheck(value);
}

async function urlCheck(value:string):Promise<Analysis>{
 let u:URL; try{u=new URL(value.startsWith("http://")||value.startsWith("https://")?value:"https://"+value)}catch{throw new Error("Enter a valid URL.")};
 if(!["http:","https:"].includes(u.protocol)) throw new Error("Only HTTP and HTTPS websites can be checked.");
 if(u.username||u.password) throw new Error("URLs containing embedded usernames or passwords cannot be fetched.");

 const host=u.hostname.toLowerCase();
 const signals:Signal[]=[];
 let score=55;
 const limitations:string[]=[];
 if(u.protocol==="https:"){score+=15;signals.push({label:"HTTPS enabled",detail:"The connection uses HTTPS. This protects data in transit but does not prove the website is legitimate.",kind:"positive",confidence:99})}
 else{score-=20;signals.push({label:"No HTTPS",detail:"The address uses HTTP, so the connection is not protected by TLS.",kind:"warning",confidence:99})}
 if(/xn--/i.test(host)){score-=18;signals.push({label:"Punycode hostname",detail:"The hostname uses internationalized encoding. This is not malicious by itself, but it deserves closer inspection for look-alike domains.",kind:"warning",confidence:95})}
 if(u.hostname.split(".").length>4){score-=8;signals.push({label:"Unusually deep hostname",detail:"The address contains several subdomain levels. This can be legitimate, but deceptive sites sometimes use long hostnames.",kind:"neutral",confidence:80})}
 if(/(?:login|verify|secure|support|wallet|bonus|claim|update|account)/i.test(host)){score-=7;signals.push({label:"Sensitive-looking hostname",detail:"The hostname contains words commonly used in account or payment flows. This is a weak signal, not proof of fraud.",kind:"neutral",confidence:72})}

 let reachable=false, finalUrl=u.toString(), redirectCount=0, status:number|undefined, title="";
 try{
   const ip=await dns.lookup(host,{family:4}).then(x=>x.address).catch(()=>null);
   if(ip && isPrivateIPv4(ip)) throw new Error("Private network address");
   const response=await fetch(u.toString(),{method:"GET",redirect:"manual",headers:{"user-agent":"VeriqTrustChecker/1.0"},signal:AbortSignal.timeout(8000)});
   status=response.status;
   reachable=status>=200&&status<500;
   let current=response;
   let currentUrl=u.toString();
   for(let i=0;i<5&&current.status>=300&&current.status<400;i++){
     const location=current.headers.get("location"); if(!location)break;
     const next=new URL(location,currentUrl);
     if(next.protocol!=="http:"&&next.protocol!=="https:")break;
     const nextIp=await dns.lookup(next.hostname,{family:4}).then(x=>x.address).catch(()=>null);
     if(nextIp&&isPrivateIPv4(nextIp))throw new Error("Redirected to a private network address");
     redirectCount++; currentUrl=next.toString();
     current=await fetch(currentUrl,{method:"GET",redirect:"manual",headers:{"user-agent":"VeriqTrustChecker/1.0"},signal:AbortSignal.timeout(8000)});
   }
   finalUrl=currentUrl;
   const typeHeader=current.headers.get("content-type")||"";
   if(typeHeader.includes("text/html")){
     const text=(await current.text()).slice(0,300000);
     const match=text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
     title=match?.[1]?.replace(/\s+/g," ").trim().slice(0,140)||"";
     const forms=(text.match(/<form\b/gi)||[]).length;
     if(forms>0)signals.push({label:"Forms detected",detail:`${forms} form${forms===1?"":"s"} were found in the fetched page. Forms are normal, but sensitive forms should be verified before use.`,kind:"neutral",confidence:90});
   }
   if(redirectCount>0){score-=Math.min(12,redirectCount*4);signals.push({label:"Redirect chain detected",detail:`The server followed ${redirectCount} redirect${redirectCount===1?"":"s"} before reaching the final address.`,kind:redirectCount>=3?"warning":"neutral",confidence:96})}
   if(status>=200&&status<400){score+=5;signals.push({label:"Website reachable",detail:`The site responded successfully with HTTP ${status}.`,kind:"positive",confidence:99})}
   else if(status>=400){score-=8;signals.push({label:`HTTP ${status}`,detail:"The server returned an error response. This can be temporary and is not evidence of fraud by itself.",kind:"neutral",confidence:99})}
   if(finalUrl.startsWith("https://"))score+=3;
   if(new URL(finalUrl).hostname!==host){signals.push({label:"Final hostname differs",detail:`The request ended on ${new URL(finalUrl).hostname}, not the original hostname.`,kind:"warning",confidence:98});score-=8}
 }catch(e){
   limitations.push("The website could not be safely fetched from the analysis server.");
   signals.push({label:"Live page check unavailable",detail:e instanceof Error&&e.message.includes("private")?"The destination resolved to a private network address and was blocked.":"The site could not be fetched within the safety/time limits.",kind:"neutral",confidence:98});
 }
 if(title)signals.push({label:"Page title observed",detail:`The live page identifies itself as “${title}”. A title alone does not establish identity.`,kind:"neutral",confidence:92});
 limitations.push("Live threat-reputation feeds, WHOIS/domain-age intelligence and cryptographic provenance are not connected yet.");
 limitations.push("A reachable HTTPS website can still be fraudulent or unsafe.");
 const risk=score<40?"high":score<65?"medium":score>=75?"low":"unknown";
 const headline=risk==="high"?"Potentially suspicious":risk==="low"?"Likely lower risk":"Unable to fully verify";
 return{type:"url",subject:host,score:clamp(score),confidence:reachable?82:70,risk,headline,summary:reachable?`Veriq checked live URL-level signals and the site's response. This is a risk screen, not a guarantee of safety.`:"Veriq could not establish enough live evidence to make a strong trust conclusion.",signals,recommendation:risk==="high"?"Do not enter credentials or send money. Verify the organization through an independently obtained official channel.":risk==="low"?"No major URL-level warning was found, but verify important requests independently.":"Review the evidence before sharing credentials, money, or sensitive information.",limitations};
}

function isPrivateAddress(ip:string){
 if(isIP(ip)===4){const p=ip.split(".").map(Number);return p[0]===10||p[0]===127||p[0]===0||(p[0]===169&&p[1]===254)||(p[0]===192&&p[1]===168)||(p[0]===172&&p[1]>=16&&p[1]<=31)}
 const v=ip.toLowerCase();return v==="::1"||v==="::"||v.startsWith("fe80:")||v.startsWith("fc")||v.startsWith("fd")||v.startsWith("::ffff:127.")||v.startsWith("::ffff:10.")||v.startsWith("::ffff:192.168.")
}

function messageCheck(value:string):Analysis{
 const rules:[RegExp,string,string,number][]=[
 [/(urgent|immediately|act now|within \d+ (minutes?|hours?))/i,"Urgency pressure","The message pushes for immediate action.",-13],
 [/(otp|one[- ]time password|password|pin|verification code)/i,"Secret information request","The message asks for an authentication secret.",-25],
 [/(send|pay|transfer|deposit).{0,60}(₹|rs\.?|inr|money|payment)/i,"Payment pressure","The message appears to request money.",-23],
 [/(prize|winner|reward|lottery|bonus|free)/i,"Reward language","Reward language can occur in deceptive messages.",-13],
 [/https?:\/\/\S+/i,"Link present","A link is present; its destination needs independent verification.",-6]
 ];
 let score=82; const signals:Signal[]=[]; for(const [re,label,detail,delta] of rules)if(re.test(value)){score+=delta;signals.push({label,detail,kind:"warning",confidence:82})}
 if(!signals.length)signals.push({label:"No listed red flags found",detail:"This screen did not find the patterns in its current rule set. That is not proof the message is safe.",kind:"neutral",confidence:70});
 score=clamp(score); const risk=score<45?"high":score<70?"medium":"low";
 return{type:"message",subject:"Message analysis",score,confidence:78,risk,headline:risk==="high"?"Potential scam indicators detected":risk==="medium"?"Review before acting":"No major heuristic red flags detected",summary:"A transparent heuristic screen, not a definitive scam verdict.",signals,recommendation:risk==="high"?"Do not click links, share codes, or send money. Verify the sender using a contact method you obtained independently.":"Treat unexpected requests cautiously and verify important details independently.",limitations:["Heuristics can miss sophisticated deception and can flag legitimate messages.","Sender identity and link reputation are not independently verified in this MVP."]};
}

function claimCheck(value:string):Analysis{
 const absolute=/(always|never|100%|guaranteed|proven|cures|miracle)/i.test(value); const cited=/(doi|study|research|paper|source|according to)/i.test(value);
 let score=absolute?44:57;if(cited)score+=17;
 const signals:Signal[]=[{label:cited?"Source language detected":"No source cited",detail:cited?"The text references research or a source, but the source itself has not been checked.":"No obvious source is included in the supplied text.",kind:cited?"positive":"warning",confidence:88},{label:"Evidence still required",detail:absolute?"Absolute wording raises the evidence bar; check the original primary source.":"Compare the statement with relevant, independent evidence.",kind:"neutral",confidence:96}];
 return{type:"claim",subject:value.slice(0,90)+(value.length>90?"…":""),score:clamp(score),confidence:64,risk:score<50?"medium":"unknown",headline:"Evidence is not fully established",summary:"Veriq separates claim wording from claim truth and does not invent citations.",signals,recommendation:"Find the original source, check its date and methods, and compare it with independent evidence.",limitations:["Live web/source verification is not connected yet.","Mentioning a source is not the same as establishing evidence quality."]};
}