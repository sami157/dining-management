import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import useAuth from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router'
import { SearchX, Key } from 'lucide-react'
import useAxiosSecure from '../hooks/useAxiosSecure'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const Login = () => {
    const navigate = useNavigate()
    const { signInUser, sendEmailToResetPassword } = useAuth()
    const { register, formState: { errors }, handleSubmit } = useForm()
    const [email, setEmail] = useState('')
    const axiosSecure = useAxiosSecure()
    const emailField = register("email", { required: "Email Address is required" })
    const passwordField = register("password", { required: "Password is required" })

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
        <div className='min-h-screen'>
            <div className='flex min-h-screen items-center justify-center'>
                <Card className='w-full max-w-md'>
                    <CardHeader className='space-y-2 pb-4'>
                        <CardTitle className='text-3xl font-bold tracking-tight'>Login</CardTitle>
                        <CardDescription>Enter your account credentials to continue.</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                            <div className='space-y-2'>
                                <Label htmlFor='email'>Email</Label>
                                <Input
                                    id='email'
                                    {...emailField}
                                    type="email"
                                    placeholder="you@example.com"
                                    onChange={(e) => {
                                        emailField.onChange(e)
                                        setEmail(e.target.value)
                                    }}
                                />
                                {errors.email && <p className='text-sm font-semibold text-destructive' role="alert">{errors.email.message}</p>}
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='password'>Password</Label>
                                <Input
                                    id='password'
                                    {...passwordField}
                                    type="password"
                                    placeholder="Enter your password"
                                />
                                {errors.password && <p className='text-sm font-semibold text-destructive' role="alert">{errors.password.message}</p>}
                            </div>

                            <div className='flex items-center justify-between gap-3 text-sm'>
                                <Link to='/register' className='font-semibold text-primary underline-offset-4 hover:underline'>
                                    Not registered yet? Click here
                                </Link>
                            </div>

                            <Button type='submit' className='w-full'>
                                Login
                            </Button>
                        </form>

                        <div className='rounded-md bg-muted p-4'>
                            <Button
                                type='button'
                                variant='outline'
                                disabled={isFetching}
                                onClick={forgotPasswordAction}
                                className='w-full bg-background'
                            >
                                <Key size={18} />
                                Forgot Password?
                            </Button>
                            <p className='mt-2 text-xs text-center leading-5 text-muted-foreground'>
                                Write your email address above, then use this button to send a password reset email.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Login
