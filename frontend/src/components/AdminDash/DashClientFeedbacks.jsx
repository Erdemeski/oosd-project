import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Badge, Spinner, Table } from 'flowbite-react'
import { HiArrowNarrowUp } from 'react-icons/hi'
import { HiMiniArrowSmallRight } from 'react-icons/hi2';
import { IoIosMail } from 'react-icons/io';

export default function DashClientFeedbacks() {

    const { currentUser } = useSelector((state) => state.user)
    const [feedbacks, setFeedbacks] = useState([])
    const [showMore, setShowMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [totalFeedback, setTotalFeedback] = useState(0)
    const [lastMonthFeedbacks, setLastMonthFeedbacks] = useState(0);

    // Feedback'in yeni olup olmadığını kontrol eden fonksiyon (son 24 saat)
    const isNewFeedback = (createdAt) => {
        const feedbackDate = new Date(createdAt);
        const now = new Date();
        const diffInHours = (now - feedbackDate) / (1000 * 60 * 60);
        return diffInHours <= 24;
    };



    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const res = await fetch('/api/contact/getContacts')
                const data = await res.json()
                if (res.ok) {
                    setLoading(false);
                    setFeedbacks(data.contacts);
                    setTotalFeedback(data.totalContacts);
                    setLastMonthFeedbacks(data.lastMonthContacts);
                    setShowMore(data.totalContacts > data.contacts.length);
                }

            } catch (error) {
                setLoading(true);
                console.log(error.message)
            }
        };
        if (currentUser.isAdmin || currentUser.isManager) {
            fetchFeedbacks();

        }
    }, [currentUser._id])


    const handleShowMore = async () => {
        const startIndex = feedbacks.length;
        try {
            const res = await fetch(`/api/contact/getContacts?startIndex=${startIndex}`);
            const data = await res.json();
            if (res.ok) {
                setFeedbacks((prev) => [...prev, ...data.contacts]);
                setShowMore(totalFeedback > feedbacks.length + data.contacts.length);
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    /*     if (loading) return (
            <div className='flex p-5 justify-center pb-96 items-center md:items-baseline min-h-screen'>
                <Spinner size='xl' />
                <p className='text-center text-gray-500 m-2'>Loading...</p>
            </div>
        );
     */

    return (
        <div className='relative isolate flex p-3 w-full flex-1'>
            <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 -z-50 transform-gpu overflow-hidden blur-3xl sm:-top-0"
            >
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 85% 110%, 90% 125%, 95% 140%, 98% 155%, 100% 170%, 100% 200%)',
                    }}
                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#667eea] to-[#764ba2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse"
                />
            </div>

            {loading ? (
                <div className='flex p-5 justify-center pb-96 items-center md:items-baseline min-h-screen'>
                    <Spinner size='xl' />
                    <p className='text-center text-gray-500 m-2'>Loading...</p>
                </div>
            ) : (


                <div className='relative isolate flex flex-col gap-3 md:mx-auto pt-3 overflow-x-scroll p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>

                    <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4'>
                        <div className='mb-4'>
                            <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Client Feedbacks</h1>
                            <p className='text-gray-600 dark:text-gray-400 mt-1'>
                                Manage client feedbacks and their details.
                            </p>
                        </div>
                        <div className='flex flex-wrap justify-center md:justify-between'>
                            <div className='flex flex-col p-3 dark:bg-slate-800 gap-4 md:w-72 w-full rounded-md shadow-md'>
                                <div className='flex justify-between'>
                                    <div>
                                        <h3 className='text-gray-500 text-md uppercase'>Total Feedbacks</h3>
                                        <p className='text-2xl'>{totalFeedback}</p>
                                    </div>
                                    <IoIosMail className='bg-red-700 text-white rounded-full text-5xl p-3 shadow-lg' />
                                </div>
                                <div className='flex gap-2 text-sm'>
                                    <span className={`${lastMonthFeedbacks === 0 ? 'text-gray-500' : 'text-green-500'} flex items-center`}>
                                        {lastMonthFeedbacks === 0 ? <HiMiniArrowSmallRight /> : <HiArrowNarrowUp />}
                                        {lastMonthFeedbacks}
                                    </span>
                                    <div className='text-gray-500  dark:text-gray-400'>Last month</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='min-h-[86vh] table-auto'>
                        {(currentUser.isAdmin || currentUser.isManager) && feedbacks.length > 0 ? (
                            <>
                                <Table hoverable className='shadow-md'>
                                    <Table.Head>
                                        <Table.HeadCell>Date Sended</Table.HeadCell>
                                        <Table.HeadCell>Name</Table.HeadCell>
                                        <Table.HeadCell>Surname</Table.HeadCell>
                                        <Table.HeadCell>Email</Table.HeadCell>
                                        <Table.HeadCell>Phone Number</Table.HeadCell>
                                        <Table.HeadCell>Message</Table.HeadCell>
                                    </Table.Head>
                                    {feedbacks.map((feedback) => (
                                        <Table.Body key={feedback._id} className='divide-y'>
                                            <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                                                <Table.Cell>
                                                    <div className='flex items-center gap-2'>
                                                        {new Date(feedback.createdAt).toLocaleDateString() + ' ' + new Date(feedback.createdAt).toLocaleTimeString()}
                                                        {isNewFeedback(feedback.createdAt) && (
                                                            <Badge color="success">NEW</Badge>
                                                        )}
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {feedback.name}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {feedback.surname}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {feedback.email}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {feedback.phoneNumber}
                                                </Table.Cell>
                                                <Table.Cell className='min-w-[400px]'>
                                                    {feedback.message}
                                                </Table.Cell>
                                            </Table.Row>
                                        </Table.Body>
                                    ))}
                                </Table>
                                {showMore && (
                                    <button onClick={handleShowMore} className='w-full text-teal-500 self-center text-sm py-7'>
                                        Show more
                                    </button>
                                )}
                            </>
                        ) : (<p>There is no feedback yet!</p>)
                        }
                    </div>
                </div>
            )}
        </div>
    )
}
