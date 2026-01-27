import React from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router'

const AdminDashboardLayout = () => {
  return (
    <div className='flex flex-col md:flex-row gap-4'>
      <div className='p-2 min-w-50'>
        <Sidebar/>
      </div>
      <Outlet/>
    </div>
  )
}

export default AdminDashboardLayout
