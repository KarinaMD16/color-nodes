export const hasDuplicateColors = (arr: (string | null)[]) => {
    const colors = arr.filter(Boolean) as string[];
    return new Set(colors).size !== colors.length;
};