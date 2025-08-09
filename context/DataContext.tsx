

import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import { Entry, Delivery, Status, FaltaEntry, Product, SizeQuantities, Client, CompanyDetails, Document, DocumentItem, DocumentType, EntryItem, DeliveryItem, User, DataContextType, Role, Session } from '../types';
import { INITIAL_ENTRIES, INITIAL_DELIVERIES, INITIAL_PRODUCTS, INITIAL_CLIENTS, INITIAL_COMPANY_DETAILS, SIZES, INITIAL_USERS } from '../constants';
import { useAuth } from './AuthContext';


const getSumOfQuantities = (quantities: SizeQuantities): number => {
  if (!quantities) return 0;
  return Object.values(quantities).reduce((sum, q) => sum + (Number(q) || 0), 0);
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  
  // Load initial state from localStorage or use constants
  const [entries, setEntries] = useState<Entry[]>(() => JSON.parse(localStorage.getItem('entries') || 'null') || INITIAL_ENTRIES);
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => JSON.parse(localStorage.getItem('deliveries') || 'null') || INITIAL_DELIVERIES);
  const [productCatalog, setProductCatalog] = useState<Product[]>(() => JSON.parse(localStorage.getItem('productCatalog') || 'null') || INITIAL_PRODUCTS);
  const [clients, setClients] = useState<Client[]>(() => JSON.parse(localStorage.getItem('clients') || 'null') || INITIAL_CLIENTS);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(() => JSON.parse(localStorage.getItem('companyDetails') || 'null') || INITIAL_COMPANY_DETAILS);
  const [documents, setDocuments] = useState<Document[]>(() => JSON.parse(localStorage.getItem('documents') || 'null') || []);
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('users') || 'null') || INITIAL_USERS);
  
  const currentUser = useMemo(() => {
    if (!authUser) return null;
    return users.find(u => u.username === authUser.email) || null;
  }, [authUser, users]);

  // Save to localStorage whenever state changes, but strip out large image data to prevent quota errors.
  useEffect(() => {
    const entriesToSave = entries.map(entry => ({ ...entry, photo: null }));
    localStorage.setItem('entries', JSON.stringify(entriesToSave));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  useEffect(() => {
    localStorage.setItem('productCatalog', JSON.stringify(productCatalog));
  }, [productCatalog]);

  useEffect(() => {
    const clientsToSave = clients.map(client => ({ ...client, logo: null }));
    localStorage.setItem('clients', JSON.stringify(clientsToSave));
  }, [clients]);

  useEffect(() => {
    const companyDetailsToSave = { ...companyDetails, logo: null };
    localStorage.setItem('companyDetails', JSON.stringify(companyDetailsToSave));
  }, [companyDetails]);

  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const isAdmin = useMemo(() => currentUser?.role === 'admin', [currentUser]);
  const isManager = useMemo(() => currentUser?.role === 'admin' || currentUser?.role === 'manager', [currentUser]);

  const updateUserRole = useCallback((userId: number, role: 'admin' | 'user' | 'manager') => {
    setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, role } : u));
  }, []);

  const deleteUser = useCallback((userId: number) => {
    if (currentUser?.id === userId) {
        console.error("Cannot delete the currently logged-in user.");
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, [currentUser]);
  
    const getRemainingQuantitiesForItem = useCallback((entry: Entry, entryItemId: string): SizeQuantities => {
    const entryItem = entry.items.find(i => i.id === entryItemId);
    if (!entryItem) return {};

    const receivedQuantities = entryItem.sizeQuantities;

    const deliveredQuantitiesForThisItem: SizeQuantities = SIZES.reduce((acc, size) => ({...acc, [size]: 0}), {});
    deliveries
      .filter(d => d.code === entry.code)
      .forEach(delivery => {
        delivery.items.forEach(deliveryItem => {
          if (deliveryItem.entryItemId === entryItemId) {
            Object.entries(deliveryItem.deliveryQuantities).forEach(([size, qty]) => {
              deliveredQuantitiesForThisItem[size] = (deliveredQuantitiesForThisItem[size] || 0) + qty;
            });
          }
        });
      });
    
    const remaining: SizeQuantities = {};
    Object.keys(receivedQuantities).forEach(size => {
      remaining[size] = (receivedQuantities[size] || 0) - (deliveredQuantitiesForThisItem[size] || 0);
    });

    return remaining;

  }, [deliveries]);

    const getCalculatedQuantities = useCallback((entry: Entry) => {
        let recibidaQuantity = 0;
        let deliveredQuantity = 0;
        
        if (entry && entry.items) {
          for (const item of entry.items) {
            recibidaQuantity += getSumOfQuantities(item.sizeQuantities);
          }
        }

        const entryDeliveries = deliveries.filter(d => d.code === entry.code);
        if(entryDeliveries.length > 0){
          for (const delivery of entryDeliveries) {
            for (const item of delivery.items) {
              deliveredQuantity += getSumOfQuantities(item.deliveryQuantities);
            }
          }
        }
        
        const remainingQuantity = recibidaQuantity - deliveredQuantity;
        return { recibidaQuantity, deliveredQuantity, remainingQuantity };
    }, [deliveries]);

    const getCalculatedQuantitiesForItem = useCallback((entryItem: EntryItem, entryCode: number) => {
        const recibidaQuantity = getSumOfQuantities(entryItem.sizeQuantities);
        
        const deliveredQuantity = deliveries
            .filter(d => d.code === entryCode)
            .flatMap(d => d.items)
            .filter(item => item.entryItemId === entryItem.id)
            .reduce((sum, item) => sum + getSumOfQuantities(item.deliveryQuantities), 0);

        const faltaQuantity = recibidaQuantity - deliveredQuantity;
        return { recibidaQuantity, deliveredQuantity, faltaQuantity };
    }, [deliveries]);
    
    const getDeliveryBreakdownForItem = useCallback((entryItem: EntryItem, entryCode: number) => {
        const breakdown: { [date: string]: number } = {};
        deliveries
            .filter(d => d.code === entryCode)
            .forEach(delivery => {
                const itemDelivery = delivery.items.find(item => item.entryItemId === entryItem.id);
                if (itemDelivery) {
                    const deliveredOnDate = getSumOfQuantities(itemDelivery.deliveryQuantities);
                    const dateKey = new Date(delivery.deliveryDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    breakdown[dateKey] = (breakdown[dateKey] || 0) + deliveredOnDate;
                }
            });
        return Object.entries(breakdown).map(([date, qty]) => ({ date, qty }));
    }, [deliveries]);
  
  const getFaltaEntries = useCallback((): FaltaEntry[] => {
    return entries
        .map(entry => {
            const quantities = getCalculatedQuantities(entry);
            return { ...entry, ...quantities };
        })
        .filter(entry => entry.remainingQuantity > 0 && entry.status !== Status.Entregada);
  }, [entries, getCalculatedQuantities]);
  
  const getNewEntryCode = useCallback(() => {
    if (entries.length === 0) return 1;
    return Math.max(...entries.map(e => e.code)) + 1;
  }, [entries]);

  const resolveProductAndPrice = (
      description: string,
      entryClientName: string,
      currentProductCatalog: Product[],
      clients: Client[]
  ): { product: Product | null; price: number } => {
      const entryClient = clients.find(c => c.name === entryClientName);
      const matchingProducts = currentProductCatalog.filter(
          p => p.modelName.toLowerCase() === description.toLowerCase()
      );

      if (matchingProducts.length === 0) {
          return { product: null, price: 0 };
      }

      const clientSpecificProduct = entryClient ? matchingProducts.find(p => p.clientId === entryClient.id) : undefined;
      if (clientSpecificProduct) {
          return { product: clientSpecificProduct, price: clientSpecificProduct.price };
      }

      const generalProduct = matchingProducts.find(p => !p.clientId);
      if (generalProduct) {
          return { product: generalProduct, price: generalProduct.price };
      }
      
      return { product: matchingProducts[0], price: 0 };
  };

  const processEntryItems = (items: any[], clientName: string, currentProductCatalog: Product[]) => {
      let tempCatalog = [...currentProductCatalog];
      const newProductsToSave: Product[] = [];

      const processedItems: EntryItem[] = items.map(item => {
          if (!item.description) throw new Error("Item description cannot be empty.");

          let { product, price } = resolveProductAndPrice(item.description, clientName, tempCatalog, clients);

          if (!product) {
              const newProductCode = `P${(1000 + tempCatalog.length).toString()}`;
              product = {
                  modelName: item.description,
                  code: newProductCode,
                  reference: '',
                  price: 0,
                  category: 'Uncategorized',
                  description: item.description,
              };
              newProductsToSave.push(product);
              tempCatalog.push(product);
              price = 0;
          }

          return {
              id: item.id || crypto.randomUUID(),
              productId: product.code,
              description: item.description,
              reference1: item.reference1 || product.reference || '',
              reference2: item.reference2 || '',
              sizeQuantities: item.sizeQuantities || {},
              unitPrice: price
          };
      });

      return { processedItems, newProductsToSave };
  };
  
  const addEntry = useCallback((entryData: Omit<Entry, 'code' | 'items'> & { items: (Partial<Omit<EntryItem, 'id' | 'unitPrice'>> & { description: string })[] }) => {
      const { processedItems, newProductsToSave } = processEntryItems(entryData.items, entryData.client, productCatalog);
      
      if (newProductsToSave.length > 0) {
        setProductCatalog(prev => [...prev, ...newProductsToSave]);
      }
      
      const newEntry: Entry = { ...entryData, code: getNewEntryCode(), items: processedItems, status: Status.Recibida };
      setEntries(prev => [...prev, newEntry]);
  }, [productCatalog, clients, getNewEntryCode]);

  const updateEntry = useCallback((updatedEntryData: Entry) => {
      const { processedItems, newProductsToSave } = processEntryItems(updatedEntryData.items, updatedEntryData.client, productCatalog);
      
      if (newProductsToSave.length > 0) {
        setProductCatalog(prev => [...prev, ...newProductsToSave]);
      }

      const finalEntry = { ...updatedEntryData, items: processedItems };
      setEntries(prev => prev.map(e => e.code === finalEntry.code ? finalEntry : e));
  }, [productCatalog, clients]);


  const deleteEntry = useCallback((code: number) => {
    setEntries(prev => prev.filter(e => e.code !== code));
    setDeliveries(prev => prev.filter(d => d.code !== code));
  }, []);

  const deleteMultipleEntries = useCallback(async (codes: number[]) => {
    const codeSet = new Set(codes);
    setEntries(prev => prev.filter(e => !codeSet.has(e.code)));
    setDeliveries(prev => prev.filter(d => !codeSet.has(d.code)));
  }, []);
  
  const addDelivery = useCallback((delivery: Omit<Delivery, 'deliveryId'>) => {
      setDeliveries(prev => [...prev, { ...delivery, deliveryId: crypto.randomUUID() }]);
  }, []);
  
  const updateEntryStatus = useCallback((code: number, status: Status) => {
    setEntries(prev => prev.map(e => e.code === code ? { ...e, status } : e));
  }, []);

  const getEntryByCode = useCallback((code: number) => entries.find(e => e.code === code), [entries]);

  const addProduct = useCallback((product: Product) => {
    setProductCatalog(prev => [...prev, product]);
  }, []);
  
  const updateProduct = useCallback((product: Product) => {
    setProductCatalog(prev => prev.map(p => p.code === product.code ? product : p));
    setEntries(prevEntries =>
      prevEntries.map(entry => {
        const hasProduct = entry.items.some(item => item.productId === product.code);
        if (!hasProduct) return entry;
        
        const newPrice = resolveProductAndPrice(product.modelName, entry.client, [product, ...productCatalog.filter(p => p.code !== product.code)], clients).price;
        
        return {
          ...entry,
          items: entry.items.map(item =>
            item.productId === product.code
              ? { ...item, unitPrice: newPrice }
              : item
          ),
        };
      })
    );
  }, [clients, productCatalog]);

  const deleteProduct = useCallback((code: string) => {
      setProductCatalog(prev => prev.filter(p => p.code !== code));
  }, []);
  
  const deleteMultipleProducts = useCallback(async (codes: string[]) => {
      const codeSet = new Set(codes);
      setProductCatalog(prev => prev.filter(p => !codeSet.has(p.code)));
  }, []);

  const addClient = useCallback((client: Omit<Client, 'id'>) => {
      const newClient = { ...client, id: `cli_${client.name.toLowerCase().replace(/\s+/g, '')}` };
      setClients(prev => [...prev, newClient]);
  }, []);
  
  const updateClient = useCallback((client: Client) => {
      setClients(prev => prev.map(c => c.id === client.id ? client : c));
  }, []);
  
  const deleteClient = useCallback((id: string) => {
      setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  const deleteMultipleClients = useCallback(async (ids: string[]) => {
    const idSet = new Set(ids);
    setClients(prev => prev.filter(c => !idSet.has(c.id)));
  }, []);

  const updateCompanyDetails = useCallback((details: CompanyDetails) => {
      setCompanyDetails(details);
  }, []);

  const getClientByName = useCallback((name: string) => clients.find(c => c.name === name), [clients]);

  const getNewDocumentNumber = useCallback((type: DocumentType) => {
    const prefix = type === 'Prefactura' ? 'PF' : 'F';
    const relevantDocs = documents.filter(d => d.documentType === type);
    const maxNum = relevantDocs.reduce((max, doc) => {
        const numPart = parseInt(doc.documentNumber.split('-')[1], 10);
        return isNaN(numPart) ? max : Math.max(max, numPart);
    }, 0);
    return `${prefix}-${(maxNum + 1).toString().padStart(4, '0')}`;
  }, [documents]);

  const saveDocument = useCallback((doc: Document) => {
      setDocuments(prev => {
          const existingIndex = prev.findIndex(d => d.id === doc.id);
          if (existingIndex !== -1) {
              const updatedDocs = [...prev];
              updatedDocs[existingIndex] = doc;
              return updatedDocs;
          } else {
             const newDoc = { ...doc };
             if(newDoc.id === 'new-draft') newDoc.id = crypto.randomUUID();
             return [...prev, newDoc];
          }
      });

      if (doc.documentType === 'Prefactura') {
          const entryCodesInDoc = new Set(doc.items.map(item => item.entryCode));
          setEntries(prev => prev.map(entry => {
              if (entryCodesInDoc.has(entry.code) && entry.status !== Status.Prefacturado) {
                  return { ...entry, status: Status.Prefacturado };
              }
              return entry;
          }));
      }
  }, []);
  
  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const deleteMultipleDocuments = useCallback(async (ids: string[]) => {
    const idSet = new Set(ids);
    setDocuments(prev => prev.filter(doc => !idSet.has(doc.id)));
  }, []);
  
  const getEntryFinancials = useCallback((entry: Entry) => {
    const totalPrice = entry.items.reduce((sum, item) => sum + (getSumOfQuantities(item.sizeQuantities) * item.unitPrice), 0);
    const totalQuantity = entry.items.reduce((sum, item) => sum + getSumOfQuantities(item.sizeQuantities), 0);
    const averageUnitPrice = totalQuantity > 0 ? totalPrice / totalQuantity : 0;
    return { totalPrice, averageUnitPrice };
  }, []);
  
  const getRevenueData = useCallback((filteredEntries: Entry[]) => {
      const billableEntries = filteredEntries.filter(e => 
          e.status === Status.Entregada || e.status === Status.Prefacturado
      );
      return billableEntries.reduce((total, entry) => {
          const { totalPrice } = getEntryFinancials(entry);
          return total + totalPrice;
      }, 0);
  }, [getEntryFinancials]);

  const getLatestDeliveryDateForEntry = useCallback((entryCode: number) => {
      const entryDeliveries = deliveries.filter(d => d.code === entryCode);
      if (entryDeliveries.length === 0) return new Date().toISOString();
      entryDeliveries.sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime());
      return entryDeliveries[0].deliveryDate;
  }, [deliveries]);
  
  useEffect(() => {
    const updatedEntries = entries.map(entry => {
        // Only auto-update if status is not manually set to a final state by an admin
        if (entry.status === Status.Recibida || entry.status === Status.EnProceso) {
            const { recibidaQuantity, deliveredQuantity } = getCalculatedQuantities(entry);
            
            let newStatus: Status;
            if (deliveredQuantity === 0) {
                newStatus = Status.Recibida;
            } else if (deliveredQuantity > 0 && deliveredQuantity < recibidaQuantity) {
                newStatus = Status.EnProceso;
            } else if (deliveredQuantity > 0 && deliveredQuantity >= recibidaQuantity) {
                newStatus = Status.Entregada;
            } else {
                newStatus = entry.status; // No change if conditions not met
            }
            
            if (newStatus !== entry.status) {
                return { ...entry, status: newStatus };
            }
        }
        return entry;
    });
    
    // Only update state if there's an actual change to prevent infinite loops
    if (JSON.stringify(updatedEntries) !== JSON.stringify(entries)) {
      setEntries(updatedEntries);
    }
  }, [deliveries, entries, getCalculatedQuantities]);


  return (
    <DataContext.Provider value={{ 
        entries, deliveries, productCatalog, clients, companyDetails, documents, users, currentUser, updateUserRole, deleteUser, addEntry, updateEntry, deleteEntry, deleteMultipleEntries, addDelivery, updateEntryStatus, getNewEntryCode, getEntryByCode, getFaltaEntries, 
        isAdmin, isManager, getCalculatedQuantities, getCalculatedQuantitiesForItem, getDeliveryBreakdownForItem, addProduct, updateProduct, deleteProduct, deleteMultipleProducts, addClient, updateClient, deleteClient, deleteMultipleClients, updateCompanyDetails, getClientByName, saveDocument,
        deleteDocument, deleteMultipleDocuments, getNewDocumentNumber, getEntryFinancials, getRevenueData, getLatestDeliveryDateForEntry, getRemainingQuantitiesForItem
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};