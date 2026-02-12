import { useState } from 'react'

interface Item {
    anon_item_id: string
    item_key?: string
    item_name: string
    composition_data?: any
    verification_result?: string | null
}

interface ItemCardProps {
    item: Item
    index: number
    onUpdate: (item: Item, result: string) => Promise<void>
}

function ItemCard({ item, index, onUpdate }: ItemCardProps) {
    const [isUpdating, setIsUpdating] = useState(false)

    const handleUpdate = async (result: string) => {
        if (!item.item_key) {
            alert('Item key is required')
            return
        }

        setIsUpdating(true)
        try {
            await onUpdate(item, result)
        } catch (error) {
            console.error('Failed to update verification:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {item.item_key}
                </h2>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Item Name
                    </label>
                    <p className="text-gray-900 dark:text-white">{item?.item_name}</p>
                </div>

                {item?.composition_data && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Composition Data
                        </label>
                        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-auto text-sm">
                            {JSON.stringify(item.composition_data, null, 2)}
                        </pre>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Verification Result
                    </label>
                    <p className="text-gray-900 dark:text-white mb-4">
                        {item?.verification_result || 'Not verified'}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleUpdate('Approved')}
                            disabled={isUpdating}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            {isUpdating ? 'Updating...' : 'Approve'}
                        </button>
                        <button
                            onClick={() => handleUpdate('Rejected')}
                            disabled={isUpdating}
                            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            {isUpdating ? 'Updating...' : 'Reject'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemCard

