import { useNavigate } from 'react-router-dom'

interface ErrorCardProps {
    title?: string
    message: string
    backLabel?: string
}

export default function ErrorCard({
    title = 'Error',
    message,
    backLabel = 'Back to Home',
}: ErrorCardProps) {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full text-center">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{title}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    {backLabel}
                </button>
            </div>
        </div>
    )
}
