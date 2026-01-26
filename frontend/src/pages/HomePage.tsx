import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function HomePage() {
    const [itemId, setItemId] = useState('')
    const navigate = useNavigate()

    const handleStartAnnotation = () => {
        if (itemId.trim()) {
            navigate(`/item/${itemId}`)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                Annotation application
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-4">
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
                />
                <button
                    onClick={handleStartAnnotation}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!itemId.trim()}
                >
                    Start annotation
                </button>
            </div>
        </div>
    )
}

export default HomePage

