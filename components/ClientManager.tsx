


import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, Modal, Input, Textarea, useToast, ConfirmationModal } from './ui';
import { Client, Column } from '../types';
import { SelectableTable } from './SelectableTable';
import { ExportControls } from './ExportControls';

const ClientForm: React.FC<{
    onClose: () => void;
    client?: Client;
}> = ({ onClose, client }) => {
    const { addClient, updateClient } = useData();
    const [formData, setFormData] = useState<Omit<Client, 'id'>>({
        name: client?.name || '',
        address: client?.address || '',
        email: client?.email || '',
        phone: client?.phone || '',
        vatNumber: client?.vatNumber || '',
        logo: client?.logo || null,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => ({ ...prev, logo: reader.result as string }));
          };
          reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (client) {
            updateClient({ ...formData, id: client.id });
        } else {
            addClient(formData);
        }
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Client Name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="VAT Number" name="vatNumber" value={formData.vatNumber} onChange={handleChange} required />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
             <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} required />
            <Input label="Logo" type="file" name="logo" onChange={handleLogoChange} accept="image/*" />
            {formData.logo && <img src={formData.logo} alt="logo preview" className="h-16 w-auto object-contain bg-brand-secondary p-1 rounded-md" />}

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{client ? 'Update' : 'Add'} Client</Button>
            </div>
        </form>
    )
}

export const ClientManager: React.FC = () => {
    const { clients, deleteClient, deleteMultipleClients, isAdmin } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const { addToast } = useToast();
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setModalOpen(true);
    }
    
    const handleAdd = () => {
        setEditingClient(undefined);
        setModalOpen(true);
    }

    const handleDeleteMany = async (ids: (string|number)[]) => {
        await deleteMultipleClients(ids as string[]);
        addToast(`${ids.length} client${ids.length > 1 ? 's' : ''} deleted.`, 'success');
    };
    
    const handleDeleteSingle = (id: string) => {
        setDeleteTarget(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteSingle = () => {
        if (deleteTarget !== null) {
            deleteClient(deleteTarget);
            addToast(`Client deleted.`, 'success');
            setDeleteConfirmOpen(false);
            setDeleteTarget(null);
        }
    };
    
    const columns: Column<Client>[] = [
        { 
            header: 'Name', 
            accessor: (item) => (
                <div className="flex items-center gap-3 font-medium text-brand-text-primary">
                    {item.logo && <img src={item.logo} alt={`${item.name} logo`} className="h-8 w-8 rounded-full object-cover" />}
                    {item.name}
                </div>
            ),
            headerClassName: 'px-6 py-3',
            className: 'px-6 py-4'
        },
        { 
            header: 'Contact', 
            accessor: (item) => (
                <div>
                    <div className="text-brand-text-primary">{item.email}</div>
                    <div className="text-xs text-brand-text-secondary">{item.phone}</div>
                </div>
            ),
            headerClassName: 'px-6 py-3',
            className: 'px-6 py-4'
        },
        { header: 'VAT Number', accessor: 'vatNumber', headerClassName: 'px-6 py-3', className: 'px-6 py-4' },
    ];
    
    if (isAdmin) {
        columns.push({
            header: 'Actions',
            accessor: (item) => (
                 <div className="text-center space-x-2">
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteSingle(item.id); }}>Delete</Button>
                </div>
            ),
            headerClassName: 'px-6 py-3 text-center',
            className: 'px-6 py-4'
        });
    }

    const exportColumns = [
        { title: 'Name', dataKey: 'name' as const },
        { title: 'Email', dataKey: 'email' as const },
        { title: 'Phone', dataKey: 'phone' as const },
        { title: 'VAT Number', dataKey: 'vatNumber' as const },
        { title: 'Address', dataKey: 'address' as const },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-text-primary">Client Management</h1>
                <div className="flex items-center gap-2">
                    <ExportControls data={clients} columns={exportColumns} fileName="clients" />
                    {isAdmin && <Button onClick={handleAdd}>+ Add New Client</Button>}
                </div>
            </div>
            <Card>
                 <SelectableTable 
                    data={clients}
                    columns={columns}
                    keyField="id"
                    onDeleteMany={isAdmin ? handleDeleteMany : undefined}
                    canSelect={isAdmin}
                 />
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingClient ? "Edit Client" : "Add New Client"} size="3xl">
                <ClientForm onClose={() => setModalOpen(false)} client={editingClient} />
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDeleteSingle}
                title="Confirm Client Deletion"
                message="Are you sure you want to permanently delete this client? All associated entries and invoices will remain but may become unlinked."
                confirmationWord="DELETE"
            />
        </div>
    )
}