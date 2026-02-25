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
    }),
});

export const {
    useGetUserDiagramsQuery,
	useGetMeQuery,
    useLazyGetDiagramQuery,
    useGetDiagramQuery,
    useGetDateModifiedQuery,
    useLoginUserMutation,
    useCreateDiagramMutation,
    useSaveDiagramMutation,
    useDeleteDiagramMutation,
} = api;