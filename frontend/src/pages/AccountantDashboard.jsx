import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import DashSidebar from '../components/AccountantDash/DashSidebar';
import AccountantDashboardMain from '../components/AccountantDash/DashboardMain';
import NotFound from './NotFound';

export default function AccountantDashboard() {

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
            navigate(`/accountant-dashboard?tab=dashboard`);
            setTab('dashboard');
        }
    }, [location.search, navigate]);

    const renderTabContent = () => {
        if (currentUser.isAccountant && tab === 'dashboard') return <AccountantDashboardMain />;
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
