import React from 'react'

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      {/* <span className="loading loading-ring loading-lg scale-400 text-primary"></span> */}
      <span className="skeleton skeleton-text text-xl md:text-4xl font-black uppercase">Loading....</span>
    </div>
  )
}

export default Loading
