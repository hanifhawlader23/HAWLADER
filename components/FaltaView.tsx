



import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Badge, Modal } from './ui';
import { Status, Entry, FilterState, Column } from '../types';
import { getClientColorClass } from '../constants';
import { FilterBar, filterEntriesByDate } from './FilterBar';
import { EntryDetailView } from './EntryDetailView';
import { SelectableTable } from './SelectableTable';
import { ExportControls } from './ExportControls';

export const FaltaView: React.FC = () => {
    const { entries, getCalculatedQuantities, isAdmin, getEntryFinancials, clients } = useData();
    const [viewingEntry, setViewingEntry] = useState<Entry | null>(null);
    const [filters, setFilters] = useState<Omit<FilterState, 'status'>>({
        dateRange: 'all',
        clientId: 'all',
        startDate: '',
        endDate: '',
    });

    const faltaEntries = useMemo(() => {
        const filteredByStatus = entries.filter(e => e.status === Status.EnProceso);
        const filteredByClient = filteredByStatus.filter(e => {
            const client = clients.find(c => c.name === e.client);
            return filters.clientId === 'all' || client?.id === filters.clientId;
        });
        const finalFiltered = filterEntriesByDate(filteredByClient, filters.dateRange, filters.startDate, filters.endDate);

        return finalFiltered
            .map(entry => {
                const quantities = getCalculatedQuantities(entry);
                const { totalPrice } = getEntryFinancials(entry);
                return { ...entry, ...quantities, totalPrice };
            })
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [entries, filters, clients, getCalculatedQuantities, getEntryFinancials]);
    
    const columns: Column<typeof faltaEntries[0]>[] = [
        { header: 'Code', accessor: 'code', headerClassName: 'px-4 py-3', className: 'px-4 py-4 font-medium text-brand-text-primary' },
        { header: 'Date', accessor: (item) => new Date(item.date).toLocaleDateString(), headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
        { header: 'Client', accessor: (item) => <Badge className={getClientColorClass(item.client, clients)}>{item.client}</Badge>, headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
        { header: 'Description', accessor: (item) => item.items.map(i => i.description).join(', '), headerClassName: 'px-4 py-3', className: 'px-4 py-4 text-brand-text-primary' },
        { header: 'Received', accessor: 'recibidaQuantity', headerClassName: 'px-4 py-3 text-right', className: 'px-4 py-4 font-semibold text-blue-600 text-right' },
        { header: 'Delivered', accessor: 'deliveredQuantity', headerClassName: 'px-4 py-3 text-right', className: 'px-4 py-4 font-semibold text-green-600 text-right' },
        { header: 'Remaining', accessor: 'remainingQuantity', headerClassName: 'px-4 py-3 text-right', className: 'px-4 py-4 font-bold text-red-600 text-right' },
    ];
    
    if (isAdmin) {
      columns.push({ header: 'Total', accessor: (item) => `€${item.totalPrice.toFixed(2)}`, headerClassName: 'px-4 py-3 text-right', className: 'px-4 py-4 font-semibold text-brand-text-primary text-right' });
    }

    const exportColumns = [
        { title: 'Code', dataKey: 'code' as const },
        { title: 'Date', dataKey: (item: any) => new Date(item.date).toLocaleDateString() },
        { title: 'Client', dataKey: 'client' as const },
        { title: 'Description', dataKey: (item: any) => item.items.map(i => i.description).join(', ') },
        { title: 'Received', dataKey: 'recibidaQuantity' as const },
        { title: 'Delivered', dataKey: 'deliveredQuantity' as const },
        { title: 'Remaining', dataKey: 'remainingQuantity' as const },
        { title: 'Total (€)', dataKey: (item: any) => isAdmin ? item.totalPrice.toFixed(2) : 'N/A' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-text-primary">Falta de Entrega (In Process)</h1>
                <ExportControls data={faltaEntries} columns={exportColumns} fileName="falta_de_entrega" />
            </div>
            <FilterBar clients={clients} onFilterChange={setFilters} />
            <Card>
                <SelectableTable
                    data={faltaEntries}
                    columns={columns}
                    keyField="code"
                    onRowClick={(item) => setViewingEntry(item)}
                    canSelect={false}
                />
            </Card>
            
            <Modal isOpen={!!viewingEntry} onClose={() => setViewingEntry(null)} title={`Details for Entry #${viewingEntry?.code}`} size="4xl">
                {viewingEntry && <EntryDetailView entry={viewingEntry} />}
            </Modal>
        </div>
    );
};