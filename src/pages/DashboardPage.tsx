import {useCallback, useEffect, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {createTask, deleteTask, getTasks, updateTask} from '../api/tasks'
import type {TaskFormRequestDto, TaskResponseDto} from '../api/types'
import {getErrorMessage} from '../api/client'
import {TaskModal} from '../components/TaskModal'
import {Icon} from '../components/Icons'

type Filter = 'all' | 'active' | 'completed'

function formatDue(value?: string | null) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

function isOverdue(task: TaskResponseDto) {
    return Boolean(task.plannedCompletionAt && !task.isReady && new Date(task.plannedCompletionAt).getTime() < Date.now())
}

export function DashboardPage() {
    const [tasks, setTasks] = useState<TaskResponseDto[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [actionError, setActionError] = useState('')
    const [filter, setFilter] = useState<Filter>('all')
    const [query, setQuery] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState<TaskResponseDto | null>(null)
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | number | null>(null)

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError('')
        try {
            setTasks(await getTasks())
        } catch (e) {
            setLoadError(getErrorMessage(e, 'Не удалось загрузить список задач.'))
        } finally {
            setLoading(false)
        }
    }, [])
    useEffect(() => {
        void load()
    }, [load])

    const completed = tasks.filter((task) => task.isReady).length
    const active = tasks.length - completed
    const overdue = tasks.filter(isOverdue).length
    const filteredTasks = useMemo(() => tasks
        .filter((task) => filter === 'all' || (filter === 'active' ? !task.isReady : task.isReady))
        .filter((task) => `${task.title} ${task.text}`.toLowerCase().includes(query.toLowerCase().trim()))
        .sort((a, b) => {
            if (a.isReady !== b.isReady) return Number(a.isReady) - Number(b.isReady)
            if (!a.plannedCompletionAt) return 1
            if (!b.plannedCompletionAt) return -1
            return new Date(a.plannedCompletionAt).getTime() - new Date(b.plannedCompletionAt).getTime()
        }), [tasks, filter, query])

    const saveTask = async (payload: TaskFormRequestDto) => {
        setSaving(true);
        setActionError('')
        try {
            if (editing) {
                const updated = await updateTask(String(editing.id), payload)
                setTasks((current) => current.map((task) => task.id === editing.id ? updated : task))
            } else {
                const created = await createTask(payload)
                setTasks((current) => [created, ...current])
            }
            setModalOpen(false);
            setEditing(null)
        } catch (e) {
            setActionError(getErrorMessage(e, 'Не удалось сохранить задачу.'))
        } finally {
            setSaving(false)
        }
    }

    const toggleTask = async (task: TaskResponseDto) => {
        setActionError('')
        const payload = {
            title: task.title,
            text: task.text,
            plannedCompletionAt: task.plannedCompletionAt ?? null,
            isReady: !task.isReady
        }
        try {
            const updated = await updateTask(String(task.id), payload)
            setTasks((current) => current.map((item) => item.id === task.id ? updated : item))
        } catch (e) {
            setActionError(getErrorMessage(e, 'Не удалось изменить статус задачи.'))
        }
    }

    const removeTask = async (task: TaskResponseDto) => {
        if (!window.confirm(`Удалить задачу «${task.title}»?`)) return
        setDeletingId(task.id);
        setActionError('')
        try {
            await deleteTask(String(task.id));
            setTasks((current) => current.filter((item) => item.id !== task.id))
        } catch (e) {
            setActionError(getErrorMessage(e, 'Не удалось удалить задачу.'))
        } finally {
            setDeletingId(null)
        }
    }

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true)
    }
    const openEdit = (task: TaskResponseDto) => {
        setEditing(task);
        setModalOpen(true)
    }

    return <div className="dashboard-page">
        <section className="welcome-row">
            <div><span className="eyebrow">ВАШ WORKSPACE</span><h1>Мои задачи<span className="brand-period">.</span>
            </h1><p>Хороший день начинается с ясного плана.</p></div>
            <button className="button button-primary create-button" onClick={openCreate}><Icon name="plus"
                                                                                               size={18}/> Новая задача
            </button>
        </section>

        <section className="stats-grid" aria-label="Статистика задач">
            <div className="stat-card stat-total">
                <div className="stat-top"><span>Всего задач</span><span className="stat-icon"><Icon name="list"/></span>
                </div>
                <strong>{tasks.length}</strong><span className="stat-foot">В вашем списке</span></div>
            <div className="stat-card">
                <div className="stat-top"><span>В работе</span><span className="stat-icon stat-icon-blue"><Icon
                    name="clock"/></span></div>
                <strong>{active}</strong><span className="stat-foot">Ждут вашего внимания</span></div>
            <div className="stat-card">
                <div className="stat-top"><span>Выполнено</span><span className="stat-icon stat-icon-green"><Icon
                    name="check"/></span></div>
                <strong>{completed}</strong><span className="stat-foot">Уже сделано</span></div>
            <div className="stat-card">
                <div className="stat-top"><span>Просрочено</span><span className="stat-icon stat-icon-orange"><Icon
                    name="alert"/></span></div>
                <strong>{overdue}</strong><span className="stat-foot">Требуют внимания</span></div>
        </section>

        <section className="tasks-section">
            <div className="section-heading">
                <div><span className="eyebrow">НЕ ТЕРЯЙТЕ ФОКУС</span><h2>Ваш список</h2></div>
                <div
                    className="task-total-pill">{filteredTasks.length} {filteredTasks.length === 1 ? 'задача' : 'задач'}</div>
            </div>
            <div className="task-toolbar">
                <div className="filter-tabs">
                    <button className={filter === 'all' ? 'selected' : ''}
                            onClick={() => setFilter('all')}>Все <span>{tasks.length}</span></button>
                    <button className={filter === 'active' ? 'selected' : ''} onClick={() => setFilter('active')}>В
                        работе <span>{active}</span></button>
                    <button className={filter === 'completed' ? 'selected' : ''}
                            onClick={() => setFilter('completed')}>Готово <span>{completed}</span></button>
                </div>
                <label className="search-box"><Icon name="search" size={17}/><input value={query}
                                                                                    onChange={(e) => setQuery(e.target.value)}
                                                                                    placeholder="Найти задачу..."
                                                                                    aria-label="Поиск задач"/>{query &&
                    <button onClick={() => setQuery('')} aria-label="Очистить поиск"><Icon name="close" size={14}/>
                    </button>}</label></div>

            {actionError && <div className="inline-alert"><Icon name="alert" size={17}/>{actionError}
                <button onClick={() => setActionError('')} aria-label="Закрыть"><Icon name="close" size={15}/></button>
            </div>}
            {loading ? <div className="loading-state"><span className="spinner"/><span>Загружаем ваши задачи...</span>
            </div> : loadError ? <div className="empty-state">
                <div className="empty-icon"><Icon name="alert" size={25}/></div>
                <h3>Не удалось загрузить задачи</h3><p>{loadError}</p>
                <button className="button button-secondary" onClick={() => void load()}>Повторить</button>
            </div> : filteredTasks.length === 0 ? <div className="empty-state">
                    <div className="empty-icon"><Icon name={query || filter !== 'all' ? 'search' : 'spark'} size={25}/>
                    </div>
                    <h3>{query || filter !== 'all' ? 'Ничего не найдено' : 'Здесь пока тихо'}</h3>
                    <p>{query || filter !== 'all' ? 'Попробуйте изменить фильтр или поисковый запрос.' : 'Добавьте первую задачу — и превратите планы в действия.'}</p>{!query && filter === 'all' &&
                    <button className="button button-primary" onClick={openCreate}><Icon name="plus" size={17}/> Добавить
                        задачу</button>}</div> :
                <div className="task-list">{filteredTasks.map((task) => <TaskCard key={task.id} task={task}
                                                                                  deleting={deletingId === task.id}
                                                                                  onToggle={() => void toggleTask(task)}
                                                                                  onEdit={() => openEdit(task)}
                                                                                  onDelete={() => void removeTask(task)}/>)}</div>}
        </section>

        <TaskModal open={modalOpen} task={editing} saving={saving} onClose={() => {
            setModalOpen(false);
            setEditing(null)
        }} onSubmit={saveTask}/>
    </div>
}

