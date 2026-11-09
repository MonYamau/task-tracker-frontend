import type {ReactNode} from 'react'
import {Navigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'

export function ProtectedRoute({children}: { children: ReactNode }) {
    const {token, loading} = useAuth()
    if (loading) return <div className="screen-loader"><span className="spinner"/></div>
    return token ? <>{children}</> : <Navigate to="/login" replace/>
}
