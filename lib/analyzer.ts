export type CheckType="url"|"message"|"claim";
export type Signal={label:string;detail:string;kind:"positive"|"warning"|"neutral";confidence:number};
export type Analysis={type:CheckType;subject:string;score:number;confidence:number;risk:"low"|"medium"|"high"|"unknown";headline:string;summary:string;signals:Signal[];recommendation:string;limitations:string[]};
const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));
export function analyze(type:CheckType,input:string):Analysis{
 const value=input.trim(); if(!value) throw new Error("Input is required.");
 if(type==="url") return urlCheck(value);
 if(type==="message") return messageCheck(value);
 return claimCheck(value);
}
function urlCheck(value:string):Analysis{
 let u:URL; try{u=new URL(value.startsWith("http")?value:"https://"+value)}catch{throw new Error("Enter a valid URL.")};
 const host=u.hostname.toLowerCase(); let score=58; const signals:Signal[]=[];
 if(u.protocol==="https:"){score+=16;signals.push({label:"HTTPS enabled",detail:"The connection is encrypted, but encryption alone does not establish legitimacy.",kind:"positive",confidence:99})}
 else{score-=20;signals.push({label:"No HTTPS",detail:"The supplied address does not use an encrypted connection.",kind:"warning",confidence:99})}
 if(/xn--|(?:login|verify|secure|support|wallet|bonus|claim)/i.test(host)){score-=18;signals.push({label:"Domain pattern needs review",detail:"The hostname contains patterns that can appear in deceptive flows.",kind:"warning",confidence:64})}
 if(u.username||u.password){score-=18;signals.push({label:"Unusual URL structure",detail:"The address contains user information before the hostname.",kind:"warning",confidence:94})}
 signals.push({label:"Live reputation",detail:"External registration and threat feeds are not connected in this MVP.",kind:"neutral",confidence:100});
 score=clamp(score); const risk=score<40?"high":score<65?"medium":score>=75?"low":"unknown";
 return{type:"url",subject:host,score,confidence:72,risk,headline:risk==="high"?"Potentially suspicious":risk==="low"?"Likely lower risk":"Unable to fully verify",summary:"This result uses URL-level signals available locally. It is not a guarantee of safety.",signals,recommendation:risk==="high"?"Do not share sensitive information. Verify the organization through an independently obtained official channel.":"Review the evidence before sharing credentials, money, or sensitive information.",limitations:["Live reputation and domain-age intelligence are not connected yet.","HTTPS proves connection encryption, not site legitimacy."]};
}
function messageCheck(value:string):Analysis{
 const rules:[RegExp,string,string,number][]=[
 [/\b(urgent|immediately|act now|within \d+ (minutes?|hours?))\b/i,"Urgency pressure","The message pushes for immediate action.",-13],
 [/\b(otp|one[- ]time password|password|pin|verification code)\b/i,"Secret information request","The message asks for an authentication secret.",-25],
 [/\b(send|pay|transfer|deposit)\b.{0,60}\b(₹|rs\.?|inr|money|payment)\b/i,"Payment pressure","The message appears to request money.",-23],
 [/\b(prize|winner|reward|lottery|bonus|free)\b/i,"Reward language","Reward language can occur in deceptive messages.",-13],
 [/https?:\/\/\S+/i,"Link present","A link is present; its destination needs independent verification.",-6]
 ];
 let score=82; const signals:Signal[]=[]; for(const [re,label,detail,delta] of rules){if(re.test(value)){score+=delta;signals.push({label,detail,kind:"warning",confidence:82})}}
 if(!signals.length)signals.push({label:"No listed red flags found",detail:"This screen did not find the patterns in its current rule set. That is not proof the message is safe.",kind:"neutral",confidence:70});
 score=clamp(score); const risk=score<45?"high":score<70?"medium":"low";
 return{type:"message",subject:"Message analysis",score,confidence:78,risk,headline:risk==="high"?"Potential scam indicators detected":risk==="medium"?"Review before acting":"No major heuristic red flags detected",summary:"A transparent heuristic screen, not a definitive scam verdict.",signals,recommendation:risk==="high"?"Do not click links, share codes, or send money. Verify the sender using a contact method you obtained independently.":"Treat unexpected requests cautiously and verify important details independently.",limitations:["Heuristics can miss sophisticated deception and can flag legitimate messages.","Sender identity and link reputation are not independently verified in this MVP."]};
}
function claimCheck(value:string):Analysis{
 const absolute=/\b(always|never|100%|guaranteed|proven|cures|miracle)\b/i.test(value);
 const cited=/\b(doi|study|research|paper|source|according to)\b/i.test(value);
 let score=absolute?44:57; if(cited)score+=17;
 const signals:Signal[]=[
 {label:cited?"Source language detected":"No source cited",detail:cited?"The text references research or a source, but the source itself has not been checked.":"No obvious source is included in the supplied text.",kind:cited?"positive":"warning",confidence:88},
 {label:"Evidence still required",detail:absolute?"Absolute wording raises the evidence bar; check the original primary source.":"Compare the statement with relevant, independent evidence.",kind:"neutral",confidence:96}
 ];
 return{type:"claim",subject:value.slice(0,90)+(value.length>90?"…":""),score:clamp(score),confidence:64,risk:score<50?"medium":"unknown",headline:"Evidence is not fully established",summary:"Veriq separates claim wording from claim truth and does not invent citations.",signals,recommendation:"Find the original source, check its date and methods, and compare it with independent evidence.",limitations:["Live web/source verification is not connected yet.","Mentioning a source is not the same as establishing evidence quality."]};
}