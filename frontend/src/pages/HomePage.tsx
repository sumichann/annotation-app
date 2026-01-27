import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function HomePage() {
    const [itemId, setItemId] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const navigate = useNavigate()

    const categories = [
        'ladies_jacket',
        'ladies_pants',
        'ladies_suit',
        'ladies_tops',
        'mens_jacket',
        'mens_pants',
        'mens_suit',
        'mens_tops',
    ]

    const handleStartAnnotation = () => {
        if (!selectedCategory) {
            return
        }
        if (itemId.trim()) {
            navigate(`/item/${itemId}?category=${encodeURIComponent(selectedCategory)}`)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Annotation application</h1>

            {/* カテゴリー選択セクション */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    まず 8 種類のカテゴリーから 1 つ選択してください
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className="px-3 py-2 rounded-lg text-sm font-semibold border transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                            style={
                                selectedCategory === category
                                    ? {
                                          backgroundColor: '#3b82f6', // bg-blue-500
                                          color: '#ffffff',
                                          borderColor: '#3b82f6',
                                      }
                                    : undefined
                            }
                        >
                            {category}
                        </button>
                    ))}
                </div>
                {selectedCategory && (
                    <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                        選択中のカテゴリー: <span className="font-semibold">{selectedCategory}</span>
                    </p>
                )}
            </div>

            {/* UUID 入力セクション */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    カテゴリー選択後に、UUID を入力してください
                </h2>
                <input
                    type="text"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="Enter the UUID of the item"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleStartAnnotation()
                        }
                    }}
                    disabled={!selectedCategory}
                />
                <button
                    onClick={handleStartAnnotation}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!selectedCategory || !itemId.trim()}
                >
                    Start annotation
                </button>
            </div>
        </div>
    )
}

export default HomePage

