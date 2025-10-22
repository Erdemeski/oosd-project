import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Label, TextInput, Select, Alert, Spinner, Table } from 'flowbite-react';
import { FaEdit, FaTrash, FaPlus, FaDollarSign, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { TbSpeakerphone } from 'react-icons/tb';

export default function DashCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    plannedStartDate: '',
    plannedEndDate: '',
    estimatedCost: '',
    budget: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch campaigns and clients on component mount
  useEffect(() => {
    fetchCampaigns();
    fetchClients();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns/get-campaigns', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setCampaigns(data.data);
      } else {
        setError(data.error || 'Failed to fetch campaigns');
      }
    } catch (error) {
      setError('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients/get-clients', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setClients(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const res = await fetch('/api/campaigns/create-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setCampaigns([...campaigns, data.data]);
        setShowCreateModal(false);
        setFormData({
          clientId: '',
          title: '',
          plannedStartDate: '',
          plannedEndDate: '',
          estimatedCost: '',
          budget: ''
        });
      } else {
        setError(data.error || 'Failed to create campaign');
      }
    } catch (error) {
      setError('Failed to create campaign');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      clientId: campaign.clientId._id || campaign.clientId,
      title: campaign.title,
      plannedStartDate: campaign.plannedStartDate ? new Date(campaign.plannedStartDate).toISOString().split('T')[0] : '',
      plannedEndDate: campaign.plannedEndDate ? new Date(campaign.plannedEndDate).toISOString().split('T')[0] : '',
      estimatedCost: campaign.estimatedCost.toString(),
      budget: campaign.budget.toString()
    });
    setShowEditModal(true);
  };

  const handleUpdateCampaign = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      const res = await fetch(`/api/campaigns/update-campaign/${selectedCampaign._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setCampaigns(campaigns.map(campaign => campaign._id === selectedCampaign._id ? data.data : campaign));
        setShowEditModal(false);
        setSelectedCampaign(null);
        setFormData({
          clientId: '',
          title: '',
          plannedStartDate: '',
          plannedEndDate: '',
          estimatedCost: '',
          budget: ''
        });
      } else {
        setError(data.error || 'Failed to update campaign');
      }
    } catch (error) {
      setError('Failed to update campaign');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  const handleDeleteCampaignConfirm = async () => {
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/campaigns/delete-campaign/${selectedCampaign._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setCampaigns(campaigns.filter(campaign => campaign._id !== selectedCampaign._id));
        setShowDeleteModal(false);
        setSelectedCampaign(null);
      } else {
        setError(data.error || 'Failed to delete campaign');
      }
    } catch (error) {
      setError('Failed to delete campaign');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getClientName = (clientId) => {
    if (typeof clientId === 'object' && clientId.name) {
      return `${clientId.name} ${clientId.surname}`;
    }
    const client = clients.find(c => c._id === clientId);
    return client ? `${client.name} ${client.surname}` : 'Unknown Client';
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
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Campaign Management</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Manage marketing campaigns and their details.
          </p>
        </div>
        <Button gradientDuoTone="purpleToPink" outline className="flex items-center p-1" onClick={() => setShowCreateModal(true)}>
          <div className='flex items-center gap-1'>
            <FaPlus />
            Add New Campaign
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
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Campaigns ({campaigns.length})</h3>
            {loading && <Spinner size="sm" />}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
              <span className="ml-2">Loading campaigns...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Title</Table.HeadCell>
                  <Table.HeadCell>Client</Table.HeadCell>
                  <Table.HeadCell>Budget</Table.HeadCell>
                  <Table.HeadCell>Estimated Cost</Table.HeadCell>
                  <Table.HeadCell>Start Date</Table.HeadCell>
                  <Table.HeadCell>End Date</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {campaigns.map((campaign) => (
                    <Table.Row key={campaign._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <TbSpeakerphone className="text-purple-500" />
                          {campaign.title}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          {getClientName(campaign.clientId)}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="text-green-500" />
                          {campaign.budget.toLocaleString()}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="text-orange-500" />
                          {campaign.estimatedCost.toLocaleString()}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400">
                        {campaign.plannedStartDate ? (
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            {new Date(campaign.plannedStartDate).toLocaleDateString()}
                          </div>
                        ) : '-'}
                      </Table.Cell>
                      <Table.Cell className="text-gray-600 dark:text-gray-400">
                        {campaign.plannedEndDate ? (
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            {new Date(campaign.plannedEndDate).toLocaleDateString()}
                          </div>
                        ) : '-'}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="dark"
                            onClick={() => handleEditCampaign(campaign)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => handleDeleteCampaign(campaign)}
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

      {/* Create Campaign Modal */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <Modal.Header>Add New Campaign</Modal.Header>
        <form onSubmit={handleCreateCampaign}>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientId" value="Client *" />
                <Select
                  id="clientId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} {client.surname} {client.companyName ? `(${client.companyName})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="title" value="Campaign Title *" />
                <TextInput
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plannedStartDate" value="Planned Start Date" />
                  <TextInput
                    id="plannedStartDate"
                    type="date"
                    value={formData.plannedStartDate}
                    onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="plannedEndDate" value="Planned End Date" />
                  <TextInput
                    id="plannedEndDate"
                    type="date"
                    value={formData.plannedEndDate}
                    onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedCost" value="Estimated Cost *" />
                  <TextInput
                    id="estimatedCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="budget" value="Budget *" />
                  <TextInput
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" disabled={submitLoading}>
              {submitLoading ? <><Spinner size="sm" /> <span className="ml-2">Creating...</span></> : 'Create Campaign'}
            </Button>
            <Button color="gray" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Edit Campaign Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <Modal.Header>Edit Campaign</Modal.Header>
        <form onSubmit={handleUpdateCampaign}>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editClientId" value="Client *" />
                <Select
                  id="editClientId"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} {client.surname} {client.companyName ? `(${client.companyName})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="editTitle" value="Campaign Title *" />
                <TextInput
                  id="editTitle"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPlannedStartDate" value="Planned Start Date" />
                  <TextInput
                    id="editPlannedStartDate"
                    type="date"
                    value={formData.plannedStartDate}
                    onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editPlannedEndDate" value="Planned End Date" />
                  <TextInput
                    id="editPlannedEndDate"
                    type="date"
                    value={formData.plannedEndDate}
                    onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEstimatedCost" value="Estimated Cost *" />
                  <TextInput
                    id="editEstimatedCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editBudget" value="Budget *" />
                  <TextInput
                    id="editBudget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" disabled={submitLoading}>
              {submitLoading ? <><Spinner size="sm" /> <span className="ml-2">Updating...</span></> : 'Update Campaign'}
            </Button>
            <Button color="gray" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Campaign Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header>Delete Campaign</Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <FaTrash className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete campaign <strong>{selectedCampaign?.title}</strong>?
            </h3>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={handleDeleteCampaignConfirm} disabled={deleteLoading}>
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
