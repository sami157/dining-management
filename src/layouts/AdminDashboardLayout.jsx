import React from 'react'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router'

const AdminDashboardLayout = () => {
  return (
    <div className='flex gap-4'>
      <div className='p-2 w-50'>
        <Sidebar/>
      </div>
      <Outlet/>
    </div>
  )
}

export default AdminDashboardLayout
