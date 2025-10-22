import React, { useState } from 'react'
import { Button, Modal, Sidebar } from 'flowbite-react'
import { HiArrowSmLeft, HiArrowSmRight, HiChartPie, HiOutlineUserGroup, HiOutlineCog, HiUsers, HiSpeakerphone } from 'react-icons/hi'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signoutSuccess } from '../../redux/user/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { GrContact } from "react-icons/gr";

export default function DashSidebar({ tab }) {
    const location = useLocation();
    const dispatch = useDispatch();
    const [showSignout, setShowSignout] = useState(false);
    const { currentUser } = useSelector(state => state.user);
    const navigate = useNavigate();

    const handleSignout = async () => {
        try {
            const res = await fetch('/api/user/signout', {
                method: 'POST',
            });
            const data = await res.json();
            if (!res.ok) {
                console.log(data.message);
            } else {
                dispatch(signoutSuccess());
                setShowSignout(false);
                navigate('/');
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div className='h-full'>
            <Sidebar
                className='w-full md:w-56 h-full'
                theme={{
                    root: {
                        inner: "h-full overflow-y-auto overflow-x-hidden rounded bg-gray-50 px-3 py-4 dark:bg-[rgb(32,38,43)] dark:border-b-2 dark:border-gray-700"
                    },
                    item: {
                        base: "flex items-center justify-center rounded-lg p-2 text-sm font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700",
                        active: "bg-gray-100 dark:bg-gray-700",
                        content: {
                            base: "flex-1 whitespace-nowrap pl-3"
                        },
                    },
                    itemGroup: {
                        base: "mt-2 space-y-2 border-t border-gray-200 pt-2 first:mt-0 first:border-t-0 first:pt-0 dark:border-gray-700"
                    }
                }}
            >
                <Sidebar.Items>
                    <Sidebar.ItemGroup className='flex flex-col gap-1'>
                        <Sidebar.Item icon={HiArrowSmLeft} className='cursor-pointer' onClick={() => navigate('/dashboard-director')}>Dashboard Director</Sidebar.Item>
                    </Sidebar.ItemGroup>
                    
                    <Sidebar.ItemGroup className='flex flex-col gap-1'>
                        {currentUser && currentUser.isAdmin && (
                            <Link to='/admin-dashboard?tab=dashboard'>
                                <Sidebar.Item active={tab === 'dashboard' || !tab} icon={HiChartPie} as='div' label="Admin" labelColor="failure">Dashboard</Sidebar.Item>
                            </Link>
                        )}
                        {currentUser && currentUser.isAdmin && (
                            <Link to='/admin-dashboard?tab=users'>
                                <Sidebar.Item active={tab === 'users'} icon={HiOutlineUserGroup} as='div'>Users</Sidebar.Item>
                            </Link>
                        )}
                        {currentUser && currentUser.isAdmin && (
                            <Link to='/admin-dashboard?tab=clients'>
                                <Sidebar.Item active={tab === 'clients'} icon={HiUsers} as='div'>Clients</Sidebar.Item>
                            </Link>
                        )}
                        {currentUser && currentUser.isAdmin && (
                            <Link to='/admin-dashboard?tab=campaigns'>
                                <Sidebar.Item active={tab === 'campaigns'} icon={HiSpeakerphone} as='div'>Campaigns</Sidebar.Item>
                            </Link>
                        )}
                        {currentUser && currentUser.isAdmin && (
                            <Link to='/admin-dashboard?tab=settings'>
                                <Sidebar.Item active={tab === 'settings'} icon={HiOutlineCog} as='div'>Settings</Sidebar.Item>
                            </Link>
                        )}
                        {currentUser && currentUser.isAdmin && (
                            <Link to='/admin-dashboard?tab=client-feedbacks'>
                                <Sidebar.Item active={tab === 'client-feedbacks'} icon={GrContact} as='div'>Client Feedbacks</Sidebar.Item>
                            </Link>
                        )}
                    </Sidebar.ItemGroup>
                    
                    <Sidebar.ItemGroup className='flex flex-col gap-1'>
                        <Sidebar.Item icon={HiArrowSmRight} className='cursor-pointer' onClick={() => setShowSignout(true)}>Sign Out</Sidebar.Item>
                    </Sidebar.ItemGroup>
                </Sidebar.Items>
            </Sidebar>

            <Modal show={showSignout} onClose={() => setShowSignout(false)} popup size='md'>
                <Modal.Header />
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Are you sure you want to sign out?</h3>
                        <div className='flex justify-center gap-6'>
                            <Link to={'/'}>
                                <Button color='warning' onClick={handleSignout}>Yes, sign out</Button>
                            </Link>
                            <Button color='gray' onClick={() => setShowSignout(false)}>Cancel</Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}