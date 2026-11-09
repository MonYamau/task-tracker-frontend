import {NavLink, Outlet, useNavigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import {Icon} from './Icons'

export function AppShell() {
    const {user, signOut} = useAuth()
    const navigate = useNavigate()
    const initials = user?.email?.slice(0, 1).toUpperCase() || 'U'
    const handleSignOut = () => {
        signOut();
        navigate('/login', {replace: true})
    }

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <NavLink to="/" className="brand"><span className="brand-mark"><Icon name="check"
                                                                                     size={20}/></span><span>taskspace<span
                    className="brand-period">.</span></span></NavLink>
                <div className="sidebar-label">WORKSPACE</div>
                <nav className="side-nav">
                    <NavLink to="/" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon
                        name="grid"/><span>Мои задачи</span></NavLink>
                </nav>
                <div className="sidebar-bottom">
                    <div className="sidebar-tip">
                        <div className="tip-icon"><Icon name="spark" size={17}/></div>
                        <strong>Маленькие шаги</strong><p>Каждая завершённая задача приближает к большой цели.</p></div>
                    <div className="sidebar-profile">
                        <div className="avatar">{initials}</div>
                        <div className="profile-copy"><strong>{user?.email || 'Пользователь'}</strong><span>Личный аккаунт</span>
                        </div>
                        <button className="icon-button logout-button" onClick={handleSignOut} title="Выйти"
                                aria-label="Выйти"><Icon name="logout"/></button>
                    </div>
                </div>
            </aside>
            <div className="main-column">
                <header className="topbar">
                    <div className="mobile-brand"><span className="brand-mark"><Icon name="check" size={18}/></span>taskspace<span
                        className="brand-period">.</span></div>
                    <div className="topbar-context"><span className="status-dot"/>Ваше личное пространство</div>
                    <div className="topbar-user"><span>{user?.email}</span>
                        <div className="avatar avatar-small">{initials}</div>
                        <button className="icon-button mobile-logout" onClick={handleSignOut} aria-label="Выйти"><Icon
                            name="logout" size={17}/></button>
                    </div>
                </header>
                <main className="page-content"><Outlet/></main>
                <footer className="page-footer">Сделайте важное. Остальное подождёт.</footer>
            </div>
        </div>
    )
}
