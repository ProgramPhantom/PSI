

import {CredentialResponse} from "@react-oauth/google";
import { paths } from "../types/apiSchema";
import createClient from 'openapi-fetch'
import { IDiagram } from "./hasComponents/diagram";



const client = createClient<paths>({ baseUrl: "/api" });

export const getUserDiagrams = async () => {
    return await client.GET('/users/diagrams')
}
export const getDateModified = async (diagramId: string) => {
    return await client.GET('/diagrams/{diagramId}/modified', { params: {path: {diagramId: diagramId}}})
}

export const getDiagram = async (diagramId: string) => {
    return await client.GET('/diagrams/{diagramId}', {params: {path: {diagramId: diagramId}}})
}

export const loginUser = async (googleData: CredentialResponse) => {
    return await client.POST('/users/login', {body: googleData})
}

export const createDiagram = async (name: string) => {
    return await client.POST('/diagrams', {body: {name: name}})
}
export const saveDiagram = async (diagramId: string, diagram: IDiagram) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await client.PUT('/diagrams/{diagramId}', {params: {path: {diagramId: diagramId}}, body: diagram as any})
}

export const deleteDiagram = async (diagramId: string) => {
    return await client.DELETE('/diagrams/{diagramId}', {params: {path: {diagramId: diagramId}}})
}