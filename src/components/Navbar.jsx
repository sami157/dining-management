import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, loading, signOutUser } = useAuth()
    const logOut = async () => {
        await signOutUser()
        toast.success('Logged out')
    }
    const [isdark, setIsdark] = useState(
        JSON.parse(localStorage.getItem('isdark'))
    );

    useEffect(() => {
        localStorage.setItem('isdark', JSON.stringify(isdark));
    }, [isdark]);
    const themeController =
        <label className="flex cursor-pointer gap-2">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path
                    d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
            </svg>
            <input type="checkbox" checked={isdark} value='coffee' className="toggle theme-controller" onChange={() => setIsdark(!isdark)} />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        </label>
    return (
        <div className='flex items-center justify-between px-4 py-1 bg-base-100'>
            <div className='flex gap-4 items-center'>

                <NavLink to='/' viewTransition>
                <div className='flex flex-col'>
                    <p className='text-sm'>Township</p>
                    <p className='font-bold text-2xl'>Dining</p>
                </div>
                </NavLink>
                
                <div>
                    {themeController}
                </div>

            </div>

            {
                loading
                    ? <div className="skeleton rounded-lg h-10 w-50"></div>
                    : <div className='flex gap-5 items-center'>
                        <NavLink to='/meal-schedule' viewTransition>Meal Schedule</NavLink>
                        <NavLink to='/member-management' viewTransition>Member Management</NavLink>
                        <NavLink to='/user-dashboard' viewTransition>User Dashboard</NavLink>
                        <p className=''>{user?.email}</p>

                        {user
                            ? 
                            <button onClick={logOut} className='btn btn-primary'>Log Out</button>
                            : 
                            <NavLink to='/login' viewTransition>Login</NavLink>
                        }
                    </div>
            }
        </div>
    )
}

export default Navbar
