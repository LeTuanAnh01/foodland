import * as React from 'react';
export function TableScroll({children}: {children:React.ReactNode}) {
 return <div className="w-full min-w-0 overflow-x-auto">{children}</div>;
}
