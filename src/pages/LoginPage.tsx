import type {FormEvent, ReactNode} from 'react'
import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import {getErrorMessage} from '../api/client'
import {Icon} from '../components/Icons'

export function LoginPage() {
    const {signIn} = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setError('');
        setLoading(true)
        try {
            await signIn({email: email.trim(), password});
            navigate('/', {replace: true})
        } catch (e) {
            setError(getErrorMessage(e, e instanceof Error ? e.message : 'Не удалось войти.'))
        } finally {
            setLoading(false)
        }
    }

    return <AuthLayout mode="login">
        <div className="auth-heading"><span className="eyebrow">С ВОЗВРАЩЕНИЕМ</span><h1>Снова в деле<span
            className="brand-period">.</span></h1><p>Войдите, чтобы продолжить работу над своими задачами.</p></div>
        <form className="auth-form" onSubmit={submit}>
            <label className="field-label" htmlFor="email">Электронная почта</label><input className="input-control"
                                                                                           id="email" type="email"
                                                                                           autoComplete="email"
                                                                                           placeholder="you@example.com"
                                                                                           value={email}
                                                                                           onChange={(e) => setEmail(e.target.value)}
                                                                                           required/>
            <label className="field-label" htmlFor="password">Пароль</label>
            <div className="password-wrap"><input className="input-control" id="password"
                                                  type={showPassword ? 'text' : 'password'}
                                                  autoComplete="current-password" placeholder="Введите пароль"
                                                  value={password} onChange={(e) => setPassword(e.target.value)}
                                                  required/>
                <button className="password-toggle" type="button"
                        onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Скрыть' : 'Показать'}</button>
            </div>
            {error && <div className="form-alert"><Icon name="alert" size={17}/>{error}</div>}
            <button className="button button-primary auth-submit" type="submit" disabled={loading}>{loading ? <><span
                className="spinner spinner-small"/>Входим...</> : <>Войти <Icon name="arrow" size={17}/></>}</button>
        </form>
        <div className="auth-switch">Ещё нет аккаунта? <Link to="/register">Создать аккаунт</Link></div>
    </AuthLayout>
}

export function AuthLayout({children, mode}: { children: ReactNode; mode: 'login' | 'register' }) {
    return <div className="auth-page">
        <div className="auth-visual">
            <div className="auth-visual-glow"/>
            <LinkBrand/>
            <div className="visual-copy"><span className="eyebrow">FOCUS ON WHAT MATTERS</span><h2>Порядок в
                задачах.<br/>Свобода в голове<span className="brand-period">.</span></h2><p>Место, где планы
                превращаются в сделанные дела.</p></div>
            <div className="visual-bottom">
                <div className="mini-progress">
                    <div className="mini-progress-top"><span>Ваш сегодняшний фокус</span><strong>3 / 5</strong></div>
                    <div className="progress-track"><span style={{width: '60%'}}/></div>
                </div>
                <span className="visual-caption">TASKSPACE · PERSONAL WORKSPACE</span></div>
        </div>
        <div className="auth-panel">
            <div className="auth-mobile-brand"><LinkBrand/></div>
            <div className="auth-content">{children}</div>
            <div
                className="auth-panel-footer">{mode === 'login' ? 'Ваш следующий шаг начинается здесь.' : 'Хорошие привычки начинаются с одного шага.'}</div>
        </div>
    </div>
}

function LinkBrand() {
    return <Link to="/login" className="brand auth-brand"><span className="brand-mark"><Icon name="check"
                                                                                             size={20}/></span><span>taskspace<span
        className="brand-period">.</span></span></Link>
}
