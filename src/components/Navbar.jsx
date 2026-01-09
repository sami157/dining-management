import React, { useEffect, useState } from 'react'
import { NavLink, Link } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { IoIosArrowDropdownCircle } from "react-icons/io";
import { GiCampCookingPot } from "react-icons/gi";

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
        <label className="swap swap-rotate">
            <input type="checkbox" className="theme-controller" value="dark" />

            {/* sun icon */}
            <svg
                className="swap-off h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path
                    d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>

            {/* moon icon */}
            <svg
                className="swap-on h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path
                    d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
        </label>
    return (
        <div className='flex items-center justify-between px-4 py-1 bg-base-100'>
            <div className='flex gap-4 items-center'>

                <Link to='/' viewTransition>
                    <div className='flex items-center gap-2'>
                        <GiCampCookingPot className='text-5xl' />
                        <div className='flex flex-col'>
                            <p className='text-sm'>Township</p>
                            <p className='font-bold text-2xl'>Dining</p>
                        </div>
                    </div>
                </Link>

            </div>

            {
                loading
                    ? <div className="skeleton rounded-lg h-10 w-50"></div>
                    : <div className='flex gap-2 items-center'>
                        <div>
                            {themeController}
                        </div>
                        <div className='flex gap-4 items-center justify-between'>
                            <div className="dropdown">
                                <div tabIndex={0} role="button" className="btn m-1">{user?.email}<span><IoIosArrowDropdownCircle className='text-xl' /></span></div>
                                <ul onClick={() => document.activeElement.blur()} tabIndex="-1" className="dropdown-content menu bg-base-100 rounded-box z-5 w-52 p-2 shadow-sm">
                                    <li>
                                        <NavLink to='/admin-dashboard' viewTransition>Admin Dashboard</NavLink>
                                    </li>
                                    <li>
                                        <NavLink to='/user-dashboard' viewTransition>User Dashboard</NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
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
