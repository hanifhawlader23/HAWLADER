import React, { useState, useEffect, useMemo } from 'react';
import { SelectableTableProps, Column } from '../types';
import { Button, ConfirmationModal, useToast } from './ui';
import { motion } from 'framer-motion';

export const SelectableTable = <T extends { [key: string]: any }>({ 
    data, 
    columns, 
    keyField, 
    onRowClick, 
    onDeleteMany,
    canSelect = true,
    renderBulkActions,
}: SelectableTableProps<T>) => {
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setSelectedIds([]); // Clear selection when data changes
  }, [data]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(data.map(item => item[keyField]));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string | number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleConfirmDelete = async () => {
      if (onDeleteMany) {
          try {
              await onDeleteMany(selectedIds);
              setDeleteConfirmOpen(false);
              setSelectedIds([]);
          } catch (error) {
              console.error("Deletion failed:", error);
              addToast('Failed to delete items.', 'error');
          }
      }
  };

  const isAllSelected = useMemo(() => data.length > 0 && selectedIds.length === data.length, [data, selectedIds]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative">
      {canSelect && selectedIds.length > 0 && (
        <div className="absolute top-0 left-0 right-0 bg-brand-secondary/80 backdrop-blur-sm p-2 flex items-center justify-between z-10 rounded-t-lg">
           <div>
            {renderBulkActions ? renderBulkActions(selectedIds) : <span className="text-sm font-semibold text-brand-text-primary">{selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected</span>}
           </div>
          <div className="space-x-2">
            {onDeleteMany && (
              <Button size="sm" variant="danger" onClick={() => setDeleteConfirmOpen(true)}>
                Delete Selected
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => setSelectedIds([])}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-brand-text-secondary responsive-table">
          <thead className="text-xs text-brand-text-secondary uppercase bg-brand-secondary">
            <tr>
              {canSelect && (
                <th scope="col" className="p-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-brand-tertiary bg-brand-primary text-brand-accent focus:ring-brand-accent"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col, index) => (
                <th key={index} scope="col" className={col.headerClassName || 'px-6 py-3'}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
            {data.map(item => (
              <motion.tr 
                key={item[keyField]} 
                variants={itemVariants}
                layout
                className={`border-b border-brand-tertiary hover:bg-brand-secondary/80 ${selectedIds.includes(item[keyField]) ? 'bg-brand-accent/20' : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {canSelect && (
                  <td data-label="Select" className="p-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-brand-tertiary bg-brand-primary text-brand-accent focus:ring-brand-accent"
                      checked={selectedIds.includes(item[keyField])}
                      onChange={() => handleSelectRow(item[keyField])}
                      onClick={(e) => e.stopPropagation()} // Prevent row click when checkbox is clicked
                    />
                  </td>
                )}
                {columns.map((col, index) => (
                  <td key={index} data-label={col.header} className={col.className || 'px-6 py-4'}>
                    {typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor]}
                  </td>
                ))}
              </motion.tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={columns.length + (canSelect ? 1: 0)} className="text-center py-10 text-brand-text-secondary">
                        No items found.
                    </td>
                </tr>
            )}
          </motion.tbody>
        </table>
      </div>
       {onDeleteMany && (
        <ConfirmationModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Bulk Deletion"
          message={`Are you sure you want to permanently delete these ${selectedIds.length} items?`}
          confirmationWord="DELETE"
        />
      )}
    </div>
  );
};