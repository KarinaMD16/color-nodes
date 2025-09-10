export function findNextNullRight(board: (string | null)[], fromIdx: number) {
    for (let i = fromIdx + 1; i < board.length; i++) {
        if (board[i] === null) {
            return i
        }
    }
    return -1
}
export function findNextNullLeft(board: (string | null)[], fromIdx: number) {
    for (let i = fromIdx - 1; i >= 0; i--) {
        if (board[i] === null) {
            return i
        }
    }
    return -1
}

export function nearestHoleIndex(
    board: (string | null)[],
    toIdx: number,
    preferTie: 'right' | 'left' = 'right'
): number {
    if (!board.includes(null)) {
        return -1
    }
    if (board[toIdx] === null) {
        return toIdx
    }

    //         [ "A", null,  "B",  "C",  "D", null ]
    //   toIdx:   0     1     2     3     4     5
    // toIdx = 3 
    const L = findNextNullLeft(board, toIdx); // L = 1
    const R = findNextNullRight(board, toIdx); // R =5

    if (L === -1) return R
    if (R === -1) return L

    const distanceL = Math.abs(toIdx - L) // 3-1 =2 
    const distanceR = Math.abs(R - toIdx) // 5-3 =2 
    
    if (distanceL < distanceR) {
        return L
    }
    if (distanceR < distanceL){ 
        return R
    }

    return preferTie === 'right' ? R : L // bias
}

export function insertAtWithNearestHole(
    board: (string | null)[],
    toIdx: number,
    cupId: string,
    preferTie: 'right' | 'left' = 'right'
): (string | null)[] {
    const b = [...board]

    // slot vacío - place
    if (b[toIdx] === null) { 
        b[toIdx] = cupId; 
        return b 
    }

    const hole = nearestHoleIndex(b, toIdx, preferTie);

    if (hole === -1) {
        return b
    }

    //          [ "A", null, "B", "C", "D", null ]
    //     idx:    0     1     2     3     4     5
    // insert cupId="X" en toIdx=3
    // hole = 1
    if (hole < toIdx) {
        // hueco a la izq :
        for (let i = hole; i < toIdx; i++) {
            // i = 1: b[1] = b[2] -> ["A", "B", "B", "C", "D", null]
            // i = 2: b[2] = b[3] -> [ "A", "B", "C", "C", "D", null
            b[i] = b[i + 1]
        }

        b[toIdx] = cupId
        // b[3] = "X" > [ "A", "B", "C", "X", "D", null ]
        return b
    } else {
        // hueco a la drecha 
        for (let i = hole; i > toIdx; i--) 
            b[i] = b[i - 1]
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
    if (fromIdx === toIdx) {
        return [...board]
    }
    
    const current = [...board]
    
    current[fromIdx] = null;

    const preferTie = fromIdx < toIdx ? 'right' : 'left';

    return insertAtWithNearestHole(current, toIdx, cupId, preferTie)
}

