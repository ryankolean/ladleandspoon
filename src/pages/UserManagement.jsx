import React, { useState, useEffect } from 'react';
import { User } from '@/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Shield, UserX, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AdminOnly from '@/components/auth/AdminOnly';
import { format } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await User.listUsersWithRoles();
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdminRole = async (userId, currentRole) => {
    try {
      setActionLoading(userId);
      setError(null);
      setSuccess(null);

      if (currentRole === 'admin') {
        await User.revokeAdminRole(userId);
        setSuccess('Admin role revoked successfully');
      } else {
        await User.grantAdminRole(userId);
        setSuccess('Admin role granted successfully');
      }

      await fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.message || 'Failed to update user role. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminOnly>
      <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-gray-600">Manage user roles and permissions</p>
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Card className="shadow-xl border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-600" />
                All Users
              </CardTitle>
              <CardDescription>
                View and manage user roles. Admins have full access to the admin dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Email</TableHead>
                        <TableHead className="font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Joined</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.user_id} className="hover:bg-orange-50/50">
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.full_name || '-'}</TableCell>
                          <TableCell>
                            {user.role === 'admin' ? (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                Customer
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {actionLoading === user.user_id ? (
                              <Button size="sm" disabled className="bg-gray-100">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </Button>
                            ) : user.role === 'admin' ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleToggleAdminRole(user.user_id, user.role)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Revoke Admin
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleToggleAdminRole(user.user_id, user.role)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Shield className="w-4 h-4 mr-1" />
                                Make Admin
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Important:</strong> Admin users have full access to manage orders, menu items, reports, and other users. Only grant admin access to trusted individuals.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