function TaskCard({task, deleting, onToggle, onEdit, onDelete}: {
    task: TaskResponseDto;
    deleting: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void
}) {
    const due = formatDue(task.plannedCompletionAt)
    const overdueTask = isOverdue(task)
    return <article className={`task-card ${task.isReady ? 'task-done' : ''}`}>
        <button className={`task-check ${task.isReady ? 'checked' : ''}`} onClick={onToggle}
                aria-label={task.isReady ? 'Вернуть в работу' : 'Отметить выполненной'}><Icon name="check" size={16}/>
        </button>
        <div className="task-main">
            <div className="task-title-row"><Link to={`/tasks/${task.id}`}
                                                  className="task-title">{task.title}</Link>{task.isReady &&
                <span className="task-status done-status">Готово</span>}{overdueTask &&
                <span className="task-status overdue-status">Просрочено</span>}</div>
            {task.text && <p className="task-description">{task.text}</p>}
            <div className="task-meta">{due ?
                <span className={`due-date ${overdueTask ? 'due-overdue' : ''}`}><Icon name="calendar" size={14}/>{due}</span> :
                <span className="no-date">Без срока</span>}</div>
        </div>
        <div className="task-actions">
            <button className="icon-button" onClick={onEdit} aria-label="Редактировать"><Icon name="edit" size={17}/>
            </button>
            <button className="icon-button danger-hover" onClick={onDelete} disabled={deleting} aria-label="Удалить">
                <Icon name="trash" size={17}/></button>
            <Link className="task-open" to={`/tasks/${task.id}`} aria-label="Открыть задачу"><Icon name="chevron"
                                                                                                   size={18}/></Link>
        </div>
    </article>
}
