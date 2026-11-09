import type {FormEvent} from 'react'
import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import {getErrorMessage} from '../api/client'
import {Icon} from '../components/Icons'
import {AuthLayout} from './LoginPage'

const passwordPattern = /^[A-Za-z0-9_.,+=\—~?!@#$%^&;'-]+$/

export function RegisterPage() {
    const {signUp} = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setError('')
        if (password !== confirm) {
            setError('Пароли не совпадают.');
            return
        }
        if (!passwordPattern.test(password)) {
            setError('Пароль содержит недопустимые символы. Используйте латинские буквы, цифры и разрешённые знаки.');
            return
        }
        setLoading(true)
        try {
            await signUp({email: email.trim(), password});
            navigate('/', {replace: true})
        } catch (e) {
            setError(getErrorMessage(e, e instanceof Error ? e.message : 'Не удалось создать аккаунт.'))
        } finally {
            setLoading(false)
        }
    }

    return <AuthLayout mode="register">
        <div className="auth-heading"><span className="eyebrow">НАЧНИТЕ СЕГОДНЯ</span><h1>Создайте аккаунт<span
            className="brand-period">.</span></h1><p>Ваше пространство для ясных планов и спокойной продуктивности.</p>
        </div>
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
                                                  type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                                                  placeholder="Придумайте пароль" value={password}
                                                  onChange={(e) => setPassword(e.target.value)} required/>
                <button className="password-toggle" type="button"
                        onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Скрыть' : 'Показать'}</button>
            </div>
            <label className="field-label" htmlFor="confirm">Повторите пароль</label><input className="input-control"
                                                                                            id="confirm" type="password"
                                                                                            autoComplete="new-password"
                                                                                            placeholder="Ещё раз пароль"
                                                                                            value={confirm}
                                                                                            onChange={(e) => setConfirm(e.target.value)}
                                                                                            required/>
            <p className="field-hint">Пароль должен соответствовать ограничениям backend: латинские буквы, цифры и
                разрешённые спецсимволы.</p>
            {error && <div className="form-alert"><Icon name="alert" size={17}/>{error}</div>}
            <button className="button button-primary auth-submit" type="submit" disabled={loading}>{loading ? <><span
                className="spinner spinner-small"/>Создаём аккаунт...</> : <>Создать аккаунт <Icon name="arrow"
                                                                                                   size={17}/></>}</button>
        </form>
        <div className="auth-switch">Уже есть аккаунт? <Link to="/login">Войти</Link></div>
    </AuthLayout>
}
