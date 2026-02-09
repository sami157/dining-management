import React from 'react'

export const NotFound = () => {
    const goBackHome = () => {
        window.location.href = '/';
    }
    return (
        <div>
            <h1 className="text-4xl font-bold text-center mt-20">404 - The page you requested does not exist</h1>
            <button className="btn btn-primary text-white font-bold py-2 px-4 mt-4 mx-auto block" onClick={goBackHome}>Go Back Home</button>
        </div>
    )
}