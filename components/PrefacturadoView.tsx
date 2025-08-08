
import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Badge, Modal } from './ui';
import { Status, Entry, FilterState, Column } from '../types';
import { CLIENT_COLORS } from '../constants';
import { FilterBar, filterEntriesByDate } from './FilterBar';
import { EntryDetailView } from './EntryDetailView';
import { SelectableTable } from './SelectableTable';

export const PrefacturadoView: React.FC = () => {
    const { entries, getCalculatedQuantities, isAdmin, getEntryFinancials, clients } = useData();
    const [viewingEntry, setViewingEntry] = useState<Entry | null>(null);
    const [filters, setFilters] = useState<Omit<FilterState, 'status'>>({
        dateRange: 'all',
        clientId: 'all',
        startDate: '',
        endDate: '',
    });

    const prefacturadoEntries = useMemo(() => {
        const filteredByStatus = entries.filter(e => e.status === Status.Prefacturado);
        const filteredByClient = filteredByStatus.filter(e => {
            const client = clients.find(c => c.name === e.client);
            return filters.clientId === 'all' || client?.id === filters.clientId;
        });
        const finalFiltered = filterEntriesByDate(filteredByClient, filters.dateRange, filters.startDate, filters.endDate);

        return finalFiltered
            .map(entry => {
                const { recibidaQuantity } = getCalculatedQuantities(entry);
                const { averageUnitPrice, totalPrice } = getEntryFinancials(entry);
                return { ...entry, recibidaQuantity, unitPrice: averageUnitPrice, totalPrice };
            })
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [entries, filters, clients, getCalculatedQuantities, getEntryFinancials]);
    
    const columns: Column<typeof prefacturadoEntries[0]>[] = [
        { header: 'Code', accessor: 'code', headerClassName: 'px-4 py-3', className: 'px-4 py-4 font-medium text-dark-text-primary' },
        { header: 'Date', accessor: (item) => new Date(item.date).toLocaleDateString(), headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
        { header: 'Client', accessor: (item) => <Badge className={CLIENT_COLORS[item.client]}>{item.client}</Badge>, headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
        { header: 'Description', accessor: (item) => item.items.map(i => i.description).join(', '), headerClassName: 'px-4 py-3', className: 'px-4 py-4 text-dark-text-primary' },
        { header: 'Quantity', accessor: 'recibidaQuantity', headerClassName: 'px-4 py-3', className: 'px-4 py-4 font-semibold text-dark-text-primary' },
        { header: 'Input By', accessor: 'whoInput', headerClassName: 'px-4 py-3', className: 'px-4 py-4' },
    ];
    
    if (isAdmin) {
        columns.push(
            { header: 'Unit Price', accessor: (item) => `€${item.unitPrice.toFixed(2)}`, headerClassName: 'px-4 py-3 text-right', className: 'px-4 py-4 text-right' },
            { header: 'Total', accessor: (item) => `€${item.totalPrice.toFixed(2)}`, headerClassName: 'px-4 py-3 text-right', className: 'px-4 py-4 font-semibold text-dark-text-primary text-right' }
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-dark-text-primary">Prefacturado Orders</h1>
            </div>
            
            <FilterBar clients={clients} onFilterChange={setFilters} />
            
            <Card>
                <SelectableTable
                    data={prefacturadoEntries}
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
