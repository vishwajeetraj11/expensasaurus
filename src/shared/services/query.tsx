import { AppwriteException } from "appwrite";
import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "react-query";
import { database, storage } from "./appwrite";

export interface InfiniteScrollApiParams<B extends any = any> {
  pageParam: number;
  params?: any;
  body?: any;
}

export type DocumentListType<T> = {
  documents: T[];
  total: number;
};

export const QueryFactoryList = <T extends unknown>(
  queryKey: QueryKey,
  query: [string, string, string[]],
  options?: UseQueryOptions<T, any, any>
) => {
  return useQuery<T, any, T>(
    queryKey,
    async () => {
      return database.listDocuments(...query).then((result) => result) as T;
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      ...options,
    }
  );
};

export const QueryFactoryOneDoc = <T extends unknown>(
  queryKey: QueryKey,
  query: [string, string, string],
  options?: UseQueryOptions<T, AppwriteException, any>
) => {
  return useQuery<T, AppwriteException, T>(
    queryKey,
    async () => {
      return database.getDocument(...query).then((result) => result) as T;
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      ...options,
    }
  );
};

export const QueryFactoryOneFileDownload = <T extends unknown>(
  queryKey: QueryKey,
  fileId: string, bucketId: string,
  options?: UseQueryOptions<any, any, any>
) => {
  return useQuery<any, any, any>(
    queryKey,
    async () => {
      return storage.getFileDownload(bucketId, fileId);
    },
    {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity,
      cacheTime: Infinity,
      ...options,
    }
  );
};

export const QueryFactoryDeleteDoc = (
  queryKey: QueryKey,
  query: [string, string, string],
  options?: UseMutationOptions<any, any, any>
) => {
  return useMutation<any, any, any>(
    queryKey,
    async () => {
      return database.deleteDocument(...query).then((result) => result);
    },
    options
  );
};

export const getAllLists = <T extends unknown>(
  queryKey: QueryKey,
  query: [string, string, string[]],
  options: UseQueryOptions<DocumentListType<T>, any, any>
) => QueryFactoryList(queryKey, query, options);

export const getDoc = <T extends unknown>(
  queryKey: QueryKey,
  query: [string, string, string],
  options: UseQueryOptions<T, AppwriteException, any>
) => QueryFactoryOneDoc(queryKey, query, options);

export const deleteDoc = (
  queryKey: QueryKey,
  query: [string, string, string],
  options: UseMutationOptions<any, any, any>
) => QueryFactoryDeleteDoc(queryKey, query, options);

export const downloadFile = (
  queryKey: QueryKey,
  fileId: string, bucketId: string,
  options: UseQueryOptions<any, any, any>
) => QueryFactoryOneFileDownload(queryKey, fileId, bucketId, options);

// export const InfiniteQueryFactory = <
//   T extends unknown,
//   E extends unknown = AxiosError<any, any>
// >(
//   queryKey: QueryKey,
//   fetchItems: (params: InfiniteScrollApiParams) => Promise<T>,
//   options?: UseInfiniteQueryOptions<T, E>
// ) => {
//   return useInfiniteQuery<T, E>(
//     queryKey,
//     ({ pageParam = 0 }) => fetchItems(pageParam),
//     {
//       retry: false,
//       refetchOnWindowFocus: false,
//       ...options,
//     }
//   );
// };

// export const QueryFactory = <T extends unknown>(
//   queryKey: QueryKey,
//   url: string,
//   params: object = {},
//   body: any,
//   method: string = "GET",
//   options?: UseQueryOptions<T, AxiosError, any>
// ) => {
//   const token = isBrowser
//     ? localStorage.getItem(localStorageConstants.AUTH_TOKEN)
//     : "";
//   return useQuery<T, AxiosError, T>(
//     queryKey,
//     async () => {
//       const headers: any = {
//         Authorization: `${token}`,
//       };
//       if (method === "POST") {
//         headers["Content-Type"] = "application/json";
//       }
//       return axios({
//         url,
//         method: method,
//         params,
//         data: body,
//         headers,
//       }).then((result: AxiosResponse<T>) => result.data as T);
//     },
//     {
//       refetchOnWindowFocus: false,
//       retry: false,
//       ...options,
//     }
//   );
// };

// const MutationFactory = (
//   mutationKey: QueryKey,
//   url: string,
//   method: "POST" | "PUT" | "PATCH",
//   headers?: any,
//   options?: MutationOptions
// ) => {
//   const token = isBrowser
//     ? localStorage.getItem(localStorageConstants.AUTH_TOKEN)
//     : "";
//   return useMutation<any, AxiosError, any>({
//     mutationKey,
//     mutationFn: async (variables: { body: any }) => {
//       return axios({
//         url,
//         method,
//         headers: {
//           Authorization: `${token}`,
//           ...headers,
//         },
//         data: variables.body,
//       }).then((response: AxiosResponse) => response.data);
//     },
//     ...options,
//   });
// };

// const DeleteMutationFactory = (
//   mutationKey: QueryKey,
//   url: string,
//   options?: MutationOptions
// ) => {
//   const token = isBrowser
//     ? localStorage.getItem(localStorageConstants.AUTH_TOKEN)
//     : "";
//   return useMutation<any, AxiosError, any>({
//     mutationKey,
//     mutationFn: async () => {
//       return axios({
//         url,
//         method: "DELETE",
//         headers: {
//           Authorization: `${token}`,
//         },
//       }).then((response: AxiosResponse) => response.data);
//     },
//     ...options,
//   });
// };
