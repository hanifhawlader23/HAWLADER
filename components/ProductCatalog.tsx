


import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, Modal, Input, Textarea, Select, useToast, ConfirmationModal } from './ui';
import { Product, Column } from '../types';
import { SelectableTable } from './SelectableTable';
import { ExportControls } from './ExportControls';

const ProductForm: React.FC<{
    onClose: () => void;
    product?: Product;
}> = ({ onClose, product }) => {
    const { addProduct, updateProduct, clients } = useData();
    const [formData, setFormData] = useState<Product>({
        code: product?.code || '',
        modelName: product?.modelName || '',
        reference: product?.reference || '',
        price: product?.price || 0,
        category: product?.category || '',
        description: product?.description || '',
        clientId: product?.clientId || '',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (product) {
            updateProduct(formData);
        } else {
            addProduct(formData);
        }
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Product Code" name="code" value={formData.code} onChange={handleChange} required disabled={!!product}/>
                <Input label="Model Name" name="modelName" value={formData.modelName} onChange={handleChange} required />
                <Input label="Category" name="category" value={formData.category} onChange={handleChange} required />
                <Input label="Reference" name="reference" value={formData.reference} onChange={handleChange} required />
                <Input label="Price (€)" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
                <Select label="Client Specific (Optional)" name="clientId" value={formData.clientId} onChange={handleChange}>
                    <option value="">General (All Clients)</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
            </div>
            <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} />
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{product ? 'Update' : 'Add'} Product</Button>
            </div>
        </form>
    )
}

export const ProductCatalogManager: React.FC = () => {
    const { productCatalog, clients, deleteProduct, deleteMultipleProducts, isAdmin } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const { addToast } = useToast();
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setModalOpen(true);
    }
    
    const handleAdd = () => {
        setEditingProduct(undefined);
        setModalOpen(true);
    }

    const getClientName = (clientId?: string) => {
        if (!clientId) return <span className="text-xs text-brand-text-secondary">General</span>;
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'Unknown Client';
    }

    const handleDeleteMany = async (codes: (string|number)[]) => {
        await deleteMultipleProducts(codes as string[]);
        addToast(`${codes.length} product${codes.length > 1 ? 's' : ''} deleted.`, 'success');
    };
    
    const handleDeleteSingle = (code: string) => {
        setDeleteTarget(code);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteSingle = () => {
        if (deleteTarget !== null) {
            deleteProduct(deleteTarget);
            addToast(`Product ${deleteTarget} deleted.`, 'success');
            setDeleteConfirmOpen(false);
            setDeleteTarget(null);
        }
    };
    
    const columns: Column<Product>[] = [
        { header: 'Code', accessor: 'code', headerClassName: 'px-6 py-3', className: 'px-6 py-4 font-medium text-brand-text-primary' },
        { header: 'Model Name', accessor: 'modelName', headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
        { header: 'For Client', accessor: (item) => getClientName(item.clientId), headerClassName: 'px-6 py-3', className: 'px-6 py-4 font-semibold' },
        { header: 'Category', accessor: 'category', headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
        { header: 'Price', accessor: (item) => `€${item.price.toFixed(2)}`, headerClassName: 'px-6 py-3', className: 'px-6 py-4 font-semibold text-brand-text-primary' },
    ];
    
    if (isAdmin) {
        columns.push({
            header: 'Actions',
            accessor: (item) => (
                <div className="text-center space-x-2">
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteSingle(item.code); }}>Delete</Button>
                </div>
            ),
            headerClassName: 'px-6 py-3 text-center',
            className: 'px-6 py-4'
        });
    }

    const exportColumns = [
        { title: 'Code', dataKey: 'code' as const },
        { title: 'Model Name', dataKey: 'modelName' as const },
        { title: 'For Client', dataKey: (item: Product) => {
            if (!item.clientId) return 'General';
            return clients.find(c => c.id === item.clientId)?.name || 'Unknown';
        }},
        { title: 'Category', dataKey: 'category' as const },
        { title: 'Price (€)', dataKey: 'price' as const },
        { title: 'Description', dataKey: 'description' as const },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-text-primary">Product Catalog</h1>
                <div className="flex items-center gap-2">
                    <ExportControls data={productCatalog} columns={exportColumns} fileName="product_catalog" />
                    {isAdmin && <Button onClick={handleAdd}>+ Add New Product</Button>}
                </div>
            </div>
            <Card>
                 <SelectableTable 
                    data={productCatalog}
                    columns={columns}
                    keyField="code"
                    onDeleteMany={isAdmin ? handleDeleteMany : undefined}
                    canSelect={isAdmin}
                 />
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingProduct ? "Edit Product" : "Add New Product"}>
                <ProductForm onClose={() => setModalOpen(false)} product={editingProduct} />
            </Modal>
            
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDeleteSingle}
                title="Confirm Product Deletion"
                message="Are you sure you want to permanently delete this product? This may affect historical entries."
                confirmationWord="DELETE"
            />
        </div>
    )
}