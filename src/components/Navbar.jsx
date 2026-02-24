import React, { useRef } from 'react'
import { NavLink, Link } from 'react-router';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { LayoutDashboard, UserCircle, LogOut, Menu, X, Settings } from "lucide-react"; 
import { GiCampCookingPot } from "react-icons/gi";
import useRole from '../hooks/useRole';

const Navbar = () => {
    const { user, loading, signOutUser } = useAuth();
    const { role } = useRole();
    const [mobileMenu, setMobileMenu] = React.useState(false);
    
    // Reference to the dropdown to close it manually on link click
    const dropdownRef = useRef(null);

    const closeDropdown = () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        setMobileMenu(false);
    };

    const logOut = async () => {
        await signOutUser();
        toast.success('Logged out successfully');
        closeDropdown();
    };

    const themeController = (
        <label className="swap swap-rotate btn btn-ghost btn-circle btn-sm">
            <input type="checkbox" className="theme-controller" value='dark' />
            <svg className="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>
            <svg className="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>
        </label>
    );

    return (
        <div className="w-full flex justify-center">
            <nav className="w-[98vw] bg-base-100 border border-base-300 rounded-xl px-2 py-2 flex items-center justify-between shadow-sm relative">
                
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
                    <div className="bg-primary text-primary-content p-2 rounded-md shadow-md">
                        <GiCampCookingPot size={28} />
                    </div>
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-primary leading-none">Township</span>
                        <span className="text-xl font-bold tracking-tight">Dining</span>
                    </div>
                </Link>

                {/* Right Side Controls */}
                <div className="flex items-center gap-3">
                    {themeController}

                    {loading ? (
                        <div className="skeleton h-10 w-24 rounded-xl opacity-40"></div>
                    ) : user ? (
                        <>
                            {/* Polished User Avatar & Dropdown */}
                            <div className="dropdown dropdown-end" ref={dropdownRef}>
                                <div 
                                    tabIndex={0} 
                                    role="button" 
                                    className="flex items-center gap-2 p-1 rounded-full bg-base-200/50 hover:bg-base-200 transition-colors border border-base-300"
                                >
                                    <span className="hidden cursor-pointer md:block text-sm font-semibold p-0 md:px-2">
                                        Menu
                                    </span>
                                    <div className="avatar">
                                        <div className="w-8 h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="User" />
                                            ) : (
                                                <div className="bg-neutral text-neutral-content flex items-center justify-center w-full h-full text-xs font-bold">
                                                    {user.email.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow-2xl bg-base-100 border border-base-300 rounded-2xl w-60 mt-4">
                                    <li className="px-4 py-3 border-b border-base-200 mb-2">
                                        <p className="text-[10px] font-black uppercase text-base-content/40 tracking-widest">Signed in as</p>
                                        <p className="text-xs font-bold truncate">{user.email}</p>
                                    </li>
                                    {role !== "member" && (
                                        <li>
                                            <NavLink to="/admin-dashboard" onClick={closeDropdown} className="py-3 rounded-xl">
                                                <Settings size={18} /> Manager Dashboard
                                            </NavLink>
                                        </li>
                                    )}
                                    <li>
                                        <NavLink to="/user-dashboard" onClick={closeDropdown} className="py-3 rounded-xl">
                                            <LayoutDashboard size={18} /> User Dashboard
                                        </NavLink>
                                    </li>
                                    <div className="divider my-1"></div>
                                    <li>
                                        <button onClick={logOut} className="text-error py-3 rounded-xl hover:bg-error/10">
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Mobile Hamburger */}
                            {/* <button 
                                onClick={() => setMobileMenu(!mobileMenu)} 
                                className="md:hidden btn btn-ghost btn-circle"
                            >
                                {mobileMenu ? <X size={24} /> : <Menu size={24} />}
                            </button> */}
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-md rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenu && (
                    <div className="absolute top-full left-0 w-full mt-2 px-2 md:hidden z-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl p-4 flex flex-col gap-2">
                            {role !== "member" && (
                                <NavLink 
                                    to="/admin-dashboard" 
                                    onClick={closeDropdown}
                                    className="flex items-center gap-3 p-4 rounded-2xl hover:bg-base-200 font-semibold"
                                >
                                    <Settings size={20} /> Manager Dashboard
                                </NavLink>
                            )}
                            <NavLink 
                                to="/user-dashboard" 
                                onClick={closeDropdown}
                                className="flex items-center gap-3 p-4 rounded-2xl hover:bg-base-200 font-semibold"
                            >
                                <LayoutDashboard size={20} /> User Dashboard
                            </NavLink>
                            <button 
                                onClick={logOut}
                                className="btn btn-error btn-outline rounded-2xl mt-4 w-full"
                            >
                                <LogOut size={20} /> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;