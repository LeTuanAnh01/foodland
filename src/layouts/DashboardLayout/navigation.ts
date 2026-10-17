import { ChartNoAxesCombined, ClipboardList, Home, Package, Settings, ShoppingCart, Users, Warehouse } from 'lucide-react';
export const navigation=[
 {to:'/dashboard',name:'Tổng quan',Icon:Home},
 {to:'/products',name:'Hàng hóa',Icon:Package},
 {to:'/inventory',name:'Kho',Icon:Warehouse},
 {to:'/purchases',name:'Mua hàng',Icon:ShoppingCart},
 {to:'/sales',name:'Bán hàng',Icon:ClipboardList},
 {to:'/partners',name:'Đối tác',Icon:Users},
 {to:'/reports',name:'Báo cáo',Icon:ChartNoAxesCombined},
 {to:'/settings',name:'Thiết lập',Icon:Settings},
];
