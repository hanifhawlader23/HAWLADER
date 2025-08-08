
import React from 'react';
import { Entry } from '../types';
import { useData } from '../context/DataContext';
import { Badge } from './ui';
import { STATUS_COLORS, CLIENT_COLORS } from '../constants';

interface EntryDetailViewProps {
  entry: Entry;
}

export const EntryDetailView: React.FC<EntryDetailViewProps> = ({ entry }) => {
  const { getClientByName } = useData();
  const client = getClientByName(entry.client);
  
  const hasPhoto = !!entry.photo;

  return (
    <div className={`grid ${hasPhoto ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
      {hasPhoto && (
        <div>
          <h3 className="text-lg font-semibold text-dark-text-primary mb-2">Photo</h3>
          <img src={entry.photo!} alt={`Photo for entry ${entry.code}`} className="w-full h-auto object-cover rounded-lg shadow-lg bg-dark-tertiary" />
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-dark-text-primary mb-2">Entry Details</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-dark-tertiary p-3 rounded-lg">
            <div className="font-semibold text-dark-text-secondary">Code:</div>
            <div className="text-dark-text-primary font-mono">{entry.code}</div>
            
            <div className="font-semibold text-dark-text-secondary">Date:</div>
            <div className="text-dark-text-primary">{new Date(entry.date).toLocaleDateString()}</div>

            <div className="font-semibold text-dark-text-secondary">Client:</div>
            <div><Badge className={CLIENT_COLORS[entry.client] || 'bg-gray-700'}>{entry.client}</Badge></div>

            <div className="font-semibold text-dark-text-secondary">Status:</div>
            <div><Badge className={STATUS_COLORS[entry.status]}>{entry.status}</Badge></div>
            
            <div className="font-semibold text-dark-text-secondary">Input By:</div>
            <div className="text-dark-text-primary">{entry.whoInput}</div>
          </div>
        </div>

        <div>
           <h3 className="text-lg font-semibold text-dark-text-primary mb-2">Products</h3>
           <div className="space-y-3">
            {entry.items.map(item => (
                <div key={item.id} className="bg-dark-tertiary p-3 rounded-lg border border-slate-700">
                     <p className="font-semibold text-amber-400">{item.description}</p>
                     <p className="text-xs text-dark-text-secondary">
                        Ref 1: {item.reference1} {item.reference2 && `| Ref 2: ${item.reference2}`}
                     </p>

                    <div className="mt-2">
                        <h4 className="text-sm font-medium text-dark-text-secondary mb-1">Quantities:</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-center">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        {Object.keys(item.sizeQuantities).filter(size => item.sizeQuantities[size] > 0).map(size => (
                                            <th key={size} className="p-1 font-normal border-x border-slate-700 first:border-l-0 last:border-r-0">{size}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {Object.entries(item.sizeQuantities).filter(([_, qty]) => qty > 0).map(([size, qty]) => (
                                            <td key={size} className="p-1 font-mono font-bold text-dark-text-primary">{qty}</td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
           </div>
        </div>
      </div>
    </div>
  );
};
