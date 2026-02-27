import UpcomingMeals from './components/UpcomingMeals'
import useAuth from './hooks/useAuth'
import Loading from './components/Loading'
import { Link } from 'react-router';
import { MealSheet } from './components/MealSheet';
import { MealSheetRamadan } from './components/MealSheetRamadan';

const Home = () => {
  const { user, loading } = useAuth()
  return (
    <div>
      {
        loading ?
            <Loading />
          :
          user
            ?
            <div className={`flex flex-col md:flex-row justify-center ${loading && 'opacity-0'}`}>
              {/* <MealSheet /> */}
              <MealSheetRamadan/>
              <UpcomingMeals />
            </div>
            :
            <div className='text-3xl flex flex-col gap-8 text-center p-4'>
              <p>Welcome to <span className='font-bold'>Township Dining Mangement</span> Web App</p>
              <Link className='' to='/login'><p className='text-center p-2 text-lg'>Click here to  <span className='font-bold'>Login</span> and Continue</p></Link>
            </div>
      }
    </div>
  )
}

export default Home
