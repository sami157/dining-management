import { useEffect } from "react";
import axios from "axios";
import useAuth from "./useAuth";

const apiBaseUrl = import.meta.env.VITE_API_URL;

const axiosSecure = axios.create({
    baseURL: apiBaseUrl
});

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
