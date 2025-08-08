
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Button, Input, Textarea } from './ui';
import { CompanyDetails } from '../types';

export const CompanyDetailsManager: React.FC = () => {
    const { companyDetails, updateCompanyDetails } = useData();
    const [formData, setFormData] = useState<CompanyDetails>(companyDetails);
    
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
        updateCompanyDetails(formData);
        alert('Company details updated successfully!');
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-dark-text-primary">Company Details</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
                    <Input label="Company Name" name="name" value={formData.name} onChange={handleChange} required />
                    <Input label="VAT Number" name="vatNumber" value={formData.vatNumber} onChange={handleChange} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} required />
                    <Input label="Company Logo" type="file" name="logo" onChange={handleLogoChange} accept="image/*" />
                    {formData.logo && <img src={formData.logo} alt="logo preview" className="h-20 w-auto object-contain bg-dark-tertiary p-2 rounded-md" />}

                    <div className="flex justify-end pt-4">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
