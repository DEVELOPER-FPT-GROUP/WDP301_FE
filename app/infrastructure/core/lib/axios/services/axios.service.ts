import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";
import { Constants } from "~/infrastructure/core/constants";
import { notifyError } from "~/infrastructure/utils/notification/notification";
import {
	FailureResponse,
	InvalidModelStateResponse,
	SuccessResponse,
} from "../response";
class AxiosService {
	readonly instance: AxiosInstance;
	private isRefreshing = false;
	private refreshQueue: Array<(token: string) => void> = [];
	private abortController: AbortController | null = null;

	constructor() {
		this.instance = axios.create({
			baseURL: import.meta.env.BACKEND_URL,
			timeout: 10000, //time wait backend response before abort
		});
		// Add a request interceptor below
		// this.addInterceptors();
	}

	/**
	 * Add request and response interceptors
	 */
	private addInterceptors() {
		this.instance.interceptors.request.use((config) => {
			const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		this.instance.interceptors.response.use(
			(response) => this.handleResponse(response), // Handle success responses
			async (error) => {
				if (error.response?.status === 401) {
					return this.handle401Error(error);
				}
				return Promise.reject(error);
			},
		);
	}

	/**
	 * Handle responses with specific status codes
	 */
	private handleResponse(response: any) {
		switch (response.status) {
			case 200: {
				const successResponse = new SuccessResponse("Success", response.data);
				if (!successResponse.data.success) {
					notifyError({
						title: "Error",
						message:
							successResponse.data.errors?.[0]?.error ||
							successResponse.data.message ||
							"An error occurred. Please contact the administrator.",
					});
				}
				return successResponse;
			}

			case 202: {
				const failureResponse = new FailureResponse({
					code: "202",
					message: response.data.message || "Request failed.",
					success: false,
				});
				notifyError({
					title: "Failure Response",
					message: failureResponse.message,
				});
				return Promise.reject(failureResponse);
			}

			case 400: {
				const invalidModelResponse = new InvalidModelStateResponse({
					code: "400",
					message:
						response.data.errors?.[0]?.message || "Invalid request parameters.",
					success: false,
				});
				notifyError({
					title: "Validation Error",
					message: invalidModelResponse.message[0],
				});
				return Promise.reject(invalidModelResponse);
			}

			default: {
				return response;
			}
		}
	}

	/**
	 * Handle 401 Unauthorized errors
	 */
	private async handle401Error(error: AxiosError) {
		const originalRequest = error.config;

		if (!originalRequest) return Promise.reject(error);

		if (this.isRefreshing) {
			return new Promise((resolve) => {
				this.refreshQueue.push((newToken) => {
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					resolve(this.instance(originalRequest));
				});
			});
		}

		this.isRefreshing = true;
		const refreshToken = localStorage.getItem(Constants.API_REFRESH_TOKEN_KEY);

		if (!refreshToken) {
			this.handleLogout();
			return Promise.reject(error);
		}

		try {
			const { data } = await this.instance.post("/auth/refresh-token", {
				refreshToken,
			});
			const newToken = data.accessToken;
			localStorage.setItem(Constants.API_ACCESS_TOKEN_KEY, newToken);

			// Resolve all queued requests with the new token
			this.refreshQueue.forEach((callback) => callback(newToken));
			this.refreshQueue = [];

			originalRequest.headers.Authorization = `Bearer ${newToken}`;
			return this.instance(originalRequest);
		} catch (refreshError) {
			this.handleLogout();
			return Promise.reject(refreshError);
		} finally {
			this.isRefreshing = false;
		}
	}

	/**
	 * Handle logout by clearing tokens and redirecting to login
	 */
	private handleLogout() {
		localStorage.removeItem(Constants.API_ACCESS_TOKEN_KEY);
		localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);
		window.location.href = AppRoutes.PUBLIC.GUEST.HOME;
	}

	/**
	 * Create a new AbortSignal for request cancellation
	 */
	public createAbortSignal(): AbortSignal {
		this.abortController = new AbortController();
		return this.abortController.signal;
	}

	/**
	 * Cancel any ongoing requests
	 */
	public cancelRequests() {
		this.abortController?.abort();
		this.abortController = null;
	}

	/**
	 * Get Axios instance
	 */
	public getAxiosInstance(): AxiosInstance {
		return this.instance;
	}
}

const axiosService = new AxiosService();
export default axiosService;
