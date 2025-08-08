
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Entry, Status, SizeQuantities, Delivery, EntryItem, Product, DeliveryItem } from '../types';
import { SIZES, STATUS_COLORS, CLIENT_COLORS, USER_COLORS } from '../constants';
import { Button, Input, Select, Modal, TrashIcon, Badge } from './ui';
import { CameraCaptureModal } from './CameraCapture';

interface EntryFormProps {
  onClose: () => void;
  entryToEdit?: Entry | null;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onClose, entryToEdit }) => {
  const { addEntry, updateEntry, getNewEntryCode, clients, productCatalog, users, currentUser } = useData();
  const isEditMode = !!entryToEdit;
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [items, setItems] = useState<Partial<EntryItem>[]>([]);

  const [formData, setFormData] = useState<Omit<Entry, 'code' | 'items'>>({
    date: new Date().toISOString().split('T')[0],
    whoInput: currentUser?.email || '',
    client: clients.length > 0 ? clients[0].name : '',
    status: Status.Recibida,
    photo: null,
  });
  
  useEffect(() => {
    if (isEditMode && entryToEdit) {
        setFormData({
            date: entryToEdit.date,
            whoInput: entryToEdit.whoInput,
            client: entryToEdit.client,
            status: entryToEdit.status,
            photo: entryToEdit.photo,
        });
        setItems(JSON.parse(JSON.stringify(entryToEdit.items))); // Deep copy
    } else {
        setItems([{
            description: '',
            reference1: '',
            reference2: '',
            sizeQuantities: SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
        }]);
    }
  }, [entryToEdit, isEditMode]);

  const availableProducts = useMemo(() => {
      const client = clients.find(c => c.name === formData.client);
      return productCatalog.filter(p => !p.clientId || p.clientId === client?.id);
  }, [productCatalog, formData.client, clients]);

  const handleAddItem = () => {
      setItems([...items, {
          description: '',
          reference1: '',
          reference2: '',
          sizeQuantities: SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
      }]);
  };
  
  const handleRemoveItem = (index: number) => {
      if (items.length > 1) {
          const newItems = items.filter((_, i) => i !== index);
          setItems(newItems);
      }
  };
  
  const handleProductDescriptionChange = (index: number, description: string) => {
    const newItems = [...items];
    const item = newItems[index];
    if (item) {
        item.description = description;
        const matchingProduct = availableProducts.find(p => p.modelName.toLowerCase() === description.toLowerCase());
        if (matchingProduct) {
            item.reference1 = matchingProduct.reference;
        }
    }
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: 'reference1' | 'reference2', value: any) => {
      const newItems = [...items];
      const item = newItems[index];
      if(item) {
        item[field] = value;
      }
      setItems(newItems);
  };


  const handleSizeChange = (itemIndex: number, size: string, value: string) => {
    const quantity = parseInt(value, 10);
    const newItems = [...items];
    const item = newItems[itemIndex];
    if (item && item.sizeQuantities) {
        item.sizeQuantities[size] = isNaN(quantity) ? 0 : quantity;
    }
    setItems(newItems);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handlePhotoCapture = (imageDataUrl: string) => {
    setFormData(prev => ({...prev, photo: imageDataUrl }));
    setCameraOpen(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client) {
        alert("Please create a client first.");
        return;
    }
    const finalItems = items.filter(item => item.description && item.description.trim() !== '');
    if (finalItems.length === 0) {
        alert("Please add at least one product to the entry.");
        return;
    }

    if (isEditMode && entryToEdit) {
        // When editing, we preserve the original status unless logic dictates otherwise
        // The automatic status calculation will handle the update in the context
        updateEntry({ ...formData, status: entryToEdit.status, code: entryToEdit.code, items: finalItems as EntryItem[] });
    } else {
        // New entries always start as 'Recibida'
        addEntry({ ...formData, status: Status.Recibida, items: finalItems as any });
    }
    onClose();
  };
  
  const statusColor = STATUS_COLORS[formData.status];
  const userColor = USER_COLORS[formData.whoInput];
  const clientColor = CLIENT_COLORS[formData.client];

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
        <Input label="Code" type="text" value={isEditMode ? entryToEdit.code : getNewEntryCode()} disabled className="bg-dark-tertiary" />
        
        <Select label="Who Input" name="whoInput" value={formData.whoInput} onChange={handleChange} valueColor={userColor}>
          {users.map(u => <option key={u.id} value={u.email} className="bg-dark-tertiary text-dark-text-primary">{u.fullName} ({u.email})</option>)}
        </Select>
        
        <Select label="Client" name="client" value={formData.client} onChange={handleChange} valueColor={clientColor}>
          {clients.map(c => <option key={c.id} value={c.name} className="bg-dark-tertiary text-dark-text-primary">{c.name}</option>)}
        </Select>
         
        <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">Status</label>
            <div className="mt-1 flex items-center h-10">
                <Badge className={statusColor}>{formData.status}</Badge>
            </div>
        </div>

        <div className="space-y-1">
            <label className="block text-sm font-medium text-dark-text-secondary mb-1">Photo</label>
            <div className="flex items-center gap-2">
                <Input label="" type="file" name="photo" onChange={handlePhotoChange} accept="image/*" className="w-full" />
                <Button type="button" variant="secondary" onClick={() => setCameraOpen(true)}>Take Photo</Button>
            </div>
            {formData.photo && <img src={formData.photo} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-md bg-dark-tertiary" />}
        </div>
      </div>
      
      <div className="space-y-4 pt-4 border-t border-dark-tertiary">
        <h3 className="text-lg font-medium text-dark-text-primary">Products in this Entry</h3>
        {items.map((item, index) => (
            <div key={item?.id || index} className="p-4 rounded-lg bg-dark-tertiary border border-slate-600 relative">
                 {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-300">
                        <TrashIcon />
                    </button>
                )}
                <div className="mb-4">
                    <Input
                        label={`Product ${index + 1}`}
                        value={item.description || ''}
                        onChange={(e) => handleProductDescriptionChange(index, e.target.value)}
                        list={`product-list-${index}`}
                        placeholder="Type a new or existing product name"
                        required
                    />
                    <datalist id={`product-list-${index}`}>
                        {availableProducts.map(p => <option key={p.code} value={p.modelName} />)}
                    </datalist>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input label="Ref 1" value={item.reference1} onChange={(e) => handleItemChange(index, 'reference1', e.target.value)} />
                    <Input label="Ref 2" value={item.reference2} onChange={(e) => handleItemChange(index, 'reference2', e.target.value)} />
                </div>

                <div>
                    <h4 className="text-md font-medium text-dark-text-secondary mb-2">Size-wise Quantities</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {SIZES.map(size => (
                            <Input key={size} label={size} type="number" min="0" value={item.sizeQuantities?.[size] || ''} onChange={e => handleSizeChange(index, size, e.target.value)} />
                        ))}
                    </div>
                </div>
            </div>
        ))}
        {!isEditMode && <Button type="button" variant="secondary" onClick={handleAddItem}>+ Add Another Product</Button>}
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-dark-tertiary mt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">{isEditMode ? 'Save Changes' : 'Add Entry'}</Button>
      </div>
    </form>
    
    <CameraCaptureModal
        isOpen={isCameraOpen}
        onCapture={handlePhotoCapture}
        onClose={() => setCameraOpen(false)}
    />
    </>
  );
};


