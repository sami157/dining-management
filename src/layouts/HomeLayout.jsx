import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'
import { Toaster } from 'react-hot-toast'
import Footer from '../components/Footer'

const HomeLayout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar/>
      <Outlet/>
      <Footer/>
      <Toaster/>
    </div>
  )
}

export default HomeLayout
