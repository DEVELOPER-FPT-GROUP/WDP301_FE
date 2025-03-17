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
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./app.css";
import { createTheme, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Route } from "./+types/root";
import AppLayout from "./infrastructure/common/components/layout/appLayout";
import { Constants } from "./infrastructure/core/constants";
import {
  GeneralError,
  NotFound,
} from "./infrastructure/common/components/error-screen";
import { Notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { AppRoutes } from "./infrastructure/core/AppRoutes";

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
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lobster&display=swap",
  },
];

export const clientLoader = async () => {
  const token = localStorage.getItem(Constants.API_ACCESS_TOKEN_KEY);
  return { isLoggedIn: !!token };
};

export function HydrateFallback() {
  return (
    <div className="flex items-center justify-center w-screen h-screen border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <div role="status">
        <svg
          aria-hidden="true"
          className="w-30 h-30 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading data...</span>
      </div>
    </div>
  );
}

const theme = createTheme({
  fontFamily: "Poppins, sans-serif",
});

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
          <MantineProvider theme={theme}>
            <Notifications /> {/* ✅ Thêm vào đây */}
            {children}
          </MantineProvider>
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
    } else if (
      !token &&
      location.pathname !== AppRoutes.PUBLIC.AUTH.LOGIN &&
      location.pathname !== AppRoutes.PUBLIC.GUEST.HOME &&
      location.pathname !== AppRoutes.PUBLIC.AUTH.SIGN_UP
    ) {
      navigate(AppRoutes.PUBLIC.AUTH.LOGIN, { replace: true });
    } else if (!token && location.pathname === AppRoutes.PUBLIC.GUEST.HOME) {
      navigate(AppRoutes.PUBLIC.GUEST.HOME, { replace: true });
    }
  }, [isLoggedIn, location.pathname, navigate]);

  return (
    <>
      {isLoggedIn === true ? (
        <AppLayout>
          <Outlet />
        </AppLayout>
      ) : (
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
