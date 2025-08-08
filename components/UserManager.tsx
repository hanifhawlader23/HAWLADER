import React from 'react';
import { useData } from '../context/DataContext';
import { Card, Select, Badge, Button } from './ui';
import { User } from '../types';

export const UserManager: React.FC = () => {
    const { users, updateUserRole, currentUser, approveUser } = useData();

    const handleRoleChange = (userId: number, role: 'admin' | 'user' | 'manager') => {
        if (currentUser?.id === userId) {
            alert("You cannot change your own role.");
            return;
        }
        updateUserRole(userId, role);
    };

    const handleApproveUser = (userId: number) => {
        approveUser(userId);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-dark-text-primary">User Management</h1>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-dark-text-secondary responsive-table">
                        <thead className="text-xs text-slate-400 uppercase bg-dark-tertiary">
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
                                <tr key={user.id} className="border-b border-dark-tertiary hover:bg-dark-tertiary">
                                    <td data-label="Full Name" className="px-6 py-4 font-medium text-dark-text-primary">{user.fullName}</td>
                                    <td data-label="Contact" className="px-6 py-4">
                                      <div>{user.email}</div>
                                      <div className="text-xs text-slate-400">{user.phone}</div>
                                    </td>
                                    <td data-label="Username" className="px-6 py-4">{user.username}</td>
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
                                    <td data-label="Status" className="px-6 py-4">
                                        {user.isApproved ? (
                                            <Badge className="bg-green-200 text-green-800">Approved</Badge>
                                        ) : (
                                            <Button size="sm" onClick={() => handleApproveUser(user.id)}>
                                                Approve User
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};