export enum Status {
  Recibida = 'Recibida',
  EnProceso = 'En proceso',
  Entregada = 'Entregada',
  Prefacturado = 'Prefacturado',
}

export type Role = 'admin' | 'user' | 'manager';

export interface User {
  id: number;
  username: string;
  password?: string;
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  webAuthnCredentialId?: string;
  isApproved: boolean;
}

export interface CompanyDetails {
    name: string;
    address: string;
    phone: string;
    email: string;
    vatNumber: string;
    logo: string | null;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  vatNumber: string;
  logo: string | null;
}

export interface Product {
  modelName: string;
  code: string;
  reference: string;
  price: number;
  category: string;
  description: string;
  clientId?: string;
}

export interface SizeQuantities {
  [size: string]: number;
}

export interface EntryItem {
    id: string;
    productId: string;
    description: string;
    reference1: string;
    reference2: string;
    sizeQuantities: SizeQuantities;
    unitPrice: number;
}

export interface Entry {
  code: number;
  date: string;
  whoInput: string;
  client: string;
  status: Status;
  photo: string | null;
  items: EntryItem[];
}

export interface DeliveryItem {
    entryItemId: string;
    deliveryQuantities: SizeQuantities;
}

export interface Delivery {
  deliveryId: string;
  code: number;
  deliveryDate: string;
  whoDelivered: string;
  items: DeliveryItem[];
}


export interface FaltaEntry extends Entry {
  recibidaQuantity: number;
  deliveredQuantity: number;
  remainingQuantity: number;
}

export interface DocumentItem {
    entryCode: number;
    productCode: string;
    description: string;
    reference1: string;
    reference2: string;
    clientName: string;
    recibidaQuantity: number;
    entregadaQuantity: number;
    faltaQuantity: number;
    status: Status;
    deliveryBreakdown: { date: string; qty: number }[];
    unitPrice: number;
    total: number;
}

export type DocumentType = 'Prefactura' | 'Factura';

export interface Document {
    id: string;
    documentNumber: string;
    documentType: DocumentType;
    clientId: string;
    date: string;
    items: DocumentItem[];
    subtotal: number;
    surcharge: number;
    taxRate: number;
    taxAmount: number;
    total: number;
}

export type DateRangePreset = 'all' | 'today' | 'yesterday' | 'last7' | 'last15' | 'last30';

export interface FilterState {
  dateRange: DateRangePreset | 'custom';
  clientId: string;
  status: 'all' | Status;
  startDate: string;
  endDate: string;
}


export interface DataContextType {
  entries: Entry[];
  deliveries: Delivery[];
  productCatalog: Product[];
  clients: Client[];
  documents: Document[];
  companyDetails: CompanyDetails;
  users: User[];
  currentUser: User | null;
  simulatedRole: Role | null;
  setSimulatedRole: (role: Role | null) => void;
  login: (username: string, password?: string) => Promise<{ success: boolean; message: string; }>;
  logout: () => void;
  signUp: (userData: Omit<User, 'id' | 'role' | 'webAuthnCredentialId' | 'isApproved'>) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; code?: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateUserRole: (userId: number, role: 'admin' | 'user' | 'manager') => void;
  approveUser: (userId: number) => void;
  registerBiometrics: () => Promise<void>;
  loginWithBiometrics: () => Promise<{ success: boolean; message: string; }>;
  addEntry: (entry: Omit<Entry, 'code' | 'items'> & { items: (Partial<Omit<EntryItem, 'id' | 'unitPrice'>> & { description: string })[] }) => void;
  updateEntry: (entry: Entry) => void;
  deleteEntry: (code: number) => void;
  deleteMultipleEntries: (codes: number[]) => Promise<void>;
  addDelivery: (delivery: Omit<Delivery, 'deliveryId'>) => void;
  updateEntryStatus: (code: number, status: Status) => void;
  getNewEntryCode: () => number;
  getEntryByCode: (code: number) => Entry | undefined;
  getFaltaEntries: () => FaltaEntry[];
  isAdmin: boolean;
  getCalculatedQuantities: (entry: Entry) => { recibidaQuantity: number, deliveredQuantity: number, remainingQuantity: number };
  getCalculatedQuantitiesForItem: (entryItem: EntryItem, entryCode: number) => { recibidaQuantity: number, deliveredQuantity: number, faltaQuantity: number };
  getDeliveryBreakdownForItem: (entryItem: EntryItem, entryCode: number) => { date: string; qty: number }[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (code: string) => void;
  deleteMultipleProducts: (codes: string[]) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  deleteMultipleClients: (ids: string[]) => Promise<void>;
  updateCompanyDetails: (details: CompanyDetails) => void;
  getClientByName: (name: string) => Client | undefined;
  saveDocument: (doc: Document) => void;
  deleteDocument: (id: string) => void;
  deleteMultipleDocuments: (ids: string[]) => Promise<void>;
  getNewDocumentNumber: (type: DocumentType) => string;
  getEntryFinancials: (entry: Entry) => { totalPrice: number; averageUnitPrice: number; };
  getRevenueData: (filteredEntries: Entry[]) => number;
  getLatestDeliveryDateForEntry: (entryCode: number) => string;
  getRemainingQuantitiesForItem: (entry: Entry, entryItemId: string) => SizeQuantities;
}

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

export interface SelectableTableProps<T extends { [key: string]: any }> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  onDeleteMany?: (ids: (string | number)[]) => Promise<void>;
  renderBulkActions?: (selectedIds: (string | number)[]) => React.ReactNode;
  canSelect?: boolean;
}