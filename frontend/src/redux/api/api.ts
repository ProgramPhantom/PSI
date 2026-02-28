import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CredentialResponse } from "@react-oauth/google";
import { IDiagram } from "../../logic/hasComponents/diagram";
import { components } from "../../types/apiSchema"

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: "include" }),
    tagTypes: ['Diagram', 'User'],
    endpoints: (builder) => ({
        getUserDiagrams: builder.query<components['schemas']['diagramsListResponse'], void>({
            query: () => '/users/diagrams',
            providesTags: ['Diagram'],
        }),
        getUserSchemes: builder.query<components['schemas']['schemesListResponse'], void>({
            query: () => '/users/schemes',
        }),
        getMe: builder.query<components['schemas']['meResponse'], void>({
            query: () => '/users/me',
            providesTags: ['User']
        }),

        getDiagram: builder.query<components['schemas']['diagramDataResponse'], string>({
            query: (diagramId) => `/diagrams/${diagramId}`,
        }),
        getDateModified: builder.query<{ date_modified?: string }, string>({
            query: (diagramId) => `/diagrams/${diagramId}/modified`,
        }),
        loginUser: builder.mutation<components['schemas']['genericResponse'], CredentialResponse>({
            query: (googleData) => ({
                url: '/users/login',
                method: 'POST',
                body: googleData,
            }),
            invalidatesTags: ["User"]
        }),
        createDiagram: builder.mutation<components['schemas']['diagramCreateResponse'], string>({
            query: (name) => ({
                url: '/diagrams',
                method: 'POST',
                body: { name },
            }),
            invalidatesTags: ['Diagram'],
        }),
        saveDiagram: builder.mutation<components['schemas']['saveDiagramResponse'] | components['schemas']['copyDiagramResponse'], { diagramId: string, diagram: IDiagram }>({
            query: ({ diagramId, diagram }) => ({
                url: `/diagrams/${diagramId}`,
                method: 'PUT',
                body: diagram,
            }),
            invalidatesTags: ['Diagram'],
        }),
        deleteDiagram: builder.mutation<components['schemas']['genericResponse'], string>({
            query: (diagramId) => ({
                url: `/diagrams/${diagramId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Diagram'],
        }),

        getScheme: builder.query<File, string>({
            query: (schemeId) => ({
                url: `/schemes/${schemeId}`,
                responseHandler: (response) => response.blob()
            }),
            keepUnusedDataFor: 0,
        }),
        createScheme: builder.mutation<components['schemas']['schemeCreateResponse'], { schemeId: string, schemeName: string, formData: FormData }>({
            query: ({ schemeId, schemeName, formData }) => {
                // Ensure the name is included in the multipart form data
                if (!formData.has('name')) {
                    formData.append('name', schemeName);
                }
                return {
                    url: `/schemes/${schemeId}`,
                    method: 'POST',
                    body: formData,
                };
            },
        }),
        saveScheme: builder.mutation<components['schemas']['saveSchemeResponse'], { schemeId: string, formData: FormData }>({
            query: ({ schemeId, formData }) => ({
                url: `/schemes/${schemeId}`,
                method: 'PUT',
                body: formData,
            }),
        }),
        deleteScheme: builder.mutation<components['schemas']['genericResponse'], string>({
            query: (schemeId) => ({
                url: `/schemes/${schemeId}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetUserDiagramsQuery,
    useGetUserSchemesQuery,
    useGetMeQuery,
    useLazyGetDiagramQuery,
    useGetDiagramQuery,
    useGetDateModifiedQuery,
    useLoginUserMutation,
    useCreateDiagramMutation,
    useSaveDiagramMutation,
    useDeleteDiagramMutation,
    useCreateSchemeMutation,
    useSaveSchemeMutation,
    useDeleteSchemeMutation,
} = api;