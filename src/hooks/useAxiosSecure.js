import { useEffect } from "react";
import axios from "axios";
import useAuth from "./useAuth";

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL,    
});

console.log(axiosSecure.baseURL);

const useAxiosSecure = () => {
    const { user } = useAuth();

    useEffect(() => {
        const interceptor = axiosSecure.interceptors.request.use(async (config) => {
            if (user) {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        return () => axiosSecure.interceptors.request.eject(interceptor);
    }, [user]);

    return axiosSecure;
};

export default useAxiosSecure;