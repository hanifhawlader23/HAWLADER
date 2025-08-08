
import React, { useEffect, useState } from 'react';
import { Document, Client, Status } from '../types';
import { Button, Input, Textarea, Badge } from './ui';
import { useData } from '../context/DataContext';
import { STATUS_COLORS } from '../constants';

interface DocumentTemplateProps {
  document: Document;
  isEditing?: boolean;
  onItemChange?: (index: number, field: keyof any, value: any) => void;
  onTaxRateChange?: (newRate: number) => void;
  onDocumentNumberChange?: (newNumber: string) => void;
}

const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer mr-2" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1h10V9a2 2 0 0 0-2-2H5zm-2 4v-1h1v2a1 1 0 0 1-1-1zm11 2h-1v-2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1z"/></svg>;

export const DocumentTemplate: React.FC<DocumentTemplateProps> = ({ document, isEditing = false, onItemChange, onTaxRateChange, onDocumentNumberChange }) => {
  const { clients, companyDetails } = useData();
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [companyLogoSize, setCompanyLogoSize] = useState(100); // Default size in px

  useEffect(() => {
    const currentClient = clients.find(c => c.id === document.clientId);
    setClient(currentClient);
  }, [document, clients]);

  const handlePrint = () => {
    const printContents = window.document.getElementById(`printable-area-${document.id}`)?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`<html><head><title>Document</title><script src="https://cdn.tailwindcss.com"></script><style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; } .no-print { display: none; } td, th { border: 1px solid #e5e7eb; color: black !important; } .bg-gray-50 { background-color: #f9fafb !important; } .bg-slate-100 { background-color: #f1f5f9 !important; } .bg-white { background-color: #ffffff !important; } .bg-slate-200 { background-color: #e2e8f0 !important; } .bg-amber-100 { background-color: #fef3c7 !important; } }</style></head><body class="p-4 font-sans bg-white text-black">${printContents}</body></html>`);
      printWindow?.document.close();
      printWindow?.focus();
      printWindow?.print();
    }
  };

  if (!client) return <p className="text-dark-text-primary">Loading client data...</p>;
  
  const documentTitle = document.documentType.toUpperCase();
  const documentNumber = document.documentNumber;
  const uniqueEntryCodes = [...new Set(document.items.map(item => item.entryCode))].sort((a,b) => a-b);
  const entryCodeColors = ['bg-slate-100', 'bg-white'];

  return (
    <div>
      <div id={`printable-area-${document.id}`} className="p-8 bg-white text-black shadow-lg rounded-lg A4-size">
        <header className="flex justify-between items-start pb-4">
            <div className="w-1/2 pr-4 bg-slate-200 p-4 rounded-lg">
                 {companyDetails.logo && (
                    <div className="relative">
                        <img src={companyDetails.logo} alt="Company Logo" className="mb-2 transition-all" style={{ maxWidth: `${companyLogoSize}px`, height: 'auto' }} />
                        {isEditing && (
                            <div className="absolute top-0 right-0 flex flex-col gap-1 no-print">
                                <button type="button" onClick={() => setCompanyLogoSize(s => s + 10)} className="bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-600">+</button>
                                <button type="button" onClick={() => setCompanyLogoSize(s => Math.max(40, s - 10))} className="bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-600">-</button>
                            </div>
                        )}
                    </div>
                )}
                <p className="font-bold text-base text-black">{companyDetails.name}</p>
                <p className="text-xs text-black">{companyDetails.address}</p>
                <p className="text-xs text-black">{companyDetails.email} | {companyDetails.phone}</p>
                <p className="text-xs text-black">VAT: {companyDetails.vatNumber}</p>
            </div>
            <div className="text-right w-1/2 pl-4 bg-amber-100 p-4 rounded-lg">
                {client.logo && <img src={client.logo} alt={`${client.name} Logo`} className="max-h-16 mb-2 ml-auto" />}
                <p className="font-bold text-base text-black">{client.name}</p>
                <p className="text-xs text-black">{client.address}</p>
                <p className="text-xs text-black">{client.email} | {client.phone}</p>
                <p className="text-xs text-black">VAT: {client.vatNumber}</p>
            </div>
        </header>

        <section className="my-6 text-center">
            <h2 className="text-3xl font-bold uppercase text-black inline-block px-4 py-2 border-2 border-black bg-slate-200">{documentTitle}</h2>
        </section>
        
        <div className="my-4 flex justify-between text-sm">
            <span className="text-black"><strong>FECHA:</strong> {new Date(document.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            <div className="flex items-center gap-2 text-black">
                <strong className="text-black">Nº {documentTitle}:</strong>
                {isEditing ? <Input value={documentNumber} onChange={e => onDocumentNumberChange?.(e.target.value)} className="w-32 text-right text-black" /> : <span>{documentNumber}</span>}
            </div>
        </div>

        <table className="w-full text-left text-xs border-collapse border border-gray-300 my-4">
            <thead className="border-b-2 border-gray-400 bg-gray-50">
                <tr>
                    <th className="p-2 font-semibold border border-gray-300 text-black">Código</th>
                    <th className="p-2 font-semibold border border-gray-300 text-black">Referencia</th>
                    <th className="p-2 font-semibold border border-gray-300 w-[25%] text-black">Producto</th>
                    <th className="p-2 font-semibold border border-gray-300 text-right text-black">Recibida</th>
                    <th className="p-2 font-semibold border border-gray-300 text-right text-black">Entregada</th>
                    <th className="p-2 font-semibold border border-gray-300 text-right text-black">Falta</th>
                    <th className="p-2 font-semibold border border-gray-300 text-black">Fecha de salida</th>
                    <th className="p-2 font-semibold border border-gray-300 text-black">Status</th>
                    <th className="p-2 font-semibold border border-gray-300 text-right text-black">Precio/U</th>
                    <th className="p-2 font-semibold border border-gray-300 text-right text-black">Total</th>
                </tr>
            </thead>
            <tbody>
                {document.items.slice().sort((a, b) => a.entryCode - b.entryCode).map((item, index) => {
                    const codeIndex = uniqueEntryCodes.indexOf(item.entryCode);
                    const rowClass = entryCodeColors[codeIndex % entryCodeColors.length];
                    
                    return (
                        <tr className={`border-b border-gray-200 ${rowClass}`} key={`${item.entryCode}-${item.productCode}-${index}`}>
                            <td className="p-2 align-top border border-gray-300 text-black">{item.entryCode}</td>
                            <td className="p-2 align-top border border-gray-300 text-black">{`${item.reference1}${item.reference2 ? ` / ${item.reference2}` : ''}`}</td>
                            <td className="p-2 align-top border border-gray-300 text-black">
                                {isEditing ? <Textarea value={item.description} onChange={e => onItemChange?.(index, 'description', e.target.value)} /> : item.description}
                            </td>
                            <td className="p-2 align-top text-right border border-gray-300 text-black">{item.recibidaQuantity}</td>
                            <td className="p-2 align-top text-right border border-gray-300 text-black">{item.entregadaQuantity}</td>
                            <td className={`p-2 align-top text-right border border-gray-300 font-bold ${item.faltaQuantity > 0 && item.status === Status.Prefacturado ? 'text-red-600' : 'text-black'}`}>
                                {item.faltaQuantity}
                            </td>
                            <td className="p-2 align-top border border-gray-300 text-black">
                                {item.deliveryBreakdown.map(d => (
                                    <div key={d.date}>{d.date} ({d.qty} pcs)</div>
                                ))}
                            </td>
                             <td className="p-2 align-top border border-gray-300 text-black">
                                <Badge className={`${STATUS_COLORS[item.status]} bg-opacity-70`}>{item.status}</Badge>
                            </td>
                            <td className="p-2 align-top text-right border border-gray-300 text-black">
                                {isEditing ? <Input type="number" step="0.01" value={item.unitPrice} onChange={e => onItemChange?.(index, 'unitPrice', parseFloat(e.target.value))} className="text-right w-20" /> : `€${item.unitPrice.toFixed(2)}`}
                            </td>
                            <td className="p-2 align-top text-right font-semibold border border-gray-300 text-black">€{item.total.toFixed(2)}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>

        <footer className="mt-6 flex justify-end">
            <div className="w-full max-w-sm text-sm text-black">
                <div className="flex justify-between py-1">
                    <span className="font-semibold text-black">Subtotal:</span>
                    <span className="text-black">€{document.subtotal.toFixed(2)}</span>
                </div>
                {document.surcharge > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="font-semibold text-black">Recargo (Cant. Mínima):</span>
                    <span className="text-black">€{document.surcharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 items-center">
                    <span className="font-semibold text-black">IVA (%):</span>
                    {isEditing ? <Input type="number" step="0.1" value={document.taxRate} onChange={e => onTaxRateChange?.(parseFloat(e.target.value))} className="w-20 text-right" /> : <span className="text-black">{document.taxRate}%</span>}
                </div>
                 <div className="flex justify-between py-1">
                    <span className="font-semibold text-black">Importe IVA:</span>
                    <span className="text-black">€{document.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-gray-400 mt-2">
                    <span className="font-bold text-xl text-black">TOTAL:</span>
                    <span className="font-bold text-xl text-black">€{document.total.toFixed(2)}</span>
                </div>
            </div>
        </footer>
      </div>
      {!isEditing && (
        <div className="p-4 bg-dark-tertiary border-t border-slate-700 flex justify-end no-print">
            <Button onClick={handlePrint}><PrintIcon /> Print Document</Button>
        </div>
      )}
    </div>
  );
};
