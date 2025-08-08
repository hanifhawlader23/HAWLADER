
import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
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
import { Button } from './components/ui';
import { FaltaView } from './components/FaltaView';
import { ToastProvider } from './components/ui';


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
const FingerprintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-fingerprint"><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 8 12.5a4.4 4.4 0 0 1 4-2.5c2.2 0 4.2 1.4 5 3.5"/><path d="M12 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1-.9-2-2-2Z"/><path d="M22 12c0 6-4 10-10 10S2 18 2 12"/><path d="M9 12a3 3 0 0 1 6 0c0 1.7-1.3 3-3 3s-3-1.3-3-3Z"/></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;

type View = 'dashboard' | 'entries' | 'delivered' | 'prefacturado' | 'invoiceWorkbench' | 'invoiceHistory' | 'catalog' | 'clients' | 'company' | 'users' | 'falta';

const AppContent = () => {
    const [view, setView] = useState<View>('dashboard');
    const { isAdmin, currentUser, logout, registerBiometrics, simulatedRole, setSimulatedRole } = useData();

    if (!currentUser) {
        return <LoginScreen />;
    }
    
    const handleViewAs = () => {
        if (currentUser.role !== 'admin') return;
        if (simulatedRole === null) setSimulatedRole('manager');
        else if (simulatedRole === 'manager') setSimulatedRole('user');
        else if (simulatedRole === 'user') setSimulatedRole(null);
    };

    const getViewAsText = () => {
        if (simulatedRole === 'manager') return "Viewing as: Manager";
        if (simulatedRole === 'user') return "Viewing as: User";
        return "Viewing as: Admin";
    };

    const renderView = () => {
        switch (view) {
            case 'dashboard': return <Dashboard />;
            case 'entries': return <EntriesManager />;
            case 'delivered': return <DeliveredView />;
            case 'prefacturado': return <PrefacturadoView />;
            case 'falta': return <FaltaView />;
            case 'invoiceWorkbench': return isAdmin ? <InvoiceWorkbench /> : null;
            case 'invoiceHistory': return isAdmin ? <InvoiceHistory /> : null;
            case 'catalog': return isAdmin ? <ProductCatalogManager /> : null;
            case 'clients': return isAdmin ? <ClientManager /> : null;
            case 'company': return isAdmin ? <CompanyDetailsManager /> : null;
            case 'users': return isAdmin ? <UserManager /> : null;
            default: return <Dashboard />;
        }
    };
    
    const allNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon />, roles: ['admin', 'manager', 'user'] },
        { id: 'entries', label: 'Entries', icon: <ListIcon />, roles: ['admin', 'manager', 'user'] },
        { id: 'delivered', label: 'Delivered', icon: <TruckIcon />, roles: ['admin', 'manager', 'user'] },
        { id: 'falta', label: 'Falta de Entrega', icon: <BoxIcon />, roles: ['admin', 'manager', 'user'] },
        { id: 'prefacturado', label: 'Prefacturado', icon: <FileCheckIcon />, roles: ['admin', 'manager', 'user'] },
        { id: 'invoiceWorkbench', label: 'Invoice Workbench', icon: <DraftIcon />, roles: ['admin'] },
        { id: 'invoiceHistory', label: 'Invoice History', icon: <HistoryIcon />, roles: ['admin'] },
        { id: 'catalog', label: 'Product Catalog', icon: <BookIcon />, roles: ['admin'] },
        { id: 'clients', label: 'Clients', icon: <UsersIcon />, roles: ['admin'] },
        { id: 'company', label: 'Company Details', icon: <BuildingIcon />, roles: ['admin'] },
        { id: 'users', label: 'User Management', icon: <UsersIcon />, roles: ['admin'] },
    ];
    
    const getVisibleNavItems = (items: typeof allNavItems) => {
      const effectiveRole = simulatedRole || currentUser.role;
      return items.filter(item => item.roles.includes(effectiveRole));
    }

    return (
        <div className="flex h-screen bg-brand-bg font-sans text-dark-text-primary">
            <aside className="w-64 bg-brand-primary text-slate-300 flex flex-col shadow-2xl">
                <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-dark-secondary">
                    <span className="text-white">HAWLA</span><span className="text-brand-accent">DER</span>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {getVisibleNavItems(allNavItems).map(item => (
                         <button key={item.id} onClick={() => setView(item.id as View)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${view === item.id ? 'bg-brand-accent text-white shadow-md' : 'hover:bg-dark-tertiary hover:text-white'}`}>
                            {item.icon}
                            <span className="font-semibold">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-dark-secondary space-y-2">
                    {currentUser.role === 'admin' && (
                         <Button variant="secondary" size="sm" className="w-full" onClick={handleViewAs}>
                            <EyeIcon /> <span className="ml-2">{getViewAsText()}</span>
                        </Button>
                    )}
                    <div className="text-center text-sm text-dark-text-secondary">
                        Logged in as: <span className="font-bold text-dark-text-primary">{currentUser.fullName}</span> ({simulatedRole ? `simulating ${simulatedRole}` : currentUser.role})
                    </div>
                    {!currentUser.webAuthnCredentialId && (
                        <Button variant="secondary" size="sm" className="w-full" onClick={registerBiometrics}>
                            <FingerprintIcon /> <span className="ml-2">Register Biometrics</span>
                        </Button>
                    )}
                    <button onClick={logout} className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-red-800/50 hover:bg-red-700/80 text-white">
                        <LogoutIcon />
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </aside>
            
            <main className="flex-1 p-8 overflow-y-auto bg-brand-bg">
                {renderView()}
            </main>
        </div>
    );
};

function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </DataProvider>
  );
}

export default App;
