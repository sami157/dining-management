import { createBrowserRouter } from "react-router";
import HomeLayout from "../layouts/HomeLayout";
import Home from "../Home";
import Login from "../pages/Login";
import Registration from "../pages/Registration";
import MealSchedule from "../pages/MealSchedule";
import UserDashboard from "../pages/UserDashboard";
import MemberManagement from "../pages/MemberManagement";
import FundManagement from "../pages/FundManagement";
import AdminDashboard from "../pages/AdminDashboard";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout";
import Loading from "../components/Loading";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: HomeLayout,
        hydrateFallbackElement: Loading,
        children: [
            {
                index: true,
                Component: Home
            },
            {
                path: '/register',
                Component: Registration
            },
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/user-dashboard',
                element: <UserDashboard />
            },
            {
                path: '/admin-dashboard',
                Component: AdminDashboardLayout,
                children: [
                    {
                        index: true,
                        element: <MealSchedule />
                    },
                    {
                        path: '/admin-dashboard/meal-schedule',
                        element: <MealSchedule />
                    },
                    {
                        path: '/admin-dashboard/fund-management',
                        element: <FundManagement />
                    },
                    {
                        path: '/admin-dashboard/member-management',
                        element: <MemberManagement />
                    },
                ]
            }
        ]
    },
]);