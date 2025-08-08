import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from './ui';
import { useData } from '../context/DataContext';

interface ExportColumn<T> {
  title: string;
  dataKey: keyof T | ((item: T) => string | number);
}

interface ExportControlsProps<T> {
  data: T[];
  columns: ExportColumn<T>[];
  fileName: string;
}

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>;


export function ExportControls<T extends object>({ data, columns, fileName }: ExportControlsProps<T>) {
  const { isManager } = useData();
  const [isOpen, setIsOpen] = useState(false);

  if (!isManager) return null;

  const getRowValue = (item: T, column: ExportColumn<T>): string => {
    try {
      if (typeof column.dataKey === 'function') {
        const value = column.dataKey(item);
        return value === null || value === undefined ? '' : String(value);
      }
      // @ts-ignore
      const value = item[column.dataKey];
      return value === null || value === undefined ? '' : String(value);
    } catch {
      return '';
    }
  };

  const exportToCSV = () => {
    const headers = columns.map(c => c.title).join(',');
    const rows = data.map(item =>
      columns.map(col => `"${getRowValue(item, col).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [columns.map(c => c.title)],
      body: data.map(item => columns.map(col => getRowValue(item, col))),
    });
    doc.save(`${fileName}.pdf`);
    setIsOpen(false);
  };


  return (
    <div className="relative inline-block text-left">
      <div>
        <Button variant="secondary" onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center">
            <DownloadIcon />
            <span className="ml-2">Download</span>
        </Button>
      </div>

      {isOpen && (
        <div 
            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-2xl bg-brand-primary ring-1 ring-brand-tertiary ring-opacity-5 focus:outline-none z-10"
            role="menu"
            aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            <button onClick={exportToCSV} className="text-brand-text-primary block w-full text-left px-4 py-2 text-sm hover:bg-brand-secondary" role="menuitem">
              Export as CSV
            </button>
            <button onClick={exportToPDF} className="text-brand-text-primary block w-full text-left px-4 py-2 text-sm hover:bg-brand-secondary" role="menuitem">
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}