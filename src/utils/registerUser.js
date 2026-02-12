import toast from "react-hot-toast";

export const registerUser = async (axiosSecure, user) => {
    toast.promise(
            async () => {
                 await axiosSecure.post("/users/create", user);
            },
            {
                loading: 'User registration in progress',
                success: 'User registered successfully',
                error: 'User registration failed',
            }
        )
};