import {api, extractToken} from './client'
import type {UserRequestDto, UserResponseDto} from './types'

export async function loginRequest(payload: UserRequestDto): Promise<string> {
    const response = await api.post<void>('/auth/login', payload)
    const token = extractToken(response.headers as Record<string, unknown>)
    if (!token) throw new Error('Backend не вернул JWT в заголовке Authorization. Проверьте CORS expose headers.')
    return token
}

export async function registerRequest(payload: UserRequestDto): Promise<string> {
    const response = await api.post<void>('/user', payload)
    const token = extractToken(response.headers as Record<string, unknown>)
    if (!token) throw new Error('Backend не вернул JWT в заголовке Authorization. Проверьте CORS expose headers.')
    return token
}

export async function getCurrentUser(): Promise<UserResponseDto> {
    const response = await api.get<UserResponseDto>('/user')
    return response.data
}
