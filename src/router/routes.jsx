import { createBrowserRouter } from "react-router";
import HomeLayout from "../layouts/HomeLayout";
import Home from "../Home";
import Login from "../pages/Login";
import Registration from "../pages/Registration";
import MealSchedule from "../pages/MealSchedule";
import UserDashboard from "../pages/UserDashboard";
import MemberManagement from "../pages/MemberManagement";
import FundManagement from "../pages/FundManagement";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout";
import Loading from "../components/Loading";
import { NotFound } from "../components/NotFound";
import { PrivateRoute } from "../components/PrivateRoute";
import PreviousData from "../pages/PreviousData";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: HomeLayout,
        hydrateFallbackElement: <Loading/>,
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
                Component: Login
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
                        path: 'meal-schedule',
                        element: <PrivateRoute><MealSchedule /></PrivateRoute>
                    },
                    {
                        path: 'fund-management',
                        element: <PrivateRoute><FundManagement /></PrivateRoute>
                    },
                    {
                        path: 'member-management',
                        element: <PrivateRoute><MemberManagement /></PrivateRoute>
                    },
                    {
                        path: 'history',
                        element: <PrivateRoute><PreviousData /></PrivateRoute>
                    },
                ]
            },
            {
                path: '*',
                Component: NotFound
            },
        ]
    },
]);