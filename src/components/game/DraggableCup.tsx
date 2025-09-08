import { DraggableCupProps } from '@/types/gameItems/items'
import { useDraggable } from '@dnd-kit/core'

const DraggableCup = ({ id, children, data,activeId }: DraggableCupProps) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, data })
    
    const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined

    const hidden = activeId === id 

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={hidden ? 'opacity-0' : ''}
        >
      {children}
    </div>
  )
}

export default DraggableCup
