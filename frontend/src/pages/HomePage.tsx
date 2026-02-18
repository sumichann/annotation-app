import { Link } from 'react-router-dom'
import ProgressSection from '../components/ProgressSection'

function HomePage() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Annotation application</h1>

            <ProgressSection />

            <div className="mt-6">
                <Link
                    to="/start-by-index"
                    className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                    カテゴリーと通し番号から開始する
                </Link>
            </div>
        </div>
    )
}

export default HomePage

