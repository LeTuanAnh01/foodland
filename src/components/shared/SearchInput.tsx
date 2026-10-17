import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchInputProps = {value:string; onChange:(value:string)=>void; placeholder:string; className?:string};
export function SearchInput({value,onChange,placeholder,className}:SearchInputProps) {
 return <div className={cn('relative w-full max-w-[390px]',className)}>
  <Search size={15} className="absolute left-3 top-2.5 text-[#93a397]" aria-hidden="true" />
  <Input aria-label={placeholder} className="pl-9" value={value} onChange={event=>onChange(event.target.value)} placeholder={placeholder}/>
 </div>;
}
