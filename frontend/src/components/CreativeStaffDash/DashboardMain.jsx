import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, Spinner } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { HiLightBulb, HiCollection, HiSpeakerphone } from 'react-icons/hi';

export default function DashboardMain() {
  const { currentUser } = useSelector((state) => state.user);
  const [campaigns, setCampaigns] = useState([]);
  const [conceptNotes, setConceptNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        setLoading(true);
        setError('');
        const [campaignRes, notesRes] = await Promise.all([
          fetch('/api/campaigns/get-campaigns', { credentials: 'include' }),
          fetch('/api/concept-notes', { credentials: 'include' }),
        ]);
        const [campaignData, noteData] = await Promise.all([campaignRes.json(), notesRes.json()]);
        if (!campaignRes.ok) throw new Error(campaignData.error || 'Unable to load campaigns');
        if (!notesRes.ok) throw new Error(noteData.error || 'Unable to load concept notes');
        setCampaigns(campaignData.data || []);
        setConceptNotes(noteData.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load creative snapshot');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, []);

  const myNotes = useMemo(() => {
    if (!currentUser) return [];
    return conceptNotes.filter(
      (note) => note.createdByStaffId?._id === currentUser._id || note.createdByStaffId === currentUser._id
    );
  }, [conceptNotes, currentUser]);

  const coverage = useMemo(() => {
    const ids = new Set();
    conceptNotes.forEach((note) => {
      const id = note?.campaignId?._id || note?.campaignId;
      if (id) ids.add(id);
    });
    return ids.size;
  }, [conceptNotes]);

  const latestNote = useMemo(() => {
    if (conceptNotes.length === 0) return null;
    return [...conceptNotes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
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
          className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff6b6b] to-[#4ecdc4] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse'
        />
      </div>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Creative Staff Dashboard</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Snapshot of your impact and the team’s creative throughput.
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
            <span className='rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30'>
              <HiLightBulb size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>My Concept Notes</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{myNotes.length}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Keep ideating! Head to the Concept Note Studio to add your next idea.
          </p>
        </Card>

        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30'>
              <HiCollection size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Team Concept Notes</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{conceptNotes.length}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Serving {coverage} campaigns with fresh ideas ready for production.
          </p>
        </Card>

        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/30'>
              <HiSpeakerphone size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Campaign Coverage</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>
                {coverage}/{campaigns.length}
              </p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Aim for every live campaign to have at least one concept note.
          </p>
        </Card>

        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-teal-100 p-3 text-teal-600 dark:bg-teal-900/30'>
              <HiCollection size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Latest Idea</p>
              <p className='text-lg font-semibold text-gray-900 dark:text-white'>
                {latestNote ? latestNote.title || 'Untitled Concept' : 'No ideas yet'}
              </p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400 line-clamp-3'>
            {latestNote
              ? latestNote.content
              : 'Once you share an idea, it will appear here for quick access.'}
          </p>
        </Card>
      </div>

      {latestNote && (
        <Card className='p-6 space-y-3'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-lg font-semibold text-gray-800 dark:text-white'>Most Recent Concept</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {latestNote.createdByStaffId?.firstName} {latestNote.createdByStaffId?.lastName} ·{' '}
                {new Date(latestNote.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge color='purple'>{latestNote.campaignId?.title || 'Campaign'}</Badge>
          </div>
          <p className='text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line'>{latestNote.content}</p>
        </Card>
      )}
    </div>
  );
}

