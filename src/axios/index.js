import axios from 'axios'
import { toast } from 'react-toastify';

const NEXT_PUBLIC_APP_API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

const instance = axios.create({
    baseURL: NEXT_PUBLIC_APP_API_URL
})

instance.interceptors.response.use(function (response) {
    return response
}, function (error) {
    if (error?.message == 'Network Error') {
        toast.error('Network error')
        return
    }
    if (error?.response?.status === 401) {
        toast.error('Session expired')
        window.location = '/user/login'
        return
    }
    if (error?.response?.status === 400) {
        toast.error('Error 400')
        return
    }

    return Promise.reject(error)
});

export { NEXT_PUBLIC_APP_API_URL }
export default instance