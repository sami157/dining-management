import React from 'react'
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import Login from '../pages/Login';

export const PrivateRoute = ({ children }) => {
    const { user, loading} = useAuth();
    const navigate = useNavigate();
    return (
        <div>
            {
                loading ? (
                    <p>Loading</p>
                ) : user ? (
                    children
                ) : (
                    navigate('/login')
                )
            }
        </div>
    )
}
