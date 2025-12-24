import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, Progress, Spinner, Table } from 'flowbite-react';
import { HiChartPie, HiUsers, HiBriefcase, HiLightBulb } from 'react-icons/hi';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-US');

export default function DashboardMain() {
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [conceptNotes, setConceptNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError('');
        const [userRes, clientRes, campaignRes, conceptRes] = await Promise.all([
          fetch('/api/user/getusers', { credentials: 'include' }),
          fetch('/api/clients/get-clients', { credentials: 'include' }),
          fetch('/api/campaigns/get-campaigns', { credentials: 'include' }),
          fetch('/api/concept-notes', { credentials: 'include' }),
        ]);

        const [userData, clientData, campaignData, conceptData] = await Promise.all([
          userRes.json(),
          clientRes.json(),
          campaignRes.json(),
          conceptRes.json(),
        ]);

        if (!userRes.ok) throw new Error(userData.message || 'Unable to load users');
        if (!clientRes.ok) throw new Error(clientData.error || 'Unable to load clients');
        if (!campaignRes.ok) throw new Error(campaignData.error || 'Unable to load campaigns');
        if (!conceptRes.ok) throw new Error(conceptData.error || 'Unable to load concept notes');

        setUsers(userData.users || []);
        setClients(clientData.data || []);
        setCampaigns(campaignData.data || []);
        setConceptNotes(conceptData.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load admin snapshot');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const roleBreakdown = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        if (user.isAdmin) acc.admin += 1;
        if (user.isManager) acc.manager += 1;
        if (user.isAccountant) acc.accountant += 1;
        if (user.isCreativeStaff) acc.creative += 1;
        return acc;
      },
      { admin: 0, manager: 0, accountant: 0, creative: 0 }
    );
  }, [users]);

  const recentStaff = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [users]);

  const topClients = useMemo(() => {
    const counts = campaigns.reduce((acc, campaign) => {
      const id = campaign.clientId?._id || campaign.clientId;
      if (id) {
        acc[id] = (acc[id] || 0) + 1;
      }
      return acc;
    }, {});
    const enriched = clients.map((client) => ({
      ...client,
      campaignCount: counts[client._id] || 0,
    }));
    return enriched.sort((a, b) => b.campaignCount - a.campaignCount).slice(0, 5);
  }, [clients, campaigns]);

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
          className='relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#667eea] to-[#764ba2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse'
        />
      </div>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Admin Dashboard</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Organization-wide metrics for staff, clients, and production activity.
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
            <span className='rounded-full bg-sky-100 p-3 text-sky-600 dark:bg-sky-900/30'>
              <HiUsers size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Staff</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{users.length}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Admin {roleBreakdown.admin} · Managers {roleBreakdown.manager} · Accountants {roleBreakdown.accountant} · Creative {roleBreakdown.creative}
          </p>
        </Card>

        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30'>
              <HiBriefcase size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Clients</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{clients.length}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {campaigns.length} active campaign relationships in total.
          </p>
        </Card>

        <Card className='p-6 space-y-4'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/30'>
              <HiChartPie size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Campaign Health</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{campaigns.length}</p>
            </div>
          </div>
          <div>
            <div className='flex items-center justify-between text-xs text-gray-500'>
              <span>Concept Coverage</span>
              <span>
                {campaigns.length ? Math.round((conceptNotes.length / campaigns.length) * 100) : 0}%
              </span>
            </div>
            <Progress
              progress={
                campaigns.length ? Math.min((conceptNotes.length / campaigns.length) * 100, 100) : 0
              }
              color='purple'
            />
          </div>
        </Card>

        <Card className='p-6 space-y-3'>
          <div className='flex items-center gap-3'>
            <span className='rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-900/30'>
              <HiLightBulb size={20} />
            </span>
            <div>
              <p className='text-sm uppercase tracking-wide text-gray-500'>Concept Notes</p>
              <p className='text-3xl font-semibold text-gray-900 dark:text-white'>{conceptNotes.length}</p>
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Track ideation velocity and collaboration between creative staff and managers.
          </p>
        </Card>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        <Card className='p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-lg font-semibold text-gray-800 dark:text-white'>Recent Staff Onboarding</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Latest staffs created in the platform (auto-refreshes on load).
              </p>
            </div>
            <Badge color='gray'>{recentStaff.length}</Badge>
          </div>
          {recentStaff.length === 0 ? (
            <p className='text-sm text-gray-500 dark:text-gray-400'>No staff members found.</p>
          ) : (
            <div className='overflow-x-auto'>
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Name</Table.HeadCell>
                  <Table.HeadCell>Staff ID</Table.HeadCell>
                  <Table.HeadCell>Roles</Table.HeadCell>
                  <Table.HeadCell>Created At</Table.HeadCell>
                </Table.Head>
                <Table.Body className='divide-y'>
                  {recentStaff.map((user) => (
                    <Table.Row key={user._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                      <Table.Cell>{user.firstName} {user.lastName}</Table.Cell>
                      <Table.Cell>{user.staffId}</Table.Cell>
                      <Table.Cell className='text-xs text-gray-500'>
                        {[
                          user.isAdmin && 'Admin',
                          user.isManager && 'Manager',
                          user.isAccountant && 'Accountant',
                          user.isCreativeStaff && 'Creative',
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Staff'}
                      </Table.Cell>
                      <Table.Cell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Card>

        <Card className='p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-lg font-semibold text-gray-800 dark:text-white'>Top Clients by Campaign Count</p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Helps prioritize account management and staffing decisions.
              </p>
            </div>
            <Badge color='gray'>{topClients.length}</Badge>
          </div>
          {topClients.length === 0 ? (
            <p className='text-sm text-gray-500 dark:text-gray-400'>No clients available.</p>
          ) : (
            <div className='overflow-x-auto'>
              <Table hoverable>
                <Table.Head>
                  <Table.HeadCell>Client</Table.HeadCell>
                  <Table.HeadCell>Company</Table.HeadCell>
                  <Table.HeadCell>Campaigns</Table.HeadCell>
                </Table.Head>
                <Table.Body className='divide-y'>
                  {topClients.map((client) => (
                    <Table.Row key={client._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                      <Table.Cell>{client.name} {client.surname}</Table.Cell>
                      <Table.Cell>{client.companyName || '—'}</Table.Cell>
                      <Table.Cell>{client.campaignCount}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
