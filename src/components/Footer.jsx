import React from 'react'
import { PhoneOutgoing } from 'lucide-react';

const Footer = () => {
  return (
    <div className="bg-base-200/60 py-4 px-2 m-2 rounded-lg">
      <div className="container mx-auto text-center">
        <p className="text-sm text-base-content/70">Developed by</p>
        <p className="text-sm text-base-content/70">Tanzir Ahmed Sami</p>
        <p className="text-xs text-base-content/70">Assistant Engineer (Electrical)</p>
        <p className="text-xs text-base-content/70"><PhoneOutgoing size={12} className="inline mr-1" /> 01840406154</p>
      </div>
    </div>
  )
}

export default Footer
