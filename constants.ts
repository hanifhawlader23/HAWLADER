

import { Status, User, Product, Entry, Delivery, Client, CompanyDetails } from './types';

export const SIZES: string[] = ['0', '2', '4', '6', '8', '10', '12', '14', '16', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '8XL', '10XL'];

export const INITIAL_USERS: User[] = [
  { id: 1, username: 'admin@hawlader.eu', password: 'admin', role: 'admin', fullName: 'Admin User', email: 'admin@hawlader.eu', phone: '111222333' },
  { id: 2, username: 'asad@hawlader.eu', password: 'asad', role: 'user', fullName: 'Asad Ahmed', email: 'asad@hawlader.eu', phone: '123456789' },
  { id: 3, username: 'hanif@hawlader.eu', password: 'hanif', role: 'admin', fullName: 'Hanif Hawlader', email: 'hanif@hawlader.eu', phone: '987654321' },
  { id: 4, username: 'choton@hawlader.eu', password: 'choton', role: 'user', fullName: 'Choton Khan', email: 'choton@hawlader.eu', phone: '112233445' },
  { id: 5, username: 'johurul@hawlader.eu', password: 'johurul', role: 'user', fullName: 'Johurul Islam', email: 'johurul@hawlader.eu', phone: '556677889' },
];

export const STATUS_COLORS: Record<Status, string> = {
  [Status.Recibida]: 'bg-blue-500 text-white font-semibold',
  [Status.EnProceso]: 'bg-yellow-400 text-deep-rose font-semibold',
  [Status.Entregada]: 'bg-green-500 text-white font-semibold',
  [Status.Prefacturado]: 'bg-sky-500 text-white font-semibold',
};

export const USER_COLORS: Record<string, string> = {
    'admin@hawlader.eu': 'bg-rose-gold-base/20 text-deep-rose',
    'asad@hawlader.eu': 'bg-light-rose-gold text-deep-rose',
    'hanif@hawlader.eu': 'bg-rose-gold-base/30 text-deep-rose',
    'choton@hawlader.eu': 'bg-metallic-rose text-deep-rose',
    'johurul@hawlader.eu': 'bg-deep-rose/20 text-deep-rose',
};

export const CLIENT_COLOR_PALETTE: string[] = [
    'bg-teal-500 text-white ring-teal-700',
    'bg-indigo-500 text-white ring-indigo-700',
    'bg-amber-500 text-white ring-amber-700',
    'bg-lime-600 text-white ring-lime-800',
    'bg-fuchsia-600 text-white ring-fuchsia-800',
    'bg-cyan-500 text-white ring-cyan-700',
    'bg-emerald-500 text-white ring-emerald-700',
    'bg-violet-500 text-white ring-violet-700',
    'bg-sky-500 text-white ring-sky-700',
    'bg-rose-500 text-white ring-rose-700',
];

export const getClientColorClass = (clientName: string, allClients: {name: string}[]): string => {
    // Sort clients alphabetically by name to ensure consistent color assignment
    const sortedClients = [...allClients].sort((a, b) => a.name.localeCompare(b.name));
    const clientIndex = sortedClients.findIndex(c => c.name === clientName);
    
    if (clientIndex === -1) {
        // Fallback for unknown clients
        return 'bg-gray-400 text-white ring-gray-600 ring-1 ring-inset';
    }
    const colorClass = CLIENT_COLOR_PALETTE[clientIndex % CLIENT_COLOR_PALETTE.length];
    return `${colorClass} ring-1 ring-inset`;
};


export const CHART_COLORS = {
    BLUE: '#3B82F6',
    GREEN: '#10B981',
    ORANGE: '#F59E0B',
    GRAY: '#94A3B8'
};


export const INITIAL_COMPANY_DETAILS: CompanyDetails = {
    name: 'HAWLADER S.L',
    address: 'CALLE SAN CAMILO,3 LOC, 28931 MOSTOLES (MADRID), ESPAÑA',
    phone: '631099217',
    email: 'facturas@hawlader.eu',
    vatNumber: 'B72863920',
    logo: null,
};

