import React, { useState, useEffect, useRef } from 'react';
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
    const [isDateFilterOpen, setDateFilterOpen] = useState(false);
    const dateFilterRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        onFilterChange({ dateRange: isCustom ? 'custom' : datePreset, clientId, startDate, endDate });
        if (onStatusFilterChange) {
            onStatusFilterChange(status);
        }
    }, [datePreset, clientId, startDate, endDate, status, onFilterChange, onStatusFilterChange, isCustom]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
                setDateFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDateChipClick = (range: DateRangePreset) => {
        setIsCustom(false);
        setStartDate('');
        setEndDate('');
        setDatePreset(range);
        setDateFilterOpen(false);
    }
    
    const handleCustomClick = () => {
        setIsCustom(true);
        setDatePreset('all'); // Reset preset when custom is active
    }
    
    const getActiveDateFilterLabel = () => {
        if (isCustom) {
            if (startDate && endDate) return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
            if (startDate) return `From ${new Date(startDate).toLocaleDateString()}`;
            if (endDate) return `Up to ${new Date(endDate).toLocaleDateString()}`;
            return 'Custom Range';
        }
        return dateRanges.find(r => r.value === datePreset)?.label || 'All Time';
    };

    return (
        <div className="flex flex-col lg:flex-row lg:flex-wrap items-stretch lg:items-end gap-4 p-3 bg-brand-primary rounded-lg border border-brand-tertiary">
            <div className="flex-grow min-w-[200px]">
                <Select label="Filter by Client" value={clientId} onChange={e => setClientId(e.target.value)}>
                    <option value="all">All Clients</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
            </div>
            
            <div className="relative flex-grow min-w-[200px]" ref={dateFilterRef}>
                <label className="block text-sm font-medium text-brand-text-secondary mb-1">Filter by Date</label>
                <button
                    type="button"
                    onClick={() => setDateFilterOpen(prev => !prev)}
                    className="w-full text-left px-3 py-2 sm:text-sm rounded-lg border-2 border-brand-tertiary/50 bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary text-brand-text-primary font-semibold shadow-lg hover:border-brand-accent/70 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-all flex justify-between items-center"
                >
                    <span>{getActiveDateFilterLabel()}</span>
                    <svg className="w-5 h-5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isDateFilterOpen && (
                    <div className="absolute top-full mt-2 w-full min-w-[280px] bg-brand-primary shadow-2xl rounded-lg border border-brand-tertiary z-20 p-4 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                           {dateRanges.map(r => (
                                <button key={r.value} onClick={() => handleDateChipClick(r.value)} data-active={!isCustom && datePreset === r.value} className="px-3 py-1 text-sm rounded-md transition-colors hover:bg-brand-tertiary data-[active=true]:bg-brand-accent data-[active=true]:text-brand-text-on-accent">
                                    {r.label}
                                </button>
                            ))}
                             <button onClick={handleCustomClick} data-active={isCustom} className="px-3 py-1 text-sm rounded-md transition-colors hover:bg-brand-tertiary data-[active=true]:bg-brand-accent data-[active=true]:text-brand-text-on-accent">
                                Custom
                            </button>
                        </div>

                        {isCustom && (
                            <div className="flex flex-col gap-2 pt-2 border-t border-brand-tertiary">
                                <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {showStatusFilter && onStatusFilterChange && (
                 <div className="flex-grow min-w-[200px]">
                    <Select label="Filter by Status" value={status} onChange={e => setStatus(e.target.value as 'all' | Status)}>
                        <option value="all">All Statuses</option>
                        {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
            )}
        </div>
    );
};