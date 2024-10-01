import axios, { AxiosError, AxiosInstance } from "axios";
import { serialize } from "object-to-formdata";
import buildQuery, { QueryOptions } from 'odata-query'

export interface BaseModel {
    Id: number
    CreatedAt: Date
    UpdatedAt: Date
}

export interface ODataResponse<T> {
    "@odata.count"?: number
    value: T
}

export type GroupResponse<T> = T & {
    $count: number
}

export type CreateOperation<T> = {
    create: (data: T, multipart?: boolean) => Promise<ODataResponse<T>>
}

export interface ReadOperation<T> {
    //read: (query?: Query, extraQs?: string[], path?: string) => Promise<ODataResponse<T[]>>
    read: (query?: Partial<QueryOptions<T>>, extraQs?: string[], path?: string) => Promise<ODataResponse<T[]>>
    readById: (id: number, query?: Partial<QueryOptions<T>>) => Promise<T>
}

export interface UpdateOperation<T> {
    update: (data: Partial<T>, id: number, multipart?: boolean, replace?: boolean) => Promise<void>
}

export interface DeleteOperation {
    deleteById: (id: number) => Promise<void>
}

export interface Api<T> extends CreateOperation<T>, ReadOperation<T>, UpdateOperation<T>, DeleteOperation {
    axiosInstance: AxiosInstance
}

export interface ApiProps {
    feature: string
}

export default function useApi<T>(props: ApiProps): Api<T> {
    const axiosInstance = axios.create({
        baseURL: `${import.meta.env.VITE_API_URL}`,
        withCredentials: true
    })

    return {
        axiosInstance,
        create(data: T, multipart?: boolean) {
            let dataToSend = multipart ? serialize(data, { indices: true }) : data
            const contentType = multipart ? 'multipart/form-data' : 'application/json'
            return axiosInstance.post<ODataResponse<T>>(
                `odata/${props.feature}`,
                dataToSend,
                {
                    headers: { 'Content-Type': contentType }
                }).then(r => r.data)
        },
        read<T>(query?: Partial<QueryOptions<T>>, extraQs?: string[], path?: string) {
            let qs = buildQuery(query)
            if (extraQs && extraQs.length) {
                qs += `&${extraQs.join("&")}`
            }
            const url = path ? `odata/${props.feature}/${path}${qs}` : `odata/${props.feature}${qs}`
            return axiosInstance.get<ODataResponse<T[]>>(url).then(r => r.data)
        },
        readById<T>(id: number, query?: Partial<QueryOptions<T>>) {
            let qs = buildQuery(query)
            const url = `odata/${props.feature}/${id}${qs}`
            return axiosInstance.get<T>(url).then(r => r.data)
        },
        update(data: Partial<T>, id: number, multipart?: boolean, replace?: boolean) {
            let dataToSend = multipart ? serialize(data, { indices: true }) : data
            const contentType = multipart ? 'multipart/form-data' : 'application/json'
            return axiosInstance(
                `odata/${props.feature}/${id}`,
                {
                    data: dataToSend,
                    method: replace ? 'put' : 'patch',
                    headers: { 'Content-Type': contentType }
                }).then(r => r.data)
        },
        deleteById(id: number) {
            return axiosInstance.delete(`odata/${props.feature}/${id}`).then(r => r.data)

        }
    }
}