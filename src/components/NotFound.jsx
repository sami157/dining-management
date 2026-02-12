import React from 'react'
import Lottie from 'lottie-react';
import errorAnimation from '../animations/errorAnimation.json';
import { NavLink } from 'react-router';

export const NotFound = () => {
    const goBackHome = () => {
        window.location.href = '/';
    }
    return (
        <div className='mt-10 w-11/12 items-center flex gap-4 flex-col md:w-7/10 mx-auto text-center'>
            <Lottie animationData={errorAnimation} loop={false} />
            <p className='font-bold text-xl'>The page you are looking for does not exist.</p>
            <NavLink to='/' className='text-sm bg-primary font-bold px-3 py-2 text-primary-content rounded-full'>Go Home</NavLink>
        </div>
    )
}