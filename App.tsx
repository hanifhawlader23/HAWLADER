

import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { EntriesManager } from './components/Entries';
import { InvoiceWorkbench } from './components/Invoicing';
import { DeliveredView } from './components/Delivered';
import { ProductCatalogManager } from './components/ProductCatalog';
import { ClientManager } from './components/ClientManager';
import { PrefacturadoView } from './components/PrefacturadoView';
import { InvoiceHistory } from './components/InvoiceHistory';
import { CompanyDetailsManager } from './components/CompanyDetails';
import { LoginScreen } from './components/LoginScreen';
import { UserManager } from './components/UserManager';
import { MenuIcon } from './components/ui';
import { FaltaView } from './components/FaltaView';
import { motion, AnimatePresence } from 'framer-motion';

// --- ICONS ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v-5H6.5A2.5 2.5 0 0 1 4 9.5v10z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>;
const FileCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>;
const DraftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;


const allNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon />, roles: ['admin', 'manager', 'user'] },
    { path: '/entries', label: 'Entries', icon: <ListIcon />, roles: ['admin', 'manager', 'user'] },
    { path: '/delivered', label: 'Delivered', icon: <TruckIcon />, roles: ['admin', 'manager', 'user'] },
    { path: '/falta', label: 'Pending Delivery', icon: <BoxIcon />, roles: ['admin', 'manager', 'user'] },
    { path: '/prefacturado', label: 'Prefacturado', icon: <FileCheckIcon />, roles: ['admin', 'manager', 'user'] },
    { path: '/invoice-workbench', label: 'Invoice Workbench', icon: <DraftIcon />, roles: ['admin'] },
    { path: '/invoice-history', label: 'Invoice History', icon: <HistoryIcon />, roles: ['admin'] },
    { path: '/catalog', label: 'Product Catalog', icon: <BookIcon />, roles: ['admin'] },
    { path: '/clients', label: 'Clients', icon: <UsersIcon />, roles: ['admin'] },
    { path: '/company', label: 'Company Details', icon: <BuildingIcon />, roles: ['admin'] },
    { path: '/users', label: 'User Management', icon: <UsersIcon />, roles: ['admin'] },
];

const MainLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { currentUser } = useData();
    const { logout } = useAuth();
    const location = useLocation();

    const getVisibleNavItems = (items: typeof allNavItems) => {
        const effectiveRole = currentUser?.role || 'user';
        return items.filter(item => item.roles.includes(effectiveRole));
    };

    return (
        <div className="flex h-screen bg-brand-bg font-sans text-brand-text-primary">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-brand-primary border-b border-brand-tertiary flex items-center justify-between px-4 z-40">
                <button onClick={() => setSidebarOpen(true)} className="text-brand-text-primary p-2">
                    <MenuIcon />
                </button>
                 <div className="text-xl font-bold">
                    <span className="text-brand-text-primary">HAWLA</span><span className="text-brand-accent">DER</span>
                </div>
                <div className="w-10" />
            </header>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)}></div>}
            
            {/* Sidebar */}
            <aside className={`fixed lg:static top-0 left-0 h-full w-60 bg-brand-primary text-brand-text-secondary flex flex-col shadow-2xl z-50 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="h-20 flex items-center justify-between px-4 text-2xl font-bold border-b border-brand-tertiary flex-shrink-0">
                    <div>
                        <span className="text-brand-text-primary">HAWLA</span><span className="text-brand-accent">DER</span>
                    </div>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {getVisibleNavItems(allNavItems).map(item => (
                         <NavLink 
                            key={item.path} 
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-brand-accent text-brand-text-on-accent shadow-md' : 'hover:bg-brand-secondary hover:text-brand-text-primary'}`}
                         >
                            {item.icon}
                            <span className="font-semibold flex-grow text-left">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-4 border-t border-brand-tertiary mt-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold text-lg">
                            {currentUser?.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-brand-text-primary">{currentUser?.fullName}</p>
                            <p className="text-xs">{currentUser?.email}</p>
                        </div>
                    </div>
                    
                    <button onClick={logout} className="w-full btn-3d bg-brand-secondary">
                        <LogoutIcon />
                        <span className="ml-2">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-4 lg:p-6 overflow-y-auto mt-14 lg:mt-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

const ProtectedRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center h-screen w-screen bg-brand-bg text-brand-accent">Loading Application...</div>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const { isAdmin } = useData();
    return isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

const App = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen w-screen bg-brand-bg text-brand-accent">Initializing...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginScreen />} />
            <Route path="/*" element={
                <ProtectedRoute>
                    <Routes>
                        <Route element={<MainLayout />}>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="entries" element={<EntriesManager />} />
                            <Route path="delivered" element={<DeliveredView />} />
                            <Route path="falta" element={<FaltaView />} />
                            <Route path="prefacturado" element={<PrefacturadoView />} />
                            
                            <Route path="invoice-workbench" element={<AdminRoute><InvoiceWorkbench /></AdminRoute>} />
                            <Route path="invoice-history" element={<AdminRoute><InvoiceHistory /></AdminRoute>} />
                            <Route path="catalog" element={<AdminRoute><ProductCatalogManager /></AdminRoute>} />
                            <Route path="clients" element={<AdminRoute><ClientManager /></AdminRoute>} />
                            <Route path="company" element={<AdminRoute><CompanyDetailsManager /></AdminRoute>} />
                            <Route path="users" element={<AdminRoute><UserManager /></AdminRoute>} />

                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Routes>
                </ProtectedRoute>
            }/>
        </Routes>
    );
};

export default App;