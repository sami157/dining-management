import React from 'react'
import { useForm } from "react-hook-form"
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { registerUser } from '../utils/registerUser'
import useAxiosSecure from '../hooks/useAxiosSecure'

const Registration = () => {
    const axiosSecure = useAxiosSecure()
    const navigate = useNavigate()
    const { createUser } = useAuth()
    const { register, formState: { errors }, handleSubmit } = useForm()
    const onSubmit = (data) => {
        toast.promise(
            async () => {
                await createUser(data.email, data.password)
                await registerUser(axiosSecure, {
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile
                })
                navigate('/')
            },
            {
                loading: 'Registration in progress',
                success: 'Registered successfully',
                error: 'Registration failed',
            }
        )
    }

    return (
        <div className='flex flex-col gap-4 m-10 items-center'>
            <p className='text-3xl font-semibold'>Registration</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <div className="card-body">
                        <fieldset className="fieldset">
                            {/* Name */}
                            <label className="label">Name</label>
                            <input {...register("name", { required: "Name is required" })} type="text" className="input" placeholder="Name" />
                            {errors.name && <p className='text-error font-semibold' role="alert">{errors.name.message}</p>}

                            {/* Mobile */}
                            <label className="label">Mobile Number</label>
                            <input {...register("mobile", {
                                required: "Phone Number is required",
                                maxLength: 11,
                                minLength: 11
                            }
                            )
                            } type="text" className="input" placeholder="11 digit phone number" />
                            {errors.name && <p className='text-error font-semibold' role="alert">{errors.mobile.message}</p>}
                            {errors.mobile?.type === 'maxLength' && <p className='text-error font-semibold' role="alert">11 digit phone number is required</p>}
                            {errors.mobile?.type === 'minLength' && <p className='text-error font-semibold' role="alert">11 digit phone number required</p>}

                            {/* Email */}
                            <label className="label">Email</label>
                            <input {...register("email", { required: "Email Address is required" })} type="email" className="input" placeholder="Email " />
                            {errors.email && <p className='text-error font-semibold' role="alert">{errors.email.message}</p>}

                            {/* Password */}
                            <label className="label">Password</label>
                            <input {...register("password", { required: "Password is required" })} type="password" className="input" placeholder="Password" />
                            {errors.password && <p className='text-error font-semibold' role="alert">{errors.password.message}</p>}


                            <div><a onClick={() => navigate('/login')} className="link link-hover">Already registered? Click here to Login</a></div>

                            <button type='submit' className="btn btn-primary mt-4">Register</button>

                            {/* Designation
                            <label className="label">Designation</label>
                            <select defaultValue="Your Designation" className="select">
                                <option disabled={true}>Your Designation</option>
                                <option>Chief Engineer</option>
                                <option>Superintending Engineer</option>
                                <option>Executive Engineer</option>
                                <option>Sub-Divisional Engineer</option>
                                <option>Assistant Engineer</option>
                                <option>Sub-Assistant Engineer</option>
                                <option>Staff</option>
                            </select> */}
                        </fieldset>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Registration
