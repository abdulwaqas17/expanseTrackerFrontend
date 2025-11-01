import axios from "axios";

const api = axios.create({
    baseURL : "http://localhost:5000"
    // baseURL : "https://expanse-tracker-phi.vercel.app"
})

export default api;