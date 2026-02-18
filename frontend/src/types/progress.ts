export interface AssignmentProgress {
    category: string
    index_start: number
    index_end: number
    total: number
    completed: number
    next_index: number | null
}

export interface ProgressResponse {
    username: string
    assignments: AssignmentProgress[]
}
