import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useLoaderData,
	useLocation,
	useNavigate,
} from "react-router";

import { LoadingOverlay, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Route } from "./+types/root";
import "@mantine/core/styles.css";
import "./app.css";
import { useEffect } from "react";
import { NotFound } from "./infrastructure/common/components/error-screen/404/not-found";
import { GeneralError } from "./infrastructure/common/components/error-screen/general/general-error";
import AppLayout from "./infrastructure/common/components/layout/appLayout";
import { AppRoutes } from "./infrastructure/core/AppRoutes";
import { Constants } from "./infrastructure/core/constants";
const queryClient = new QueryClient();
export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
];

export const clientLoader = async () => {
	const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);
	return { isLoggedIn: !!token };
};

export function HydrateFallback() {
	return (
		<LoadingOverlay
			visible={true}
			zIndex={1000}
			loaderProps={{ type: "bars" }}
			transitionProps={{
				duration: 500,
				timingFunction: "ease",
			}}
		/>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>
					<MantineProvider>{children}</MantineProvider>
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const { isLoggedIn } = useLoaderData<typeof clientLoader>();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);

		// Redirect only if the user is not already on the correct page
		if (token && location.pathname === AppRoutes.PUBLIC.AUTH.LOGIN) {
			navigate(AppRoutes.ROOT, { replace: true });
		} else if (!token && location.pathname !== AppRoutes.PUBLIC.AUTH.LOGIN) {
			navigate(AppRoutes.PUBLIC.AUTH.LOGIN, { replace: true });
		}
	}, [isLoggedIn, location.pathname, navigate]);

	return (
		<>
			{isLoggedIn ? (
				<AppLayout>
					<Outlet />
				</AppLayout>
			) : (
				// Render public routes (e.g., login, register)
				<Outlet />
			)}
		</>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let errorPage = null;
	if (isRouteErrorResponse(error)) {
		switch (error.status) {
			case 404:
				errorPage = <NotFound />;
				break;
			case 403:
			default:
				errorPage = <GeneralError />;
				break;
		}
	}

	return <main>{errorPage}</main>;
}
