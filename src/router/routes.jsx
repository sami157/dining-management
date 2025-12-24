import { createBrowserRouter } from "react-router";
import HomeLayout from "../layouts/HomeLayout";
import Home from "../Home";
import Login from "../pages/Registration";
import Registration from "../pages/Registration";

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
                element: <Registration/>
            }
        ]
    },
]);