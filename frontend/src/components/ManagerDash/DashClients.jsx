import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Label, TextInput, Alert, Spinner, Table } from 'flowbite-react';
import { FaEdit, FaTrash, FaPlus, FaUser, FaBuilding, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

export default function DashClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    address: '',
    contactPersonDetails: '',
    companyName: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients/get-clients', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setClients(data.data);
      } else {
        setError(data.error || 'Failed to fetch clients');
      }
    } catch (error) {
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const res = await fetch('/api/clients/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setClients([...clients, data.data]);
        setShowCreateModal(false);
        setFormData({
          name: '',
          surname: '',
          email: '',
          address: '',
          contactPersonDetails: '',
          companyName: ''
        });
      } else {
        setError(data.error || 'Failed to create client');
      }
    } catch (error) {
      setError('Failed to create client');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      surname: client.surname,
      email: client.email,
      address: client.address || '',
      contactPersonDetails: client.contactPersonDetails || '',
      companyName: client.companyName || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const res = await fetch(`/api/clients/update-client/${selectedClient._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setClients(clients.map(client => client._id === selectedClient._id ? data.data : client));
        setShowEditModal(false);
        setSelectedClient(null);
        setFormData({
          name: '',
          surname: '',
          email: '',
          address: '',
          contactPersonDetails: '',
          companyName: ''
        });
      } else {
        setError(data.error || 'Failed to update client');
      }
    } catch (error) {
      setError('Failed to update client');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteClient = (client) => {
    setSelectedClient(client);
    setShowDeleteModal(true);
  };

  const handleDeleteClientConfirm = async () => {
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/clients/delete-client/${selectedClient._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setClients(clients.filter(client => client._id !== selectedClient._id));
        setShowDeleteModal(false);
        setSelectedClient(null);
      } else {
        setError(data.error || 'Failed to delete client');
      }
    } catch (error) {
      setError('Failed to delete client');
    } finally {
      setDeleteLoading(false);
    }
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
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#f093fb] to-[#f5576c] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse"
        />
      </div>

      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Client Management</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Manage clients and their information.
          </p>
        </div>
        <Button gradientDuoTone="purpleToPink" outline className="flex items-center p-1" onClick={() => setShowCreateModal(true)}>
          <div className='flex items-center gap-1'>
            <FaPlus />
            Add New Client
          </div>
        </Button>
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
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Clients ({clients.length})</h3>
            {loading && <Spinner size="sm" />}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
              <span className="ml-2">Loading clients...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Email</Table.HeadCell>
                  <Table.HeadCell>Company</Table.HeadCell>
                  <Table.HeadCell>Campaign Count</Table.HeadCell>
                  <Table.HeadCell>Contact Person</Table.HeadCell>
                  <Table.HeadCell>Created</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {clients.map((client) => (
                    <Table.Row key={client._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-blue-500" />
                          {client.name} {client.surname}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          {client.email}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400">
                        {client.companyName ? (
                          <div className="flex items-center gap-2">
                            <FaBuilding className="text-gray-400" />
                            {client.companyName}
                          </div>
                        ) : '-'}
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400">
                        {client.campaignCount}
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400">
                        {client.contactPersonDetails || '-'}
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400 ">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(client.createdAt).toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul' })} - {new Date(client.createdAt).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' })}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="dark"
                            onClick={() => handleEditClient(client)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => handleDeleteClient(client)}
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

      {/* Create Client Modal */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}
        theme={{
          content: {
            base: "relative h-full w-full mt-32 md:mt-0 p-4 md:h-auto",
          },
        }}
      >
        <Modal.Header>Add New Client</Modal.Header>
        <form onSubmit={handleCreateClient}>
          <Modal.Body>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" value="First Name *" />
                  <TextInput
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="surname" value="Last Name *" />
                  <TextInput
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    required
                    maxLength={50}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" value="Email *" />
                <TextInput
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="companyName" value="Company Name" />
                <TextInput
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="address" value="Address" />
                <TextInput
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactPersonDetails" value="Contact Person Details" />
                <TextInput
                  id="contactPersonDetails"
                  value={formData.contactPersonDetails}
                  onChange={(e) => setFormData({ ...formData, contactPersonDetails: e.target.value })}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" disabled={submitLoading}>
              {submitLoading ? <><Spinner size="sm" /> <span className="ml-2">Creating...</span></> : 'Create Client'}
            </Button>
            <Button color="gray" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}
        theme={{
          content: {
            base: "relative h-full w-full mt-32 md:mt-0 p-4 md:h-auto",
          },
        }}
      >
        <Modal.Header>Edit Client</Modal.Header>
        <form onSubmit={handleUpdateClient}>
          <Modal.Body>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editName" value="First Name *" />
                  <TextInput
                    id="editName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="editSurname" value="Last Name *" />
                  <TextInput
                    id="editSurname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    required
                    maxLength={50}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail" value="Email *" />
                <TextInput
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="editCompanyName" value="Company Name" />
                <TextInput
                  id="editCompanyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="editAddress" value="Address" />
                <TextInput
                  id="editAddress"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editContactPersonDetails" value="Contact Person Details" />
                <TextInput
                  id="editContactPersonDetails"
                  value={formData.contactPersonDetails}
                  onChange={(e) => setFormData({ ...formData, contactPersonDetails: e.target.value })}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" disabled={submitLoading}>
              {submitLoading ? <><Spinner size="sm" /> <span className="ml-2">Updating...</span></> : 'Update Client'}
            </Button>
            <Button color="gray" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Client Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header>Delete Client</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FaTrash className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete client <strong>{selectedClient?.name} {selectedClient?.surname}</strong>?
            </h3>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={handleDeleteClientConfirm} disabled={deleteLoading}>
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


