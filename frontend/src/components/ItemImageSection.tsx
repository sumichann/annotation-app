import ImageGallery from './ImageGallery'

interface ItemImageSectionProps {
    itemId: string
}

function ItemImageSection({ itemId }: ItemImageSectionProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                画像
            </h2>
            <ImageGallery uuid={itemId} />
        </div>
    )
}

export default ItemImageSection

