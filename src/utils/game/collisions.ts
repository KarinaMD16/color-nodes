export function findNextNullRight(board: (string | null)[], fromIdx: number) {
    for (let i = fromIdx + 1; i < board.length; i++) if (board[i] === null) return i
    return -1
}

export function findNextNullLeft(board: (string | null)[], fromIdx: number) {
    for (let i = fromIdx - 1; i >= 0; i--) if (board[i] === null) return i
    return -1
}

export function insertWithDirectionalPushPure(
    board: (string | null)[],
    toIdx: number,
    cupId: string,
    prefer: 'right' | 'left'
    ): (string | null)[] {
    const b = [...board]
    if (b[toIdx] === null) { b[toIdx] = cupId; return b }

    const pushRight = () => {
        const r = findNextNullRight(b, toIdx)
        if (r !== -1) {
            for (let i = r; i > toIdx; i--) b[i] = b[i - 1]
            b[toIdx] = cupId
            return b
        }
        // sin hueco: empuja todo a la izquierda 
        for (let i = 0; i < toIdx; i++) b[i] = b[i + 1]
        b[toIdx] = cupId
        return b
    }

    const pushLeft = () => {
        const l = findNextNullLeft(b, toIdx)
        if (l !== -1) {
            for (let i = l; i < toIdx; i++) b[i] = b[i + 1]
            b[toIdx] = cupId
            return b
        }
        // sin hueco: empuja todo a la derecha 
        for (let i = b.length - 1; i > toIdx; i--) b[i] = b[i - 1]
        b[toIdx] = cupId
        return b
    }

    return prefer === 'right' ? pushRight() : pushLeft()
}
