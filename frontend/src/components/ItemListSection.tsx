import ItemCard from './ItemCard'

interface Item {
    anon_item_id: string
    item_key?: string
    item_name: string
    composition_data?: any
    verification_result?: string | null
}

interface ItemListSectionProps {
    items: Item[]
    onUpdate: (item: Item, result: string) => Promise<void>
}

function ItemListSection({ items, onUpdate }: ItemListSectionProps) {
    if (items.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">No items found</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                商品情報
            </h2>
            {items.map((item, index) => (
                <ItemCard
                    key={item.item_key || index}
                    item={item}
                    index={index}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    )
}

export default ItemListSection

