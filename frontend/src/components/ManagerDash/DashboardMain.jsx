import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, Progress, Spinner } from 'flowbite-react';
import { HiChartPie, HiLightBulb, HiSpeakerphone } from 'react-icons/hi';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function DashboardMain() {
  const [campaigns, setCampaigns] = useState([]);
  const [conceptNotes, setConceptNotes] = useState([]);
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        setLoading(true);
        setError('');
        const [campaignRes, conceptRes, advertRes] = await Promise.all([
          fetch('/api/campaigns/get-campaigns', { credentials: 'include' }),
          fetch('/api/concept-notes', { credentials: 'include' }),
          fetch('/api/adverts', { credentials: 'include' }),
        ]);

        const [campaignData, conceptData, advertData] = await Promise.all([
          campaignRes.json(),
          conceptRes.json(),
          advertRes.json(),
        ]);

        if (!campaignRes.ok) throw new Error(campaignData.error || 'Unable to load campaigns');
        if (!conceptRes.ok) throw new Error(conceptData.error || 'Unable to load concept notes');
        if (!advertRes.ok) throw new Error(advertData.error || 'Unable to load adverts');

        setCampaigns(campaignData.data || []);
        setConceptNotes(conceptData.data || []);
        setAdverts(advertData.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard snapshot');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, []);

  const budgetInsights = useMemo(() => {
    if (campaigns.length === 0) {
      return { alerts: 0, avgUsage: 0, overBudget: 0 };
    }

    let alerts = 0;
    let overBudget = 0;
    let totalUsage = 0;

    campaigns.forEach((campaign) => {
      const relatedAdverts = adverts.filter(
        (advert) => (advert?.campaignId?._id || advert?.campaignId) === campaign._id
      );
      const spend = relatedAdverts.reduce((sum, advert) => {
        const cost = advert.actualCost > 0 ? advert.actualCost : advert.estimatedCost;
        return sum + cost;
      }, 0);
      const usage = campaign.budget > 0 ? spend / campaign.budget : 0;
      if (usage >= 1) {
        overBudget += 1;
      } else if (usage >= 0.8) {
        alerts += 1;
      }
      totalUsage += usage;
    });

    return {
      alerts,
      overBudget,
      avgUsage: Number(((totalUsage / campaigns.length) * 100).toFixed(1)),
    };
  }, [campaigns, adverts]);

  const conceptCoverage = useMemo(() => {
    const coverage = new Set();
    conceptNotes.forEach((note) => {
      const id = note?.campaignId?._id || note?.campaignId;
      if (id) coverage.add(id);
    });
    return coverage.size;
  }, [conceptNotes]);

  const recentConcepts = useMemo(() => {
    return [...conceptNotes]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [conceptNotes]);

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
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Manager Dashboard</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Operational snapshot across campaigns, creative throughput, and advert health.
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
            <span className='rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30'>
              <HiChartPie size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Active Campaigns</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{campaigns.length}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Concept coverage on {conceptCoverage}/{campaigns.length || 1} campaigns.
          </p>
        </Card>

        <Card className='p-6 space-y-4'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/30'>
              <FaExclamationTriangle />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Budget Alerts</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{budgetInsights.alerts}</p>
            </div>
          </div>
          <div>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>Average Utilization</span>
              <span>{budgetInsights.avgUsage}%</span>
            </div>
            <Progress progress={Math.min(budgetInsights.avgUsage, 100)} color='pink' />
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {budgetInsights.overBudget} campaign(s) already exceeded their limit.
          </p>
        </Card>

        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30'>
              <HiLightBulb size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Concept Notes</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{conceptNotes.length}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Review every idea inside the Concept Note Explorer workspace.
          </p>
        </Card>

        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30'>
              <HiSpeakerphone size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Adverts In Flight</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{adverts.length}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Manage status, schedules, and costs from the Operations tab.
          </p>
        </Card>
      </div>

      <Card className='p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-lg font-semibold text-gray-800 dark:text-white'>Latest Concept Notes</p>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              A quick glance at what the creative staff has produced most recently.
            </p>
          </div>
          <Badge color='purple'>{recentConcepts.length}</Badge>
        </div>
        {recentConcepts.length === 0 ? (
          <p className='text-sm text-gray-500 dark:text-gray-400'>No concept notes recorded yet.</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {recentConcepts.map((note) => (
              <div key={note._id} className='rounded-xl border border-gray-200 dark:border-gray-700 p-4'>
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
                <p className='text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3'>{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
