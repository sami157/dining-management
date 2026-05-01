import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { Menu, X } from 'lucide-react';
import UserSidebar from '../components/UserDashboard/UserSidebar';

const UserDashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen">
            <div className="md:hidden sticky top-14 z-40 bg-base-100/80 backdrop-blur-md border-b border-base-300 px-2 py-1">
                <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open user dashboard menu"
                >
                    <Menu size={14} />
                    Navigation Menu
                </button>
            </div>

            {sidebarOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close user dashboard menu"
                    />
                    <div className="relative h-full w-72 max-w-[86vw] bg-base-100 shadow-2xl">
                        <div className="flex justify-end p-2">
                            <button
                                type="button"
                                className="btn btn-ghost btn-circle btn-sm"
                                onClick={() => setSidebarOpen(false)}
                                aria-label="Close user dashboard menu"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <UserSidebar onNavigate={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
                <div className="hidden md:block p-2 md:min-w-64">
                <UserSidebar />
                </div>
                <main className="w-full lg:w-11/12 mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserDashboardLayout;
