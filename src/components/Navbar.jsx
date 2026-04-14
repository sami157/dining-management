import React, { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import toast from 'react-hot-toast'
import { LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, X } from 'lucide-react'
import { GiCampCookingPot } from 'react-icons/gi'

import useAuth from '../hooks/useAuth'
import useRole from '../hooks/useRole'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const Navbar = () => {
    const { user, loading, signOutUser } = useAuth()
    const { role } = useRole()
    const [theme, setTheme] = useState('light')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const root = document.documentElement
        const savedTheme = localStorage.getItem('theme')
        const nextTheme = savedTheme || root.dataset.theme || 'light'

        root.dataset.theme = nextTheme
        root.classList.toggle('dark', nextTheme === 'dark')
        setTheme(nextTheme)
    }, [])

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''

        return () => {
            document.body.style.overflow = ''
        }
    }, [mobileMenuOpen])

    const toggleTheme = () => {
        const root = document.documentElement
        const nextTheme = theme === 'dark' ? 'light' : 'dark'

        root.dataset.theme = nextTheme
        root.classList.toggle('dark', nextTheme === 'dark')
        localStorage.setItem('theme', nextTheme)
        setTheme(nextTheme)
    }

    const closeMobileMenu = () => setMobileMenuOpen(false)

    const logOut = async () => {
        await signOutUser()
        toast.success('Logged out successfully')
        closeMobileMenu()
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-muted/70 backdrop-blur-md">
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <Link viewTransition to="/" className="flex min-w-0 items-center gap-3 transition-transform hover:scale-[1.01]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <GiCampCookingPot size={24} />
                    </div>
                    <div className="flex min-w-0 flex-col">
                        <span className="title-font text-[10px] uppercase tracking-[0.35em] text-primary">Township</span>
                        <span className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">Dining</span>
                    </div>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full hover:bg-muted/80"
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </Button>

                    {loading ? (
                        <div className="h-10 w-28 animate-pulse rounded-full border border-border/60 bg-muted/70" />
                    ) : user ? (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(true)}
                                className="rounded-full bg-background/80 md:hidden"
                                aria-label="Open navigation menu"
                            >
                                <Menu size={18} />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="hidden h-10 rounded-full bg-background px-1.5 shadow-none backdrop-blur hover:bg-muted/80 md:inline-flex"
                                    >
                                        <span className="hidden max-w-40 truncate text-sm font-medium md:block">
                                            {user.email}
                                        </span>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="User" className="h-8 w-8 rounded-full object-cover" />
                                        ) : (
                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                                                {user.email.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuLabel>
                                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-muted-foreground">Signed in as</p>
                                        <p className="mt-1 truncate text-sm font-semibold text-foreground">{user.email}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {role !== 'member' && (
                                        <DropdownMenuItem asChild>
                                            <NavLink viewTransition to="/admin-dashboard" className="cursor-pointer">
                                                <Settings size={16} /> Manager Dashboard
                                            </NavLink>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <NavLink viewTransition to="/user-dashboard" className="cursor-pointer">
                                            <LayoutDashboard size={16} /> User Dashboard
                                        </NavLink>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logOut} className="cursor-pointer text-destructive focus:text-destructive">
                                        <LogOut size={16} /> Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Button asChild className="px-6 sm:px-8">
                            <Link viewTransition to="/login">
                                Login
                            </Link>
                        </Button>
                    )}
                </div>
            </nav>

            {user && (
                <>
                    <div
                        className={`fixed min-h-screen inset-0 z-40 bg-black/50 backdrop-blur-xl transition-opacity duration-200 md:hidden ${mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                        onClick={closeMobileMenu}
                    />
                    <aside
                        className={`fixed inset-y-0 left-0 z-50 w-[70vw] max-w-sm p-5 shadow-2xl min-h-screen bg-background/90 backdrop-blur-2xl transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="User" className="h-11 w-11 rounded-full object-cover" />
                                ) : (
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                                        {user.email.charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-muted-foreground">Signed in as</p>
                                    <p className="truncate text-sm font-semibold text-foreground">{user.email}</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={closeMobileMenu}
                                className="rounded-full"
                                aria-label="Close navigation menu"
                            >
                                <X size={18} />
                            </Button>
                        </div>

                        <div className="mt-6 space-y-2">
                            {role !== 'member' && (
                                <NavLink
                                    viewTransition
                                    to="/admin-dashboard"
                                    onClick={closeMobileMenu}
                                    className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                                >
                                    <Settings size={18} />
                                    Manager Dashboard
                                </NavLink>
                            )}
                            <NavLink
                                viewTransition
                                to="/user-dashboard"
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                            >
                                <LayoutDashboard size={18} />
                                User Dashboard
                            </NavLink>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={logOut}
                                className="w-full bg-destructive/10 text-destructive hover:bg-destructive/30 hover:text-destructive"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </Button>
                        </div>
                    </aside>
                </>
            )}
        </header>
    )
}

export default Navbar
