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
import { UserProfile } from "../pages/UserProfile";
import AdminRoute from "../components/AdminRoute";

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
                path: '/user-profile',
                element: <PrivateRoute><UserProfile /></PrivateRoute>
            },
            {
                path: '/admin-dashboard',
                element: <PrivateRoute><AdminRoute><AdminDashboardLayout /></AdminRoute></PrivateRoute>,
                children: [
                    {
                        index: true,
                        element: <MealSchedule />
                    },
                    {
                        path: 'meal-schedule',
                        element: <MealSchedule />
                    },
                    {
                        path: 'fund-management',
                        element: <FundManagement />
                    },
                    {
                        path: 'member-management',
                        element: <MemberManagement />
                    },
                    {
                        path: 'history',
                        element: <PreviousData />
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
