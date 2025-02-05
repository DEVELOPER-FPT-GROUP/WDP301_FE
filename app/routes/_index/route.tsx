import { AppRoutes } from "app/infrastructure/core/AppRoutes";
import { Constants } from "app/infrastructure/core/constants";
import { Navigate } from "react-router";

export function meta() {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function IndexPage() {
	const authWrapper = () => {
		// const accessToken = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);
		// if (accessToken) {
		//   return <Navigate to={AppRoutes.PRIVATE.FAMILY_TREE} replace={true} />;
		// } else {
		//   return <Navigate to={AppRoutes.PUBLIC.AUTH.HOME} replace={true} />;
		// }
		return <Navigate to={AppRoutes.PUBLIC.GUEST.HOME} replace={true} />;
	};
	return <>{authWrapper()}</>;
}
