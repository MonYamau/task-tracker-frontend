import type {ReactNode} from 'react'
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {getCurrentUser, loginRequest, registerRequest} from '../api/auth'
import {TOKEN_KEY} from '../api/client'
import type {UserRequestDto, UserResponseDto} from '../api/types'

interface AuthContextValue {
    token: string | null
    user: UserResponseDto | null
    loading: boolean
    signIn: (payload: UserRequestDto) => Promise<void>
    signUp: (payload: UserRequestDto) => Promise<void>
    signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({children}: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
    const [user, setUser] = useState<UserResponseDto | null>(null)
    const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

    const saveTokenAndLoadUser = useCallback(async (newToken: string) => {
        localStorage.setItem(TOKEN_KEY, newToken)
        setToken(newToken)
        try {
            const current = await getCurrentUser()
            setUser(current)
        } catch (error) {
            // Не оставляем частично завершённую авторизацию с токеном без профиля.
            localStorage.removeItem(TOKEN_KEY)
            setToken(null)
            setUser(null)
            throw error
        }
    }, [])

    const signIn = useCallback(async (payload: UserRequestDto) => {
        const newToken = await loginRequest(payload)
        await saveTokenAndLoadUser(newToken)
    }, [saveTokenAndLoadUser])

    const signUp = useCallback(async (payload: UserRequestDto) => {
        const newToken = await registerRequest(payload)
        await saveTokenAndLoadUser(newToken)
    }, [saveTokenAndLoadUser])

    const signOut = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
    }, [])

    useEffect(() => {
        const handleUnauthorized = () => {
            setToken(null)
            setUser(null)
        }
        window.addEventListener('task-tracker:unauthorized', handleUnauthorized)
        return () => window.removeEventListener('task-tracker:unauthorized', handleUnauthorized)
    }, [])

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }
        let active = true
        setLoading(true)
        getCurrentUser()
            .then((current) => {
                if (active) setUser(current)
            })
            .catch(() => {
                if (active) {
                    localStorage.removeItem(TOKEN_KEY);
                    setToken(null);
                    setUser(null)
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => {
            active = false
        }
    }, [])

    const value = useMemo(() => ({
        token,
        user,
        loading,
        signIn,
        signUp,
        signOut
    }), [token, user, loading, signIn, signUp, signOut])
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used inside AuthProvider')
    return context
}
