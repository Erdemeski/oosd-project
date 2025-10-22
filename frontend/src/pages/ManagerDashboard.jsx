import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import DashSidebar from '../components/ManagerDash/DashSidebar';
import ManagerDashboardMain from '../components/ManagerDash/DashboardMain';
import ManagerDashUsers from '../components/ManagerDash/DashUsers';

import ManagerDashClients from '../components/ManagerDash/DashClients';
import ManagerDashCampaigns from '../components/ManagerDash/DashCampaigns';
import NotFound from './NotFound';
import DashClientFeedbacks from '../components/ManagerDash/DashClientFeedbacks';

export default function ManagerDashboard() {

    const { currentUser } = useSelector((state) => state.user)
    const location = useLocation();
    const [tab, setTab] = useState('')
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const tabFromUrl = urlParams.get('tab')
        if (tabFromUrl) {
            setTab(tabFromUrl);
        } else {
            navigate(`/manager-dashboard?tab=dashboard`);
            setTab('dashboard');
        }
    }, [location.search, navigate]);

    const renderTabContent = () => {
        if (currentUser.isManager && tab === 'dashboard') return <ManagerDashboardMain />;
        if (currentUser.isManager && tab === 'users') return <ManagerDashUsers />;

        if (currentUser.isManager && tab === 'clients') return <ManagerDashClients />;
        if (currentUser.isManager && tab === 'campaigns') return <ManagerDashCampaigns />;
        if (currentUser.isManager && tab === 'client-feedbacks') return <DashClientFeedbacks />;
        return <NotFound />;
    }

    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            <div className='md:w-56 z-20'>
                <DashSidebar tab={tab} />
            </div>
            {renderTabContent()}
        </div>
    )
}