export const INITIAL_PRODUCTS: Product[] = [
  { modelName: 'Summer T-Shirt', code: 'TS001', reference: 'REF01', price: 15.50, category: 'Tops', description: 'Lightweight cotton t-shirt for summer.' },
  { modelName: 'Winter Hoodie', code: 'HD002', reference: 'REF02', price: 45.00, category: 'Outerwear', description: 'Fleece-lined warm hoodie.' },
  { modelName: 'Sports Jersey (USOA)', code: 'SJ003', reference: 'REF03', price: 32.00, category: 'Sportswear', description: 'Breathable-fabric sports jersey for USOA.', clientId: 'cli_usoa' },
  { modelName: 'Denim Jeans', code: 'JN004', reference: 'REF04', price: 60.00, category: 'Pants', description: 'Classic straight-fit denim jeans.' },
];

// Initial data for demonstration
export const INITIAL_ENTRIES: Entry[] = [
    { 
      code: 1, 
      date: '2023-10-01T10:00:00.000Z', 
      whoInput: 'asad@hawlader.eu', 
      client: 'AUSTRAL', 
      status: Status.Entregada, 
      photo: null, 
      items: [
        { id: 'item-1-1', productId: 'TS001', description: 'Summer T-Shirt Batch 1', reference1: 'REF01', reference2: '', sizeQuantities: { 'S': 50, 'M': 100, 'L': 50 }, unitPrice: 15.50 }
      ]
    },
    { 
      code: 2, 
      date: '2023-10-05T11:00:00.000Z', 
      whoInput: 'hanif@hawlader.eu', 
      client: 'KON SPORT', 
      status: Status.EnProceso, 
      photo: null, 
      items: [
        { id: 'item-2-1', productId: 'HD002', description: 'Winter Hoodie Batch 1', reference1: 'REF02', reference2: 'URGENT', sizeQuantities: { 'M': 75, 'L': 75, 'XL': 50 }, unitPrice: 45.00 }
      ]
    },
    { 
      code: 3, 
      date: '2023-10-10T12:00:00.000Z', 
      whoInput: 'choton@hawlader.eu', 
      client: 'USOA', 
      status: Status.Recibida, 
      photo: null, 
      items: [
        { id: 'item-3-1', productId: 'SJ003', description: 'Sports Jersey Batch 1', reference1: 'REF03', reference2: '', sizeQuantities: { 'S': 100, 'M': 100 }, unitPrice: 32.00 }
      ]
    },
    { 
      code: 4, 
      date: '2023-10-15T13:00:00.000Z', 
      whoInput: 'johurul@hawlader.eu', 
      client: 'AUSTRAL', 
      status: Status.Prefacturado, 
      photo: null, 
      items: [
        { id: 'item-4-1', productId: 'JN004', description: 'Denim Jeans Batch 1', reference1: 'REF04', reference2: '', sizeQuantities: { '32': 50, '34': 100, '36': 50 }, unitPrice: 60.00 },
        { id: 'item-4-2', productId: 'TS001', description: 'Extra T-shirts', reference1: 'REF01', reference2: 'ADD-ON', sizeQuantities: { 'S': 20 }, unitPrice: 15.50 }
      ]
    },
];

export const INITIAL_DELIVERIES: Delivery[] = [
    { deliveryId: 'd1', code: 1, deliveryDate: '2023-10-03T14:00:00.000Z', whoDelivered: 'asad@hawlader.eu', items: [{ entryItemId: 'item-1-1', deliveryQuantities: { 'S': 50, 'M': 50 } }] },
    { deliveryId: 'd2', code: 2, deliveryDate: '2023-10-07T15:00:00.000Z', whoDelivered: 'hanif@hawlader.eu', items: [{ entryItemId: 'item-2-1', deliveryQuantities: { 'M': 50, 'L': 25 } }] },
];

export const INITIAL_CLIENTS: Client[] = [
    { id: 'cli_austral', name: 'AUSTRAL', address: 'CALLE ALDECOA,10 28945,FUENLABRADA(MADRID),ESPAÑA', email: 'austral@central.es', phone: '671038221', vatNumber: 'B83199121', logo: null },
    { id: 'cli_konsport', name: 'KON SPORT', address: '456 Sportif Blvd, Paris, FR', email: 'info@konsport.fr', phone: '234-567-8901', vatNumber: 'FR987654321', logo: null },
    { id: 'cli_usoa', name: 'USOA', address: '789 Eagle Rd, New York, US', email: 'purchasing@usoa.com', phone: '345-678-9012', vatNumber: 'US-VAT-XYZ', logo: null },
];