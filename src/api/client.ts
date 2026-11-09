import axios, {AxiosError} from 'axios'
import type {ErrorDto} from './types'

export const TOKEN_KEY = 'task_tracker_token'
const baseURL = import.meta.env.VITE_API_BASE_URL ?? ''

export const api = axios.create({
    baseURL,
    headers: {'Content-Type': 'application/json'},
    timeout: 15000,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorDto>) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY)
            window.dispatchEvent(new Event('task-tracker:unauthorized'))
        }
        return Promise.reject(error)
    },
)

export function getErrorMessage(error: unknown, fallback = 'Что-то пошло не так. Попробуйте ещё раз.'): string {
    if (axios.isAxiosError<ErrorDto>(error)) {
        const message = error.response?.data?.message
        if (message) return message
        if (error.code === 'ECONNABORTED') return 'Сервер слишком долго отвечает. Попробуйте ещё раз.'
        if (!error.response) return 'Не удалось связаться с сервером. Проверьте подключение и адрес backend.'
    }
    return fallback
}

export function extractToken(headers: Record<string, unknown>): string | null {
    const raw = headers.authorization ?? headers.Authorization
    if (typeof raw !== 'string' || !raw.trim()) return null
    return raw.trim().startsWith('Bearer ') ? raw.trim() : `Bearer ${raw.trim()}`
}
