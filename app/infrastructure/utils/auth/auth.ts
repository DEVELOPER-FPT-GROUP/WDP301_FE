import { data, useNavigate } from "react-router";
import { AppRoutes } from "~/infrastructure/core/AppRoutes";
import { Constants } from "~/infrastructure/core/constants";

export const useLogout = () => {
  const navigate = useNavigate();

  return () => {
    localStorage.removeItem(Constants.API_ACCESS_TOKEN_KEY);
    localStorage.removeItem(Constants.API_REFRESH_TOKEN_KEY);

    // Redirect to the login page and replace the history entry
    navigate(AppRoutes.PUBLIC.GUEST.HOME, { replace: true });
  };
};

export const protectRoute = (role: string[]) => {
  const accountRole = getAccountRole();
  if (!role.includes(accountRole!)) {
    throw data(null, { status: 403 });
  }
};

export const getAccountRole = () => {
  return localStorage.getItem(Constants.API_ROLE);
};
