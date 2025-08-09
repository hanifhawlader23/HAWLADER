
import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Button, Card, Badge, Modal, ConfirmationModal } from './ui';
import { useToast } from '../context/ToastContext';
import { STATUS_COLORS, getClientColorClass } from '../constants';
import { Status, Entry, FaltaEntry, FilterState } from '../types';
import { DeliveryForm, EntryForm } from './Forms';
import { EntryDetailView } from './EntryDetailView';
import { FilterBar, filterEntriesByDate } from './FilterBar';
import { SelectableTable } from './SelectableTable';
import { ExportControls } from './ExportControls';
import { motion } from 'framer-motion';

const FaltaList: React.FC<{ entries: FaltaEntry[], onRowClick: (code: number) => void }> = ({ entries, onRowClick }) => {
    
    if (entries.length === 0) {
        return <Card><p className="text-center text-brand-text-secondary">No pending deliveries. Well done!</p></Card>;
    }

    const columns = [
        { header: 'Code', accessor: 'code' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4 font-medium text-brand-text-primary' },
        { header: 'Client', accessor: 'client' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
        { header: 'Description', accessor: (item: FaltaEntry) => item.items.map(i => i.description).join(', '), headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
        { header: 'Received', accessor: 'recibidaQuantity' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4 text-blue-600 font-semibold' },
        { header: 'Delivered', accessor: 'deliveredQuantity' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4 text-green-600 font-semibold' },
        { header: 'Remaining', accessor: 'remainingQuantity' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4 text-red-600 font-bold' },
    ];

    return (
         <SelectableTable 
            data={entries}
            columns={columns}
            keyField="code"
            onRowClick={(item) => onRowClick(item.code)}
            canSelect={false}
         />
    );
};

export const EntriesManager = () => {
    const { entries, deleteEntry, deleteMultipleEntries, isAdmin, clients, getFaltaEntries, getEntryByCode, updateEntryStatus, getCalculatedQuantities, getEntryFinancials } = useData();
    const [isEntryModalOpen, setEntryModalOpen] = useState(false);
    const [isDeliveryModalOpen, setDeliveryModalOpen] = useState(false);
    const [selectedEntryCode, setSelectedEntryCode] = useState<number | null>(null);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [viewingEntry, setViewingEntry] = useState<Entry | null>(null);
    const { addToast } = useToast();
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    
    const [filters, setFilters] = useState<Omit<FilterState, 'status'>>({
        dateRange: 'all',
        clientId: 'all',
        startDate: '',
        endDate: '',
    });

    const filteredBaseEntries = useMemo(() => {
        let tempEntries = [...entries];
        if (filters.clientId !== 'all') {
            const client = clients.find(c => c.id === filters.clientId);
            if (client) {
                tempEntries = tempEntries.filter(e => e.client === client.name);
            }
        }
        return filterEntriesByDate(tempEntries, filters.dateRange, filters.startDate, filters.endDate);
    }, [entries, filters, clients]);

    const orderedStatuses = [Status.Recibida, Status.EnProceso, Status.Entregada, Status.Prefacturado];

    const processedGroupedEntries = useMemo(() => {
        const initialGroups: Record<Status, any[]> = {
            [Status.Recibida]: [],
            [Status.EnProceso]: [],
            [Status.Entregada]: [],
            [Status.Prefacturado]: [],
        };

        return filteredBaseEntries.reduce((acc, entry) => {
            const processedEntry = {
                ...entry,
                recibidaQuantity: getCalculatedQuantities(entry).recibidaQuantity,
                totalPrice: getEntryFinancials(entry).totalPrice,
            };
            if (acc[entry.status]) {
                acc[entry.status].push(processedEntry);
            }
            return acc;
        }, initialGroups);
    }, [filteredBaseEntries, getCalculatedQuantities, getEntryFinancials]);
    
    const allVisibleEntries = useMemo(() => {
        return orderedStatuses.flatMap(status => processedGroupedEntries[status] || []);
    }, [processedGroupedEntries]);


    const filteredFaltaEntries = useMemo(() => {
        const faltaCodes = new Set(getFaltaEntries().map(e => e.code));
        return filteredBaseEntries.filter(e => faltaCodes.has(e.code))
            .map(e => ({...e, ...getCalculatedQuantities(e)}));
    }, [getFaltaEntries, filteredBaseEntries, getCalculatedQuantities]);

    const openDeliveryModal = useCallback((code: number) => {
        setSelectedEntryCode(code);
        setDeliveryModalOpen(true);
    }, []);

    const openEditModal = useCallback((entry: Entry | null) => {
        setEditingEntry(entry);
        setEntryModalOpen(true);
    }, []);

    const closeEntryModal = useCallback(() => {
        setEditingEntry(null);
        setEntryModalOpen(false);
    }, []);
    
    const handleDeleteMany = useCallback(async (codes: (string|number)[]) => {
        await deleteMultipleEntries(codes as number[]);
        addToast(`${codes.length} ${codes.length === 1 ? 'entry' : 'entries'} deleted.`, 'success');
    }, [deleteMultipleEntries, addToast]);
    
    const handleDeleteSingle = useCallback((code: number) => {
        setDeleteTarget(code);
        setDeleteConfirmOpen(true);
    }, []);

    const confirmDeleteSingle = useCallback(() => {
        if (deleteTarget !== null) {
            deleteEntry(deleteTarget);
            addToast(`Entry #${deleteTarget} deleted.`, 'success');
            setDeleteConfirmOpen(false);
            setDeleteTarget(null);
        }
    }, [deleteTarget, deleteEntry, addToast]);

    const columns = useMemo(() => {
        const baseColumns: any[] = [
            { header: 'Code', accessor: 'code', headerClassName: 'px-4 py-3', className: 'px-4 py-4 font-medium text-brand-text-primary' },
            { header: 'Date', accessor: (item: Entry) => new Date(item.date).toLocaleDateString(), headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
            { header: 'Client', accessor: (item: Entry) => <Badge className={getClientColorClass(item.client, clients)}>{item.client}</Badge>, headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
            { header: 'Description', accessor: (item: Entry) => item.items.map(i => i.description).join(', '), headerClassName: 'px-4 py-3', className: 'px-4 py-4 text-brand-text-primary' },
            { header: 'Qty', accessor: 'recibidaQuantity', headerClassName: 'px-4 py-3', className: 'px-4 py-4 font-semibold text-brand-text-primary' },
            { header: 'Input By', accessor: 'whoInput', headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
            { 
                header: 'Status', 
                accessor: (item: Entry) => {
                    if (!isAdmin) return <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>;
                    const optionClass = "bg-white text-black";
                    return (
                        <div className="relative w-full min-w-[120px]">
                            <select
                                value={item.status}
                                onChange={(e) => updateEntryStatus(item.code, e.target.value as Status)}
                                className={`appearance-none w-full text-center px-2 py-1.5 text-xs font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-primary focus:ring-brand-accent transition-colors ${STATUS_COLORS[item.status]}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <option className={optionClass} value={Status.Prefacturado}>{Status.Prefacturado}</option>
                                <option className={optionClass} value={Status.Entregada}>{Status.Entregada}</option>
                                <option className={optionClass} value={Status.Recibida} disabled>{Status.Recibida}</option>
                                <option className={optionClass} value={Status.EnProceso} disabled>{Status.EnProceso}</option>
                            </select>
                            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${item.status === Status.EnProceso ? 'text-deep-rose' : 'text-white'}`}>
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    );
                },
                headerClassName: 'px-4 py-3', 
                className: 'px-4 py-4' 
            },
        ];
        
        if (isAdmin) {
            baseColumns.push(
                { header: 'Total Value', accessor: (item: any) => `€${item.totalPrice.toFixed(2)}`, headerClassName: 'px-4 py-3 text-right', className: 'px-4 py-4 text-right font-semibold text-brand-text-primary' }
            );
        }
        
        baseColumns.push({
            header: 'Actions',
            accessor: (item: Entry) => (
                <div className="space-x-2 text-center flex justify-center items-center">
                    {isAdmin && <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); openEditModal(item);}}>Edit</Button>}
                    {item.status !== Status.Entregada && <Button size="sm" onClick={(e) => { e.stopPropagation(); openDeliveryModal(item.code);}}>Add Delivery</Button>}
                    {isAdmin && <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteSingle(item.code); }}>Delete</Button>}
                </div>
            ),
            headerClassName: 'px-4 py-3 text-center',
            className: 'px-4 py-4'
        });

        return baseColumns;
    }, [isAdmin, clients, openEditModal, openDeliveryModal, handleDeleteSingle, updateEntryStatus]);
    
    const exportColumns = useMemo(() => [
      { title: 'Code', dataKey: 'code' as const },
      { title: 'Date', dataKey: (item: any) => new Date(item.date).toLocaleDateString() },
      { title: 'Client', dataKey: 'client' as const },
      { title: 'Description', dataKey: (item: any) => item.items.map(i => i.description).join(', ') },
      { title: 'Quantity', dataKey: 'recibidaQuantity' as const },
      { title: 'Input By', dataKey: 'whoInput' as const },
      { title: 'Status', dataKey: 'status' as const },
      { title: 'Total Value (€)', dataKey: (item: any) => item.totalPrice.toFixed(2) },
    ], []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-text-primary">Entries</h1>
                 <div className="flex items-center gap-2">
                    <ExportControls data={allVisibleEntries} columns={exportColumns} fileName="entries_report" />
                    <Button onClick={() => openEditModal(null)}>+ Add New Entry</Button>
                 </div>
            </div>
            
            <FilterBar 
              clients={clients} 
              onFilterChange={(f) => setFilters(prev => ({...prev, ...f}))}
            />

            <motion.div variants={itemVariants}>
                <Card gradient>
                <h2 className="text-2xl font-bold text-brand-text-primary mb-4">Falta - Pending Deliveries</h2>
                <FaltaList entries={filteredFaltaEntries} onRowClick={(code) => setViewingEntry(getEntryByCode(code) || null)} />
                </Card>
            </motion.div>
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
            {orderedStatuses.map(status => {
                const entriesForStatus = processedGroupedEntries[status] || [];
                if (entriesForStatus.length === 0) return null;

                return (
                    <motion.div key={status} variants={itemVariants}>
                        <Card>
                            <div className="flex justify-center items-baseline mb-4">
                            <Badge className={`${STATUS_COLORS[status]} text-lg`}>{status}</Badge>
                            <span className="ml-2 text-brand-text-secondary font-semibold">({entriesForStatus.length} entr{entriesForStatus.length > 1 ? 'ies' : ''}y)</span>
                            </div>
                            <SelectableTable 
                                data={entriesForStatus}
                                columns={columns}
                                keyField="code"
                                onRowClick={(item) => setViewingEntry(item)}
                                onDeleteMany={isAdmin ? handleDeleteMany : undefined}
                                canSelect={isAdmin}
                            />
                        </Card>
                    </motion.div>
                )
            })}
            </motion.div>
            
            <Modal isOpen={isEntryModalOpen} onClose={closeEntryModal} title={editingEntry ? `Edit Entry #${editingEntry.code}` : "Create New Entry"} size="5xl">
                <EntryForm onClose={closeEntryModal} entryToEdit={editingEntry} />
            </Modal>
            
            <Modal isOpen={isDeliveryModalOpen} onClose={() => setDeliveryModalOpen(false)} title="Add New Delivery" size="5xl">
                <DeliveryForm onClose={() => setDeliveryModalOpen(false)} entryCode={selectedEntryCode} />
            </Modal>
            
            <Modal isOpen={!!viewingEntry} onClose={() => setViewingEntry(null)} title={`Details for Entry #${viewingEntry?.code}`} size="4xl">
                {viewingEntry && <EntryDetailView entry={viewingEntry} />}
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDeleteSingle}
                title="Confirm Deletion"
                message={`Are you sure you want to permanently delete this entry? This action cannot be undone.`}
                confirmationWord="DELETE"
            />
        </div>
    );
}