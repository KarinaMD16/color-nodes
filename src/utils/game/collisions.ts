export function findNextNullRight(board: (string | null)[], fromIdx: number) {
    for (let i = fromIdx + 1; i < board.length; i++) if (board[i] === null) return i
    return -1
}
export function findNextNullLeft(board: (string | null)[], fromIdx: number) {
    for (let i = fromIdx - 1; i >= 0; i--) if (board[i] === null) return i
    return -1
}
export function nearestHoleIndex(
    board: (string | null)[],
    toIdx: number,
    preferTie: 'right' | 'left' = 'right'
): number {
    if (!board.includes(null)) return -1
    if (board[toIdx] === null) return toIdx

    const L = findNextNullLeft(board, toIdx)
    const R = findNextNullRight(board, toIdx)

    if (L === -1) return R
    if (R === -1) return L

    const dL = Math.abs(toIdx - L)
    const dR = Math.abs(R - toIdx)
    
    if (dL < dR) {
        return L
    }
    if (dR < dL){ 
        return R
    }
    // empate
    return preferTie === 'right' ? R : L
}

export function insertAtWithNearestHole(
    board: (string | null)[],
    toIdx: number,
    cupId: string,
    preferTie: 'right' | 'left' = 'right'
): (string | null)[] {
    const b = [...board]

    // slot vacío - place
    if (b[toIdx] === null) { b[toIdx] = cupId; return b }


    const hole = nearestHoleIndex(b, toIdx, preferTie);
    //por si acaso
    if (hole === -1) {
        return b
    }
    if (hole === toIdx) {
        b[toIdx] = cupId
        return b
    }

    // mover a donde haya un hole
    if (hole < toIdx) {
        // hueco a la izq :
        // [hole+1 .. toIdx] una posición a la izquierda
        // 0 1 2 3 4 5 ->  2 a 5 ->  0 1 3 4 5 [2]
        for (let i = hole; i < toIdx; i++) b[i] = b[i + 1]
        b[toIdx] = cupId
        return b
    } else {
        // hueco a la drecha 
        for (let i = hole; i > toIdx; i--) b[i] = b[i - 1]
        b[toIdx] = cupId
        return b
    }
}

export function moveWithinBoardNearest(
    board: (string | null)[],
    fromIdx: number,
    toIdx: number,
    cupId: string
): (string | null)[] {
    if (fromIdx === toIdx) return [...board]
    const current = [...board]
    current[fromIdx] = null
    const preferTie = fromIdx < toIdx ? 'right' : 'left'
    return insertAtWithNearestHole(current, toIdx, cupId, preferTie)
}

