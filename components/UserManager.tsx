

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Select, Badge, Button, ConfirmationModal } from './ui';
import { useToast } from '../context/ToastContext';
import { User } from '../types';
import { ExportControls } from './ExportControls';

export const UserManager: React.FC = () => {
    const { users, updateUserRole, currentUser, deleteUser } = useData();
    const { addToast } = useToast();
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

    const handleRoleChange = (userId: number, role: 'admin' | 'user' | 'manager') => {
        if (currentUser?.id === userId) {
            addToast('You cannot change your own role.', 'error');
            return;
        }
        updateUserRole(userId, role);
        addToast('User role updated successfully.', 'success');
    };

    const handleDeleteUser = (user: User) => {
        if (currentUser?.id === user.id) {
            addToast('You cannot delete your own account.', 'error');
            return;
        }
        setDeleteTarget(user);
    };

    const confirmDeleteUser = () => {
        if (deleteTarget) {
            deleteUser(deleteTarget.id);
            addToast(`User ${deleteTarget.fullName} has been deleted.`, 'success');
            setDeleteTarget(null);
        }
    };
    
    const exportColumns = [
        { title: 'Full Name', dataKey: 'fullName' as const },
        { title: 'Email', dataKey: 'email' as const },
        { title: 'Phone', dataKey: 'phone' as const },
        { title: 'Username', dataKey: 'username' as const },
        { title: 'Role', dataKey: 'role' as const },
        { title: 'Status', dataKey: (item: User) => 'Active' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-text-primary">User Management</h1>
                <ExportControls data={users} columns={exportColumns} fileName="users" />
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-brand-text-secondary responsive-table">
                        <thead className="text-xs text-brand-text-secondary uppercase bg-brand-secondary">
                            <tr>
                                <th className="px-6 py-3">Full Name</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Username</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: User) => (
                                <tr key={user.id} className="border-b border-brand-tertiary hover:bg-brand-secondary/80">
                                    <td data-label='Full Name' className="px-6 py-4 font-medium text-brand-text-primary">{user.fullName}</td>
                                    <td data-label="Contact" className="px-6 py-4">
                                      <div>{user.email}</div>
                                      <div className="text-xs text-brand-text-secondary">{user.phone}</div>
                                    </td>
                                    <td data-label='Username' className="px-6 py-4">{user.username}</td>
                                    <td data-label="Role" className="px-6 py-4">
                                        <Select 
                                            label=""
                                            value={user.role} 
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user' | 'manager')}
                                            className="max-w-xs"
                                            disabled={currentUser?.id === user.id}
                                        >
                                            <option value="user">User</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Admin</option>
                                        </Select>
                                    </td>
                                    <td data-label='Actions' className="px-6 py-4 text-center">
                                       <Button size="sm" variant="danger" onClick={() => handleDeleteUser(user)} disabled={currentUser?.id === user.id}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDeleteUser}
                title='Confirm User Deletion'
                message={`Are you sure you want to delete the user account for ${deleteTarget?.fullName}? This action cannot be undone.`}
                confirmationWord="DELETE"
            />
        </div>
    );
};