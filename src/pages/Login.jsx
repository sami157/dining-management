import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { Key, Mail, ShieldCheck } from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useAxiosSecure from '../hooks/useAxiosSecure'

const Login = () => {
    const navigate = useNavigate()
    const axiosSecure = useAxiosSecure()
    const { signInUser, resetPasswordByEmail } = useAuth()
    const [isRecoveryMode, setIsRecoveryMode] = useState(false)

    const {
        register: registerLogin,
        formState: { errors: loginErrors },
        handleSubmit: handleLoginSubmit,
        getValues: getLoginValues,
    } = useForm()

    const {
        register: registerRecovery,
        formState: { errors: recoveryErrors },
        handleSubmit: handleRecoverySubmit,
        reset: resetRecoveryForm,
        watch,
    } = useForm()

    const newPassword = watch('newPassword')

    const onLoginSubmit = (data) => {
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

    const onRecoverySubmit = (data) => {
        toast.promise(
            async () => {
                await axiosSecure.post('/auth/recover-password', {
                    email: data.email,
                    recoveryCode: data.recoveryCode,
                    newPassword: data.newPassword,
                })

                resetRecoveryForm()
                setIsRecoveryMode(false)
            },
            {
                loading: 'Updating password...',
                success: 'Password updated. You can now log in.',
                error: 'Recovery failed',
            }
        )
    }

    const handleEmailPasswordReset = () => {
        const email = getLoginValues('email')

        if (!email) {
            toast.error('Enter your email first')
            return
        }

        toast.promise(
            resetPasswordByEmail(email),
            {
                loading: 'Sending reset email...',
                success: 'Password reset email sent. Check your inbox.',
                error: 'Could not send reset email',
            }
        )
    }

    return (
        <div className='flex flex-col gap-4 min-h-screen items-center mt-[calc(100vh/5)]'>
            <p className='text-4xl font-bold'>{isRecoveryMode ? 'Account Recovery' : 'Login'}</p>

            <form onSubmit={isRecoveryMode ? handleRecoverySubmit(onRecoverySubmit) : handleLoginSubmit(onLoginSubmit)}>
                <div className="card bg-base-100 w-[85vw] md:w-full max-w-sm">
                    <div className="card-body">
                        <fieldset className="fieldset">
                            {isRecoveryMode ? (
                                <>
                                    <div className='rounded-box bg-base-200 px-4 py-3 text-sm text-base-content/70'>
                                        Ask an admin for a one-time recovery code. Keep that code private and use it here to set a new password.
                                    </div>

                                    <label className="label">Email</label>
                                    <input
                                        {...registerRecovery("email", { required: "Email address is required" })}
                                        type="email"
                                        className="input"
                                        placeholder="Email"
                                    />
                                    {recoveryErrors.email && <p className='text-error font-semibold' role="alert">{recoveryErrors.email.message}</p>}

                                    <label className="label">Recovery Code</label>
                                    <input
                                        {...registerRecovery("recoveryCode", { required: "Recovery code is required" })}
                                        type="text"
                                        className="input uppercase"
                                        placeholder="Admin-issued recovery code"
                                    />
                                    {recoveryErrors.recoveryCode && <p className='text-error font-semibold' role="alert">{recoveryErrors.recoveryCode.message}</p>}

                                    <label className="label">New Password</label>
                                    <input
                                        {...registerRecovery("newPassword", {
                                            required: "New password is required",
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters long"
                                            }
                                        })}
                                        type="password"
                                        className="input"
                                        placeholder="New password"
                                    />
                                    {recoveryErrors.newPassword && <p className='text-error font-semibold' role="alert">{recoveryErrors.newPassword.message}</p>}

                                    <label className="label">Confirm Password</label>
                                    <input
                                        {...registerRecovery("confirmPassword", {
                                            required: "Please confirm your new password",
                                            validate: (value) => value === newPassword || "Passwords do not match"
                                        })}
                                        type="password"
                                        className="input"
                                        placeholder="Confirm new password"
                                    />
                                    {recoveryErrors.confirmPassword && <p className='text-error font-semibold' role="alert">{recoveryErrors.confirmPassword.message}</p>}

                                    <button type='submit' className="btn btn-primary mt-3">
                                        <ShieldCheck size={18} />
                                        Set New Password
                                    </button>

                                    <button
                                        type='button'
                                        className="btn btn-ghost"
                                        onClick={() => {
                                            resetRecoveryForm()
                                            setIsRecoveryMode(false)
                                        }}
                                    >
                                        Back To Login
                                    </button>
                                </>
                            ) : (
                                <>
                                    <label className="label">Email</label>
                                    <input
                                        {...registerLogin("email", { required: "Email Address is required" })}
                                        type="email"
                                        className="input"
                                        placeholder="Email"
                                    />
                                    {loginErrors.email && <p className='text-error font-semibold' role="alert">{loginErrors.email.message}</p>}

                                    <label className="label">Password</label>
                                    <input
                                        {...registerLogin("password", { required: "Password is required" })}
                                        type="password"
                                        className="input"
                                        placeholder="Password"
                                    />
                                    {loginErrors.password && <p className='text-error font-semibold' role="alert">{loginErrors.password.message}</p>}

                                    <div><a onClick={() => navigate('/register')} className="link link-info">Not registered yet? Click here</a></div>
                                    <button type='submit' className="btn btn-primary mt-2">Login</button>
                                </>
                            )}
                        </fieldset>
                    </div>
                </div>
            </form>

            {!isRecoveryMode && (
                <div className='gap-2 flex flex-col items-center'>
                    <button
                        type='button'
                        onClick={handleEmailPasswordReset}
                        className='btn font-bold bg-base-100'>
                        <span><Mail size={18} /></span>Email Password Reset
                    </button>
                    <button
                        type='button'
                        onClick={() => setIsRecoveryMode(true)}
                        className='btn font-bold bg-base-100'>
                        <span><Key size={18} /></span>Admin Assisted Reset
                    </button>
                    <p className='px-4 py-1 text-xs text-center text-base-content/50'>
                        Use Firebase email recovery or ask an admin for a one-time recovery code.
                    </p>
                </div>
            )}
        </div>
    )
}

export default Login
