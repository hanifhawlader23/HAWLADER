import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Select, Modal, Input, Badge, Button, ConfirmationModal } from './ui';
import { useToast } from '../context/ToastContext';
import { getClientColorClass, STATUS_COLORS } from '../constants';
import { Entry, FaltaEntry, FilterState, User } from '../types';
import { EntryDetailView } from './EntryDetailView';
import { FilterBar, filterEntriesByDate } from './FilterBar';
import { motion, Variants } from 'framer-motion';
import { WorkCalendar } from './Calendar/WorkCalendar';
import { DashboardCharts } from './Dashboard/Charts';

export const Dashboard = () => {
  const { entries, deliveries, getCalculatedQuantities, isAdmin, clients, getRevenueData, documents, users } = useData();
  const [filters, setFilters] = useState<Omit<FilterState, 'status'>>({
    dateRange: 'all',
    clientId: 'all',
    startDate: '',
    endDate: '',
  });
  const [modalData, setModalData] = useState<{ title: string; entries: (Entry | FaltaEntry)[] } | null>(null);
  const [viewingEntry, setViewingEntry] = useState<Entry | null>(null);
  
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
        const client = clients.find(c => c.name === e.client);
        const clientMatch = filters.clientId === 'all' || client?.id === filters.clientId;
        return clientMatch;
    });
  }, [entries, filters.clientId, clients]);

  const { finalFilteredEntries, filteredDeliveries } = useMemo(() => {
      const dateFiltered = filterEntriesByDate(filteredEntries, filters.dateRange, filters.startDate, filters.endDate);
      const filteredEntryCodes = new Set(dateFiltered.map(e => e.code));
      const deliveriesForFilteredEntries = deliveries.filter(d => filteredEntryCodes.has(d.code));

      return { 
        finalFilteredEntries: dateFiltered, 
        filteredDeliveries: deliveriesForFilteredEntries
      };
  }, [filteredEntries, deliveries, filters]);

  const dashboardStats = useMemo(() => {
    let totalReceived = 0;
    let totalDelivered = 0;
    finalFilteredEntries.forEach(entry => {
        const { recibidaQuantity, deliveredQuantity } = getCalculatedQuantities(entry);
        totalReceived += recibidaQuantity;
        totalDelivered += deliveredQuantity;
    });
    
    const totalRevenue = getRevenueData(finalFilteredEntries);
    
    return {
        totalEntries: finalFilteredEntries.length,
        totalReceived,
        totalDelivered,
        pendingUnits: totalReceived - totalDelivered,
        totalRevenue
    };
  }, [finalFilteredEntries, getCalculatedQuantities, getRevenueData]);
  

  const handleCardClick = (type: 'pending' | 'delivered' | 'received' | 'total' | 'revenue') => {
      let title = '';
      let entriesToShow: (Entry | FaltaEntry)[] = [];

      switch(type) {
        case 'pending':
          title = 'Pending Entries';
          entriesToShow = finalFilteredEntries
              .map(e => ({ ...e, ...getCalculatedQuantities(e) }))
              .filter(e => e.remainingQuantity > 0);
          break;
        case 'delivered':
          title = 'Delivered Entries';
          entriesToShow = finalFilteredEntries.filter(e => getCalculatedQuantities(e).deliveredQuantity > 0);
          break;
        case 'received':
        case 'total':
          title = 'Total Entries';
          entriesToShow = finalFilteredEntries;
          break;
        case 'revenue':
          title = 'Entries Contributing to Revenue';
          entriesToShow = finalFilteredEntries.filter(e => e.status === 'Entregada' || e.status === 'Prefacturado');
          break;
      }
      setModalData({ title: title, entries: entriesToShow });
  };
  
  const handleEntryRowClick = (entryCode: number) => {
    const entryDetails = entries.find(e => e.code === entryCode);
    if(entryDetails) {
        setViewingEntry(entryDetails);
    }
  }
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };


  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-text-primary">Dashboard</h1>
      </div>
      
      <FilterBar clients={clients} onFilterChange={setFilters} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-6"
      >
        <motion.div variants={itemVariants} className="text-left w-full h-full">
            <button className="w-full h-full" onClick={() => handleCardClick('total')}>
                <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-brand-text-secondary">Total Entries</h3><p className="text-3xl lg:text-4xl font-bold text-brand-accent">{dashboardStats.totalEntries}</p></Card>
            </button>
        </motion.div>
        <motion.div variants={itemVariants} className="text-left w-full h-full">
            <button className="w-full h-full" onClick={() => handleCardClick('received')}>
                <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-brand-text-secondary">Units Received</h3><p className="text-3xl lg:text-4xl font-bold text-brand-accent-hover">{dashboardStats.totalReceived}</p></Card>
            </button>
        </motion.div>
        <motion.div variants={itemVariants} className="text-left w-full h-full">
            <button className="w-full h-full" onClick={() => handleCardClick('delivered')}>
                <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-brand-text-secondary">Units Delivered</h3><p className="text-3xl lg:text-4xl font-bold text-green-600">{dashboardStats.totalDelivered}</p></Card>
            </button>
        </motion.div>
        <motion.div variants={itemVariants} className="text-left w-full h-full">
            <button className="w-full h-full" onClick={() => handleCardClick('pending')}>
                <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-brand-text-secondary">Pending Units</h3><p className="text-3xl lg:text-4xl font-bold text-red-600">{dashboardStats.pendingUnits}</p></Card>
            </button>
        </motion.div>
        {isAdmin && (
            <motion.div variants={itemVariants} className="text-left w-full h-full col-span-2 md:col-span-1">
                <button className="w-full h-full" onClick={() => handleCardClick('revenue')}>
                    <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-brand-text-secondary">Total Revenue</h3><p className="text-3xl lg:text-4xl font-bold text-green-600">€{dashboardStats.totalRevenue.toFixed(0)}</p></Card>
                </button>
            </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
              <Card>
                  <h3 className="text-xl font-semibold text-brand-text-primary mb-4">Work Calendar</h3>
                  <WorkCalendar entries={finalFilteredEntries} deliveries={filteredDeliveries} />
              </Card>
          </div>
          <div className="lg:col-span-2">
            <DashboardCharts entries={finalFilteredEntries} deliveries={filteredDeliveries} />
          </div>
      </div>


       <Modal isOpen={!!modalData} onClose={() => setModalData(null)} title={modalData?.title || ''} size="5xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-brand-text-secondary responsive-table">
              <thead className="text-xs text-brand-text-secondary uppercase bg-brand-secondary">
                <tr>
                  <th scope="col" className="px-6 py-3">Code</th>
                  <th scope="col" className="px-6 py-3">Client</th>
                  <th scope="col" className="px-6 py-3">Description</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {modalData?.entries.map((entry: Entry) => (
                  <tr key={entry.code} className="border-b border-brand-tertiary hover:bg-brand-secondary/80 cursor-pointer" onClick={() => handleEntryRowClick(entry.code)}>
                    <td data-label="Code" className="px-6 py-4 font-medium text-brand-text-primary">{entry.code}</td>
                    <td data-label="Client" className="px-6 py-4"><Badge className={getClientColorClass(entry.client, clients)}>{entry.client}</Badge></td>
                    <td data-label="Description" className="px-6 py-4">{entry.items.map(i => i.description).join(', ')}</td>
                    <td data-label="Status" className="px-6 py-4"><Badge className={STATUS_COLORS[entry.status]}>{entry.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>

        <Modal isOpen={!!viewingEntry} onClose={() => setViewingEntry(null)} title={`Details for Entry #${viewingEntry?.code}`} size="4xl">
            {viewingEntry && <EntryDetailView entry={viewingEntry} />}
        </Modal>

    </div>
  );
};