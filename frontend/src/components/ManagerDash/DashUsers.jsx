import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Label, TextInput, Checkbox, Alert, Spinner, Table } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaUser, FaUserShield, FaUserTie, FaCalculator, FaPaintBrush } from 'react-icons/fa';

export default function DashUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/getusers', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      staffId: user.staffId,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      isManager: user.isManager,
      isAccountant: user.isAccountant,
      isCreativeStaff: user.isCreativeStaff,
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      const res = await fetch(`/api/user/update/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(user => user._id === selectedUser._id ? data : user));
        setShowEditModal(false);
        setSelectedUser(null);
        setEditFormData({});
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (error) {
      setError('Failed to update user');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteUserConfirm = async () => {
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/user/delete/${selectedUser._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(users.filter(user => user._id !== selectedUser._id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (error) {
      setError('Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleIcons = (user) => {
    const icons = [];
    if (user.isAdmin) icons.push(<FaUserShield key="admin" className="text-red-500" title="Admin" />);
    if (user.isManager) icons.push(<FaUserTie key="manager" className="text-blue-500" title="Manager" />);
    if (user.isAccountant) icons.push(<FaCalculator key="accountant" className="text-green-500" title="Accountant" />);
    if (user.isCreativeStaff) icons.push(<FaPaintBrush key="creative" className="text-purple-500" title="Creative Staff" />);
    if (icons.length === 0) icons.push(<FaUser key="staff" className="text-gray-500" title="Staff" />);
    return icons;
  };

  const getRoleText = (user) => {
    const roles = [];
    if (user.isAdmin) roles.push('Admin');
    if (user.isManager) roles.push('Manager');
    if (user.isAccountant) roles.push('Accountant');
    if (user.isCreativeStaff) roles.push('Creative Staff');
    return roles.length > 0 ? roles.join(', ') : 'Staff';
  };

  return (
    <div className='relative isolate flex-1 p-4 md:p-7'>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-50 transform-gpu overflow-hidden blur-3xl sm:-top-0"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 85% 110%, 90% 125%, 95% 140%, 98% 155%, 100% 170%, 100% 200%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#667eea] to-[#764ba2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse"
        />
      </div>
      
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>User Management</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Manage users, roles, and permissions.
          </p>
        </div>
        <Link to="/manager-sign-up-page">
          <Button gradientDuoTone="purpleToPink" outline className="flex items-center p-1">
            <div className='flex items-center gap-1'>
              <FaPlus />
              Add New User
            </div>
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert color="failure" className="mb-4" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <div className='grid grid-cols-1 gap-6'>
        <Card className='p-1 md:p-6'>
          <div className="flex justify-between items-center mb-4">
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Users ({users.length})</h3>
            {loading && <Spinner size="sm" />}
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Staff ID</Table.HeadCell>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Roles</Table.HeadCell>
                  <Table.HeadCell>Created</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {users.map((user) => (
                    <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {user.staffId}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {getRoleIcons(user)}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {getRoleText(user)}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="dark"
                            onClick={() => handleEditUser(user)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <Modal.Header>Edit User</Modal.Header>
        <form onSubmit={handleUpdateUser}>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="staffId" value="Staff ID" />
                <TextInput
                  id="staffId"
                  value={editFormData.staffId || ''}
                  onChange={(e) => setEditFormData({...editFormData, staffId: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" value="First Name" />
                  <TextInput
                    id="firstName"
                    value={editFormData.firstName || ''}
                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" value="Last Name" />
                  <TextInput
                    id="lastName"
                    value={editFormData.lastName || ''}
                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label value="Roles" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isAdmin"
                      checked={editFormData.isAdmin || false}
                      onChange={(e) => setEditFormData({...editFormData, isAdmin: e.target.checked})}
                    />
                    <Label htmlFor="isAdmin">Admin</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isManager"
                      checked={editFormData.isManager || false}
                      onChange={(e) => setEditFormData({...editFormData, isManager: e.target.checked})}
                    />
                    <Label htmlFor="isManager">Manager</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isAccountant"
                      checked={editFormData.isAccountant || false}
                      onChange={(e) => setEditFormData({...editFormData, isAccountant: e.target.checked})}
                    />
                    <Label htmlFor="isAccountant">Accountant</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isCreativeStaff"
                      checked={editFormData.isCreativeStaff || false}
                      onChange={(e) => setEditFormData({...editFormData, isCreativeStaff: e.target.checked})}
                    />
                    <Label htmlFor="isCreativeStaff">Creative Staff</Label>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" disabled={updateLoading}>
              {updateLoading ? <><Spinner size="sm" /> <span className="ml-2">Updating...</span></> : 'Update User'}
            </Button>
            <Button color="gray" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header>Delete User</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FaTrash className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete user <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> (ID: {selectedUser?.staffId})?
            </h3>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={handleDeleteUserConfirm} disabled={deleteLoading}>
            {deleteLoading ? <><Spinner size="sm" /> <span className="ml-2">Deleting...</span></> : 'Yes, delete'}
          </Button>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}