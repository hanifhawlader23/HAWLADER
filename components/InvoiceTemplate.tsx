import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Client, Status, DocumentItem } from '../types';
import { Button, Input, Textarea, Badge } from './ui';
import { useData } from '../context/DataContext';
import { STATUS_COLORS } from '../constants';

interface DocumentTemplateProps {
  document: Document;
  isEditing?: boolean;
  onItemChange?: (index: number, field: keyof any, value: any) => void;
  onTaxRateChange?: (newRate: number) => void;
  onDocumentNumberChange?: (newNumber: string) => void;
  onDateChange?: (field: 'startDate' | 'endDate', value: string) => void;
}

const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer mr-2" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1h10V9a2 2 0 0 0-2-2H5zm-2 4v-1h1v2a1 1 0 0 1-1-1zm11 2h-1v-2h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1z"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download mr-2" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>;


export const DocumentTemplate: React.FC<DocumentTemplateProps> = ({ document, isEditing = false, onItemChange, onTaxRateChange, onDocumentNumberChange, onDateChange }) => {
  const { clients, companyDetails } = useData();
  const [client, setClient] = useState<Client | undefined>(undefined);
  const uniqueEntryCodes = [...new Set(document.items.map(item => item.entryCode))].sort((a, b) => a - b);

  useEffect(() => {
    const currentClient = clients.find(c => c.id === document.clientId);
    setClient(currentClient);
  }, [document, clients]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!client) return;
    
    const doc = new jsPDF();
    const brandAccent = '#B76E79';
    const textPrimary = '#8B5E5A';
    const textSecondary = '#B76E79';
    const borderPrimary = '#D4A5A5';
    const documentTitle = document.documentType.toUpperCase();
    const documentNumber = document.documentNumber;

    // Header
    doc.setFillColor('#F6E9E9'); // brand-primary slightly darker
    doc.rect(14, 15, 90, 30, 'F');
    doc.setTextColor(textPrimary);
    doc.setFontSize(12).setFont('helvetica', 'bold');
    doc.text(companyDetails.name, 20, 22);
    doc.setFontSize(8).setFont('helvetica', 'normal');
    doc.text(companyDetails.address, 20, 29);
    doc.text(`${companyDetails.email} | ${companyDetails.phone}`, 20, 34);
    doc.text(`VAT: ${companyDetails.vatNumber}`, 20, 39);

    doc.setFillColor('#FEF3F1'); // warm-beige a bit lighter
    doc.rect(106, 15, 90, 30, 'F');
    doc.setFontSize(12).setFont('helvetica', 'bold');
    doc.text(client.name, 196, 22, { align: 'right' });
    doc.setFontSize(8).setFont('helvetica', 'normal');
    doc.text(client.address, 196, 29, { align: 'right' });
    doc.text(`${client.email} | ${client.phone}`, 196, 34, { align: 'right' });
    doc.text(`VAT: ${client.vatNumber}`, 196, 39, { align: 'right' });

    // Title
    doc.setDrawColor(textPrimary);
    doc.setLineWidth(0.5);
    doc.rect(doc.internal.pageSize.getWidth() / 2 - 35, 52, 70, 12, 'S');
    doc.setFontSize(18).setFont('helvetica', 'bold');
    doc.text(documentTitle, doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });
    
    // Info line
    doc.setFontSize(10).setFont('helvetica', 'normal');
    doc.setTextColor(textSecondary);
    doc.text(`FECHA:`, 14, 75);
    doc.setTextColor(textPrimary);
    doc.text(`${new Date(document.date).toLocaleDateString('es-ES')}`, 32, 75);

    doc.setTextColor(textSecondary);
    doc.text(`Nº ${documentTitle}:`, 196, 75, { align: 'right' });
    doc.setTextColor(textPrimary);
    doc.text(`${documentNumber}`, 168, 75, { align: 'right' });
    
    let tableStartY = 82;
    if (document.startDate && document.endDate) {
        doc.setFontSize(9).setFont('helvetica', 'normal');
        doc.setTextColor(textSecondary);
        doc.text(`PERIODO: `, 14, 80);
        doc.setTextColor(textPrimary);
        const startDate = new Date(document.startDate);
        startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
        const endDate = new Date(document.endDate);
        endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
        doc.text(`${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`, 34, 80);
        tableStartY = 87;
    }

    // Table
    const sortedItems = [...document.items].sort((a,b) => a.entryCode - b.entryCode);
    
    const body = sortedItems.map(item => [
        item.entryCode.toString(),
        `${item.reference1 || ''}${item.reference1 && item.reference2 ? ' / ' : ''}${item.reference2 || ''}`,
        item.description,
        item.recibidaQuantity.toString(),
        item.entregadaQuantity.toString(),
        item.faltaQuantity.toString(),
        item.deliveryBreakdown.map(d => `${d.date} (${d.qty}pcs)`).join('\n'),
        item.status,
        `€${item.unitPrice.toFixed(2)}`,
        `€${item.total.toFixed(2)}`,
    ]);
    
    const statusColorsPDF: Record<Status, string> = {
        [Status.Recibida]: '#3B82F6',
        [Status.EnProceso]: '#FBBF24',
        [Status.Entregada]: '#22C55E',
        [Status.Prefacturado]: '#0EA5E9',
    };

    const head = [[ 'Código', 'Referencia', 'Producto', 'Recibida', 'Entregada', 'Falta', 'Fecha de salida', 'Status', 'Precio/U', 'Total' ]];
    
    const totalWidth = doc.internal.pageSize.getWidth() - 28; // 14 margin on each side

    autoTable(doc, {
        startY: tableStartY,
        head: head,
        body: body,
        theme: 'grid',
        headStyles: { 
            fillColor: '#F6D1C1',
            textColor: textPrimary,
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            lineColor: borderPrimary,
            lineWidth: 0.2,
            fontSize: 8.5,
        },
        styles: {
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 2,
            lineColor: borderPrimary,
            lineWidth: 0.2,
            textColor: textPrimary,
            valign: 'middle',
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: totalWidth * 0.07 },
            1: { halign: 'left', cellWidth: totalWidth * 0.10 },
            2: { halign: 'left', cellWidth: totalWidth * 0.32 },
            3: { halign: 'center', cellWidth: totalWidth * 0.07 },
            4: { halign: 'center', cellWidth: totalWidth * 0.07 },
            5: { halign: 'center', cellWidth: totalWidth * 0.07 },
            6: { halign: 'center', cellWidth: totalWidth * 0.12 },
            7: { halign: 'center', cellWidth: totalWidth * 0.06 },
            8: { halign: 'right', cellWidth: totalWidth * 0.06 },
            9: { halign: 'right', cellWidth: totalWidth * 0.06 },
        },
        didDrawCell: (data) => {
            if (data.column.index === 7 && data.cell.section === 'body') {
                const status = data.cell.raw as Status;
                const color = statusColorsPDF[status] || '#8B5E5A';
                const cellWidth = data.cell.width;
                const cellHeight = data.cell.height;
                const textWidth = doc.getTextWidth(status);
                const textX = data.cell.x + (cellWidth - textWidth) / 2;
                const textY = data.cell.y + cellHeight / 2;
                const padding = 2;
                
                doc.setFillColor(color);
                doc.roundedRect(textX - padding, data.cell.y + 2, textWidth + (padding*2), cellHeight - 4, 3, 3, 'F');
                doc.setTextColor('#FFFFFF');
                doc.setFont('helvetica', 'bold');
                doc.text(status, textX, textY, { align: 'center', baseline: 'middle' });
            }
        },
        didDrawPage: (data) => {
            let finalY = data.cursor?.y ? data.cursor.y + 10 : 250;
            if (finalY > 240) {
                doc.addPage();
                finalY = 20;
            }
            const boxWidth = 80;
            const startX = doc.internal.pageSize.getWidth() - boxWidth - 14;

            doc.setFillColor('#FAF3F0');
            doc.roundedRect(startX, finalY, boxWidth, 30, 3, 3, 'F');
            doc.setDrawColor(borderPrimary);
            doc.roundedRect(startX, finalY, boxWidth, 30, 3, 3, 'S');
            
            doc.setFontSize(9);
            doc.setTextColor(textSecondary);
            doc.text('Subtotal:', startX + 5, finalY + 7);
            if (document.surcharge > 0) {
                 doc.text('Recargo (Cant. Mínima):', startX + 5, finalY + 12);
            }
            doc.text(`IVA (${document.taxRate}%):`, startX + 5, finalY + 17);
            doc.text('Importe IVA:', startX + 5, finalY + 22);

            doc.setLineWidth(0.5);
            doc.line(startX, finalY + 24, startX + boxWidth, finalY + 24);
            doc.setFontSize(11).setFont('helvetica', 'bold');
            doc.text('TOTAL:', startX + 5, finalY + 28);
            
            doc.setFontSize(9).setFont('helvetica', 'normal');
            doc.setTextColor(textPrimary);
            doc.text(`€${document.subtotal.toFixed(2)}`, startX + boxWidth - 5, finalY + 7, { align: 'right' });
            if (document.surcharge > 0) {
                 doc.text(`€${document.surcharge.toFixed(2)}`, startX + boxWidth - 5, finalY + 12, { align: 'right' });
            }
            doc.text(`${document.taxRate.toFixed(2)}%`, startX + boxWidth - 5, finalY + 17, { align: 'right' });
            doc.text(`€${document.taxAmount.toFixed(2)}`, startX + boxWidth - 5, finalY + 22, { align: 'right' });
            doc.setFontSize(11).setFont('helvetica', 'bold');
            doc.text(`€${document.total.toFixed(2)}`, startX + boxWidth - 5, finalY + 28, { align: 'right' });
        }
    });

    doc.save(`${document.documentType}-${document.documentNumber}.pdf`);
};

  const renderItemRow = (item: DocumentItem, index: number) => {
      const isEven = uniqueEntryCodes.indexOf(item.entryCode) % 2 === 0;
      const rowBgClass = isEven ? 'bg-brand-bg' : 'bg-brand-primary';

      return (
        <tr key={`${item.entryCode}-${item.productCode}`} className={rowBgClass}>
            <td className="px-1 py-2 text-center">{item.entryCode}</td>
            <td className="px-2 py-2 text-left">
                {isEditing ? (
                  <>
                    <Input unstyled value={item.reference1} onChange={(e) => onItemChange && onItemChange(index, 'reference1', e.target.value)} placeholder="Ref 1"/>
                    <Input unstyled value={item.reference2} onChange={(e) => onItemChange && onItemChange(index, 'reference2', e.target.value)} placeholder="Ref 2"/>
                  </>
                ) : (
                  <>
                    <div>{item.reference1}</div>
                    <div>{item.reference2}</div>
                  </>
                )}
            </td>
            <td className="px-2 py-2 text-left">
                {isEditing ? (
                  <Textarea unstyled value={item.description} onChange={(e) => onItemChange && onItemChange(index, 'description', e.target.value)}/>
                ) : ( item.description )}
            </td>
            <td className="px-1 py-2 text-center">{item.recibidaQuantity}</td>
            <td className="px-1 py-2 text-center">
                {isEditing ? 
                    <Input unstyled className="text-center" type="number" value={item.entregadaQuantity} onChange={(e) => onItemChange && onItemChange(index, 'entregadaQuantity', parseInt(e.target.value, 10) || 0)} />
                    : item.entregadaQuantity
                }
            </td>
            <td className="px-1 py-2 text-center text-red-600 font-semibold">{item.faltaQuantity}</td>
            <td className="px-2 py-2 text-center text-xs">
                {item.deliveryBreakdown.map((d: any) => <div key={d.date}>{d.date} ({d.qty} pcs)</div>)}
            </td>
            <td className="px-2 py-2 text-center">
                <Badge className={`${STATUS_COLORS[item.status]}`}>{item.status}</Badge>
            </td>
            <td className="px-2 py-2 text-right">
                {isEditing ? 
                    <Input unstyled className="text-right" type="number" step="0.01" value={item.unitPrice} onChange={(e) => onItemChange && onItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
                    : `€${item.unitPrice.toFixed(2)}`
                }
            </td>
            <td className="px-2 py-2 text-right font-semibold">{`€${item.total.toFixed(2)}`}</td>
        </tr>
      );
  }

  return (
    <div className="invoice-wrapper">
        <div id={`printable-area-${document.id}`} className="invoice-container p-8 shadow-lg">
            {/* Header */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-rose-50 p-4 rounded-lg">
                    {companyDetails.logo && <img src={companyDetails.logo} alt="Company Logo" className="h-12 w-auto mb-2" />}
                    <h2 className="font-bold text-lg mb-1">{companyDetails.name}</h2>
                    <p className="text-xs whitespace-pre-wrap">{companyDetails.address}</p>
                    <p className="text-xs">{companyDetails.email} | {companyDetails.phone}</p>
                    <p className="text-xs">VAT: {companyDetails.vatNumber}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-lg text-right">
                    {client?.logo && <img src={client.logo} alt="Client Logo" className="h-12 w-auto mb-2 ml-auto" />}
                    <h2 className="font-bold text-lg mb-1">{client?.name}</h2>
                    <p className="text-xs whitespace-pre-wrap">{client?.address}</p>
                    <p className="text-xs">{client?.email} | {client?.phone}</p>
                    <p className="text-xs">VAT: {client?.vatNumber}</p>
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-widest border-4 border-black inline-block px-8 py-2">{document.documentType.toUpperCase()}</h1>
            </div>

            {/* Meta Info */}
            <div className="flex justify-between mb-8 text-sm">
                <div>
                    <span className="font-bold">FECHA: </span>
                    <span>{new Date(document.date).toLocaleDateString('es-ES')}</span>
                </div>
                <div>
                    <span className="font-bold">Nº {document.documentType.toUpperCase()}: </span>
                     {isEditing ? 
                        <Input unstyled value={document.documentNumber} onChange={(e) => onDocumentNumberChange && onDocumentNumberChange(e.target.value)} />
                        : <span>{document.documentNumber}</span>
                    }
                </div>
            </div>
            {isEditing ? (
                 <div className="flex items-center gap-4 mb-8 text-sm">
                    <div className="flex items-center gap-2">
                        <label className="font-bold">PERIODO:</label>
                        <Input type="date" label="Start Date" value={document.startDate?.split('T')[0] || ''} onChange={(e) => onDateChange && onDateChange('startDate', e.target.value)} />
                         <span>-</span>
                        <Input type="date" label="End Date" value={document.endDate?.split('T')[0] || ''} onChange={(e) => onDateChange && onDateChange('endDate', e.target.value)} />
                    </div>
                </div>
            ) : document.startDate && document.endDate && (
                 <div className="mb-8 text-sm">
                    <span className="font-bold">PERIODO: </span>
                    <span>
                       {new Date(document.startDate).toLocaleDateString('es-ES')} - {new Date(document.endDate).toLocaleDateString('es-ES')}
                    </span>
                </div>
            )}


            {/* Table */}
            <table className="invoice-table text-xs text-center">
                <colgroup>
                    <col style={{width: '7%'}} />
                    <col style={{width: '10%'}} />
                    <col style={{width: '32%'}} />
                    <col style={{width: '7%'}} />
                    <col style={{width: '7%'}} />
                    <col style={{width: '7%'}} />
                    <col style={{width: '12%'}} />
                    <col style={{width: '6%'}} />
                    <col style={{width: '6%'}} />
                    <col style={{width: '6%'}} />
                </colgroup>
                <thead className="text-xs text-brand-text-secondary uppercase bg-brand-secondary">
                    <tr>
                        <th scope="col" className="px-1 py-3 text-center">Código</th>
                        <th scope="col" className="px-2 py-3 text-left">Referencia</th>
                        <th scope="col" className="px-2 py-3 text-left">Producto</th>
                        <th scope="col" className="px-1 py-3 text-center">Recibida</th>
                        <th scope="col" className="px-1 py-3 text-center">Entregada</th>
                        <th scope="col" className="px-1 py-3 text-center">Falta</th>
                        <th scope="col" className="px-2 py-3 text-center">Fecha de salida</th>
                        <th scope="col" className="px-2 py-3 text-center">Status</th>
                        <th scope="col" className="px-2 py-3 text-right">Precio/U</th>
                        <th scope="col" className="px-2 py-3 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {document.items.map(renderItemRow)}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-8">
                <div className="w-2/5">
                    <div className="bg-rose-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-600">Subtotal:</span>
                            <span>€{document.subtotal.toFixed(2)}</span>
                        </div>
                        {document.surcharge > 0 && (
                             <div className="flex justify-between text-xs">
                                <span className="font-semibold text-gray-500">Recargo (Cant. Mínima):</span>
                                <span>€{document.surcharge.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-600">IVA (%):</span>
                            <span>{isEditing ? <Input unstyled className="text-right" type="number" step="0.01" value={document.taxRate} onChange={(e) => onTaxRateChange && onTaxRateChange(parseFloat(e.target.value) || 0)} /> : `${document.taxRate.toFixed(2)}%`}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-600">Importe IVA:</span>
                            <span>€{document.taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t-2 border-black my-2"></div>
                        <div className="flex justify-between font-extrabold text-lg">
                            <span>TOTAL:</span>
                            <span>€{document.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {!isEditing && (
            <div className="no-print mt-6 flex justify-center gap-4">
                <Button variant="secondary" onClick={handleDownloadPdf}><DownloadIcon /> Download PDF</Button>
                <Button onClick={handlePrint}><PrintIcon /> Print Document</Button>
            </div>
        )}
    </div>
  );
};