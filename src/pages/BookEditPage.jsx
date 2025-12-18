// src/pages/BookEditPage.jsx

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
    Box,
    Paper,
    TextField,
    Button,
    Stack,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material'

import { updateBook as updateBookApi } from '../services/bookService'

export default function BookEditPage() {
    const navigate = useNavigate()
    const location = useLocation()

    // BookDetailPage 에서 넘어온 도서 객체
    const book = location.state?.book

    // 1. 잘못 들어온 경우 방어
    useEffect(() => {
        if (!book) {
            alert(
                '수정할 도서 정보가 없습니다.\n도서 상세 화면에서 다시 시도해주세요.',
            )
            navigate('/main')
        }
    }, [book, navigate])

    // 2. 기본 폼 상태 (content / description 모두 고려)
    const [title, setTitle] = useState(book?.title || '')
    const [author, setAuthor] = useState(book?.author || '')
    const [genre, setGenre] = useState(book?.genre || '')
    const [summary, setSummary] = useState(
        book?.content || book?.description || book?.summary || '',
    )
    const [coverPrompt, setCoverPrompt] = useState(book?.coverPrompt || '')

    // 3. OpenAI 옵션
    const [apiKey, setApiKey] = useState('')
    const [model, setModel] = useState('dall-e-3')
    const [quality, setQuality] = useState('standard')
    const [style, setStyle] = useState('vivid')
    const [size, setSize] = useState('1024x1024')

    // 표지 미리보기
    const [coverPreview, setCoverPreview] = useState(
        book?.imageUrl || book?.coverUrl || '',
    )
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const isFormValid = !!title.trim()

    // 4. AI 표지 생성
    const handleGenerateCover = async () => {
        if (!apiKey) {
            alert('OpenAI API Key를 입력해주세요.')
            return
        }
        if (!title && !summary) {
            alert('제목이나 줄거리를 먼저 입력해주세요.')
            return
        }

        const basePrompt =
            coverPrompt.trim() ||
            `한국어 소설 표지 일러스트. 장르: ${genre || '미정'}. 제목: "${
                title || '제목 없음'
            }". 줄거리: ${summary}. 서점에서 판매되는 책 표지처럼 디자인.`

        setLoading(true)
        setErrorMsg('')

        try {
            const response = await fetch(
                'https://api.openai.com/v1/images/generations',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model,
                        prompt: basePrompt,
                        n: 1,
                        size,
                        quality,
                        style,
                        response_format: 'url',
                    }),
                },
            )

            if (!response.ok) {
                let errText = '이미지 생성 실패'
                try {
                    const errJson = await response.json()
                    if (errJson?.error?.message) {
                        errText = errJson.error.message
                    }
                } catch (e) {
                    console.error('이미지 에러 응답 파싱 실패', e)
                }
                throw new Error(errText)
            }

            const data = await response.json()
            const url = data?.data?.[0]?.url
            if (!url) {
                throw new Error('응답에 이미지 URL이 없습니다.')
            }

            setCoverPreview(url)
        } catch (err) {
            console.error(err)
            const msg =
                err instanceof Error
                    ? err.message
                    : '알 수 없는 오류가 발생했습니다.'
            setErrorMsg(msg)
            alert('이미지 생성 중 오류: ' + msg)
        } finally {
            setLoading(false)
        }
    }

    // 5. 내용 초기화 – 원본으로
    const handleClear = () => {
        if (!book) return
        setTitle(book.title || '')
        setAuthor(book.author || '')
        setGenre(book.genre || '')
        setSummary(book.content || book.description || book.summary || '')
        setCoverPrompt(book.coverPrompt || '')
        setCoverPreview(book.imageUrl || book.coverUrl || '')
        setModel('dall-e-3')
        setQuality('standard')
        setStyle('vivid')
        setSize('1024x1024')
        setErrorMsg('')
    }

    // 6. 저장(수정) 처리 – content + description 둘 다 보냄
    const handleSave = async (e) => {
        e.preventDefault()
        if (!book) return

        if (!isFormValid) {
            alert('책 제목은 필수입니다.')
            return
        }

        const targetId = book.id ?? book.bookId

        const payload = {
            title: title.trim(),
            author: author.trim(),
            genre: genre.trim(),

            // 백엔드 실제 필드
            content: summary.trim(),
            // 프론트/기존 코드 호환용
            description: summary.trim(),

            imageUrl: coverPreview || book.imageUrl || '',
        }

        try {
            await updateBookApi(targetId, payload)
            alert('도서 정보가 수정되었습니다.')
            navigate(`/books/${targetId}`)
        } catch (error) {
            console.error('도서 수정 중 오류:', error)
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                '도서 수정 중 오류가 발생했습니다.'
            alert(msg)
        }
    }

    // 7. 취소
    const handleCancel = () => {
        navigate(-1)
    }

    if (!book) return null

    // 8. JSX 렌더링
    return (
        <Box sx={{ mt: 4 }}>
            <Paper
                sx={{
                    p: 3.5,
                    borderRadius: 4,
                    background:
                        'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(241,247,244,0.98))',
                    boxShadow: '0 16px 40px rgba(33,37,41,0.12)',
                }}
            >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    도서 정보 수정
                </Typography>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    alignItems="flex-start"
                >
                    {/* 왼쪽 - 폼 */}
                    <Box
                        component="form"
                        onSubmit={handleSave}
                        sx={{ flex: 2, width: '100%' }}
                    >
                        <Stack spacing={2.2}>
                            <TextField
                                label="OpenAI API Key"
                                fullWidth
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                helperText="테스트용으로만 사용하세요. 실제 서비스는 백엔드에서 호출해야 합니다."
                            />

                            <TextField
                                label="제목"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <TextField
                                label="작가"
                                fullWidth
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                            />

                            <TextField
                                label="장르"
                                fullWidth
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                            />

                            <TextField
                                label="줄거리"
                                fullWidth
                                multiline
                                minRows={4}
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                            />

                            <TextField
                                label="표지 디테일 설정 (선택)"
                                fullWidth
                                multiline
                                minRows={2}
                                helperText="비워두면 제목·장르·줄거리로 AI가 자동으로 표지 느낌을 만듭니다."
                                value={coverPrompt}
                                onChange={(e) =>
                                    setCoverPrompt(e.target.value)
                                }
                            />

                            {/* AI 옵션: 모델 / 품질 */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                sx={{ mt: 1 }}
                            >
                                <FormControl fullWidth>
                                    <InputLabel id="model-label">모델</InputLabel>
                                    <Select
                                        labelId="model-label"
                                        label="모델"
                                        value={model}
                                        onChange={(e) =>
                                            setModel(e.target.value)
                                        }
                                    >
                                        <MenuItem value="dall-e-3">
                                            dall-e-3
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel id="quality-label">
                                        품질
                                    </InputLabel>
                                    <Select
                                        labelId="quality-label"
                                        label="품질"
                                        value={quality}
                                        onChange={(e) =>
                                            setQuality(e.target.value)
                                        }
                                    >
                                        <MenuItem value="standard">
                                            standard
                                        </MenuItem>
                                        <MenuItem value="hd">hd</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            {/* AI 옵션: 스타일 / 해상도 */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={2}
                                sx={{ mt: 1 }}
                            >
                                <FormControl fullWidth>
                                    <InputLabel id="style-label">
                                        스타일
                                    </InputLabel>
                                    <Select
                                        labelId="style-label"
                                        label="스타일"
                                        value={style}
                                        onChange={(e) =>
                                            setStyle(e.target.value)
                                        }
                                    >
                                        <MenuItem value="vivid">
                                            vivid (선명, 드라마틱)
                                        </MenuItem>
                                        <MenuItem value="natural">
                                            natural (자연스러운)
                                        </MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel id="size-label">
                                        해상도
                                    </InputLabel>
                                    <Select
                                        labelId="size-label"
                                        label="해상도"
                                        value={size}
                                        onChange={(e) =>
                                            setSize(e.target.value)
                                        }
                                    >
                                        <MenuItem value="1024x1024">
                                            1024 x 1024 (정사각형)
                                        </MenuItem>
                                        <MenuItem value="1792x1024">
                                            1792 x 1024 (가로형)
                                        </MenuItem>
                                        <MenuItem value="1024x1792">
                                            1024 x 1792 (세로형)
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            {/* 버튼 영역 */}
                            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                <Button
                                    type="button"
                                    variant="contained"
                                    onClick={handleGenerateCover}
                                    disabled={loading}
                                >
                                    {loading ? '생성 중...' : 'AI 표지 생성'}
                                </Button>

                                <Box sx={{ flexGrow: 1 }} />

                                <Button
                                    variant="contained"
                                    type="submit"
                                    disabled={!isFormValid}
                                >
                                    수정 완료
                                </Button>
                                <Button
                                    variant="contained"
                                    type="button"
                                    onClick={handleClear}
                                >
                                    내용 초기화
                                </Button>
                                <Button
                                    variant="contained"
                                    type="button"
                                    onClick={handleCancel}
                                >
                                    취소
                                </Button>
                            </Stack>

                            {errorMsg && (
                                <Typography
                                    color="error"
                                    variant="body2"
                                    sx={{ mt: 1 }}
                                >
                                    오류: {errorMsg}
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    {/* 오른쪽 - 표지 미리보기 */}
                    <Box
                        sx={{
                            flex: 1,
                            width: { xs: '100%', md: 260 },
                            minHeight: 260,
                            borderRadius: 3,
                            border: '1px dashed rgba(214,205,189,0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            p: 2,
                            background: '#f5f5f5',
                        }}
                    >
                        {coverPreview ? (
                            <Box sx={{ width: '100%' }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{ mb: 1, fontWeight: 'bold' }}
                                >
                                    AI 표지 미리보기
                                </Typography>
                                <Box
                                    component="img"
                                    src={coverPreview}
                                    alt="AI book cover"
                                    sx={{
                                        width: '100%',
                                        borderRadius: 2,
                                        boxShadow: 2,
                                    }}
                                />
                            </Box>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                아직 생성된 표지가 없습니다.
                                <br />
                                <strong>"AI 표지 생성"</strong> 버튼을
                                눌러보세요.
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}
