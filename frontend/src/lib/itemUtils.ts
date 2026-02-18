import type { Item } from '../types/item'

/** item_key の末尾の数字で昇順ソート（item_1, item_2, ...） */
export function sortItemsByItemKeyIndex(items: Item[]): Item[] {
    const getOrder = (key?: string | null): number => {
        if (!key) return Number.MAX_SAFE_INTEGER
        const match = key.match(/(\d+)$/)
        return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
    }
    return [...items].sort((a, b) => getOrder(a.item_key) - getOrder(b.item_key))
}
