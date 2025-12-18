// src/pages/BookDetailPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Box, Paper, Typography, Stack, Button } from '@mui/material'

import {
    fetchBookById,
    deleteBook as deleteBookApi,
} from '../services/bookService'

export default function BookDetailPage() {
    const params = useParams()
    // 라우트가 /books/:id 인지 /books/:bookId 인지 둘 다 대응
    const routeId = params.id ?? params.bookId

    const navigate = useNavigate()
    const location = useLocation()

    // MainPage 에서 state 로 넘긴 book (표지 URL 포함 가능)
    const initialBook = location.state?.book || null

    // 처음엔 initialBook 으로 채워두고, 이후 서버 데이터로 덮어쓰기
    const [book, setBook] = useState(initialBook)
    const [loading, setLoading] = useState(!initialBook)
    const [error, setError] = useState('')

    // --------------------------------------------------
    // 1. 도서 상세 정보 불러오기 (GET /books/{id})
    // --------------------------------------------------
    useEffect(() => {
        if (!routeId) {
            alert('잘못된 접근입니다.')
            navigate('/main')
            return
        }

        const loadBook = async () => {
            try {
                const data = await fetchBookById(routeId)
                const bookData = data?.data ?? data

                if (!bookData) {
                    alert('책을 찾을 수 없습니다.')
                    navigate('/main')
                    return
                }

                // 기존 state(initialBook)에 서버 데이터를 덮어쓰기
                setBook((prev) => ({
                    ...(prev || {}),
                    ...bookData,
                }))
            } catch (err) {
                console.error(err)
                const msg =
                    err?.response?.data?.message ||
                    err.message ||
                    '도서 정보를 불러오지 못했습니다.'
                setError(msg)
            } finally {
                setLoading(false)
            }
        }

        loadBook()
    }, [routeId, navigate])

    // --------------------------------------------------
    // 2. 버튼 핸들러들
    // --------------------------------------------------
    const handleBack = () => {
        navigate('/main')
    }

    const handleDelete = async () => {
        if (!book) return
        if (!window.confirm('이 책을 삭제하시겠습니까?')) return

        try {
            const targetId = book.id ?? book.bookId
            await deleteBookApi(targetId)
            alert('삭제되었습니다.')
            navigate('/main')
        } catch (err) {
            console.error(err)
            const msg =
                err?.response?.data?.message ||
                err.message ||
                '도서 삭제 중 오류가 발생했습니다.'
            alert(msg)
        }
    }

    const handleEdit = () => {
        if (!book) return
        navigate('/books/edit', { state: { book } })
    }

    // --------------------------------------------------
    // 3. 로딩 / 에러 처리
    // --------------------------------------------------
    if (loading && !book) {
        return (
            <Box sx={{ mt: 3 }}>
                <Typography align="center">
                    도서 정보를 불러오는 중입니다...
                </Typography>
            </Box>
        )
    }

    if (error && !book) {
        return (
            <Box sx={{ mt: 3 }}>
                <Typography align="center" color="error">
                    {error}
                </Typography>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button variant="outlined" onClick={handleBack}>
                        메인으로
                    </Button>
                </Box>
            </Box>
        )
    }

    if (!book) return null

    // --------------------------------------------------
    // 4. 표지 이미지 & 줄거리 텍스트 결정
    // --------------------------------------------------
    const coverSrc =
        book.imageUrl || // 백엔드 DTO 필드
        book.coverUrl ||
        book.bookCoverUrl ||
        book.coverImageUrl ||
        book.thumbnailUrl ||
        book.cover ||
        ''

    // 🔴 content(백엔드 실제 필드)를 우선 사용
    const descriptionText =
        book.content || book.description || book.summary || ''

    console.log('📘 BookDetailPage book 데이터:', book)
    console.log('📘 BookDetailPage coverSrc:', coverSrc)

    // --------------------------------------------------
    // 5. 실제 화면 렌더링
    // --------------------------------------------------
    return (
        <Box sx={{ mt: 3 }}>
            <Paper
                sx={{
                    p: 3.5,
                    borderRadius: 4,
                    background:
                        'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(242, 247, 243, 0.98))',
                    boxShadow: '0 16px 40px rgba(33, 37, 41, 0.1)',
                }}
            >
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    alignItems={{ xs: 'flex-start', md: 'flex-start' }}
                >
                    {/* 왼쪽: 책 표지 영역 */}
                    <Box
                        sx={{
                            width: { xs: '100%', md: 220 },
                            minHeight: 260,
                            borderRadius: 3,
                            background: coverSrc
                                ? `url(${coverSrc}) center/cover no-repeat`
                                : 'linear-gradient(135deg, rgba(188,226,210,0.95), rgba(202,222,246,0.95))',
                            boxShadow: '0 10px 26px rgba(33,37,41,0.18)',
                        }}
                    />

                    {/* 오른쪽: 텍스트 정보 영역 */}
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, mb: 1 }}
                        >
                            {book.title}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', mb: 1.5 }}
                        >
                            작가: {book.author || '작가 미상'}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', mb: 2 }}
                        >
                            장르: {book.genre || '장르 없음'}
                        </Typography>

                        <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 0.8 }}
                        >
                            줄거리
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}
                        >
                            {descriptionText || '등록된 줄거리가 없습니다.'}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ mt: 3 }}
                            justifyContent="flex-end"
                        >
                            <Button variant="text" onClick={handleBack}>
                                목록으로
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleEdit}
                            >
                                수정
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleDelete}
                            >
                                삭제
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}
