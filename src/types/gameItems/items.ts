import { ReactNode } from 'react'

export type DraggableCupProps = {
    id: string,
    children: ReactNode,
    data: any;
}


export type DroppableSlotProps = {
    id: string,
    children: ReactNode
}