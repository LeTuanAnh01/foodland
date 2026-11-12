import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { Breadcrumbs } from './Breadcrumbs';
export function DashboardLayout(){return <div className="flex min-h-screen w-full min-w-0 bg-[#f6f8f6] text-[#162c21]">
 <Sidebar/>
 <div className="w-full min-w-0 flex-1">
  <Header/><MobileNavigation/>
  <main className="w-full min-w-0 max-w-none px-4 pb-16 pt-6 sm:px-5 md:px-7 lg:px-8 2xl:px-10"><Breadcrumbs/><Outlet/></main>
 </div>
 </div>;}
