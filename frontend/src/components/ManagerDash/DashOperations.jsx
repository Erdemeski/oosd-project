import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Modal, Select, Spinner, Table, TextInput, Textarea } from 'flowbite-react';
import { FaPlus } from 'react-icons/fa';
import { TbSpeakerphone } from 'react-icons/tb';

const statusOptions = ['Planned', 'InProduction', 'Completed', 'OnHold', 'Cancelled'];

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export default function DashOperations() {
  const [campaigns, setCampaigns] = useState([]);
  const [conceptNotes, setConceptNotes] = useState([]);
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [summaryCampaignId, setSummaryCampaignId] = useState('');

  const [newAdvert, setNewAdvert] = useState({
    campaignId: '',
    title: '',
    description: '',
    platform: '',
    estimatedCost: ''
  });
  const [createAdvertLoading, setCreateAdvertLoading] = useState(false);

  const [statusAdvertId, setStatusAdvertId] = useState('');
  const [statusValue, setStatusValue] = useState('Planned');
  const [statusLoading, setStatusLoading] = useState(false);

  const [scheduleAdvertId, setScheduleAdvertId] = useState('');
  const [scheduleData, setScheduleData] = useState({
    channel: '',
    startDate: '',
    endDate: '',
    cost: ''
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        setLoading(true);
        setError('');
        const [campaignRes, conceptsRes, advertsRes] = await Promise.all([
          fetch('/api/campaigns/get-campaigns', { credentials: 'include' }),
          fetch('/api/concept-notes', { credentials: 'include' }),
          fetch('/api/adverts', { credentials: 'include' })
        ]);

        const [campaignData, conceptData, advertData] = await Promise.all([
          campaignRes.json(),
          conceptsRes.json(),
          advertsRes.json()
        ]);

        if (!campaignRes.ok) {
          throw new Error(campaignData.error || 'Unable to load campaigns');
        }
        if (!conceptsRes.ok) {
          throw new Error(conceptData.error || 'Unable to load concept notes');
        }
        if (!advertsRes.ok) {
          throw new Error(advertData.error || 'Unable to load adverts');
        }

        setCampaigns(campaignData.data || []);
        setConceptNotes(conceptData.data || []);
        setAdverts(advertData.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, []);

  useEffect(() => {
    if (!selectedCampaign) {
      setBudgetInfo(null);
      setBudgetError('');
      setSummaryData(null);
      setSummaryError('');
      setSummaryCampaignId('');
      setShowSummaryModal(false);
      return;
    }

    const fetchBudget = async () => {
      try {
        setBudgetLoading(true);
        setBudgetError('');
        const res = await fetch(`/api/campaigns/${selectedCampaign}/budget-check`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to fetch budget info');
        }
        setBudgetInfo(data.data);
      } catch (err) {
        setBudgetInfo(null);
        setBudgetError(err.message || 'Unable to fetch budget info');
      } finally {
        setBudgetLoading(false);
      }
    };

    fetchBudget();
  }, [selectedCampaign]);

  const handleOpenSummary = async (forceRefresh = false) => {
    if (!selectedCampaign) {
      setError('Select a campaign to generate the overview');
      return;
    }
    setShowSummaryModal(true);
    if (!forceRefresh && summaryCampaignId === selectedCampaign && summaryData) {
      return;
    }
    try {
      setSummaryLoading(true);
      setSummaryError('');
      setSummaryData(null);
      const res = await fetch(`/api/campaigns/${selectedCampaign}/operations-summary`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to generate campaign overview');
      }
      setSummaryData(data.data);
      setSummaryCampaignId(selectedCampaign);
    } catch (err) {
      setSummaryError(err.message || 'Unable to generate campaign overview');
    } finally {
      setSummaryLoading(false);
    }
  };

  const renderSummaryList = (items, emptyLabel) => {
    if (!items || items.length === 0) {
      return <p className='text-sm text-gray-500 dark:text-gray-400'>{emptyLabel}</p>;
    }
    return (
      <ul className='list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1'>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
  };

  const noteCountByCampaign = useMemo(() => {
    const counts = {};
    conceptNotes.forEach((note) => {
      const id = note?.campaignId?._id || note?.campaignId;
      if (id) {
        counts[id] = (counts[id] || 0) + 1;
      }
    });
    return counts;
  }, [conceptNotes]);

  const advertCountByCampaign = useMemo(() => {
    const counts = {};
    adverts.forEach((advert) => {
      const id = advert?.campaignId?._id || advert?.campaignId;
      if (id) {
        counts[id] = (counts[id] || 0) + 1;
      }
    });
    return counts;
  }, [adverts]);

  const filteredConceptNotes = useMemo(() => {
    if (!selectedCampaign) return [];
    return conceptNotes.filter(
      (note) => (note?.campaignId?._id || note?.campaignId) === selectedCampaign
    );
  }, [conceptNotes, selectedCampaign]);

  const filteredAdverts = useMemo(() => {
    if (!selectedCampaign) return [];
    return adverts.filter(
      (advert) => (advert?.campaignId?._id || advert?.campaignId) === selectedCampaign
    );
  }, [adverts, selectedCampaign]);

  const handleCreateAdvert = async (e) => {
    e.preventDefault();
    const payload = {
      ...newAdvert,
      campaignId: newAdvert.campaignId || selectedCampaign,
      estimatedCost: Number(newAdvert.estimatedCost || 0),
    };

    if (!payload.campaignId) {
      setError('Select a campaign before creating an advert');
      return;
    }

    try {
      setCreateAdvertLoading(true);
      setError('');
      const res = await fetch('/api/adverts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to create advert');
      }
      setAdverts((prev) => [data.data, ...prev]);
      setActionMessage('Advert created successfully');
      setNewAdvert({
        campaignId: '',
        title: '',
        description: '',
        platform: '',
        estimatedCost: ''
      });
    } catch (err) {
      setError(err.message || 'Unable to create advert');
    } finally {
      setCreateAdvertLoading(false);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusAdvertId) {
      setError('Select an advert to update');
      return;
    }
    try {
      setStatusLoading(true);
      setError('');
      const res = await fetch(`/api/adverts/${statusAdvertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: statusValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to update advert');
      }
      setAdverts((prev) => prev.map((ad) => (ad._id === data.data?._id ? data.data : ad)));
      setActionMessage('Advert status updated');
    } catch (err) {
      setError(err.message || 'Unable to update advert');
    } finally {
      setStatusLoading(false);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleAdvertId) {
      setError('Select an advert before adding a schedule');
      return;
    }
    if (!scheduleData.channel || !scheduleData.startDate || !scheduleData.endDate) {
      setError('Please fill all schedule fields');
      return;
    }
    try {
      setScheduleLoading(true);
      setError('');
      const payload = {
        ...scheduleData,
        cost: Number(scheduleData.cost || 0),
      };
      const res = await fetch(`/api/adverts/${scheduleAdvertId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to add schedule');
      }
      setAdverts((prev) => prev.map((ad) => (ad._id === data.data?._id ? data.data : ad)));
      setScheduleData({
        channel: '',
        startDate: '',
        endDate: '',
        cost: ''
      });
      setActionMessage('Schedule item added');
    } catch (err) {
      setError(err.message || 'Unable to add schedule');
    } finally {
      setScheduleLoading(false);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const campaignOptions = campaigns.map((campaign) => {
    const id = campaign._id;
    const noteCount = noteCountByCampaign[id] || 0;
    const advertCount = advertCountByCampaign[id] || 0;
    return (
      <option key={id} value={id}>
        {campaign.title} · {noteCount} notes · {advertCount} adverts
      </option>
    );
  });

  const renderConceptNotesList = (notes) => (
    <div className='space-y-3'>
      {notes.map((note) => (
        <div key={note._id} className='rounded-lg border border-gray-100 dark:border-gray-700 p-3'>
          <div className='flex items-center justify-between gap-2'>
            <div>
              <p className='font-semibold text-gray-900 dark:text-white'>{note.title || 'Untitled Concept'}</p>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {note.createdByStaffId?.firstName} {note.createdByStaffId?.lastName} ·{' '}
                {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
              </p>
            </div>
            <Badge color='purple'>{note.campaignId?.title || 'Campaign'}</Badge>
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line'>{note.content}</p>
        </div>
      ))}
    </div>
  );

  const renderAdvertsTable = (list) => (
    <Table hoverable>
      <Table.Head>
        <Table.HeadCell>Advert</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell>Est. Cost</Table.HeadCell>
        <Table.HeadCell>Actual Cost</Table.HeadCell>
        <Table.HeadCell>Created By</Table.HeadCell>
      </Table.Head>
      <Table.Body className='divide-y'>
        {list.map((advert) => (
          <Table.Row key={advert._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
            <Table.Cell>
              <p className='font-semibold'>{advert.title}</p>
              <p className='text-xs text-gray-500'>{advert.campaignId?.title}</p>
            </Table.Cell>
            <Table.Cell>
              <Badge color='info'>{advert.status}</Badge>
            </Table.Cell>
            <Table.Cell>{formatCurrency(advert.estimatedCost)}</Table.Cell>
            <Table.Cell>{formatCurrency(advert.actualCost)}</Table.Cell>
            <Table.Cell>
              {advert.createdByStaffId
                ? `${advert.createdByStaffId.firstName} ${advert.createdByStaffId.lastName}`
                : '—'}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );

  if (loading) {
    return (
      <div className='flex-1 flex items-center justify-center'>
        <Spinner size='xl' />
      </div>
    );
  }

  return (
    <div className='relative isolate flex-1 p-4 md:p-7 space-y-6'>
      <div
        aria-hidden='true'
        className='absolute inset-x-0 top-0 -z-50 transform-gpu overflow-hidden blur-3xl sm:-top-0'
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 85% 110%, 90% 125%, 95% 140%, 98% 155%, 100% 170%, 100% 200%)',
          }}
          className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#f093fb] to-[#f5576c] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse'
        />
      </div>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Campaign Operations</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Drill into a single campaign or review every concept note and advert in one place.
          </p>
        </div>
        {actionMessage && (
          <Alert color='success' onDismiss={() => setActionMessage('')}>
            {actionMessage}
          </Alert>
        )}
      </div>

      {error && (
        <Alert color='failure' onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className='space-y-4'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Select Campaign</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Options display the number of concept notes and adverts linked to each campaign.
          </p>
        </div>
        <Select
          value={selectedCampaign}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedCampaign(value);
            setNewAdvert((prev) => ({ ...prev, campaignId: value }));
            setStatusAdvertId('');
            setScheduleAdvertId('');
          }}
        >
          <option value=''>Pick a campaign</option>
          {campaignOptions}
        </Select>
        <div className='flex justify-end'>
          <Button outline gradientDuoTone='purpleToPink' onClick={handleOpenSummary} disabled={!selectedCampaign || summaryLoading}>
            {summaryLoading ? (
              <span className='flex items-center gap-2'>
                <Spinner size='sm' /> Generating...
              </span>
            ) : (
              'About this Campaign (AI)'
            )}
          </Button>
        </div>
      </Card>

      {selectedCampaign ? (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
            <Card className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Budget Validation</h3>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Requirement #7 – monitor total spend vs. approved budget.
                  </p>
                </div>
                {budgetLoading && <Spinner size='sm' />}
              </div>
              {budgetError && (
                <Alert color='failure' onDismiss={() => setBudgetError('')}>
                  {budgetError}
                </Alert>
              )}
              {budgetInfo && !budgetLoading && (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <TbSpeakerphone className='text-purple-500' />
                    <span className='font-semibold'>{budgetInfo.campaignTitle}</span>
                    <Badge color='info'>{budgetInfo.budgetStatus}</Badge>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-gray-500'>Budget</p>
                      <p className='text-lg font-semibold'>{formatCurrency(budgetInfo.campaignBudget)}</p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Advert Cost</p>
                      <p className='text-lg font-semibold'>{formatCurrency(budgetInfo.totalAdvertCost)}</p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Remaining</p>
                      <p className='text-lg font-semibold'>{formatCurrency(budgetInfo.remainingBudget)}</p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Usage</p>
                      <p className='text-lg font-semibold'>{Number(budgetInfo.budgetUsagePercentage).toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-gray-500'>Planned Start</p>
                      <p className='font-medium'>
                        {budgetInfo.plannedStartDate ? new Date(budgetInfo.plannedStartDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500'>Planned End</p>
                      <p className='font-medium'>
                        {budgetInfo.plannedEndDate ? new Date(budgetInfo.plannedEndDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Concept Notes</h3>
                <Badge color='purple'>{filteredConceptNotes.length} entries</Badge>
              </div>
              {filteredConceptNotes.length === 0 ? (
                <p className='text-sm text-gray-500 dark:text-gray-400'>No concept notes for this campaign yet.</p>
              ) : (
                <div className='max-h-80 overflow-y-auto pr-1'>
                  {renderConceptNotesList(filteredConceptNotes)}
                </div>
              )}
            </Card>
          </div>

          <Card className='space-y-6'>
            <div>
              <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Advert Operations</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Requirements #10 & #11 – create adverts, update statuses, and schedule publishing windows.
              </p>
            </div>
            <form onSubmit={handleCreateAdvert} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
              <Select
                value={newAdvert.campaignId || selectedCampaign}
                onChange={(e) => setNewAdvert({ ...newAdvert, campaignId: e.target.value })}
              >
                <option value=''>Campaign</option>
                {campaignOptions}
              </Select>
              <TextInput
                placeholder='Title'
                required
                value={newAdvert.title}
                onChange={(e) => setNewAdvert({ ...newAdvert, title: e.target.value })}
              />
              <TextInput
                placeholder='Platform'
                value={newAdvert.platform}
                onChange={(e) => setNewAdvert({ ...newAdvert, platform: e.target.value })}
              />
              <TextInput
                placeholder='Estimated Cost'
                type='number'
                min='0'
                value={newAdvert.estimatedCost}
                onChange={(e) => setNewAdvert({ ...newAdvert, estimatedCost: e.target.value })}
              />
              <Button type='submit' disabled={createAdvertLoading}>
                {createAdvertLoading ? (
                  <div className='flex items-center gap-2'>
                    <Spinner size='sm' /> Saving...
                  </div>
                ) : (
                  <>
                    <FaPlus />
                    <span>Create</span>
                  </>
                )}
              </Button>
              <div className='md:col-span-2 lg:col-span-5'>
                <Textarea
                  rows={2}
                  placeholder='Description (optional)'
                  value={newAdvert.description}
                  onChange={(e) => setNewAdvert({ ...newAdvert, description: e.target.value })}
                />
              </div>
            </form>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <form onSubmit={handleUpdateStatus} className='space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-800 dark:text-white'>Update Status</h4>
                <Select
                  value={statusAdvertId}
                  onChange={(e) => setStatusAdvertId(e.target.value)}
                >
                  <option value=''>Select advert</option>
                  {filteredAdverts.map((advert) => (
                    <option key={advert._id} value={advert._id}>
                      {advert.title}
                    </option>
                  ))}
                </Select>
                <Select value={statusValue} onChange={(e) => setStatusValue(e.target.value)}>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
                <Button type='submit' disabled={statusLoading}>
                  {statusLoading ? <Spinner size='sm' /> : 'Apply'}
                </Button>
              </form>

              <form onSubmit={handleAddSchedule} className='space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
                <h4 className='font-semibold text-gray-800 dark:text-white'>Add Publishing Schedule</h4>
                <Select
                  value={scheduleAdvertId}
                  onChange={(e) => setScheduleAdvertId(e.target.value)}
                >
                  <option value=''>Select advert</option>
                  {filteredAdverts.map((advert) => (
                    <option key={advert._id} value={advert._id}>
                      {advert.title}
                    </option>
                  ))}
                </Select>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <TextInput
                    placeholder='Channel (ex: TV, IG)'
                    value={scheduleData.channel}
                    onChange={(e) => setScheduleData({ ...scheduleData, channel: e.target.value })}
                  />
                  <TextInput
                    type='number'
                    min='0'
                    placeholder='Cost'
                    value={scheduleData.cost}
                    onChange={(e) => setScheduleData({ ...scheduleData, cost: e.target.value })}
                  />
                  <TextInput
                    type='date'
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduleData.startDate}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      setScheduleData({ 
                        ...scheduleData, 
                        startDate: startDate,
                        endDate: scheduleData.endDate && startDate > scheduleData.endDate ? '' : scheduleData.endDate
                      });
                    }}
                  />
                  <TextInput
                    type='date'
                    min={scheduleData.startDate || new Date().toISOString().split('T')[0]}
                    value={scheduleData.endDate}
                    onChange={(e) => setScheduleData({ ...scheduleData, endDate: e.target.value })}
                  />
                </div>
                <Button type='submit' disabled={scheduleLoading}>
                  {scheduleLoading ? <Spinner size='sm' /> : 'Add Schedule'}
                </Button>
              </form>
            </div>

            <div>
              <h4 className='font-semibold text-gray-800 dark:text-white mb-2'>Adverts for Selected Campaign</h4>
              {filteredAdverts.length === 0 ? (
                <p className='text-sm text-gray-500 dark:text-gray-400'>No adverts defined for this campaign yet.</p>
              ) : (
                <div className='overflow-x-auto'>{renderAdvertsTable(filteredAdverts)}</div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Select a campaign to unlock budget validation, concept note drilldowns, and advert controls.
          </p>
        </Card>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>All Concept Notes</h3>
            <Badge color='purple'>{conceptNotes.length}</Badge>
          </div>
          <div className='max-h-[400px] overflow-y-auto pr-1'>
            {conceptNotes.length === 0 ? (
              <p className='text-sm text-gray-500 dark:text-gray-400'>No concept notes recorded.</p>
            ) : (
              renderConceptNotesList(conceptNotes)
            )}
          </div>
        </Card>

        <Card className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>All Adverts</h3>
            <Badge color='info'>{adverts.length}</Badge>
          </div>
          <div className='overflow-x-auto max-h-[400px]'>
            {adverts.length === 0 ? (
              <p className='text-sm text-gray-500 dark:text-gray-400'>No adverts created yet.</p>
            ) : (
              renderAdvertsTable(adverts)
            )}
          </div>
        </Card>
      </div>

      <Modal show={showSummaryModal} onClose={() => setShowSummaryModal(false)} size='2xl'>
        <Modal.Header>Campaign Overview (AI)</Modal.Header>
        <Modal.Body>
          <div className='space-y-4'>
            {summaryLoading && (
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                <Spinner size='sm' />
                Generating summary...
              </div>
            )}
            {summaryError && (
              <Alert color='failure' onDismiss={() => setSummaryError('')}>
                {summaryError}
              </Alert>
            )}
            {!summaryLoading && !summaryError && summaryData && (
              <div className='space-y-4'>
                <div>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Summary</p>
                  <p className='text-sm text-gray-700 dark:text-gray-200'>{summaryData.summary || '—'}</p>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Concept Summary</p>
                  <p className='text-sm text-gray-700 dark:text-gray-200'>{summaryData.conceptSummary || '—'}</p>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Highlights</p>
                  {renderSummaryList(summaryData.highlights, 'No highlights available.')}
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Risks</p>
                  {renderSummaryList(summaryData.risks, 'No risks flagged.')}
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Next Actions</p>
                  {renderSummaryList(summaryData.nextActions, 'No next actions suggested.')}
                </div>
              </div>
            )}
            {!summaryLoading && !summaryError && !summaryData && (
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Select a campaign and generate an AI overview to see summary insights.
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            The overview is generated from campaign budgets, concept notes, and adverts.
          </p>
          <Button color='gray' onClick={() => setShowSummaryModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
