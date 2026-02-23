import React, { useState } from 'react'
import { NavLink, Link } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { IoIosArrowDropdownCircle } from "react-icons/io";
import { GiCampCookingPot } from "react-icons/gi";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import useRole from '../hooks/useRole';

const Navbar = () => {
    const { user, loading, signOutUser } = useAuth()
    // const { value, setValue } = useState('')
    const { role } = useRole()
    const logOut = async () => {
        await signOutUser()
        toast.success('Logged out')
    }

    // const [isdark, setIsdark] = useState(
    //     JSON.parse(localStorage.getItem('isdark')) || false
    // );

    // useEffect(() => {
    //     localStorage.setItem('isdark', JSON.stringify(isdark));
    // }, [isdark]);

    const [mobileMenu, setMobileMenu] = useState(false);

    const themeController = (
        <label className="swap swap-rotate cursor-pointer">
            {/* <input type="checkbox" className="theme-controller" checked={isdark} onChange={() => setIsdark(!isdark)} /> */}
            <input type="checkbox" className="theme-controller" value='dark' />

            {/* sun icon */}
            <svg
                className="swap-off h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>

            {/* moon icon */}
            <svg
                className="swap-on h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
        </label>
    );

    return (
        <nav className="relative lg:mx-2 md:w-[99vw] lg:w-[98vw] bg-base-100 rounded-lg px-4 py-2 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
                <GiCampCookingPot className="text-5xl" />
                <div className="flex flex-col">
                    <p className="text-sm">Township</p>
                    <p className="font-bold text-2xl">Dining</p>
                </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
                {themeController}
                {loading ? (
                    <div className="skeleton rounded-lg h-10 w-50"></div>
                ) : user ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} className="btn m-1">
                            {user.email}
                            <IoIosArrowDropdownCircle className="text-xl ml-1" />
                        </div>
                        <ul
                            tabIndex="-1"
                            className="dropdown-content menu bg-base-100 rounded-box w-52 p-2"
                        >
                            {role !== "member" && (
                                <li>
                                    <NavLink to="/admin-dashboard">Manager Dashboard</NavLink>
                                </li>
                            )}
                            <li>
                                <NavLink to="/user-dashboard">User Dashboard</NavLink>
                            </li>
                            <li>
                                <button onClick={logOut}>Log Out</button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <Link className="btn btn-sm btn-primary font-bold" to="/login">
                        Login
                    </Link>
                )}
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center gap-2">
                {themeController}
                <button
                    onClick={() => setMobileMenu(!mobileMenu)}
                    className="text-2xl focus:outline-none"
                >
                    {mobileMenu ? <HiOutlineX /> : <HiOutlineMenu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenu && (
                <div className="absolute top-full left-0 w-full bg-base-100 flex flex-col p-4 md:hidden z-50">
                    {user ? (
                        <>
                            <p className="mb-2 font-semibold">{user.email}</p>
                            {role !== "member" && (
                                <NavLink className="mb-2" to="/admin-dashboard">
                                    Manager Dashboard
                                </NavLink>
                            )}
                            <NavLink className="mb-2" to="/user-dashboard">
                                User Dashboard
                            </NavLink>
                            <button
                                onClick={() => {
                                    logOut();
                                    setMobileMenu(false);
                                }}
                                className="btn btn-sm btn-primary"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <Link
                            className="btn btn-sm btn-primary w-full"
                            to="/login"
                            onClick={() => setMobileMenu(false)}
                        >
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar
