
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Button, Card, Badge, Modal, useToast, ConfirmationModal } from './ui';
import { STATUS_COLORS, CLIENT_COLORS } from '../constants';
import { Status, Entry, FaltaEntry, FilterState } from '../types';
import { DeliveryForm, EntryForm } from './Forms';
import { EntryDetailView } from './EntryDetailView';
import { FilterBar, filterEntriesByDate } from './FilterBar';
import { SelectableTable } from './SelectableTable';

const FaltaList: React.FC<{ entries: FaltaEntry[], onRowClick: (code: number) => void }> = ({ entries, onRowClick }) => {
    
    if (entries.length === 0) {
        return <Card><p className="text-center text-dark-text-secondary">No pending deliveries. Well done!</p></Card>;
    }

    const columns = [
        { header: 'Code', accessor: 'code' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4 font-medium text-dark-text-primary' },
        { header: 'Client', accessor: 'client' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
        { header: 'Description', accessor: (item: FaltaEntry) => item.items.map(i => i.description).join(', '), headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
        { header: 'Received', accessor: 'recibidaQuantity' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4 text-blue-400 font-semibold' },
        { header: 'Delivered', accessor: 'deliveredQuantity' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4 text-green-400 font-semibold' },
        { header: 'Remaining', accessor: 'remainingQuantity' as const, headerClassName: 'px-6 py-3', className: 'px-6 py-4 text-red-400 font-bold' },
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
    const { entries, deleteEntry, deleteMultipleEntries, isAdmin, clients, getFaltaEntries, getEntryByCode, updateEntryStatus, getCalculatedQuantities } = useData();
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
        // Client filter
        if (filters.clientId !== 'all') {
            const client = clients.find(c => c.id === filters.clientId);
            if (client) {
                tempEntries = tempEntries.filter(e => e.client === client.name);
            }
        }
        // Date filter
        return filterEntriesByDate(tempEntries, filters.dateRange, filters.startDate, filters.endDate);
    }, [entries, filters, clients]);

    const groupedEntries = useMemo(() => {
        return filteredBaseEntries.reduce((acc, entry) => {
            const status = entry.status;
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(entry);
            return acc;
        }, {} as Record<Status, Entry[]>);
    }, [filteredBaseEntries]);


    const filteredFaltaEntries = useMemo(() => {
        const faltaCodes = new Set(getFaltaEntries().map(e => e.code));
        return filteredBaseEntries.filter(e => faltaCodes.has(e.code))
            .map(e => ({...e, ...getCalculatedQuantities(e)}));
    }, [getFaltaEntries, filteredBaseEntries, getCalculatedQuantities]);

    const openDeliveryModal = (code: number) => {
        setSelectedEntryCode(code);
        setDeliveryModalOpen(true);
    };

    const openEditModal = (entry: Entry | null) => {
        setEditingEntry(entry);
        setEntryModalOpen(true);
    };

    const closeEntryModal = () => {
        setEditingEntry(null);
        setEntryModalOpen(false);
    };
    
    const handleDeleteMany = async (codes: (string|number)[]) => {
        await deleteMultipleEntries(codes as number[]);
        addToast(`${codes.length} entr${codes.length > 1 ? 'ies' : ''} deleted.`, 'success');
    };
    
    const handleDeleteSingle = (code: number) => {
        setDeleteTarget(code);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteSingle = () => {
        if (deleteTarget !== null) {
            deleteEntry(deleteTarget);
            addToast(`Entry #${deleteTarget} deleted.`, 'success');
            setDeleteConfirmOpen(false);
            setDeleteTarget(null);
        }
    };

    const columns: any[] = [
        { header: 'Code', accessor: 'code', headerClassName: 'px-4 py-3', className: 'px-4 py-4 font-medium text-dark-text-primary' },
        { header: 'Date', accessor: (item: Entry) => new Date(item.date).toLocaleDateString(), headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
        { header: 'Client', accessor: (item: Entry) => <Badge className={CLIENT_COLORS[item.client]}>{item.client}</Badge>, headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
        { header: 'Description', accessor: (item: Entry) => item.items.map(i => i.description).join(', '), headerClassName: 'px-4 py-3', className: 'px-4 py-4 text-dark-text-primary' },
        { header: 'Qty', accessor: (item: Entry) => getCalculatedQuantities(item).recibidaQuantity, headerClassName: 'px-4 py-3', className: 'px-4 py-4 font-semibold text-dark-text-primary' },
        { header: 'Input By', accessor: 'whoInput', headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
        { 
            header: 'Status', 
            accessor: (item: Entry) => isAdmin ? (
                <select 
                    value={item.status}
                    onChange={(e) => updateEntryStatus(item.code, e.target.value as Status)}
                    className="bg-transparent border-0 rounded p-1 text-xs text-dark-text-primary focus:outline-none focus:ring-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value={Status.Prefacturado}>{Status.Prefacturado}</option>
                    <option value={Status.Entregada}>{Status.Entregada}</option>
                    <option value={Status.Recibida} disabled>{Status.Recibida}</option>
                    <option value={Status.EnProceso} disabled>{Status.EnProceso}</option>
                </select>
            ) : <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>, 
            headerClassName: 'px-4 py-3', 
            className: 'px-4 py-4' 
        },
    ];
    
    if (isAdmin) {
        columns.push(
            { header: 'Total Value', accessor: (item: Entry) => `€${useData().getEntryFinancials(item).totalPrice.toFixed(2)}`, headerClassName: 'px-4 py-3 text-right', className: 'px-4 py-4 text-right font-semibold text-dark-text-primary' }
        );
    }
    
    columns.push({
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
    
    const orderedStatuses = [Status.Recibida, Status.EnProceso, Status.Entregada, Status.Prefacturado];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-dark-text-primary">Entries</h1>
                 <Button onClick={() => openEditModal(null)}>+ Add New Entry</Button>
            </div>
            
            <FilterBar 
              clients={clients} 
              onFilterChange={(f) => setFilters(prev => ({...prev, ...f}))}
            />

            <Card gradient>
              <h2 className="text-2xl font-bold text-dark-text-primary mb-4">Falta - Pending Deliveries</h2>
              <FaltaList entries={filteredFaltaEntries} onRowClick={(code) => setViewingEntry(getEntryByCode(code) || null)} />
            </Card>

            {orderedStatuses.map(status => {
                const entriesForStatus = groupedEntries[status] || [];
                if (entriesForStatus.length === 0) return null;

                return (
                    <Card key={status}>
                        <div className="flex justify-center items-baseline mb-4">
                           <Badge className={`${STATUS_COLORS[status]} text-lg`}>{status}</Badge>
                           <span className="ml-2 text-dark-text-secondary font-semibold">({entriesForStatus.length} entr{entriesForStatus.length > 1 ? 'ies' : 'y'})</span>
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
                )
            })}
            
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
