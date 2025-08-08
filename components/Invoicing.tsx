


import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Entry, Status, Document, DocumentItem, DocumentType, Column, FilterState, EntryItem, DateRangePreset } from '../types';
import { Button, Card, Input, Select, Badge, Modal } from './ui';
import { DocumentEditor } from './InvoiceEditor';
import { EntryDetailView } from './EntryDetailView';
import { FilterBar, filterEntriesByDate } from './FilterBar';
import { SelectableTable } from './SelectableTable';
import { STATUS_COLORS } from '../constants';

// The data structure for the table in this component
interface InvoiceableEntry {
  code: number;
  date: string;
  description: string;
  qty: number;
  status: Status;
  client: string;
}

const getDateRangeFromPreset = (preset: DateRangePreset): { start?: string; end?: string } => {
    const today = new Date();
    const toISODate = (d: Date) => {
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
    };
    
    const end = new Date();
    let start = new Date();

    switch (preset) {
        case 'today':
            break;
        case 'yesterday':
            start.setDate(today.getDate() - 1);
            end.setDate(today.getDate() - 1);
            break;
        case 'last7':
            start.setDate(today.getDate() - 6);
            break;
        case 'last15':
            start.setDate(today.getDate() - 14);
            break;
        case 'last30':
            start.setDate(today.getDate() - 29);
            break;
        case 'all':
        default:
            return {};
    }
    return { start: toISODate(start), end: toISODate(end) };
};

