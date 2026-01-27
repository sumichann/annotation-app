import ImageGallery from './ImageGallery'
import '../App.css'
interface ItemImageSectionProps {
    itemId: string
    category?: string
    productName?: string | null
    productDescription?: string | null
}

function ItemImageSection({
    itemId,
    category,
    productName,
    productDescription,
}: ItemImageSectionProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {(productName || productDescription) && (
                <div className="p-4">
                    {productName && (
                        <h2 className="text-sm dark:text-white">
                            {productName}
                        </h2>
                    )}
                    {productDescription && (
                        <p className="whitespace-pre-line text-xs">
                            {productDescription}
                        </p>
                    )}
                </div>
            )}
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white p-4">
                画像
            </h2>
            <ImageGallery uuid={itemId} category={category} />
        </div>
    )
}

export default ItemImageSection

