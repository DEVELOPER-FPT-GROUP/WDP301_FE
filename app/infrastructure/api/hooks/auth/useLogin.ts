import type { MutationOptions } from "@tanstack/react-query";
import { usePostApi } from "~/infrastructure/common/api/hooks/requestCommonHooks";
import { Endpoints } from "~/infrastructure/core/endpoints";
import type { LoginRequest } from "../../requests/auth/LoginRequest";
import type { LoginResponse } from "../../resopones/auth/LoginResponse";
const useLogin = (
	options?: MutationOptions<LoginResponse, unknown, LoginRequest, unknown>,
) => {
	return usePostApi<LoginRequest, LoginResponse>({
		endpoint: Endpoints.Auth.LOGIN, // Backend endpoint for login
		options,
	});
};

export default useLogin;
