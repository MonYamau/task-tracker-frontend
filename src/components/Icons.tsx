import type {ReactNode, SVGProps} from 'react'

type IconName =
    'grid'
    | 'plus'
    | 'search'
    | 'calendar'
    | 'check'
    | 'clock'
    | 'edit'
    | 'trash'
    | 'arrow'
    | 'logout'
    | 'chevron'
    | 'close'
    | 'spark'
    | 'list'
    | 'menu'
    | 'sun'
    | 'alert'

const paths: Record<IconName, ReactNode> = {
    grid: <>
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </>,
    plus: <path d="M12 5v14M5 12h14"/>,
    search: <>
        <circle cx="10.8" cy="10.8" r="6.8"/>
        <path d="m16 16 5 5"/>
    </>,
    calendar: <>
        <rect x="3" y="5" width="18" height="16" rx="2"/>
        <path d="M16 3v4M8 3v4M3 10h18"/>
    </>,
    check: <path d="m5 12 4 4L19 6"/>,
    clock: <>
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3.5 2"/>
    </>,
    edit: <>
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>
    </>,
    trash: <>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/>
    </>,
    arrow: <>
        <path d="M5 12h14M13 6l6 6-6 6"/>
    </>,
    logout: <>
        <path d="M10 17l5-5-5-5M15 12H3"/>
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>
    </>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    close: <path d="m18 6-12 12M6 6l12 12"/>,
    spark: <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/>
        <path d="m19 16 .9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9Z"/>
    </>,
    list: <>
        <path d="M8 6h13M8 12h13M8 18h13"/>
        <path d="M3 6h.01M3 12h.01M3 18h.01"/>
    </>,
    menu: <>
        <path d="M4 6h16M4 12h16M4 18h16"/>
    </>,
    sun: <>
        <circle cx="12" cy="12" r="4"/>
        <path
            d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>
    </>,
    alert: <>
        <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/>
        <path d="M12 9v4m0 4h.01"/>
    </>,
}

export function Icon({name, size = 18, ...props}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>
}
