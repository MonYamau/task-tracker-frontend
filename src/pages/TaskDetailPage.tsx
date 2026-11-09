import {useEffect, useState} from 'react'
import {Link, useNavigate, useParams} from 'react-router-dom'
import {deleteTask, getTask, updateTask} from '../api/tasks'
import type {TaskFormRequestDto, TaskResponseDto} from '../api/types'
import {getErrorMessage} from '../api/client'
import {Icon} from '../components/Icons'
import {TaskModal} from '../components/TaskModal'

export function TaskDetailPage() {
    const {id = ''} = useParams()
    const navigate = useNavigate()
    const [task, setTask] = useState<TaskResponseDto | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        let active = true
        setLoading(true);
        setError('')
        getTask(id).then((value) => {
            if (active) setTask(value)
        }).catch((e) => {
            if (active) setError(getErrorMessage(e, 'Не удалось загрузить задачу.'))
        }).finally(() => {
            if (active) setLoading(false)
        })
        return () => {
            active = false
        }
    }, [id])

    const save = async (payload: TaskFormRequestDto) => {
        setSaving(true);
        setError('')
        try {
            setTask(await updateTask(id, payload));
            setModalOpen(false)
        } catch (e) {
            setError(getErrorMessage(e, 'Не удалось сохранить задачу.'))
        } finally {
            setSaving(false)
        }
    }
    const remove = async () => {
        if (!task || !window.confirm(`Удалить задачу «${task.title}»?`)) return
        try {
            await deleteTask(id);
            navigate('/', {replace: true})
        } catch (e) {
            setError(getErrorMessage(e, 'Не удалось удалить задачу.'))
        }
    }
    const toggle = async () => {
        if (!task) return
        const payload = {
            title: task.title,
            text: task.text,
            plannedCompletionAt: task.plannedCompletionAt ?? null,
            isReady: !task.isReady
        }
        try {
            setTask(await updateTask(id, payload))
        } catch (e) {
            setError(getErrorMessage(e, 'Не удалось изменить статус задачи.'))
        }
    }

    if (loading) return <div className="loading-state detail-loading"><span className="spinner"/>Загружаем задачу...
    </div>
    if (error && !task) return <div className="detail-error">
        <div className="inline-alert"><Icon name="alert"/>{error}</div>
        <Link to="/" className="back-link">← Вернуться к задачам</Link></div>
    if (!task) return null

    const due = task.plannedCompletionAt ? new Date(task.plannedCompletionAt) : null
    const dateLabel = due && !Number.isNaN(due.getTime()) ? new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'long',
        timeStyle: 'short'
    }).format(due) : 'Не установлен'
    return <div className="detail-page"><Link to="/" className="back-link"><Icon name="arrow" size={16}/> Все
        задачи</Link>{error && <div className="inline-alert"><Icon name="alert"/>{error}</div>}
        <article className="detail-card">
            <div className="detail-topline"><span className="eyebrow">ДЕТАЛИ ЗАДАЧИ</span><span
                className={`task-status ${task.isReady ? 'done-status' : 'active-status'}`}>{task.isReady ? 'Выполнена' : 'В работе'}</span>
            </div>
            <h1 className={task.isReady ? 'detail-title done-text' : 'detail-title'}>{task.title}</h1><p
            className="detail-description">{task.text || 'Описание не добавлено.'}</p>
            <div className="detail-divider"/>
            <div className="detail-info">
                <div><span className="detail-info-label"><Icon name="calendar"
                                                               size={16}/> Срок выполнения</span><strong>{dateLabel}</strong>
                </div>
                <div><span className="detail-info-label"><Icon name="check"
                                                               size={16}/> Статус</span><strong>{task.isReady ? 'Задача завершена' : 'Ожидает выполнения'}</strong>
                </div>
            </div>
            <div className="detail-actions">
                <button className="button button-secondary" onClick={() => setModalOpen(true)}><Icon name="edit"
                                                                                                     size={17}/> Редактировать
                </button>
                <button className="button button-primary" onClick={() => void toggle()}><Icon name="check"
                                                                                              size={17}/>{task.isReady ? 'Вернуть в работу' : 'Отметить выполненной'}
                </button>
                <button className="button button-danger" onClick={() => void remove()}><Icon name="trash"
                                                                                             size={17}/> Удалить
                </button>
            </div>
        </article>
        <TaskModal open={modalOpen} task={task} saving={saving} onClose={() => setModalOpen(false)} onSubmit={save}/>
    </div>
}
