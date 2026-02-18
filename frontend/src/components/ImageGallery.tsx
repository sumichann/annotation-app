import { useState, useEffect } from 'react'
import { getApiUrl } from '../lib/api'

interface ImageData {
    filename: string
    data: string // base64エンコードされた画像データ
    size: number
}

interface ImageGalleryResponse {
    uuid: string
    count: number
    images: ImageData[]
}

interface ImageGalleryProps {
    uuid: string
    category?: string
}

interface ThumbnailGridProps {
    images: ImageData[]
    onSelect: (image: ImageData) => void
}

interface ImageModalProps {
    image: ImageData
    onClose: () => void
}

function ThumbnailGrid({ images, onSelect }: ThumbnailGridProps) {
    if (images.length === 0) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">画像がありません</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {images.map((image) => (
                    <button
                        key={image.filename}
                        type="button"
                        onClick={() => onSelect(image)}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <div className="bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-2 overflow-hidden">
                            <img
                                src={`data:image/jpeg;base64,${image.data}`}
                                alt={image.filename}
                                className="max-h-full max-w-full object-contain cursor-zoom-in"
                                style={{ height: '260px', width: 'auto' }}
                                loading="lazy"
                            />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

function ImageModal({ image, onClose }: ImageModalProps) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={onClose}
        >
            <div
                className="max-w-5xl max-h-[90vh] mx-4 bg-black rounded-lg overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white bg-black/60 rounded-full px-3 py-1 text-sm hover:bg-black"
                >
                    閉じる
                </button>
                <img
                    src={`data:image/jpeg;base64,${image.data}`}
                    alt={image.filename}
                    className="object-contain w-full h-full"
                />
            </div>
        </div>
    )
}

function ImageGallery({ uuid, category }: ImageGalleryProps) {
    const [images, setImages] = useState<ImageData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)

    useEffect(() => {
        const fetchImages = async () => {
            if (!uuid) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(null)
                const params = category ? `?category=${encodeURIComponent(category)}` : ''
                const response = await fetch(`${getApiUrl()}/images/${uuid}${params}`)

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('画像が見つかりませんでした')
                    } else {
                        throw new Error('画像の取得に失敗しました')
                    }
                    setImages([])
                    return
                }

                const data: ImageGalleryResponse = await response.json()
                setImages(data.images || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : '画像の取得に失敗しました')
                setImages([])
            } finally {
                setLoading(false)
            }
        }

        fetchImages()
    }, [uuid, category])

    // Escキーで拡大表示を閉じる
    useEffect(() => {
        if (!selectedImage) return
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedImage(null)
            }
        }
        window.addEventListener('keydown', handleKeydown)
        return () => window.removeEventListener('keydown', handleKeydown)
    }, [selectedImage])

    return (
        <div>
            {loading && (
                <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            画像を読み込み中...
                        </p>
                    </div>
                </div>
            )}

            {!loading && error && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">{error}</p>
                </div>
            )}

            {!loading && !error && (
                <ThumbnailGrid images={images} onSelect={setSelectedImage} />
            )}

            {selectedImage && (
                <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
            )}
        </div>
    )
}

export default ImageGallery