interface DeliveryFormProps {
  onClose: () => void;
  entryCode: number | null;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({ onClose, entryCode }) => {
    const { addDelivery, getEntryByCode, getRemainingQuantitiesForItem, users } = useData();
    const [entry, setEntry] = useState<Entry | undefined>(undefined);
    const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
    
    const [formData, setFormData] = useState<{ deliveryDate: string, whoDelivered: string }>({
        deliveryDate: new Date().toISOString().split('T')[0],
        whoDelivered: users.length > 0 ? users[0].email : '',
    });

    useEffect(() => {
        if (entryCode) {
            const currentEntry = getEntryByCode(entryCode);
            setEntry(currentEntry);
            if (currentEntry) {
                const initialDeliveryItems = currentEntry.items.map(item => ({
                    entryItemId: item.id,
                    deliveryQuantities: SIZES.reduce((acc, size) => ({...acc, [size]: 0}), {}),
                }));
                setDeliveryItems(initialDeliveryItems);
            }
        }
    }, [entryCode, getEntryByCode]);

    const handleSizeChange = (itemIndex: number, size: string, value: string) => {
        const quantity = parseInt(value, 10) || 0;
        if (!entry) return;

        const entryItem = entry.items[itemIndex];
        if(!entryItem) return;
        
        const remaining = getRemainingQuantitiesForItem(entry, entryItem.id);
        const maxQuantity = remaining[size] || 0;
        
        if (quantity > maxQuantity) {
            alert(`Cannot deliver more than the remaining quantity of ${maxQuantity} for size ${size}.`);
            return;
        }
        const newDeliveryItems = [...deliveryItems];
        if (newDeliveryItems[itemIndex]) {
          newDeliveryItems[itemIndex].deliveryQuantities[size] = quantity;
          setDeliveryItems(newDeliveryItems);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!entryCode) return;

        const itemsWithQuantities = deliveryItems
            .map(item => ({
                ...item,
                total: Object.values(item.deliveryQuantities).reduce((sum, q) => sum + (Number(q) || 0), 0)
            }))
            .filter(item => item.total > 0)
            .map(({total, ...rest}) => rest);

        if (itemsWithQuantities.length === 0) {
            alert('Please enter at least one delivery quantity.');
            return;
        }

        addDelivery({
            code: entryCode,
            deliveryDate: formData.deliveryDate,
            whoDelivered: formData.whoDelivered,
            items: itemsWithQuantities,
        });
        onClose();
    };

    if (!entry) {
        return <p className="text-dark-text-secondary">Loading entry details...</p>;
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-dark-tertiary rounded-lg">
                <Input label="Delivery Date" type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required />
                <Select label="Who Delivered" name="whoDelivered" value={formData.whoDelivered} onChange={handleChange}>
                    {users.map(u => <option key={u.id} value={u.email} className="bg-dark-tertiary text-dark-text-primary">{u.fullName}</option>)}
                </Select>
                <div>
                    <p className="text-sm font-medium text-dark-text-secondary">Entry Code</p>
                    <p className="text-lg font-bold text-dark-text-primary mt-1">{entry.code}</p>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-dark-tertiary">
                <h3 className="text-lg font-medium text-dark-text-primary">Delivery Quantities</h3>
                {entry.items.map((item, index) => {
                    const remaining = getRemainingQuantitiesForItem(entry, item.id);
                    const totalRemaining = Object.values(remaining).reduce((sum, q) => sum + (q || 0), 0);
                    if (totalRemaining === 0) return null; // Don't show fully delivered items

                    return (
                        <div key={item.id} className="p-4 rounded-lg bg-dark-tertiary border border-slate-600">
                            <p className="font-semibold text-amber-400">{item.description}</p>
                            <p className="text-xs text-dark-text-secondary mb-2">
                                Ref: {item.reference1} {item.reference2 && `/ ${item.reference2}`}
                            </p>
                            
                            <div>
                                <h4 className="text-md font-medium text-dark-text-secondary mb-2">Enter quantities to deliver:</h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                    {SIZES.map(size => {
                                        const remainingForSize = remaining[size] || 0;
                                        if (remainingForSize > 0) {
                                            return (
                                                <Input 
                                                    key={size} 
                                                    label={size} 
                                                    type="number" 
                                                    min="0"
                                                    max={remainingForSize}
                                                    placeholder={`Max: ${remainingForSize}`}
                                                    value={deliveryItems[index]?.deliveryQuantities[size] || ''} 
                                                    onChange={e => handleSizeChange(index, size, e.target.value)} 
                                                />
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-dark-tertiary mt-4">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Add Delivery</Button>
            </div>
        </form>
    );
};
