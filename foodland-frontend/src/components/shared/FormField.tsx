import * as React from 'react';
export function FormField({label,children}:{label:string;children:React.ReactNode}){return <label className="block min-w-0"><span className="form-label">{label}</span>{children}</label>}
