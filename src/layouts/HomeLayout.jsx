import React from 'react'
import { Outlet } from 'react-router'
import Navbar from '../components/Navbar'
import { Toaster } from 'react-hot-toast'
import Footer from '../components/Footer'

const HomeLayout = () => {
  return (
    <div className='flex flex-col bg-base-300 min-h-screen'>
      <Navbar/>
      <main className='flex-1 py-2'>
        <Outlet/>
      </main>
      <Footer/>
      <Toaster/>
    </div>
  )
}

export default HomeLayout
