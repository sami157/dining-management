export const registerUser = async (axiosSecure, user) => {
    try {
        if (user?.email && user?.name) {
            await axiosSecure.post("/users/create", user);
        }
    } catch (error) {
        console.error("Failed to send user to server:", error);
    }
};