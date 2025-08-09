import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Entry, Delivery } from '../../types';
import { usePreparedData } from '../../utils/metrics';
import { Card } from '../ui';
import { CHART_COLORS } from '../../constants';

const numberFormatter = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-primary p-2 border border-brand-tertiary rounded shadow-lg text-sm">
        <p className="label font-semibold text-brand-text-primary mb-1">{label}</p>
        {payload.map((pld: any, index: number) => (
             <p key={index} style={{ color: pld.color }}>
                {`${pld.name}: ${numberFormatter(pld.value)}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatusBreakdownChart: React.FC<{ data: {name: string, value: number}[] }> = ({ data }) => {
    const colors = [CHART_COLORS.GREEN, CHART_COLORS.ORANGE];
    
    return (
        <Card>
            <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

const ClientTotalsChart: React.FC<{ data: {name: string, Entregada: number}[] }> = ({ data }) => {
    return (
        <Card>
            <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Client-wise Delivered Totals</h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.GRAY} strokeOpacity={0.2}/>
                    <XAxis dataKey="name" stroke={CHART_COLORS.GRAY} fontSize={12} />
                    <YAxis stroke={CHART_COLORS.GRAY} fontSize={12} tickFormatter={numberFormatter}/>
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}/>
                    <Legend />
                    <Bar dataKey="Entregada" name={'Delivered'} fill={CHART_COLORS.GREEN} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

const DailyTrendChart: React.FC<{ data: {date: string, Recibida: number, Entregada: number}[] }> = ({ data }) => {
    return (
        <Card>
             <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Daily Trend (Received vs. Delivered)</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.GRAY} strokeOpacity={0.2}/>
                    <XAxis dataKey="date" stroke={CHART_COLORS.GRAY} fontSize={12}/>
                    <YAxis stroke={CHART_COLORS.GRAY} fontSize={12} tickFormatter={numberFormatter}/>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" name={'Received'} dataKey="Recibida" stroke={CHART_COLORS.BLUE} strokeWidth={2} dot={{r: 3}} activeDot={{r: 6}} />
                    <Line type="monotone" name={'Delivered'} dataKey="Entregada" stroke={CHART_COLORS.GREEN} strokeWidth={2} dot={{r: 3}} activeDot={{r: 6}}/>
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

const ReceivedVsDeliveredChart: React.FC<{ data: {date: string, Recibida: number, Entregada: number}[] }> = ({ data }) => {
    return (
        <Card>
             <h3 className="text-lg font-semibold text-brand-text-primary mb-4">Received vs. Delivered Stack</h3>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.GRAY} strokeOpacity={0.2}/>
                    <XAxis dataKey="date" stroke={CHART_COLORS.GRAY} fontSize={12}/>
                    <YAxis stroke={CHART_COLORS.GRAY} fontSize={12} tickFormatter={numberFormatter}/>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Recibida" name={'Received'} stackId="a" fill={CHART_COLORS.BLUE} />
                    <Bar dataKey="Entregada" name={'Delivered'} stackId="a" fill={CHART_COLORS.GREEN} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};


export const DashboardCharts: React.FC<{ entries: Entry[]; deliveries: Delivery[] }> = ({ entries, deliveries }) => {
    const { statusBreakdownData, clientTotalsData, dailyTrendData } = usePreparedData(entries, deliveries);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatusBreakdownChart data={statusBreakdownData} />
            <ClientTotalsChart data={clientTotalsData} />
            <DailyTrendChart data={dailyTrendData} />
            <ReceivedVsDeliveredChart data={dailyTrendData} />
        </div>
    );
};