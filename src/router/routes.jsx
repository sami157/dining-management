import { createBrowserRouter } from "react-router";
import HomeLayout from "../layouts/HomeLayout";
import Home from "../Home";
import Login from "../pages/Login";
import Registration from "../pages/Registration";
import MealSchedule from "../pages/MealSchedule";
import UserDashboard from "../pages/UserDashboard";
import MemberManagement from "../pages/MemberManagement";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: HomeLayout,
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
                element: <Login/>
            },
            {
                path: '/meal-schedule',
                element: <MealSchedule/>
            },
            {
                path: '/user-dashboard',
                element: <UserDashboard/>
            },
            {
                path: '/member-management',
                element: <MemberManagement/>
            }
        ]
    },
]);