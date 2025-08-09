
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, Select, Badge, Button, ConfirmationModal } from './ui';
import { useToast } from '../context/ToastContext';
import { User } from '../types';
import { ExportControls } from './ExportControls';

export const UserManager: React.FC = () => {
    const { users, updateUserRole, currentUser, approveUser, deleteUser } = useData();
    const { addToast } = useToast();
    const [rejectionTarget, setRejectionTarget] = useState<User | null>(null);

    const handleRoleChange = (userId: number, role: 'admin' | 'user' | 'manager') => {
        if (currentUser?.id === userId) {
            addToast('You cannot change your own role.', 'error');
            return;
        }
        updateUserRole(userId, role);
        addToast('User role updated successfully.', 'success');
    };

    const handleApproveUser = (userId: number) => {
        approveUser(userId);
        addToast('User has been approved.', 'success');
    };

    const handleRejectUser = (user: User) => {
        if (currentUser?.id === user.id) {
            addToast('You cannot reject or delete your own account.', 'error');
            return;
        }
        setRejectionTarget(user);
    };

    const confirmRejectUser = () => {
        if (rejectionTarget) {
            deleteUser(rejectionTarget.id);
            addToast(`User ${rejectionTarget.fullName} has been rejected and removed.`, 'success');
            setRejectionTarget(null);
        }
    };
    
    const exportColumns = [
        { title: 'Full Name', dataKey: 'fullName' as const },
        { title: 'Email', dataKey: 'email' as const },
        { title: 'Phone', dataKey: 'phone' as const },
        { title: 'Username', dataKey: 'username' as const },
        { title: 'Role', dataKey: 'role' as const },
        { title: 'Status', dataKey: (item: User) => item.isApproved ? 'Approved' : 'Pending' },
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
                                <th className="px-6 py-3">Status</th>
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
                                    <td data-label='Status' className="px-6 py-4">
                                        {user.isApproved ? (
                                            <Badge className="bg-green-200 text-green-800">Approved</Badge>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" onClick={() => handleApproveUser(user.id)}>
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => handleRejectUser(user)}>
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <ConfirmationModal
                isOpen={!!rejectionTarget}
                onClose={() => setRejectionTarget(null)}
                onConfirm={confirmRejectUser}
                title='Confirm User Rejection'
                message={`Are you sure you want to reject and delete the user account for ${rejectionTarget?.fullName}? This action cannot be undone.`}
                confirmationWord="REJECT"
            />
        </div>
    );
};