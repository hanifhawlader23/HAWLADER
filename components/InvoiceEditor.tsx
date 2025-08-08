
import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { Document, DocumentItem } from '../types';
import { Modal, Button } from './ui';
import { DocumentTemplate } from './InvoiceTemplate';

interface DocumentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  document: Document;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ isOpen, onClose, onSave, document }) => {
  const { saveDocument, getNewDocumentNumber, clients } = useData();
  const [editableDocument, setEditableDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (document) {
      const docCopy = JSON.parse(JSON.stringify(document)); // Deep copy
      if (docCopy.id === 'new-draft' && !docCopy.documentNumber) {
        docCopy.documentNumber = getNewDocumentNumber(docCopy.documentType);
      }
      setEditableDocument(docCopy);
    }
  }, [document, getNewDocumentNumber]);

  const calculateTotals = useCallback((items: DocumentItem[], taxRate: number, clientId: string) => {
      const client = clients.find(c => c.id === clientId);
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      
      let surcharge = 0;
      if (client?.name === 'AUSTRAL') {
          surcharge = items.reduce((sum, item) => {
              if (item.recibidaQuantity <= 20) {
                  return sum + (item.total * 0.10);
              }
              return sum;
          }, 0);
      }

      const taxAmount = (subtotal + surcharge) * (taxRate / 100);
      const total = subtotal + surcharge + taxAmount;
      return { subtotal, surcharge, taxAmount, total };
  }, [clients]);

  const handleItemChange = useCallback((index: number, field: keyof DocumentItem, value: any) => {
    setEditableDocument(prev => {
        if (!prev) return null;
        const newItems = [...prev.items];
        const itemToUpdate = { ...newItems[index] };
        
        // @ts-ignore
        itemToUpdate[field] = value;
        
        if (field === 'entregadaQuantity' || field === 'unitPrice') {
            const quantityForTotal = itemToUpdate.entregadaQuantity > 0 ? itemToUpdate.entregadaQuantity : itemToUpdate.recibidaQuantity;
            itemToUpdate.total = (quantityForTotal || 0) * (itemToUpdate.unitPrice || 0);
        }

        newItems[index] = itemToUpdate;
        const { subtotal, surcharge, taxAmount, total } = calculateTotals(newItems, prev.taxRate, prev.clientId);

        return { ...prev, items: newItems, subtotal, surcharge, taxAmount, total };
    });
  }, [calculateTotals]);

  const handleTaxRateChange = useCallback((newRate: number) => {
    setEditableDocument(prev => {
        if (!prev) return null;
        const { subtotal, surcharge, taxAmount, total } = calculateTotals(prev.items, newRate, prev.clientId);
        return { ...prev, taxRate: newRate, subtotal, surcharge, taxAmount, total };
    });
  }, [calculateTotals]);

  const handleDocumentNumberChange = useCallback((newNumber: string) => {
    setEditableDocument(prev => {
        if (!prev) return null;
        return { ...prev, documentNumber: newNumber };
    });
  }, []);

  const handleSave = () => {
    if (editableDocument) {
      saveDocument(editableDocument);
      onSave();
      onClose();
    }
  };

  const title = document.id === 'new-draft' 
    ? `Creating New ${document.documentType}` 
    : `Editing ${document.documentType} #${document.documentNumber}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="5xl">
      {editableDocument ? (
        <div className="bg-brand-bg p-4">
          <DocumentTemplate 
            document={editableDocument} 
            isEditing={true}
            onItemChange={handleItemChange}
            onTaxRateChange={handleTaxRateChange}
            onDocumentNumberChange={handleDocumentNumberChange}
          />
          <div className="p-4 bg-dark-primary border-t border-dark-secondary mt-4 rounded-b-lg flex justify-between items-center">
            <p className="text-sm text-dark-text-secondary">You are in editing mode. Changes are updated live.</p>
            <div>
              <Button onClick={onClose} variant="secondary" className="mr-2">Cancel</Button>
              <Button onClick={handleSave}>Confirm & Save Document</Button>
            </div>
          </div>
        </div>
      ) : (
        <p>Generating editor...</p>
      )}
    </Modal>
  );
};
