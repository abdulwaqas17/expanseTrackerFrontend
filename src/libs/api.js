import axios from "axios";

const api = axios.create({
    baseURL : "https://expanse-tracker-phi.vercel.app"
})

export default api;