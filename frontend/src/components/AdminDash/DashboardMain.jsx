import React from 'react';
import { Card } from 'flowbite-react';

export default function DashboardMain() {
  return (
    <div className='relative isolate flex-1 p-4 md:p-7'>
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
      
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800 dark:text-white'>Admin Dashboard</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Welcome to your admin dashboard. Manage users, settings, and system administration here.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>User Management</h3>
          <p className='text-gray-600 dark:text-gray-400'>Your user management content will go here.</p>
        </Card>

        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>System Settings</h3>
          <p className='text-gray-600 dark:text-gray-400'>Your system settings content will go here.</p>
        </Card>

        <Card className='p-6'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>Analytics</h3>
          <p className='text-gray-600 dark:text-gray-400'>Your analytics content will go here.</p>
        </Card>
      </div>
    </div>
  );
}