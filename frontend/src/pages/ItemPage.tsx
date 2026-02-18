import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import ItemImageSection from '../components/ItemImageSection'
import ItemListSection from '../components/ItemListSection'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorCard from '../components/ErrorCard'
import { getApiUrl } from '../lib/api'
import { sortItemsByItemKeyIndex } from '../lib/itemUtils'
import type { Item } from '../types/item'

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
            const params = category ? `?category=${encodeURIComponent(category)}` : ''
            const response = await fetch(`${getApiUrl()}/items/${itemId}${params}`)

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
            const qs = new URLSearchParams()
            qs.set('item_key', item.item_key)
            if (category) qs.set('category', category)
            const response = await fetch(`${getApiUrl()}/items/${item.anon_item_id}?${qs.toString()}`, {
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

        const username = searchParams.get('username')?.trim() || undefined

        let nextIndex: number
        if (username) {
            try {
                const nextRes = await fetch(
                    `${getApiUrl()}/progress/next-index?username=${encodeURIComponent(username)}&category=${encodeURIComponent(category)}&after_index=${currentIndex}`
                )
                if (!nextRes.ok) throw new Error('Failed to fetch next index')
                const nextData = await nextRes.json()
                if (nextData.next_index == null) {
                    alert('このカテゴリで未完了のアイテムはありません（現在のもの以外）')
                    return
                }
                nextIndex = nextData.next_index
            } catch (err) {
                alert(err instanceof Error ? err.message : '次の index の取得に失敗しました')
                return
            }
        } else {
            nextIndex = currentIndex + 1
        }

        try {
            setLoadingNext(true)
            const response = await fetch(
                `${getApiUrl()}/items/by-index?category=${encodeURIComponent(category)}&index=${nextIndex}`
            )

            if (!response.ok) {
                if (response.status === 404) {
                    alert('次のアイテムがありません')
                    return
                }
                throw new Error('Failed to fetch next item')
            }

            const data = await response.json()
            const nextQuery = new URLSearchParams(searchParams)
            if (data?.anon_item_id) {
                navigate(`/item/${data.anon_item_id}?${nextQuery.toString()}`)
            } else {
                alert('アイテムの取得に失敗しました')
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'エラーが発生しました')
        } finally {
            setLoadingNext(false)
        }
    }

    if (loading) return <LoadingSpinner message="Loading..." />

    if (error) return <ErrorCard message={error} backLabel="Back to Home" />

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

