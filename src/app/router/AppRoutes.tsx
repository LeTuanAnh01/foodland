import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout/DashboardLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { InventoryPage } from '@/features/inventory/pages/InventoryPage';
import { PurchasesPage } from '@/features/purchases/pages/PurchasesPage';
import { SalesPage } from '@/features/sales/pages/SalesPage';
import { PartnersPage } from '@/features/partners/pages/PartnersPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
export function AppRoutes(){return <Routes><Route element={<DashboardLayout/>}>
 <Route index element={<Navigate to="/dashboard" replace/>}/>
 <Route path="dashboard" element={<DashboardPage/>}/>
 <Route path="products" element={<ProductsPage/>}/>
 <Route path="inventory" element={<InventoryPage/>}/>
 <Route path="purchases" element={<PurchasesPage/>}/>
 <Route path="sales" element={<SalesPage/>}/>
 <Route path="partners" element={<PartnersPage/>}/>
 <Route path="reports" element={<ReportsPage/>}/>
 <Route path="settings" element={<SettingsPage/>}/>
 <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
 </Route></Routes>}
