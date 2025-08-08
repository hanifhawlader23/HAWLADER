
import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList, AreaChart, Area } from 'recharts';
import { useData } from '../context/DataContext';
import { Card, Select, Modal, Input, Badge } from './ui';
import { CHART_COLORS, CLIENT_COLORS, STATUS_COLORS } from '../constants';
import { Entry, FaltaEntry, FilterState } from '../types';
import { EntryDetailView } from './EntryDetailView';
import { FilterBar, filterDocumentsByDate, filterEntriesByDate } from './FilterBar';
import { EventCalendar } from './EventCalendar';

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 p-2 border border-slate-700 rounded shadow-lg">
        <p className="label font-semibold text-slate-100">{label}</p>
        <p className="intro text-amber-400">{`${payload[0].name}: ${formatter ? formatter(payload[0].value) : payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-sm">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const Dashboard = () => {
  const { entries, deliveries, getCalculatedQuantities, isAdmin, clients, getRevenueData, documents, productCatalog } = useData();
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

  const { finalFilteredEntries, dateFilteredDocuments, filteredDeliveries } = useMemo(() => {
      const dateFiltered = filterEntriesByDate(filteredEntries, filters.dateRange, filters.startDate, filters.endDate);
      const dateFilteredDocs = filterDocumentsByDate(documents, filters.dateRange, filters.startDate, filters.endDate);
      const filteredEntryCodes = new Set(dateFiltered.map(e => e.code));
      const deliveriesForFilteredEntries = deliveries.filter(d => filteredEntryCodes.has(d.code));

      return { 
        finalFilteredEntries: dateFiltered, 
        dateFilteredDocuments: dateFilteredDocs,
        filteredDeliveries: deliveriesForFilteredEntries
      };
  }, [filteredEntries, documents, deliveries, filters]);

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
  
  const clientChartData = useMemo(() => {
    const dataByClient = clients.map(client => {
        const clientEntries = finalFilteredEntries.filter(e => e.client === client.name);
        const { pendingUnits, totalDelivered } = clientEntries.reduce((acc, entry) => {
            const { remainingQuantity, deliveredQuantity } = getCalculatedQuantities(entry);
            acc.pendingUnits += remainingQuantity;
            acc.totalDelivered += deliveredQuantity;
            return acc;
        }, {pendingUnits: 0, totalDelivered: 0});
        
        return { name: client.name, pending: pendingUnits, delivered: totalDelivered };
    }).filter(c => c.pending > 0 || c.delivered > 0);
    return dataByClient;
  }, [clients, finalFilteredEntries, getCalculatedQuantities]);
  
  const revenueByClientData = useMemo(() => {
      const data = dateFilteredDocuments.reduce((acc, doc) => {
          const clientName = clients.find(c => c.id === doc.clientId)?.name || 'Unknown';
          acc[clientName] = (acc[clientName] || 0) + doc.total;
          return acc;
      }, {} as Record<string, number>);
      return Object.entries(data).map(([name, value]) => ({name, revenue: value}));
  }, [dateFilteredDocuments, clients]);

  const revenueByCategoryData = useMemo(() => {
    const dataByCategory = dateFilteredDocuments.reduce((acc, doc) => {
        doc.items.forEach(item => {
            const product = productCatalog.find(p => p.code === item.productCode);
            const category = product?.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + item.total;
        });
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(dataByCategory).map(([name, value]) => ({ name, revenue: value }));
  }, [dateFilteredDocuments, productCatalog]);
  
  const monthlyRevenueData = useMemo(() => {
      const dataByMonth = dateFilteredDocuments.reduce((acc, doc) => {
        const month = new Date(doc.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        acc[month] = (acc[month] || 0) + doc.total;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(dataByMonth).map(([name, revenue]) => ({name, revenue})).sort((a,b) => new Date(`1 ${a.name}`).getTime() - new Date(`1 ${b.name}`).getTime());
  }, [dateFilteredDocuments]);
  
  const revenueDistributionData = useMemo(() => {
      if (!isAdmin) return [];
      const billableEntries = finalFilteredEntries.filter(e => e.status === 'Entregada' || e.status === 'Prefacturado');
      
      const revenueByClient = clients.map(client => {
          const clientRevenue = billableEntries
              .filter(entry => entry.client === client.name)
              .reduce((sum, entry) => sum + getRevenueData([entry]), 0);
          return { name: client.name, value: clientRevenue };
      }).filter(item => item.value > 0);
      
      return revenueByClient;
  }, [finalFilteredEntries, clients, getRevenueData, isAdmin]);

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
      setModalData({ title, entries: entriesToShow });
  };
  
  const handleEntryRowClick = (entryCode: number) => {
    const entryDetails = entries.find(e => e.code === entryCode);
    if(entryDetails) {
        setViewingEntry(entryDetails);
    }
  }


  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dark-text-primary">Dashboard</h1>
      </div>
      
      <FilterBar clients={clients} onFilterChange={setFilters} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 my-6">
        <button className="text-left w-full h-full" onClick={() => handleCardClick('total')}>
            <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-dark-text-secondary">Total Entries</h3><p className="text-4xl font-bold text-amber-400">{dashboardStats.totalEntries}</p></Card>
        </button>
        <button className="text-left w-full h-full" onClick={() => handleCardClick('received')}>
            <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-dark-text-secondary">Units Received</h3><p className="text-4xl font-bold text-blue-400">{dashboardStats.totalReceived}</p></Card>
        </button>
        <button className="text-left w-full h-full" onClick={() => handleCardClick('delivered')}>
            <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-dark-text-secondary">Units Delivered</h3><p className="text-4xl font-bold text-green-400">{dashboardStats.totalDelivered}</p></Card>
        </button>
        <button className="text-left w-full h-full" onClick={() => handleCardClick('pending')}>
            <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-dark-text-secondary">Pending Units</h3><p className="text-4xl font-bold text-red-400">{dashboardStats.pendingUnits}</p></Card>
        </button>
        {isAdmin && (
            <button className="text-left w-full h-full" onClick={() => handleCardClick('revenue')}>
                <Card gradient className="text-center h-full transition-all transform hover:scale-105 hover:shadow-2xl"><h3 className="text-lg font-medium text-dark-text-secondary">Total Revenue</h3><p className="text-4xl font-bold text-green-400">€{dashboardStats.totalRevenue.toFixed(0)}</p></Card>
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-4">Event Calendar</h3>
            <EventCalendar entries={finalFilteredEntries} deliveries={filteredDeliveries} />
        </Card>
        <Card>
            <h3 className="text-xl font-semibold text-dark-text-primary mb-4">Delivered Units by Client</h3>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8"/>
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="delivered" name="Delivered">
                        <LabelList dataKey="delivered" position="top" fill="#f8fafc" />
                        {clientChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
        {isAdmin && revenueByClientData.length > 0 && (
          <Card>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-4">Revenue by Client</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByClientData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={(value) => `€${(value as number / 1000).toFixed(0)}k`}/>
                      <Tooltip content={<CustomTooltip formatter={(value: number) => `€${value.toFixed(2)}`} />} />
                      <Bar dataKey="revenue" name="Revenue">
                          {revenueByClientData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </Card>
        )}
         {isAdmin && revenueByCategoryData.length > 0 && (
          <Card>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-4">Revenue by Product Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByCategoryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={(value) => `€${(value as number / 1000).toFixed(0)}k`}/>
                      <Tooltip content={<CustomTooltip formatter={(value: number) => `€${value.toFixed(2)}`} />} />
                      <Bar dataKey="revenue" name="Revenue">
                          {revenueByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[CHART_COLORS.length - 1 - (index % CHART_COLORS.length)]} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </Card>
        )}
        {isAdmin && monthlyRevenueData.length > 0 && (
          <Card>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-4">Monthly Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={(value) => `€${(value as number / 1000).toFixed(0)}k`}/>
                      <Tooltip content={<CustomTooltip formatter={(value: number) => `€${value.toFixed(2)}`} />} />
                      <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
              </ResponsiveContainer>
          </Card>
        )}
        {isAdmin && revenueDistributionData.length > 0 && (
            <Card>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-4">Revenue Distribution by Client</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={revenueDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={renderCustomizedLabel}>
                            {revenueDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip formatter={(value: number) => `€${value.toFixed(2)}`} />} />
                        <Legend wrapperStyle={{color: "#f8fafc"}}/>
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        )}
      </div>

       <Modal isOpen={!!modalData} onClose={() => setModalData(null)} title={modalData?.title || ''} size="5xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-dark-text-secondary">
              <thead className="text-xs text-slate-400 uppercase bg-dark-tertiary">
                <tr>
                  <th scope="col" className="px-6 py-3">Code</th>
                  <th scope="col" className="px-6 py-3">Client</th>
                  <th scope="col" className="px-6 py-3">Description</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {modalData?.entries.map((entry: Entry) => (
                  <tr key={entry.code} className="border-b border-dark-secondary hover:bg-dark-tertiary/80 cursor-pointer" onClick={() => handleEntryRowClick(entry.code)}>
                    <td className="px-6 py-4 font-medium text-dark-text-primary">{entry.code}</td>
                    <td className="px-6 py-4"><Badge className={CLIENT_COLORS[entry.client]}>{entry.client}</Badge></td>
                    <td className="px-6 py-4">{entry.items.map(i => i.description).join(', ')}</td>
                    <td className="px-6 py-4"><Badge className={STATUS_COLORS[entry.status]}>{entry.status}</Badge></td>
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
