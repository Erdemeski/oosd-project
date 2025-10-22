import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import DashSidebar from '../components/CreativeStaffDash/DashSidebar';
import CreativeStaffDashboardMain from '../components/CreativeStaffDash/DashboardMain';
import NotFound from './NotFound';

export default function CreativeStaffDashboard() {

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
            navigate(`/creative-staff-dashboard?tab=dashboard`);
            setTab('dashboard');
        }
    }, [location.search, navigate]);

    const renderTabContent = () => {
        if (currentUser.isCreativeStaff && tab === 'dashboard') return <CreativeStaffDashboardMain />;
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
