import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { SearchX , Key } from 'lucide-react'
import useAxiosSecure from '../hooks/useAxiosSecure'
import { useQuery } from '@tanstack/react-query'

const Login = () => {
    const navigate = useNavigate()
    const { signInUser, sendEmailToResetPassword } = useAuth()
    const { register, formState: { errors }, handleSubmit } = useForm()
    const [email, setEmail] = useState('')
    const axiosSecure = useAxiosSecure()

    const { refetch, isFetching } = useQuery({
        queryKey: ['userExists', email],
        queryFn: async () => {
            const response = await axiosSecure.get(`/users/check-user/${email}`)
            return response.data.doesExist
        },
        enabled: false, // Won't run automatically
        retry: false,
    })

    const onSubmit = (data) => {
        toast.promise(
            async () => {
                await signInUser(data.email, data.password)
                navigate('/')
            },
            {
                loading: 'Logging in',
                success: 'Logged in successfully',
                error: 'Login failed',
            }
        )
    }

    const forgotPasswordAction = async () => {
        if (!email) {
            toast('Email address is required')
            return
        }

        const { data: userExists, isError } = await refetch()

        if (isError || !userExists) {
            toast(
                <span className='text-center'>
                    No user found with this email address
                </span>,
                {
                    icon: <SearchX stroke='red' size={18} />,
                }
            );
            return
        }

        toast.promise(
            async () => {
                await sendEmailToResetPassword(email)
            },
            {
                loading: 'Sending email...',
                success: 'Password reset email sent! Check your inbox and spam folder',
                error: 'Operation failed',
            }
        )
    }

    return (
        <div className='flex flex-col gap-4 min-h-screen items-center mt-[calc(100vh/5)]'>
            <p className='text-4xl font-bold'>Login</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card bg-base-100 w-[85vw] md:w-full">
                    <div className="card-body">
                        <fieldset className="fieldset">
                            {/* Email */}
                            <label className="label">Email</label>
                            <input {...register("email", { required: "Email Address is required" })} type="email" className="input" placeholder="Email " onChange={(e) => {
                                setEmail(e.target.value)
                            }} />
                            {errors.email && <p className='text-error font-semibold' role="alert">{errors.email.message}</p>}

                            {/* Password */}
                            <div className='flex items-center justify-between'>
                                <label className="label">Password</label>
                            </div>
                            <input {...register("password", { required: "Password is required" })} type="password" className="input" placeholder="Password" />
                            {errors.password && <p className='text-error font-semibold' role="alert">{errors.password.message}</p>}

                            <div><a onClick={() => navigate('/register')} className="link link-info">Not registered yet? Click here</a></div>
                            <button type='submit' className="btn btn-primary mt-2">Login</button>
                        </fieldset>
                    </div>
                </div>
            </form>
            <div className='gap-1 flex flex-col items-center'>
                <button
                    disabled={isFetching}
                    onClick={forgotPasswordAction}
                    className='btn font-bold bg-base-100'>
                    <span><Key size={18} /></span>Forgot Password?
                </button>
                <p className='px-4 py-1 text-xs text-center text-base-content/50'>In such case, write your email address above and click this button</p>
            </div>
        </div>
    )
}

export default Login
