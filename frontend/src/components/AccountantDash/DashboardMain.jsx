import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, Progress, Spinner, Table } from 'flowbite-react';
import { HiChartPie, HiCurrencyDollar, HiCollection } from 'react-icons/hi';
import { FaBalanceScale } from 'react-icons/fa';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-US');

export default function DashboardMain() {
  const [campaigns, setCampaigns] = useState([]);
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        setLoading(true);
        setError('');
        const [campaignRes, advertRes] = await Promise.all([
          fetch('/api/campaigns/get-campaigns', { credentials: 'include' }),
          fetch('/api/adverts', { credentials: 'include' }),
        ]);
        const [campaignData, advertData] = await Promise.all([campaignRes.json(), advertRes.json()]);
        if (!campaignRes.ok) throw new Error(campaignData.error || 'Unable to load campaigns');
        if (!advertRes.ok) throw new Error(advertData.error || 'Unable to load adverts');
        setCampaigns(campaignData.data || []);
        setAdverts(advertData.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load accountant snapshot');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, []);

  const metrics = useMemo(() => {
    if (campaigns.length === 0) return { overBudget: 0, avgUsage: 0, recorded: 0, pending: 0 };

    let overBudget = 0;
    let totalUsage = 0;
    let recordedCosts = 0;

    campaigns.forEach((campaign) => {
      const relatedAdverts = adverts.filter(
        (advert) => (advert?.campaignId?._id || advert?.campaignId) === campaign._id
      );
      const spend = relatedAdverts.reduce((sum, advert) => {
        if (advert.actualCost > 0) recordedCosts += 1;
        const cost = advert.actualCost > 0 ? advert.actualCost : advert.estimatedCost;
        return sum + cost;
      }, 0);
      const usage = campaign.budget > 0 ? spend / campaign.budget : 0;
      if (usage >= 1) overBudget += 1;
      totalUsage += usage;
    });

    const pending = adverts.length - recordedCosts;

    return {
      overBudget,
      avgUsage: Number(((totalUsage / campaigns.length) * 100).toFixed(1)),
      recorded: recordedCosts,
      pending: pending < 0 ? 0 : pending,
    };
  }, [campaigns, adverts]);

  const topPendingAdverts = useMemo(() => {
    return adverts
      .filter((advert) => advert.actualCost === 0)
      .sort((a, b) => b.estimatedCost - a.estimatedCost)
      .slice(0, 5);
  }, [adverts]);

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
          className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#48ff00] to-[#0f63e2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse'
        />
      </div>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Accountant Dashboard</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Monitor budgets, flag risk, and keep advert actuals up to date.
          </p>
        </div>
        {loading && <Spinner />}
      </div>

      {error && (
        <Alert color='failure' onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30'>
              <HiChartPie size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Campaigns Monitored</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{campaigns.length}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Across {formatNumber(adverts.length)} adverts currently in the system.
          </p>
        </Card>

        <Card className='p-6 space-y-4'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-orange-100 p-3 text-orange-600 dark:bg-orange-900/30'>
              <FaBalanceScale />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Budget Alerts</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{metrics.overBudget}</p>
            </div>
          </div>
          <div>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>Average Utilization</span>
              <span>{metrics.avgUsage}%</span>
            </div>
            <Progress progress={Math.min(metrics.avgUsage, 100)} color='yellow' />
          </div>
        </Card>

        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30'>
              <HiCurrencyDollar size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Actuals Recorded</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{metrics.recorded}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {formatNumber(metrics.pending)} advert(s) still waiting for a production cost entry.
          </p>
        </Card>

        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-slate-100 p-3 text-slate-600 dark:bg-slate-900/30'>
              <HiCollection size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Top Pending Items</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>
                {Math.min(metrics.pending, 99)}
              </p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Review the highest estimated adverts still lacking actual cost data.
          </p>
        </Card>
      </div>

      <Card className='p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-lg font-semibold text-gray-800 dark:text-white'>Largest Pending Actuals</p>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Requirement #10 – prioritize recording the biggest spends first.
            </p>
          </div>
          <Badge color='gray'>{topPendingAdverts.length}</Badge>
        </div>
        {topPendingAdverts.length === 0 ? (
          <p className='text-sm text-gray-500 dark:text-gray-400'>All adverts have recorded costs. 🎉</p>
        ) : (
          <div className='overflow-x-auto'>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Advert</Table.HeadCell>
                <Table.HeadCell>Campaign</Table.HeadCell>
                <Table.HeadCell>Estimated Cost</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body className='divide-y'>
                {topPendingAdverts.map((advert) => (
                  <Table.Row key={advert._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>{advert.title}</Table.Cell>
                    <Table.Cell>{advert.campaignId?.title || '—'}</Table.Cell>
                    <Table.Cell>{formatNumber(advert.estimatedCost)}</Table.Cell>
                    <Table.Cell>{advert.status}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
