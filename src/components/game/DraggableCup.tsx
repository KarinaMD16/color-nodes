import { DraggableCupProps } from '@/types/gameItems/items'
import { useDraggable } from '@dnd-kit/core'

const DraggableCup = ({ id, children, data }: DraggableCupProps) => {
    const { 
        attributes, 
        listeners, 
        setNodeRef, 
        transform, 
        isDragging
    } = useDraggable({ id, data })
    
   const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } 
                           : undefined
    
    return (
     <div ref={setNodeRef} style={style} 
        {...attributes} {...listeners} 
        className={isDragging ? 'opacity-70' : ''}>
      {children}
    </div>
  )
}

export default DraggableCup
