import * as React from 'react';
import { Card } from '@/components/ui/card';
export function MetricCard({label,value,note,icon,tone='green'}:{label:string;value:string;note?:string;icon:React.ReactNode;tone?:'green'|'orange'|'blue'|'purple'}){
 const colors={green:'bg-emerald-50 text-emerald-700',orange:'bg-orange-50 text-orange-600',blue:'bg-blue-50 text-blue-600',purple:'bg-violet-50 text-violet-600'};
 return <Card className="relative min-h-[146px] p-[19px]"><span className={'mb-3 grid size-10 place-items-center rounded-xl '+colors[tone]}>{icon}</span><div className="text-[11px] text-[#83948a]">{label}</div><div className="mt-1 text-[23px] font-bold tracking-tight text-[#182e22]">{value}</div>{note&&<div className="mt-1 text-[10px] text-[#a1afa5]">{note}</div>}</Card>;
}
