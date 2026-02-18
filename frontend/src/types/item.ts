export interface Item {
    anon_item_id: string
    item_key?: string
    item_name: string
    composition_data?: unknown
    verification_result?: string | null
    product_name?: string | null
    product_description?: string | null
    index?: number | null
}
