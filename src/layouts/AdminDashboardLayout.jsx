import React from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router'

const AdminDashboardLayout = () => {
  return (
    <div className='min-h-screen'>
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='hidden md:block p-2 min-w-50'>
          <Sidebar />
        </div>
        <div className='lg:w-11/12 mx-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardLayout
