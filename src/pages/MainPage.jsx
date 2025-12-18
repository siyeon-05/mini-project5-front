// src/pages/MainPage.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchBooks } from '../services/bookService'

import {
    Box,
    Typography,
    Button,
    Stack,
    TextField,
    Card,
    CardActionArea,
    CardContent,
} from '@mui/material'

export default function MainPage() {
    const navigate = useNavigate()

    const [userName] = useState(
        () => localStorage.getItem('currentUserName') ?? ''
    )
    const [keyword, setKeyword] = useState('')
    const [currentUserId] = useState(
        () => localStorage.getItem('currentUserId') ?? ''
    )
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        if (!currentUserId) {
            navigate('/login')
            return
        }

        const loadBooks = async () => {
            try {
                // 👇 userId를 함께 넘겨서 호출
                const data = await fetchBooks(currentUserId)

                // 백엔드가 { code, message, data } 형태라면
                const list = data?.data ?? data ?? []

                setBooks(list)
            } catch (err) {
                console.error(err)
                const status = err?.response?.status
                alert(
                    `도서 목록을 불러오지 못했습니다.\nstatus: ${
                        status ?? '알 수 없음'
                    }`,
                )
            } finally {
                setLoading(false)
            }
        }

        loadBooks()
    }, [currentUserId, navigate])




    const filteredBooks = books.filter((book) => {
        if (!keyword.trim()) return true
        const key = keyword.trim()

        return (
            (book.title && book.title.includes(key)) ||
            (book.author && book.author.includes(key)) ||
            (book.genre && book.genre.includes(key))
        )
    })

    const handleLogout = () => {
        localStorage.removeItem('currentUserId')
        localStorage.removeItem('currentUserName')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        navigate('/login')
    }

    // 🔹 카드 클릭 시 상세 페이지로 이동
    //    - book 객체 전체를 함께 넘겨서 표지 URL도 같이 전달
    const handleClickCard = (book) => {
        const bookId = book.id ?? book.bookId
        navigate(`/books/${bookId}`, { state: { book } })
    }


    const handleGoRegister = () => {
        navigate('/books/new')
    }

    console.log('📚 MainPage에서 보는 books:', books)

    return (
        <Box sx={{ mt: 1 }}>
            <Stack spacing={2.5}>
                {/* 상단 영역 */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1.5}
                >
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {userName
                                ? `${userName}의 개인 서재`
                                : '내 서재 메인 페이지'}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ mt: 2, color: 'text.secondary' }}
                        >
                            머릿속에만 머물던 장면들을,
                            <br />
                            한 권 한 권 나만의 책으로 남겨보세요.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleLogout}
                        sx={{ borderRadius: 999 }}
                    >
                        로그아웃
                    </Button>
                </Stack>

                {/* 상단: 책 등록 + 검색 */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGoRegister}
                        sx={{
                            px: 3,
                            py: 1.2,
                            borderRadius: 999,
                            boxShadow: '0 10px 24px rgba(98, 183, 162, 0.32)',
                        }}
                    >
                        책 등록
                    </Button>

                    <TextField
                        size="small"
                        placeholder="제목, 작가, 장르로 검색해보세요."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        sx={{
                            width: { xs: '100%', sm: 260, md: 360 },
                            ml: { xs: 0, sm: 'auto' },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 999,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                overflow: 'hidden',
                            },
                            '& .MuiOutlinedInput-input': {
                                py: 1.1,
                                px: 2,
                            },
                        }}
                    />
                </Stack>

                {/* 카드 리스트 */}
                <Box sx={{ mt: 2 }}>
                    {loading ? (
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 4,
                                textAlign: 'center',
                                color: 'text.secondary',
                            }}
                        >
                            도서 목록을 불러오는 중입니다...
                        </Typography>
                    ) : filteredBooks.length === 0 ? (
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 4,
                                textAlign: 'center',
                                color: 'text.secondary',
                            }}
                        >
                            아직 등록된 책이 없거나, 검색 결과가 없습니다.
                        </Typography>
                    ) : (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, minmax(0, 1fr))',
                                    md: 'repeat(3, minmax(0, 1fr))',
                                },
                                gap: 3,
                                justifyItems: 'center',
                            }}
                        >
                            {filteredBooks.map((book) => {
                                const coverSrc =
                                    book.imageUrl ||
                                    book.coverUrl ||
                                    book.bookCoverUrl ||
                                    book.coverImageUrl ||
                                    book.thumbnailUrl ||
                                    book.cover ||
                                    ''
                                const bookId = book.id ?? book.bookId

                                return (
                                    <Card
                                        key={bookId}
                                        variant="outlined"
                                        sx={{
                                            transition:
                                                'transform 0.2s ease, box-shadow 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow:
                                                    '0 14px 30px rgba(33,37,41,0.18)',
                                            },
                                            width: '100%',
                                            maxWidth: 280,
                                            borderRadius: 3,
                                            background:
                                                'linear-gradient(145deg, #fdfaf5, #f5faf7)',
                                            boxShadow:
                                                '0 10px 26px rgba(33,37,41,0.1)',
                                        }}
                                    >
                                        <CardActionArea
                                            onClick={() => handleClickCard(book)}   // ✅ book.id 대신 book 전체 전달
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'stretch',
                                                p: 1.5,
                                                borderRadius: 3,
                                                minHeight: 120,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    flex: '0 0 80px',
                                                    width: 80,
                                                    height: 110,
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    background: coverSrc
                                                        ? '#eee'
                                                        : 'linear-gradient(135deg, rgba(188,226,210,0.95), rgba(202,222,246,0.95))',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center',
                                                    mr: 1.8,
                                                }}
                                            >
                                                {coverSrc ? (
                                                    <Box
                                                        component="img"
                                                        src={coverSrc}
                                                        alt={`${book.title} 표지`}
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            display: 'block',
                                                        }}
                                                    />
                                                ) : (
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: '#324450',
                                                            wordBreak: 'keep-all',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                                'ellipsis',
                                                            display:
                                                                '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient:
                                                                'vertical',
                                                            whiteSpace:
                                                                'normal',
                                                            lineHeight: 1.25,
                                                            fontSize: 12,
                                                            px: 1,
                                                        }}
                                                    >
                                                        {book.title}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <CardContent
                                                sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    py: 0.5,
                                                    pl: 0.5,
                                                    '&:last-child': { pb: 0.5 },
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 600,
                                                        mb: 0.5,
                                                        color: '#324450',
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        display:
                                                            '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient:
                                                            'vertical',
                                                        whiteSpace:
                                                            'normal',
                                                    }}
                                                >
                                                    {book.title}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: 'text.secondary',
                                                    }}
                                                    noWrap
                                                >
                                                    {book.author || '작가 미상'}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        mt: 0.5,
                                                        color: 'text.secondary',
                                                        display: 'block',
                                                    }}
                                                    noWrap
                                                >
                                                    {book.genre || '장르 없음'}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                )
                            })}
                        </Box>
                    )}
                </Box>
            </Stack>
        </Box>
    )
}
