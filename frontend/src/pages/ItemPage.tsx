import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import ItemImageSection from '../components/ItemImageSection'
import ItemListSection from '../components/ItemListSection'

interface Item {
    anon_item_id: string
    item_key?: string
    item_name: string
    composition_data?: any
    verification_result?: string | null
    product_name?: string | null
    product_description?: string | null
    index?: number | null
}

// item_key の末尾の数字で昇順ソートするユーティリティ
const sortItemsByItemKeyIndex = (items: Item[]): Item[] => {
    const getOrder = (key?: string | null): number => {
        if (!key) return Number.MAX_SAFE_INTEGER
        const match = key.match(/(\d+)$/)
        return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
    }
    return [...items].sort((a, b) => getOrder(a.item_key) - getOrder(b.item_key))
}

function ItemPage() {
    const { itemId } = useParams<{ itemId: string }>()
    const [searchParams] = useSearchParams()
    const category = searchParams.get('category') || undefined
    const navigate = useNavigate()
    const [items, setItems] = useState<Item[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingNext, setLoadingNext] = useState(false)
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
            const params = category ? `?category=${encodeURIComponent(category)}` : ''
            const response = await fetch(`${apiUrl}/items/${itemId}${params}`)

            if (!response.ok) {
                throw new Error('Item not found')
            }

            const data = await response.json()
            const normalized: Item[] = Array.isArray(data) ? data : [data]
            // item_key の番号順（item_1, item_2, ...）に並べ替えてからセット
            setItems(sortItemsByItemKeyIndex(normalized))
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch item')
        } finally {
            setLoading(false)
        }
    }, [itemId, category])

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
            const searchParams = new URLSearchParams()
            searchParams.set('item_key', item.item_key)
            if (category) {
                searchParams.set('category', category)
            }
            const response = await fetch(`${apiUrl}/items/${item.anon_item_id}?${searchParams.toString()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ result }),
            })

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

    const handleNextItem = async () => {
        if (!category) {
            alert('カテゴリーが指定されていません')
            return
        }
        const currentIndex = items[0]?.index
        if (currentIndex == null || typeof currentIndex !== 'number') {
            alert('現在の通し番号が取得できません（index がありません）')
            return
        }
        const nextIndex = currentIndex + 1

        try {
            setLoadingNext(true)
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
            const response = await fetch(
                `${apiUrl}/items/by-index?category=${encodeURIComponent(category)}&index=${nextIndex}`
            )

            if (!response.ok) {
                if (response.status === 404) {
                    alert('次のアイテムがありません')
                    return
                }
                throw new Error('Failed to fetch next item')
            }

            const data = await response.json()
            if (data?.anon_item_id) {
                navigate(`/item/${data.anon_item_id}?category=${encodeURIComponent(category)}`)
            } else {
                alert('アイテムの取得に失敗しました')
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'エラーが発生しました')
        } finally {
            setLoadingNext(false)
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
            <div className="mx-auto">
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
                        >
                            ← Back to Home
                        </button>
                        {category && (
                            <button
                                onClick={handleNextItem}
                                disabled={loadingNext || items[0]?.index == null}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loadingNext ? '読み込み中...' : '次へ →'}
                            </button>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Item ID: {itemId}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Found {items.length} item(s)
                    </p>
                    {category && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            カテゴリー: {category}
                            {items[0]?.index != null && (
                                <> ・通し番号: {items[0].index}</>
                            )}
                        </p>
                    )}
                </div>

                {/* 画像表示セクション */}
                {itemId && (
                    <ItemImageSection
                        itemId={itemId}
                        category={category}
                        productName={items[0]?.product_name}
                        productDescription={items[0]?.product_description}
                    />
                )}

                {/* 商品情報セクション */}
                <ItemListSection items={items} onUpdate={handleUpdateVerification} />
            </div>
        </div>
    )
}

export default ItemPage

