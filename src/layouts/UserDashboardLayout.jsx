import React from 'react';
import { Outlet } from 'react-router';
import UserSidebar from '../components/UserDashboard/UserSidebar';

const UserDashboardLayout = () => {
    return (
        <div className="min-h-screen">
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
