

import React, { useState, useMemo } from 'react';
import { Entry, Delivery } from '../types';

interface EventCalendarProps {
  entries: Entry[];
  deliveries: Delivery[];
}

const areSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export const EventCalendar: React.FC<EventCalendarProps> = ({ entries, deliveries }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const eventDates = useMemo(() => {
    const events = new Map<string, { received: boolean; delivered: boolean }>();
    
    entries.forEach(entry => {
        const date = new Date(entry.date);
        const dateString = date.toDateString();
        if (!events.has(dateString)) events.set(dateString, { received: false, delivered: false });
        events.get(dateString)!.received = true;
    });

    deliveries.forEach(delivery => {
        const date = new Date(delivery.deliveryDate);
        const dateString = date.toDateString();
        if (!events.has(dateString)) events.set(dateString, { received: false, delivered: false });
        events.get(dateString)!.delivered = true;
    });

    return events;
  }, [entries, deliveries]);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const days = [];
  let date = startDate;
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="text-brand-text-primary text-sm">
      <div className="flex justify-between items-center mb-2">
        <button onClick={prevMonth} className="px-2 py-1 rounded-md hover:bg-brand-secondary">&lt;</button>
        <h2 className="font-semibold text-base">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={nextMonth} className="px-2 py-1 rounded-md hover:bg-brand-secondary">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-brand-text-secondary">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-1">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = areSameDay(day, new Date());
          const events = eventDates.get(day.toDateString());

          return (
            <div
              key={index}
              className={`relative flex flex-col items-center justify-center h-9 rounded-md ${
                isCurrentMonth ? '' : 'text-brand-text-secondary/30'
              } ${isToday ? 'bg-brand-accent/30 font-bold' : ''}`}
            >
              <span>{day.getDate()}</span>
              {events && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {events.received && <div className="w-1.5 h-1.5 bg-brand-accent rounded-full"></div>}
                  {events.delivered && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};