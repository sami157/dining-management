import React from 'react'
import { NavLink } from 'react-router'
import {
  CalendarDays,
  Users2,
  WalletCards,
  History,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { to: '/admin-dashboard/meal-schedule', label: 'Meal Schedule', icon: CalendarDays },
    { to: '/admin-dashboard/member-management', label: 'Members', icon: Users2 },
    { to: '/admin-dashboard/fund-management', label: 'Funds', icon: WalletCards },
    { to: '/admin-dashboard/history', label: 'Previous Data', icon: History },
  ]

  return (
    <div className='h-full flex flex-col bg-base-100 border-r border-base-300 p-4 w-full rounded-lg md:min-h-screen'>
      {/* Brand/Logo Section */}
      <div className='flex items-center gap-3 px-2 mb-10'>
        <div className='p-2 rounded-xl'>
          <LayoutDashboard size={24} className='text-primary' />
        </div>
        <div className='flex flex-col'>
          <span className='font-black tracking-tighter text-xl leading-none italic uppercase'>Admin</span>
          <span className='text-[10px] font-bold uppercase tracking-[0.2em] opacity-40'>Management</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className='grid grid-cols-2 gap-2 lg:grid-cols-1'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            viewTransition
            // The function below provides { isActive }
            className={({ isActive }) => `
        group flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300
        ${isActive
                ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 scale-[1.02]'
                : 'hover:bg-base-200 text-base-content/60 hover:text-base-content'}
      `}
          >
            {/* We need to use the function pattern here too to access isActive for the icons/labels */}
            {({ isActive }) => (
              <>
                <div className='flex items-center gap-3'>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {item.label}
                  </span>
                </div>

                <ChevronRight
                  size={14}
                  className={`transition-transform duration-300 ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-40'}`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar