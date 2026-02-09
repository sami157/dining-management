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
import { NotFound } from "../components/NotFound";
import { PrivateRoute } from "../components/PrivateRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: HomeLayout,
        hydrateFallbackElement: Loading,
        errorElement: <NotFound />,
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
                element: <PrivateRoute><UserDashboard /></PrivateRoute>
            },
            {
                path: '/admin-dashboard',
                element: <PrivateRoute><AdminDashboardLayout /></PrivateRoute>,
                children: [
                    {
                        index: true,
                        element: <PrivateRoute><MealSchedule /></PrivateRoute>
                    },
                    {
                        path: '/admin-dashboard/meal-schedule',
                        element: <PrivateRoute><MealSchedule /></PrivateRoute>
                    },
                    {
                        path: '/admin-dashboard/fund-management',
                        element: <PrivateRoute><FundManagement /></PrivateRoute>
                    },
                    {
                        path: '/admin-dashboard/member-management',
                        element: <PrivateRoute><MemberManagement /></PrivateRoute>
                    },
                ]
            }
        ]
    },
]);