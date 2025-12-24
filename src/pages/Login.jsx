import React from 'react'
import { useForm } from "react-hook-form"

const Login = () => {
    const { register, formState: { errors }, handleSubmit } = useForm()
    const onSubmit = (data) => {
        
    }

    return (
        <div className='flex flex-col gap-4 m-10 items-center'>
            <p className='text-3xl font-semibold'>Login</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
                    <div className="card-body">
                        <fieldset className="fieldset">
                            {/* Email */}
                            <label className="label">Email</label>
                            <input {...register("email", { required: "Email Address is required" })} type="email" className="input" placeholder="Email " />
                            {errors.email && <p className='text-error font-semibold' role="alert">{errors.email.message}</p>}

                            {/* Password */}
                            <label className="label">Password</label>
                            <input {...register("password", { required: "Password is required" })} type="password" className="input" placeholder="Password" />
                            {errors.password && <p className='text-error font-semibold' role="alert">{errors.password.message}</p>}


                            <div><a className="link link-hover">Forgot password?</a></div>
                            <button type='submit' className="btn btn-primary mt-4">Login</button>

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

export default Login
