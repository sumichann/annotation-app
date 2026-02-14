import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY_USERNAME = 'annotation_username'

export type AssignmentProgress = {
    category: string
    index_start: number
    index_end: number
    total: number
    completed: number
    next_index: number | null
}

export type ProgressResponse = {
    username: string
    assignments: AssignmentProgress[]
}

const CATEGORY_LABELS: Record<string, string> = {
    ladies_jacket: 'レディスジャケット',
    ladies_pants: 'レディスパンツ',
    ladies_suit: 'レディススーツ',
    ladies_tops: 'レディストップス',
    mens_jacket: 'メンズジャケット',
    mens_pants: 'メンズパンツ',
    mens_suit: 'メンズスーツ',
    mens_tops: 'メンズトップス',
}

function ProgressSection() {
    const [usernameInput, setUsernameInput] = useState('')
    const [progress, setProgress] = useState<ProgressResponse | null>(null)
    const [progressLoading, setProgressLoading] = useState(false)
    const [progressError, setProgressError] = useState<string | null>(null)
    const [resumeLoading, setResumeLoading] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY_USERNAME)
        if (saved) setUsernameInput(saved)
    }, [])

    const handleLoadProgress = async () => {
        const name = usernameInput.trim()
        if (!name) {
            setProgressError('担当者名を入力してください')
            return
        }
        setProgressError(null)
        setProgress(null)
        setProgressLoading(true)
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
            const res = await fetch(
                `${apiUrl}/progress?username=${encodeURIComponent(name)}`
            )
            if (!res.ok) throw new Error('Failed to fetch progress')
            const data: ProgressResponse = await res.json()
            setProgress(data)
            localStorage.setItem(STORAGE_KEY_USERNAME, name)
        } catch (err) {
            setProgressError(err instanceof Error ? err.message : '進捗の取得に失敗しました')
        } finally {
            setProgressLoading(false)
        }
    }

    const handleResume = async (category: string, nextIndex: number) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        setResumeLoading(`${category}-${nextIndex}`)
        try {
            const res = await fetch(
                `${apiUrl}/items/by-index?category=${encodeURIComponent(category)}&index=${nextIndex}`
            )
            if (!res.ok) throw new Error('Failed to fetch item')
            const data = await res.json()
            if (data?.anon_item_id) {
                navigate(
                    `/item/${data.anon_item_id}?category=${encodeURIComponent(category)}`
                )
            }
        } catch (err) {
            setProgressError(err instanceof Error ? err.message : '再開に失敗しました')
        } finally {
            setResumeLoading(null)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                担当者名で進捗を表示
            </h2>
            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadProgress()}
                    placeholder="担当者名を入力"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button"
                    onClick={handleLoadProgress}
                    disabled={progressLoading}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {progressLoading ? '取得中...' : '進捗を表示'}
                </button>
            </div>
            {progressError && (
                <p className="text-red-500 text-sm mb-3">{progressError}</p>
            )}
            {progress && (
                <div className="space-y-3">
                    <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{progress.username}</span> さんの担当範囲
                    </p>
                    <ul className="space-y-2">
                        {progress.assignments.map((a) => (
                            <li
                                key={`${a.category}-${a.index_start}-${a.index_end}`}
                                className="flex flex-wrap items-center gap-2 py-2 border-b border-gray-200 dark:border-gray-600 last:border-0"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {CATEGORY_LABELS[a.category] ?? a.category}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    index {a.index_start}〜{a.index_end}：{a.completed} / {a.total} 完了
                                </span>
                                {a.next_index != null ? (
                                    <button
                                        type="button"
                                        onClick={() => handleResume(a.category, a.next_index!)}
                                        disabled={resumeLoading !== null}
                                        className="ml-auto px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resumeLoading === `${a.category}-${a.next_index}` ? '移動中...' : '再開'}
                                    </button>
                                ) : (
                                    <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">完了</span>
                                )}
                            </li>
                        ))}
                    </ul>
                    {progress.assignments.length === 0 && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">割り当てがありません</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default ProgressSection
