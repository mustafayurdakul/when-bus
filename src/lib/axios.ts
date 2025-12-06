import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

axiosInstance.interceptors.request.use(
	(config) => {
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

axiosInstance.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response) {
			console.error("API Error:", error.response.data);
		} else if (error.request) {
			console.error("Network Error:", error.message);
		} else {
			console.error("Error:", error.message);
		}
		return Promise.reject(error);
	},
);

export default axiosInstance;
