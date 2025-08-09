import { useMemo } from 'react';
import { Entry, Delivery, SizeQuantities } from '../types';

export const sumQuantities = (quantities: SizeQuantities): number => {
  if (!quantities) return 0;
  return Object.values(quantities).reduce((sum, q) => sum + (Number(q) || 0), 0);
};

const formatDate = (date: Date) => {
    // We add timezone offset to get the correct UTC date string
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
};

export const usePreparedData = (entries: Entry[], deliveries: Delivery[]) => {
    return useMemo(() => {
        // --- Totals for Status Breakdown Pie Chart ---
        let totalReceived = 0;
        let totalDelivered = 0;

        const entryQuantities = new Map<number, { received: number, delivered: number }>();

        entries.forEach(entry => {
            const received = entry.items.reduce((sum, item) => sum + sumQuantities(item.sizeQuantities), 0);
            entryQuantities.set(entry.code, { received: received, delivered: 0 });
            totalReceived += received;
        });

        deliveries.forEach(delivery => {
            const delivered = delivery.items.reduce((sum, item) => sum + sumQuantities(item.deliveryQuantities), 0);
            totalDelivered += delivered;
        });

        const statusBreakdownData = [
            { name: 'Entregada', value: totalDelivered },
            { name: 'Falta', value: Math.max(0, totalReceived - totalDelivered) },
        ].filter(item => item.value > 0);


        // --- Client-wise Totals Bar Chart ---
        const clientTotals = new Map<string, number>();
        deliveries.forEach(delivery => {
            const entry = entries.find(e => e.code === delivery.code);
            if (entry) {
                const delivered = delivery.items.reduce((sum, item) => sum + sumQuantities(item.deliveryQuantities), 0);
                const currentTotal = clientTotals.get(entry.client) || 0;
                clientTotals.set(entry.client, currentTotal + delivered);
            }
        });
        
        const clientTotalsData = Array.from(clientTotals.entries()).map(([name, value]) => ({ name, Entregada: value }));

        
        // --- Daily Trend Data & Calendar Data ---
        const dailyData = new Map<string, { received: number, delivered: number }>();

        entries.forEach(entry => {
            const date = formatDate(new Date(entry.date));
            const received = entry.items.reduce((sum, item) => sum + sumQuantities(item.sizeQuantities), 0);
            const day = dailyData.get(date) || { received: 0, delivered: 0 };
            day.received += received;
            dailyData.set(date, day);
        });

        deliveries.forEach(delivery => {
            const date = formatDate(new Date(delivery.deliveryDate));
            const delivered = delivery.items.reduce((sum, item) => sum + sumQuantities(item.deliveryQuantities), 0);
            const day = dailyData.get(date) || { received: 0, delivered: 0 };
            day.delivered += delivered;
            dailyData.set(date, day);
        });

        const sortedDailyData = Array.from(dailyData.entries()).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
        
        const dailyTrendData = sortedDailyData.map(([date, values]) => {
            const d = new Date(date);
            // Adjust for timezone when displaying
            d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
            return {
                date: `${d.getDate()}/${d.getMonth() + 1}`,
                Recibida: values.received,
                Entregada: values.delivered
            };
        });
        
        const calendarEvents = new Map<string, { received: number, delivered: number }>();
         sortedDailyData.forEach(([date, values]) => {
            calendarEvents.set(date, values);
        });

        return {
            statusBreakdownData,
            clientTotalsData,
            dailyTrendData,
            calendarEvents,
        };

    }, [entries, deliveries]);
};
