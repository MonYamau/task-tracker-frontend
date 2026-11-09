export interface UserRequestDto {
    email: string
    password: string
}

export interface UserResponseDto {
    id: number | string
    email: string
}

export interface TaskFormRequestDto {
    title: string
    text: string
    plannedCompletionAt: string | null
    isReady: boolean
}

export interface TaskResponseDto extends TaskFormRequestDto {
    id: number | string
    completedAt?: string | null
}

export interface ErrorDto {
    message?: string
}
