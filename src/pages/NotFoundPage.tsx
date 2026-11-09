import {Link} from 'react-router-dom'

export function NotFoundPage() {
    return <div className="not-found"><span className="not-found-code">404</span><h1>Кажется, вы свернули не туда.</h1>
        <p>Такой страницы нет. Вернёмся к вашим задачам?</p><Link className="button button-primary" to="/">На
            главную</Link></div>
}
