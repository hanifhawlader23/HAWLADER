
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
  [Status.Recibida]: 'bg-yellow-200 text-yellow-800',
  [Status.EnProceso]: 'bg-blue-200 text-blue-800',
  [Status.Entregada]: 'bg-green-200 text-green-800',
  [Status.Prefacturado]: 'bg-purple-200 text-purple-800',
};

export const USER_COLORS: Record<string, string> = {
    'admin@hawlader.eu': 'bg-red-200 text-red-800',
    'asad@hawlader.eu': 'bg-blue-200 text-blue-800',
    'hanif@hawlader.eu': 'bg-green-200 text-green-800',
    'choton@hawlader.eu': 'bg-yellow-200 text-yellow-800',
    'johurul@hawlader.eu': 'bg-purple-200 text-purple-800',
};

export const CLIENT_COLORS: Record<string, string> = {
    'AUSTRAL': 'bg-red-200 text-red-800',
    'KON SPORT': 'bg-sky-200 text-sky-800',
    'USOA': 'bg-indigo-200 text-indigo-800',
};

export const CHART_COLORS = ['#f59e0b', '#16a34a', '#3b82f6', '#9333ea', '#db2777', '#ef4444', '#f97316', '#10b981', '#06b6d4'];


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
