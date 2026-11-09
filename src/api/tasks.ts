import {api} from './client'
import type {TaskFormRequestDto, TaskResponseDto} from './types'

export async function getTasks(): Promise<TaskResponseDto[]> {
    const response = await api.get<TaskResponseDto[]>('/tasks')
    return response.data
}

export async function getTask(id: string): Promise<TaskResponseDto> {
    const response = await api.get<TaskResponseDto>(`/task/${encodeURIComponent(id)}`)
    return response.data
}

export async function createTask(payload: TaskFormRequestDto): Promise<TaskResponseDto> {
    const response = await api.post<TaskResponseDto>('/task', payload)
    return response.data
}

export async function updateTask(id: string, payload: TaskFormRequestDto): Promise<TaskResponseDto> {
    const response = await api.patch<TaskResponseDto>(`/task/${encodeURIComponent(id)}`, payload)
    return response.data
}

export async function deleteTask(id: string): Promise<void> {
    await api.delete(`/task/${encodeURIComponent(id)}`)
}
