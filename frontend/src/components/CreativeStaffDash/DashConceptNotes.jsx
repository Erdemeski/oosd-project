import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Label, Modal, Select, Spinner, Textarea, TextInput, Table } from 'flowbite-react';
import { HiSparkles } from 'react-icons/hi';
import { useSelector } from 'react-redux';

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
  return `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

export default function DashConceptNotes() {
  const { currentUser } = useSelector((state) => state.user);
  const [campaigns, setCampaigns] = useState([]);
  const [conceptNotes, setConceptNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [noteForm, setNoteForm] = useState({
    campaignId: '',
    title: '',
    content: '',
    estimatedBudget: '',
  });

  const [notesCampaign, setNotesCampaign] = useState('');
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [ideaError, setIdeaError] = useState('');
  const [ideaResults, setIdeaResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [campaignRes, noteRes] = await Promise.all([
          fetch('/api/campaigns/get-campaigns', { credentials: 'include' }),
          fetch('/api/concept-notes', { credentials: 'include' }),
        ]);
        const [campaignData, noteData] = await Promise.all([campaignRes.json(), noteRes.json()]);
        if (!campaignRes.ok) throw new Error(campaignData.error || 'Unable to load campaigns');
        if (!noteRes.ok) throw new Error(noteData.error || 'Unable to load concept notes');
        setCampaigns(campaignData.data || []);
        setConceptNotes(noteData.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load concept note workspace');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const noteCountByCampaign = useMemo(() => {
    const counts = {};
    conceptNotes.forEach((note) => {
      const id = note?.campaignId?._id || note?.campaignId;
      if (id) counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [conceptNotes]);

  const filteredNotes = useMemo(() => {
    if (!notesCampaign) return [];
    return conceptNotes.filter(
      (note) => (note?.campaignId?._id || note?.campaignId) === notesCampaign
    );
  }, [conceptNotes, notesCampaign]);

  const handleConceptNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteForm.campaignId || !noteForm.content) {
      setError('Campaign and content fields are required');
      return;
    }
    const hasEstimatedBudget = noteForm.estimatedBudget !== '';
    const parsedBudget = hasEstimatedBudget ? Number(noteForm.estimatedBudget) : null;
    if (hasEstimatedBudget && (!Number.isFinite(parsedBudget) || parsedBudget < 0)) {
      setError('Estimated budget must be a positive number');
      return;
    }
    try {
      setError('');
      const payload = {
        campaignId: noteForm.campaignId,
        title: noteForm.title,
        content: noteForm.content,
      };
      if (hasEstimatedBudget) {
        payload.estimatedBudget = parsedBudget;
      }
      const res = await fetch('/api/concept-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to create concept note');
      }
      setConceptNotes((prev) => [data.data, ...prev]);
      setSuccessMessage('Concept note saved');
      setNoteForm({
        campaignId: '',
        title: '',
        content: '',
        estimatedBudget: '',
      });
      if (notesCampaign && (notesCampaign === data.data?.campaignId?._id || notesCampaign === data.data?.campaignId)) {
        setNotesCampaign(notesCampaign); // refresh filter pipeline
      }
    } catch (err) {
      setError(err.message || 'Unable to create concept note');
    } finally {
      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleOpenIdeaModal = () => {
    setIdeaPrompt(noteForm.content || '');
    setIdeaError('');
    setIdeaResults([]);
    setShowIdeaModal(true);
  };

  const handleGenerateIdeas = async () => {
    const trimmedPrompt = ideaPrompt.trim();
    if (!noteForm.campaignId) {
      setIdeaError('Select a campaign to generate ideas.');
      return;
    }
    if (!trimmedPrompt) {
      setIdeaError('Add a prompt or reference to generate ideas.');
      return;
    }
    try {
      setIdeaLoading(true);
      setIdeaError('');
      setIdeaResults([]);
      const res = await fetch('/api/concept-notes/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          campaignId: noteForm.campaignId,
          prompt: trimmedPrompt,
          titleHint: noteForm.title,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to generate ideas');
      }
      const ideas = Array.isArray(data.data) ? data.data : [];
      setIdeaResults(ideas);
    } catch (err) {
      setIdeaError(err.message || 'Unable to generate ideas right now.');
    } finally {
      setIdeaLoading(false);
    }
  };

  const handleUseIdea = (idea) => {
    const channelsLine = idea.channels?.length
      ? `\n\nSuggested channels:\n- ${idea.channels.join('\n- ')}`
      : '';
    setNoteForm((prev) => ({
      ...prev,
      title: idea.title,
      content: `${idea.summary}${channelsLine}`,
      estimatedBudget: idea.estimatedBudget ? String(idea.estimatedBudget) : prev.estimatedBudget,
    }));
    setShowIdeaModal(false);
  };

  const campaignOptions = campaigns.map((campaign) => {
    const count = noteCountByCampaign[campaign._id] || 0;
    return (
      <option key={campaign._id} value={campaign._id}>
        {campaign.title} · {count} notes
      </option>
    );
  });

  const renderNoteCards = (notes) => (
    <div className='space-y-3'>
      {notes.map((note) => (
        <div key={note._id} className='border border-gray-100 dark:border-gray-700 rounded-lg p-4'>
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
          {note.estimatedBudget !== undefined && note.estimatedBudget !== null && (
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
              Estimated budget: {formatCurrency(note.estimatedBudget)}
            </p>
          )}
        </div>
      ))}
    </div>
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
          className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff6b6b] to-[#4ecdc4] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse'
        />
      </div>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Concept Note Studio</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Requirement #8 & #9 – capture new ideas and browse every concept your team produced.
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
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Create Concept Note</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Share inspiration, references, or ready-to-produce ideas for any campaign.
          </p>
        </div>
        <form onSubmit={handleConceptNoteSubmit} className='space-y-4'>
          <Select
            value={noteForm.campaignId}
            onChange={(e) => setNoteForm({ ...noteForm, campaignId: e.target.value })}
          >
            <option value=''>Select a campaign</option>
            {campaignOptions}
          </Select>
          <TextInput
            placeholder='Concept title (optional)'
            value={noteForm.title}
            onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
          />
          <Textarea
            rows={5}
            placeholder='Describe your concept, references, or inspiration...'
            required
            value={noteForm.content}
            onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
          />
          <TextInput
            type='number'
            min='0'
            step='100'
            placeholder='Estimated budget (optional)'
            value={noteForm.estimatedBudget}
            onChange={(e) => setNoteForm({ ...noteForm, estimatedBudget: e.target.value })}
          />
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2'>
            <Button color='gray' type='button' onClick={handleOpenIdeaModal}>
              <HiSparkles className='mr-2 h-5 w-5' />
              Generate Ideas
            </Button>
            <Button type='submit'>Save Concept Note</Button>
          </div>
        </form>
      </Card>

      <Card className='space-y-4'>
        <div className='flex flex-col gap-1'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>Browse by Campaign</h3>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Pick a campaign to review everything created for it. Each option shows how many notes exist.
          </p>
        </div>
        <Select value={notesCampaign} onChange={(e) => setNotesCampaign(e.target.value)}>
          <option value=''>Select a campaign</option>
          {campaignOptions}
        </Select>
        {notesCampaign ? (
          filteredNotes.length === 0 ? (
            <p className='text-sm text-gray-500 dark:text-gray-400'>No concept notes saved yet.</p>
          ) : (
            <div className='max-h-[420px] overflow-y-auto pr-1'>{renderNoteCards(filteredNotes)}</div>
          )
        ) : (
          <p className='text-sm text-gray-500 dark:text-gray-400'>Select a campaign to view its notes.</p>
        )}
      </Card>

      <Card className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>All Concept Notes</h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              A full browse view without filters so everyone can stay aligned.
            </p>
          </div>
          <Badge color='purple'>{conceptNotes.length}</Badge>
        </div>
        {conceptNotes.length === 0 ? (
          <p className='text-sm text-gray-500 dark:text-gray-400'>No concept notes recorded.</p>
        ) : (
          <div className='overflow-x-auto'>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell>Campaign</Table.HeadCell>
                <Table.HeadCell>Created By</Table.HeadCell>
                <Table.HeadCell>Created At</Table.HeadCell>
                <Table.HeadCell>Est. Budget</Table.HeadCell>
              </Table.Head>
              <Table.Body className='divide-y'>
                {conceptNotes.map((note) => (
                  <Table.Row key={note._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>{note.title || 'Untitled Concept'}</Table.Cell>
                    <Table.Cell>{note.campaignId?.title || '—'}</Table.Cell>
                    <Table.Cell>
                      {note.createdByStaffId
                        ? `${note.createdByStaffId.firstName} ${note.createdByStaffId.lastName}`
                        : '—'}
                    </Table.Cell>
                    <Table.Cell>
                      {note.createdAt ? new Date(note.createdAt).toLocaleString() : '—'}
                    </Table.Cell>
                    <Table.Cell>
                      {note.estimatedBudget !== undefined && note.estimatedBudget !== null
                        ? formatCurrency(note.estimatedBudget)
                        : '—'}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>

      <Modal show={showIdeaModal} onClose={() => setShowIdeaModal(false)} size='2xl'>
        <Modal.Header>Generate Concept Ideas</Modal.Header>
        <Modal.Body>
          <div className='space-y-4'>
            <div className='grid gap-3 md:grid-cols-2'>
              <div>
                <Label htmlFor='ideaCampaign' value='Campaign' />
                <Select
                  id='ideaCampaign'
                  value={noteForm.campaignId}
                  onChange={(e) => setNoteForm({ ...noteForm, campaignId: e.target.value })}
                >
                  <option value=''>Select a campaign</option>
                  {campaignOptions}
                </Select>
              </div>
              <div>
                <Label htmlFor='ideaTitleHint' value='Title hint (optional)' />
                <TextInput
                  id='ideaTitleHint'
                  placeholder='Hero idea, campaign focus, or angle'
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor='ideaPrompt' value='Prompt or reference' />
              <Textarea
                id='ideaPrompt'
                rows={4}
                placeholder='Describe the inspiration, audience, or references for the idea...'
                value={ideaPrompt}
                onChange={(e) => setIdeaPrompt(e.target.value)}
              />
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                Use the campaign plus your prompt to steer tone, channel, and budget scope.
              </p>
            </div>
            {ideaError && (
              <Alert color='failure' onDismiss={() => setIdeaError('')}>
                {ideaError}
              </Alert>
            )}
            {ideaLoading && (
              <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
                <Spinner size='sm' />
                Generating ideas...
              </div>
            )}
            {!ideaLoading && ideaResults.length === 0 && (
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Add a prompt and click Generate to see AI ideas with estimated budgets.
              </p>
            )}
            {!ideaLoading && ideaResults.length > 0 && (
              <div className='space-y-3'>
                {ideaResults.map((idea) => (
                  <div key={idea.id} className='rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3'>
                    <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2'>
                      <div className='space-y-1'>
                        <p className='font-semibold text-gray-900 dark:text-white'>{idea.title}</p>
                        <p className='text-sm text-gray-600 dark:text-gray-300'>{idea.summary}</p>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        <Badge color='info'>Est. {formatCurrency(idea.estimatedBudget)}</Badge>
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {idea.channels.map((channel) => (
                        <Badge key={channel} color='gray'>
                          {channel}
                        </Badge>
                      ))}
                    </div>
                    {idea.estimatedBudget !== null && idea.estimatedBudget !== undefined && (
                      <div className='flex justify-end'>
                        <Button size='xs' onClick={() => handleUseIdea(idea)}>
                          Use this idea
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            Generated ideas are local suggestions. Adjust copy and budgets as needed.
          </p>
          <div className='flex flex-col sm:flex-row gap-2'>
            <Button color='gray' onClick={() => setShowIdeaModal(false)}>
              Close
            </Button>
            <Button onClick={handleGenerateIdeas} disabled={ideaLoading}>
              <HiSparkles className='mr-2 h-5 w-5' />
              Generate
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

