import React from 'react'
import { NavLink } from 'react-router'

const Sidebar = () => {
  return (
    <div className='p-2 min-h-screen flex flex-col gap-2 bg-base-200 rounded-lg'>
      <NavLink to='/admin-dashboard/meal-schedule' viewTransition>Meal Schedule</NavLink>
      <NavLink to='/admin-dashboard/fund-management' viewTransition>Funds</NavLink>
      <NavLink to='/admin-dashboard/member-management' viewTransition>Members</NavLink>
    </div>
  )
}

export default Sidebar
