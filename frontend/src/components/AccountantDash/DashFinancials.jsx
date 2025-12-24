import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Select, Spinner, Table, TextInput } from 'flowbite-react';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

export default function DashFinancials() {
  const [campaigns, setCampaigns] = useState([]);
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState('');

  const [advertsError, setAdvertsError] = useState('');
  const [costUpdates, setCostUpdates] = useState({});
  const [costUpdateLoading, setCostUpdateLoading] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBasics = async () => {
      try {
        setLoading(true);
        setError('');
        const [campaignRes, advertsRes] = await Promise.all([
          fetch('/api/campaigns/get-campaigns', { credentials: 'include' }),
          fetch('/api/adverts', { credentials: 'include' }),
        ]);
        const [campaignData, advertsData] = await Promise.all([
          campaignRes.json(),
          advertsRes.json(),
        ]);
        if (!campaignRes.ok) throw new Error(campaignData.error || 'Unable to load campaigns');
        if (!advertsRes.ok) throw new Error(advertsData.error || 'Unable to load adverts');
        setCampaigns(campaignData.data || []);
        setAdverts(advertsData.data || []);
        console.log(campaignData.data);
        console.log(advertsData.data);
      } catch (err) {
        setError(err.message || 'Unable to load financial data');
      } finally {
        setLoading(false);
      }
    };

    fetchBasics();
  }, []);

  useEffect(() => {
    if (!selectedCampaign) {
      setBudgetInfo(null);
      setBudgetError('');
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

  const refreshBudgetInfo = async () => {
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
    setBudgetError(err.message || 'Unable to fetch budget info');
  } finally {
    setBudgetLoading(false);
  }
};

  const advertsByCampaign = useMemo(() => {
    const map = {};
    adverts.forEach((advert) => {
      const id = advert?.campaignId?._id || advert?.campaignId;
      if (!map[id]) map[id] = [];
      map[id].push(advert);
    });
    return map;
  }, [adverts]);

  const selectedCampaignAdverts = selectedCampaign ? advertsByCampaign[selectedCampaign] || [] : [];

  const campaignOptions = campaigns.map((campaign) => {
    const advertsCount = (advertsByCampaign[campaign._id] || []).length;
    const actualsRecorded = (advertsByCampaign[campaign._id] || []).filter((ad) => ad.actualCost > 0).length;
    return (
      <option key={campaign._id} value={campaign._id}>
        {campaign.title} · {advertsCount} adverts · {actualsRecorded} recorded
      </option>
    );
  });

  const handleActualCostUpdate = async (advertId) => {
    const value = costUpdates[advertId];
    if (value === undefined || value === '') {
      setAdvertsError('Enter an actual cost before saving');
      return;
    }
    try {
      setCostUpdateLoading(advertId);
      setAdvertsError('');
      const res = await fetch(`/api/adverts/${advertId}/actual-cost`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ actualCost: Number(value) }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to update actual cost');
      }
      setAdverts((prev) => prev.map((advert) => (advert._id === data.data?._id ? data.data : advert)));
      setCostUpdates((prev) => ({ ...prev, [advertId]: '' }));
      setSuccessMessage('Actual cost updated');
    } catch (err) {
      setAdvertsError(err.message || 'Unable to update actual cost');
    } finally {
      setCostUpdateLoading('');
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const renderAdvertsTable = (list, enableEdit = false) => (
    <Table hoverable>
      <Table.Head>
        <Table.HeadCell>Advert</Table.HeadCell>
        <Table.HeadCell>Estimated</Table.HeadCell>
        <Table.HeadCell>Actual</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell>Created By</Table.HeadCell>
        <Table.HeadCell>Created At</Table.HeadCell>
        {enableEdit && <Table.HeadCell>Update</Table.HeadCell>}
      </Table.Head>
      <Table.Body className='divide-y'>
        {list.map((advert) => (
          <Table.Row key={advert._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
            <Table.Cell>
              <p className='font-semibold'>{advert.title}</p>
              <p className='text-xs text-gray-500'>{advert.campaignId?.title}</p>
            </Table.Cell>
            <Table.Cell>{formatCurrency(advert.estimatedCost)}</Table.Cell>
            <Table.Cell>{formatCurrency(advert.actualCost)}</Table.Cell>
            <Table.Cell>{advert.status}</Table.Cell>
            <Table.Cell>
              {advert.createdByStaffId
                ? `${advert.createdByStaffId.firstName} ${advert.createdByStaffId.lastName}`
                : '—'}
            </Table.Cell>
            <Table.Cell>
              {advert.createdDate ? new Date(advert.createdDate).toLocaleDateString() : '—'} - {advert.createdDate ? new Date(advert.createdDate).toLocaleTimeString() : '—'}
            </Table.Cell>
            {enableEdit && (
              <Table.Cell>
                <div className='flex flex-col gap-2'>
                  <TextInput
                    type='number'
                    min='0'
                    placeholder='Actual cost'
                    value={costUpdates[advert._id] ?? ''}
                    onChange={(e) =>
                      setCostUpdates((prev) => ({
                        ...prev,
                        [advert._id]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    size='xs'
                    onClick={() => handleActualCostUpdate(advert._id)}
                    disabled={costUpdateLoading === advert._id}
                  >
                    {costUpdateLoading === advert._id ? <Spinner size='sm' /> : 'Save'}
                  </Button>
                </div>
              </Table.Cell>
            )}
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
    <div className='relative isolate flex-1 p-4 md:p-7 space-y-6 overflow-x-scroll scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      <div
        aria-hidden='true'
        className='absolute inset-x-0 top-0 -z-50 transform-gpu overflow-hidden blur-3xl sm:-top-0'
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 85% 110%, 90% 125%, 95% 140%, 98% 155%, 100% 170%, 100% 200%)',
          }}
          className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#48ff00] to-[#0f63e2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse'
        />
      </div>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Financial Controls</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Validate budgets and record actual costs from a single workspace.
          </p>
        </div>
        {successMessage && (
          <Alert color='success' onDismiss={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
      </div>

      {error && (
        <Alert color='failure' onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className='space-y-4'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Choose Campaign</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Requirement #7 and #10 – selector shows advert volume and how many have recorded costs.
          </p>
        </div>
        <Select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
        >
          <option value=''>Select a campaign</option>
          {campaignOptions}
        </Select>
      </Card>

      {selectedCampaign ? (
        <div className='flex flex-col md:flex-row gap-6'>
          <Card className='space-y-4 w-full md:max-w-md min-w-[300px]'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Budget Validation</h3>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Requirement #7 – check spend vs. approved budget.
                </p>
              </div>
              <div >
                <Button size='xs' color='gray' onClick={refreshBudgetInfo}>Refresh</Button>
              </div>
              {budgetLoading && <Spinner size='sm' />}
            </div>
            {budgetError && (
              <Alert color='failure' onDismiss={() => setBudgetError('')}>
                {budgetError}
              </Alert>
            )}
            {budgetInfo && !budgetLoading && (
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-gray-500 dark:text-gray-400'>Budget</p>
                  <p className='text-lg font-semibold'>{formatCurrency(budgetInfo.campaignBudget)}</p>
                </div>
                <div>
                  <p className='text-gray-500 dark:text-gray-400'>Advert Cost</p>
                  <p className='text-lg font-semibold'>{formatCurrency(budgetInfo.totalAdvertCost)}</p>
                </div>
                <div>
                  <p className='text-gray-500 dark:text-gray-400'>Remaining</p>
                  <p className='text-lg font-semibold'>{formatCurrency(budgetInfo.remainingBudget)}</p>
                </div>
                <div>
                  <p className='text-gray-500 dark:text-gray-400'>Usage</p>
                  <p className='text-lg font-semibold'>{Number(budgetInfo.budgetUsagePercentage).toFixed(2)}%</p>
                </div>
              </div>
            )}
          </Card>

          <Card className='space-y-4 w-full md:max-w-full'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Record Actual Costs</h3>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Requirement #10 – update production spend per advert.
                </p>
              </div>
              <Badge color='info'>{selectedCampaignAdverts.length} adverts</Badge>
            </div>
            {advertsError && (
              <Alert color='failure' onDismiss={() => setAdvertsError('')}>
                {advertsError}
              </Alert>
            )}
            {selectedCampaignAdverts.length === 0 ? (
              <p className='text-sm text-gray-500 dark:text-gray-400'>No adverts for this campaign yet.</p>
            ) : (
              <div className='overflow-x-auto max-h-[360px]'>
                {renderAdvertsTable(selectedCampaignAdverts, true)}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Select a campaign to see its budget position and associated adverts for cost recording.
          </p>
        </Card>
      )}

      <Card className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>All Adverts (Browse View)</h3>
          <Badge color='gray'>{adverts.length}</Badge>
        </div>
        <div className='overflow-x-auto'>
          {adverts.length === 0 ? (
            <p className='text-sm text-gray-500 dark:text-gray-400'>No adverts recorded.</p>
          ) : (
            renderAdvertsTable(adverts, false)
          )}
        </div>
      </Card>
    </div>
  );
}



