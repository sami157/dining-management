import React from 'react';
import { NavLink } from 'react-router';
import { ChevronRight, ClipboardList, UserRound, WalletCards } from 'lucide-react';

const navItems = [
    { to: '/user-dashboard/meal-sheet', label: 'Meal Sheet', icon: ClipboardList },
    { to: '/user-dashboard/financial-information', label: 'Finance', icon: WalletCards },
    { to: '/user-dashboard/profile', label: 'Profile', icon: UserRound },
];

const UserSidebar = ({ onNavigate }) => {
    return (
        <aside className="h-full flex flex-col bg-base-100 border-r border-base-300 p-4 w-full rounded-lg md:min-h-screen">
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="p-2 rounded-xl text-primary">
                    <ClipboardList size={24} />
                </div>
                <div className="flex flex-col">
                    <span className="font-black tracking-tighter text-xl leading-none italic uppercase">User</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Dashboard</span>
                </div>
            </div>

            <nav className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        viewTransition
                        onClick={onNavigate}
                        className={({ isActive }) => `
                            group flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300
                            ${isActive
                                ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 scale-[1.02]'
                                : 'hover:bg-base-200 text-base-content/60 hover:text-base-content'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <div className="flex items-center gap-3 min-w-0">
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className={`text-xs font-black uppercase tracking-widest truncate ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                        {item.label}
                                    </span>
                                </div>
                                <ChevronRight
                                    size={14}
                                    className={`hidden lg:block transition-transform duration-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-40'}`}
                                />
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default UserSidebar;
