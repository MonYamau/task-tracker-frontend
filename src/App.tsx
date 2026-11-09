import type {ReactNode} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import {useAuth} from './context/AuthContext'
import {ProtectedRoute} from './components/ProtectedRoute'
import {AppShell} from './components/AppShell'
import {LoginPage} from './pages/LoginPage'
import {RegisterPage} from './pages/RegisterPage'
import {DashboardPage} from './pages/DashboardPage'
import {TaskDetailPage} from './pages/TaskDetailPage'
import {NotFoundPage} from './pages/NotFoundPage'

function PublicOnly({children}: { children: ReactNode }) {
    const {token, loading} = useAuth()
    if (loading) return <div className="screen-loader"><span className="spinner"/></div>
    return token ? <Navigate to="/" replace/> : <>{children}</>
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<PublicOnly><LoginPage/></PublicOnly>}/>
            <Route path="/register" element={<PublicOnly><RegisterPage/></PublicOnly>}/>
            <Route element={<ProtectedRoute><AppShell/></ProtectedRoute>}>
                <Route path="/" element={<DashboardPage/>}/>
                <Route path="/tasks/:id" element={<TaskDetailPage/>}/>
            </Route>
            <Route path="*" element={<NotFoundPage/>}/>
        </Routes>
    )
}
