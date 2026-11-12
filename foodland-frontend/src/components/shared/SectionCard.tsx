import * as React from 'react';
import { Card } from '@/components/ui/card';
export function SectionCard({title,subtitle,children,right,className}:{title:string;subtitle?:string;children:React.ReactNode;right?:React.ReactNode;className?:string}){return <Card className={'overflow-hidden '+(className||'')}><div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3"><div><h2 className="text-[15px] font-bold">{title}</h2>{subtitle&&<p className="mt-1 text-[11px] text-[#8a998f]">{subtitle}</p>}</div>{right}</div>{children}</Card>}
