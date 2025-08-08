
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card, Modal, Button, Badge, useToast, ConfirmationModal } from './ui';
import { DocumentTemplate } from './InvoiceTemplate';
import { DocumentEditor } from './InvoiceEditor';
import { Document, FilterState, Column } from '../types';
import { FilterBar, filterDocumentsByDate } from './FilterBar';
import { SelectableTable } from './SelectableTable';

export const InvoiceHistory: React.FC = () => {
  const { documents, clients, deleteDocument, deleteMultipleDocuments, isAdmin } = useData();
  const [filters, setFilters] = useState<Omit<FilterState, 'status'>>({
    dateRange: 'all',
    clientId: 'all',
    startDate: '',
    endDate: '',
  });
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const { addToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filteredDocuments = useMemo(() => {
    let tempDocs = [...documents];
    // Client filter
    tempDocs = tempDocs.filter(doc => filters.clientId === 'all' || doc.clientId === filters.clientId);
    // Date filter
    return filterDocumentsByDate(tempDocs, filters.dateRange, filters.startDate, filters.endDate);
  }, [documents, filters]);

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Unknown Client';
  };

  const handleDeleteMany = async (ids: (string|number)[]) => {
      await deleteMultipleDocuments(ids as string[]);
      addToast(`${ids.length} document${ids.length > 1 ? 's' : ''} deleted.`, 'success');
  };
  
  const handleDeleteSingle = (id: string) => {
    setDeleteTarget(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteSingle = () => {
      if (deleteTarget !== null) {
          deleteDocument(deleteTarget);
          addToast(`Document deleted.`, 'success');
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
      }
  };

  const columns: Column<Document>[] = [
      { header: 'Number', accessor: 'documentNumber', headerClassName: 'px-6 py-3', className: 'px-6 py-4 font-medium text-dark-text-primary' },
      { header: 'Type', accessor: (item) => <Badge className={item.documentType === 'Factura' ? 'bg-teal-900 text-teal-300' : 'bg-orange-900 text-orange-300'}>{item.documentType}</Badge>, headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
      { header: 'Date', accessor: (item) => new Date(item.date).toLocaleDateString(), headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
      { header: 'Client', accessor: (item) => getClientName(item.clientId), headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
      { header: 'Amount', accessor: (item) => `€${item.total.toFixed(2)}`, headerClassName: 'px-6 py-3 text-right', className: 'px-6 py-4 text-right font-semibold text-dark-text-primary' },
      { 
          header: 'Actions', 
          accessor: (item) => (
              <div className="text-center space-x-2">
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setViewingDocument(item); }}>View</Button>
                  {isAdmin && <Button size="sm" onClick={(e) => { e.stopPropagation(); setEditingDocument(item); }}>Edit</Button>}
                  {isAdmin && <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteSingle(item.id); }}>Delete</Button>}
              </div>
          ), 
          headerClassName: 'px-6 py-3 text-center',
          className: 'px-6 py-4'
      },
  ];


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-dark-text-primary">Invoice History</h1>
      </div>
      
      <FilterBar clients={clients} onFilterChange={setFilters} />
      
      <Card>
        <SelectableTable 
            data={filteredDocuments}
            columns={columns}
            keyField="id"
            onRowClick={(item) => setViewingDocument(item)}
            onDeleteMany={isAdmin ? handleDeleteMany : undefined}
            canSelect={isAdmin}
        />
      </Card>

       <Modal isOpen={!!viewingDocument} onClose={() => setViewingDocument(null)} title={`${viewingDocument?.documentType} #${viewingDocument?.documentNumber}`} size="5xl">
          {viewingDocument && <DocumentTemplate document={viewingDocument} />}
       </Modal>
       
       {editingDocument && (
            <DocumentEditor 
                isOpen={!!editingDocument}
                onClose={() => setEditingDocument(null)}
                onSave={() => { setEditingDocument(null); addToast('Document saved successfully.', 'success'); }}
                document={editingDocument}
            />
       )}

        <ConfirmationModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setDeleteConfirmOpen(false)}
            onConfirm={confirmDeleteSingle}
            title="Confirm Document Deletion"
            message="Are you sure you want to permanently delete this document? This will not affect the original entries."
            confirmationWord="DELETE"
        />
    </div>
  );
};
