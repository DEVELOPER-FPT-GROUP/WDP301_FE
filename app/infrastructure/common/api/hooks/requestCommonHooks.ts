import {
  type MutationOptions,
  type QueryKey,
  type QueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import useAxios from "~/infrastructure/core/lib/axios/hooks/useAxios";
import { buildUrl } from "~/infrastructure/utils/url/url";

interface UseGetApiProps<TResponse> {
  queryKey: QueryKey;
  endpoint: string;
  urlParams?: Record<string, string | number> | null;
  queryParams?: Record<string, string | number | boolean | undefined> | null;
  options?: QueryOptions<any, any, TResponse>;
  enabled?: boolean; // Add this line to support the enabled flag
  refetchOnWindowFocus?: boolean; // Add this line to support refetchOnWindowFocus
  // Default to true to maintain backward compatibility
}

interface UseMutationApiProps<TRequest, TResponse> {
  endpoint: string;
  queryParams?: Record<string, string | number | boolean | undefined> | null;
  options?: MutationOptions<TResponse, unknown, TRequest, unknown>;
}

interface UseDeleteApiProps {
  endpoint: string; // API endpoint
  urlParams?: Record<string, string | number>;
  queryParams?: Record<string, string | number | boolean | undefined> | null;
  options?: MutationOptions;
}

// GET request hook
export const useGetApi = <TResponse = any>({
  queryKey,
  endpoint,
  urlParams = null,
  queryParams = null,
  options = {},
  enabled = true, // Default to true to maintain backward compatibility
  refetchOnWindowFocus = true,
}: UseGetApiProps<TResponse>) => {
  const { axiosInstance, newAbortSignal } = useAxios();

  return useQuery({
    queryKey,
    queryFn: async () => {
      const signal = newAbortSignal();
      const response = await axiosInstance.get<TResponse>(
        buildUrl(endpoint, urlParams, queryParams),
        {
          signal,
        }
      );
      return response.data;
    },
    enabled, // Pass the enabled flag to useQuery
    refetchOnWindowFocus, // Pass the refetchOnWindowFocus flag to useQuery
    ...options, // This should come after enabled to allow options to override it if needed
  });
};

// POST request hook
export const usePostApi = <TRequest = any, TResponse = any>({
  endpoint,
  queryParams = null,
  options = {},
}: UseMutationApiProps<TRequest, TResponse>) => {
  const { axiosInstance, newAbortSignal } = useAxios();

  return useMutation<TResponse, unknown, TRequest, unknown>({
    mutationFn: async (payload: TRequest) => {
      const signal = newAbortSignal();
      const response = await axiosInstance.post<TResponse>(
        buildUrl(endpoint, null, queryParams),
        payload,
        { signal }
      );
      return response.data;
    },
    ...options,
  });
};

// PUT request hook
export const usePutApi = <TRequest = any, TResponse = any>({
  endpoint,
  queryParams = {},
  options = {},
}: UseMutationApiProps<TRequest, TResponse>) => {
  const { axiosInstance, newAbortSignal } = useAxios();

  return useMutation({
    mutationFn: async (payload: TRequest) => {
      const signal = newAbortSignal();
      const response = await axiosInstance.put<TResponse>(
        buildUrl(endpoint, {}, queryParams),
        payload,
        {
          signal,
        }
      );
      return response.data;
    },
    ...options,
  });
};

// DELETE request hook
export const useDeleteApi = ({
  endpoint,
  urlParams = {},
  queryParams = {},
  options = {},
}: UseDeleteApiProps) => {
  const { axiosInstance, newAbortSignal } = useAxios();

  return useMutation({
    mutationFn: async () => {
      const signal = newAbortSignal();
      const response = await axiosInstance.delete(
        buildUrl(endpoint, urlParams, queryParams),
        {
          signal,
        }
      );
      return response.data;
    },
    ...options,
  });
};
