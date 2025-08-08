
import React, { useState, useEffect } from 'react';
import { Select, Input } from './ui';
import { Client, Status, DateRangePreset, FilterState, Entry, Document } from '../types';

interface FilterBarProps {
  clients: Client[];
  onFilterChange: (filters: Omit<FilterState, 'status' | 'dateRange'> & { dateRange: DateRangePreset | 'custom' }) => void;
  showStatusFilter?: boolean;
  onStatusFilterChange?: (status: 'all' | Status) => void;
}

const dateRanges: { value: DateRangePreset; label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7', label: 'Last 7 Days' },
    { value: 'last15', label: 'Last 15 Days' },
    { value: 'last30', label: 'Last 30 Days' },
];

const checkDate = (dateStr: string, range: DateRangePreset | 'custom', startDate?: string, endDate?: string): boolean => {
    if (range === 'all') {
        return true;
    }

    const date = new Date(dateStr);

    if (range === 'custom') {
        if (!startDate && !endDate) {
            return true; // No custom dates provided, so don't filter.
        }
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        if (start && end) return date >= start && date <= end;
        if (start) return date >= start;
        if (end) return date <= end;
        return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
        case 'today':
            return date.setHours(0, 0, 0, 0) === today.getTime();
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return date.setHours(0, 0, 0, 0) === yesterday.getTime();
        case 'last7':
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6);
            return date >= sevenDaysAgo;
        case 'last15':
            const fifteenDaysAgo = new Date(today);
            fifteenDaysAgo.setDate(today.getDate() - 14);
            return date >= fifteenDaysAgo;
        case 'last30':
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 29);
            return date >= thirtyDaysAgo;
        default:
            return true;
    }
};


export const filterEntriesByDate = (entries: Entry[], range: DateRangePreset | 'custom', startDate?: string, endDate?: string) => {
    return entries.filter(e => checkDate(e.date, range, startDate, endDate));
};

export const filterDocumentsByDate = (documents: Document[], range: DateRangePreset | 'custom', startDate?: string, endDate?: string) => {
    return documents.filter(d => checkDate(d.date, range, startDate, endDate));
};


export const FilterBar: React.FC<FilterBarProps> = ({ clients, onFilterChange, showStatusFilter = false, onStatusFilterChange }) => {
    const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
    const [clientId, setClientId] = useState<string>('all');
    const [status, setStatus] = useState<'all' | Status>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    
    useEffect(() => {
        onFilterChange({ dateRange: isCustom ? 'custom' : datePreset, clientId, startDate, endDate });
        if (onStatusFilterChange) {
            onStatusFilterChange(status);
        }
    }, [datePreset, clientId, startDate, endDate, status, onFilterChange, onStatusFilterChange, isCustom]);

    const handleDateChipClick = (range: DateRangePreset) => {
        setIsCustom(false);
        setStartDate('');
        setEndDate('');
        setDatePreset(range);
    }
    
    const handleCustomClick = () => {
        setIsCustom(true);
        setDatePreset('all'); // Reset preset when custom is active
    }
    
    return (
        <div className="flex flex-wrap items-end gap-4 p-3 bg-dark-primary rounded-lg border border-dark-secondary">
            <div className="flex-1 min-w-[200px]">
                <Select label="Filter by Client" value={clientId} onChange={e => setClientId(e.target.value)}>
                    <option value="all">All Clients</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
            </div>
            
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-dark-text-secondary mb-1">Filter by Date</label>
                    <div className="flex items-center gap-1 p-1 bg-dark-secondary rounded-lg">
                        {dateRanges.map(r => (
                            <button key={r.value} onClick={() => handleDateChipClick(r.value)} data-active={!isCustom && datePreset === r.value} className="px-3 py-1 text-sm rounded-md transition-colors hover:bg-dark-tertiary data-[active=true]:bg-brand-accent data-[active=true]:text-white">
                                {r.label}
                            </button>
                        ))}
                         <button onClick={handleCustomClick} data-active={isCustom} className="px-3 py-1 text-sm rounded-md transition-colors hover:bg-dark-tertiary data-[active=true]:bg-brand-accent data-[active=true]:text-white">
                            Custom
                        </button>
                    </div>
                </div>
                {isCustom && (
                    <div className="flex gap-2 items-end">
                        <Input label="Start" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <Input label="End" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                )}
            </div>
            
            {showStatusFilter && onStatusFilterChange && (
                 <div className="flex-1 min-w-[200px]">
                    <Select label="Filter by Status" value={status} onChange={e => setStatus(e.target.value as 'all' | Status)}>
                        <option value="all">All Statuses</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
            )}
        </div>
    );
};