export const InvoiceWorkbench: React.FC = () => {
  const { entries, clients, getCalculatedQuantities, getCalculatedQuantitiesForItem, getDeliveryBreakdownForItem, isAdmin, documents } = useData();
  const [filters, setFilters] = useState<Omit<FilterState, 'status'>>({
    dateRange: 'all',
    clientId: 'all',
    startDate: '',
    endDate: '',
  });
  const [selectedEntryCodes, setSelectedEntryCodes] = useState<number[]>([]);
  const [taxRate, setTaxRate] = useState<number>(21);
  const [documentType, setDocumentType] = useState<DocumentType>('Prefactura');
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [draftDocument, setDraftDocument] = useState<Document | null>(null);
  const [viewingEntry, setViewingEntry] = useState<Entry | null>(null);

  const invoiceableEntries: InvoiceableEntry[] = useMemo(() => {
    // Prevent re-invoicing by filtering out entries already in any document (Prefactura or Factura).
    const entriesInDocuments = new Set(
        documents.flatMap(doc => doc.items.map(item => item.entryCode))
    );
      
    const billableEntries = entries.filter(entry => 
        (entry.status === Status.Entregada || entry.status === Status.Prefacturado) &&
        !entriesInDocuments.has(entry.code)
    );
    
    const clientFiltered = billableEntries.filter(e => {
        const client = clients.find(c => c.name === e.client);
        return filters.clientId === 'all' || client?.id === filters.clientId;
    });

    const dateFiltered = filterEntriesByDate(clientFiltered, filters.dateRange, filters.startDate, filters.endDate);

    return dateFiltered.map(entry => ({
      code: entry.code,
      date: entry.date,
      description: entry.items.map(i => i.description).join(' + '),
      qty: getCalculatedQuantities(entry).recibidaQuantity,
      status: entry.status,
      client: entry.client,
    }));
  }, [entries, documents, filters.clientId, filters.dateRange, filters.startDate, filters.endDate, clients, getCalculatedQuantities]);

  const handleCreateDraft = () => {
    if (selectedEntryCodes.length === 0) {
        alert("Please select at least one entry to create a document.");
        return;
    }
    const firstEntry = entries.find(e => e.code === selectedEntryCodes[0]);
    const client = clients.find(c => c.name === firstEntry?.client);
    
    if (!client) {
        alert("A valid client must be selected.");
        return;
    }
    
    const docItems: DocumentItem[] = [];

    // Find all selected entries
    const selectedEntries = entries.filter(e => selectedEntryCodes.includes(e.code));

    // Iterate through each selected entry and then through each of its items
    selectedEntries.forEach(entry => {
        entry.items.forEach(item => {
            const quantities = getCalculatedQuantitiesForItem(item, entry.code);
            const deliveryBreakdown = getDeliveryBreakdownForItem(item, entry.code);
            
            // Use received quantity for total calculation
            const quantityForInvoice = quantities.recibidaQuantity; 

            docItems.push({
                entryCode: entry.code,
                productCode: item.productId,
                description: item.description,
                reference1: item.reference1,
                reference2: item.reference2,
                clientName: client.name,
                recibidaQuantity: quantities.recibidaQuantity,
                entregadaQuantity: quantityForInvoice,
                faltaQuantity: quantities.faltaQuantity,
                status: entry.status,
                deliveryBreakdown: deliveryBreakdown,
                unitPrice: item.unitPrice,
                total: quantityForInvoice * item.unitPrice,
            });
        });
    });

    if (docItems.length === 0) {
        alert("No valid items found in the selected entries.");
        return;
    }

    const subtotal = docItems.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate surcharge for AUSTRAL client on items with quantity <= 20
    let surcharge = 0;
    if (client?.name === 'AUSTRAL') {
        surcharge = docItems.reduce((sum, item) => {
            if (item.recibidaQuantity <= 20) {
                return sum + (item.total * 0.10);
            }
            return sum;
        }, 0);
    }

    const taxAmount = (subtotal + surcharge) * (taxRate / 100);
    const total = subtotal + surcharge + taxAmount;
    
    let docStartDate: string | undefined;
    let docEndDate: string | undefined;

    if (filters.dateRange === 'custom') {
        docStartDate = filters.startDate || undefined;
        docEndDate = filters.endDate || undefined;
    } else if (filters.dateRange !== 'all') {
        const range = getDateRangeFromPreset(filters.dateRange);
        docStartDate = range.start;
        docEndDate = range.end;
    }

    const tempDocument: Document = {
        id: 'new-draft',
        documentNumber: '',
        documentType: documentType,
        clientId: client.id,
        date: new Date().toISOString(),
        items: docItems,
        subtotal,
        surcharge,
        taxRate,
        taxAmount,
        total,
        startDate: docStartDate,
        endDate: docEndDate,
    };

    setDraftDocument(tempDocument);
    setEditorOpen(true);
  }
  
  const resetState = () => {
    setSelectedEntryCodes([]);
    setEditorOpen(false);
    setDraftDocument(null);
  }
  
  const columns: Column<InvoiceableEntry>[] = [
      { header: 'Code', accessor: 'code', headerClassName: 'px-6 py-3', className: 'px-6 py-4 font-medium text-brand-text-primary' },
      { header: 'Date', accessor: (item) => new Date(item.date).toLocaleDateString(), headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
      { header: 'Description', accessor: 'description', headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
      { header: 'Qty', accessor: 'qty', headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
      { header: 'Status', accessor: (item) => <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>, headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
  ];

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-brand-text-primary">Invoice Workbench</h1>
          <Button onClick={() => { setSelectedEntryCodes([]); setFilters({ dateRange: 'all', clientId: 'all', startDate: '', endDate: '' }); }} variant="secondary">Start New</Button>
        </div>
        
        <div className="space-y-4 bg-brand-secondary/50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select 
                label="1. Select Document Type" 
                value={documentType} 
                onChange={e => setDocumentType(e.target.value as DocumentType)}
            >
              <option value="Prefactura">Prefactura</option>
              <option value="Factura">Factura</option>
            </Select>
            <Input 
                label="2. Set Tax Rate (%)" 
                type="number"
                value={taxRate}
                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
            />
            <div className="self-end">
              <Button 
                  onClick={handleCreateDraft}
                  disabled={selectedEntryCodes.length === 0}
                  className="w-full"
              >
                  Preview Invoice
              </Button>
            </div>
          </div>
          <div className="pt-4 border-t border-brand-tertiary">
             <FilterBar clients={clients} onFilterChange={setFilters} />
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <Card>
          <h2 className="text-xl font-semibold text-brand-text-secondary mb-2">
            Available Items for {clients.find(c=>c.id === filters.clientId)?.name || 'All Clients'}
          </h2>
          <SelectableTable 
            data={invoiceableEntries}
            columns={columns}
            keyField="code"
            onRowClick={(item) => {
              const entry = entries.find(e => e.code === item.code);
              setViewingEntry(entry || null);
            }}
            canSelect={isAdmin}
            renderBulkActions={(selectedIds) => {
                setSelectedEntryCodes(selectedIds as number[]);
                return <span className="text-sm font-semibold text-brand-text-primary">{selectedIds.length} entr{selectedIds.length > 1 ? 'ies' : ''} selected</span>
            }}
          />
        </Card>
      </div>
      
      {isEditorOpen && draftDocument && (
          <DocumentEditor
            isOpen={isEditorOpen}
            onClose={() => setEditorOpen(false)}
            onSave={resetState}
            document={draftDocument}
          />
      )}

       <Modal isOpen={!!viewingEntry} onClose={() => setViewingEntry(null)} title={`Details for Entry #${viewingEntry?.code}`} size="4xl">
            {viewingEntry && <EntryDetailView entry={viewingEntry} />}
        </Modal>
    </>
  );
};