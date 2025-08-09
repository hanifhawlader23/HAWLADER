import React, { useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Entry, Delivery } from '../../types';
import { usePreparedData } from '../../utils/metrics';

export const WorkCalendar: React.FC<{ entries: Entry[]; deliveries: Delivery[] }> = ({ entries, deliveries }) => {
    const { calendarEvents } = usePreparedData(entries, deliveries);

    const handleDayCellMount = useCallback((arg: any) => {
        const dateStr = arg.date.toISOString().split('T')[0];
        const eventData = calendarEvents.get(dateStr);
        if (eventData) {
            const hasReceived = eventData.received > 0;
            const hasDelivered = eventData.delivered > 0;
            
            if (hasReceived && hasDelivered) {
                arg.el.style.background = 'linear-gradient(90deg, rgba(59,130,246,0.18) 50%, rgba(16,185,129,0.18) 50%)';
            } else if (hasReceived) {
                arg.el.style.backgroundColor = 'rgba(59,130,246,0.18)';
            } else if (hasDelivered) {
                arg.el.style.backgroundColor = 'rgba(16,185,129,0.18)';
            }

            const eventsContainer = arg.el.querySelector('.fc-daygrid-day-events');
            if (eventsContainer) {
                let badgeHTML = '';
                if(hasReceived) badgeHTML += `<div style="color:#3B82F6; font-weight:500;">Rec: ${eventData.received}</div>`;
                if(hasDelivered) badgeHTML += `<div style="color:#10B981; font-weight:500;">Del: ${eventData.delivered}</div>`;
                eventsContainer.innerHTML = badgeHTML;
            }
        }
    }, [calendarEvents]);

    return (
        <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height="auto"
            dayCellDidMount={handleDayCellMount}
            headerToolbar={false}
        />
    );
};