import type {FormEvent} from 'react'
import {useEffect, useState} from 'react'
import type {TaskFormRequestDto, TaskResponseDto} from '../api/types'
import {Icon} from './Icons'

interface TaskModalProps {
    open: boolean
    task?: TaskResponseDto | null
    saving?: boolean
    onClose: () => void
    onSubmit: (payload: TaskFormRequestDto) => Promise<void>
}

function toLocalInput(value?: string | null) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const offset = date.getTimezoneOffset()
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}

export function TaskModal({open, task, saving = false, onClose, onSubmit}: TaskModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState('')
    const [isReady, setIsReady] = useState(false)
    const [validation, setValidation] = useState('')

    useEffect(() => {
        if (!open) return
        setTitle(task?.title ?? '')
        setDescription(task?.text ?? '')
        setDeadline(toLocalInput(task?.plannedCompletionAt))
        setIsReady(task?.isReady ?? false)
        setValidation('')
    }, [open, task])

    useEffect(() => {
        if (!open) return
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !saving) onClose()
        }
        window.addEventListener('keydown', closeOnEscape)
        return () => window.removeEventListener('keydown', closeOnEscape)
    }, [open, saving, onClose])

    if (!open) return null

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (!title.trim()) {
            setValidation('Введите название задачи.');
            return
        }
        if (deadline && new Date(deadline).getTime() < Date.now() - 60000) {
            setValidation('Срок не может быть в прошлом.');
            return
        }
        const plannedCompletionAt = deadline ? new Date(deadline).toISOString() : null
        setValidation('')
        await onSubmit({title: title.trim(), text: description.trim(), plannedCompletionAt, isReady})
    }

    return (
        <div className="modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) onClose()
        }}>
            <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
                <div className="modal-header">
                    <div><span className="eyebrow">ЗАДАЧА</span><h2
                        id="task-modal-title">{task ? 'Редактировать задачу' : 'Новая задача'}</h2></div>
                    <button className="icon-button" onClick={onClose} disabled={saving} aria-label="Закрыть"><Icon
                        name="close"/></button>
                </div>
                <form onSubmit={handleSubmit} className="task-form">
                    <label className="field-label" htmlFor="task-title">Название <span>*</span></label>
                    <input id="task-title" className="input-control" value={title}
                           onChange={(e) => setTitle(e.target.value)} maxLength={100}
                           placeholder="Например, закончить проект" autoFocus required/>
                    <div className="field-meta"><span>Коротко и по делу</span><span>{title.length}/100</span></div>
                    <label className="field-label" htmlFor="task-description">Описание</label>
                    <textarea id="task-description" className="input-control textarea-control" value={description}
                              onChange={(e) => setDescription(e.target.value)} maxLength={300} rows={4}
                              placeholder="Добавьте детали, которые помогут не забыть важное..."/>
                    <div className="field-meta"><span>Необязательно</span><span>{description.length}/300</span></div>
                    <label className="field-label" htmlFor="task-deadline">Срок выполнения</label>
                    <div className="input-with-icon"><Icon name="calendar" size={17}/><input id="task-deadline"
                                                                                             className="input-control"
                                                                                             type="datetime-local"
                                                                                             value={deadline}
                                                                                             onChange={(e) => setDeadline(e.target.value)}/>
                    </div>
                    <label className="ready-toggle"><input type="checkbox" checked={isReady}
                                                           onChange={(e) => setIsReady(e.target.checked)}/><span
                        className="custom-check"><Icon name="check" size={13}/></span><span>Задача уже выполнена</span></label>
                    {validation && <p className="form-error">{validation}</p>}
                    <div className="modal-actions">
                        <button type="button" className="button button-ghost" onClick={onClose}
                                disabled={saving}>Отмена
                        </button>
                        <button type="submit" className="button button-primary" disabled={saving}>{saving ? <span
                            className="spinner spinner-small"/> : <>{task ? 'Сохранить изменения' : 'Создать задачу'}
                            <Icon name="arrow" size={16}/></>}</button>
                    </div>
                </form>
            </section>
        </div>
    )
}
