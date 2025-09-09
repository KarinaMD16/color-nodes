export function insertTowardHole(
    board: (string | null)[],
    toIdx: number,
    cupId: string
): (string | null)[] {
    const b = [...board]

    const hole = b.indexOf(null)
    // por si acaso
    if (hole === -1) {
        return b
    }

    if (hole === toIdx) {
        b[toIdx] = cupId
        return b
    }

    if (hole < toIdx) {
        // [hole+1 .. toIdx] una posición a la izquierda
        // 0 1 2 3 4 5 ->  2 a 5 ->  0 1 3 4 5 [2]
        for (let i = hole; i < toIdx; i++) b[i] = b[i + 1]
        b[toIdx] = cupId
        return b
    }

    // hole > toIdx
    // [toIdx .. hole-1] a la derecha
    for (let i = hole; i > toIdx; i--) b[i] = b[i - 1]
    b[toIdx] = cupId
    return b
}

export function insertWithDirectionalPush(
    board: (string | null)[],
    toIdx: number,
    cupId: string,
    prefer: 'right' | 'left'
): (string | null)[] {
    if (board.includes(null)) {
        return insertTowardHole(board, toIdx, cupId)
    }

    const b = [...board]

    if (prefer === 'right') {
        // empuja hacia la izquierda (expulsa el extremo 0) y coloca en toIdx
        for (let i = 0; i < toIdx; i++) b[i] = b[i + 1]
        b[toIdx] = cupId
        return b
    } else {
        // Empuja todo hacia la derecha (expulsa el extremo final) y coloca en toIdx
        for (let i = b.length - 1; i > toIdx; i--) b[i] = b[i - 1]
        b[toIdx] = cupId
        return b
    }
}