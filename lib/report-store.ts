import type {Analysis} from "./analyzer";
export type StoredReport=Analysis&{id:string;createdAt:string};
const KEY="veriq-reports-v1";
export function saveReport(a:Analysis):StoredReport{const r={...a,id:crypto.randomUUID(),createdAt:new Date().toISOString()};const all=getReports();localStorage.setItem(KEY,JSON.stringify([r,...all].slice(0,50)));return r}
export function getReports():StoredReport[]{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
export function getReport(id:string){return getReports().find(r=>r.id===id)}
export function deleteReports(){localStorage.removeItem(KEY)}