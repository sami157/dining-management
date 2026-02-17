import { useState } from 'react'
import Navbar from './components/Navbar'
import UpcomingMeals from './components/UpcomingMeals'
import useAuth from './hooks/useAuth'
import Loading from './components/Loading'
import { Link } from 'react-router';

const Home = () => {
  const { user, loading } = useAuth()
  return (
    <div>
      <div className='text-3xl text-center p-4'>
        <p>Welcome to <span className='font-bold'>Township Dining Mangement</span> Web App</p>
      </div>
      {
        loading ? <Loading/> :
        user ? <UpcomingMeals /> :
        <Link className='' to='/login'><p className='text-center p-2'>Click here to Login and Continue</p></Link> 
      }
      
    </div>
  )
}

export default Home
