import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'

const HomeLayout = () => {
  return (
    <div className='py-2 bg-base-300 min-h-screen'>
      <Navbar/>
      <Outlet/>
    </div>
  )
}

export default HomeLayout
