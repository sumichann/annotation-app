import ProgressSection from '../components/ProgressSection'

function HomePage() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Annotation application</h1>
            <ProgressSection />
        </div>
    )
}

export default HomePage

