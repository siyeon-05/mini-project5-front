// src/services/bookService.js
import apiClient from './apiClient'

// ✅ 도서 목록 조회: GET /books?userId=xxx
export async function fetchBooks(userId) {
    if (!userId) {
        throw new Error('userId가 없습니다. 로그인 상태를 확인해주세요.')
    }

    const res = await apiClient.get('/books', {
        params: { userId }, // 👈 여기 중요!
    })

    // 백엔드가 ApiResponse 형태라면 { code, message, data } 구조일 것
    return res.data
}

// ✅ 도서 단건 조회: GET /books/{bookId}
export async function fetchBookById(bookId) {
    const res = await apiClient.get(`/books/${bookId}`)
    return res.data
}

// ✅ 도서 등록: POST /books?userId=xxx
export async function createBook(bookData, userId) {
    if (!userId) {
        throw new Error('userId가 없습니다. 로그인 상태를 확인해주세요.')
    }

    const res = await apiClient.post('/books', bookData, {
        params: { userId }, // 👈 여기도 중요!
    })

    return res.data
}

// ✅ 도서 수정: PUT /books/{bookId}
export async function updateBook(bookId, bookData) {
    const res = await apiClient.put(`/books/${bookId}`, bookData)
    return res.data
}

// ✅ 도서 삭제: DELETE /books/{bookId}
export async function deleteBook(bookId) {
    const res = await apiClient.delete(`/books/${bookId}`)
    return res.data
}
