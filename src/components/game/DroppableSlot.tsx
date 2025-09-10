import { DroppableSlotProps } from "@/types/gameItems/items"
import { useDroppable } from "@dnd-kit/core"

const DroppableSlot = ({ id, children }: DroppableSlotProps) => {
    const { setNodeRef, isOver } = useDroppable({ id })

    return (
    <div ref={setNodeRef} 
        className={`aspect-square w-40 h-40 flex items-center justify-center transition-all 
        ${isOver ? 'bg-white/20' : 'bg-transparent'}`}>
      {children}
    </div>
  )
}

export default DroppableSlot
