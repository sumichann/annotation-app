import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ItemCard from '../components/ItemCard'

interface Item {
    anon_item_id: string
    item_key?: string
    item_name: string
    composition_data?: any
    verification_result?: string | null
}

function ItemPage() {
    const { itemId } = useParams<{ itemId: string }>()
    const navigate = useNavigate()
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchItems = useCallback(async () => {
        if (!itemId) {
            setError('Item ID is required')
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
            const response = await fetch(`${apiUrl}/items/${itemId}`)

            if (!response.ok) {
                throw new Error('Item not found')
            }

            const data = await response.json()
            setItems(Array.isArray(data) ? data : [data])
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch item')
        } finally {
            setLoading(false)
        }
    }, [itemId])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    const handleUpdateVerification = async (item: Item, result: string) => {
        if (!item.item_key) {
            alert('Item key is required')
            return
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
            const response = await fetch(
                `${apiUrl}/items/${item.anon_item_id}?item_key=${encodeURIComponent(item.item_key)}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ result }),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to update verification')
            }

            // 更新後、アイテムリストを再取得
            await fetchItems()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update verification')
            throw err
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 mb-4"
                    >
                        ← Back to Home
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Item ID: {itemId}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Found {items.length} item(s)
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">No items found</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {items.map((item, index) => (
                            <ItemCard
                                key={item.item_key || index}
                                item={item}
                                index={index}
                                onUpdate={handleUpdateVerification}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ItemPage

