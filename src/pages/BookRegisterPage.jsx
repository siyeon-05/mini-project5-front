// src/pages/BookRegisterPage.jsx

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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

import {
    createBook,
    updateBook as updateBookApi,
} from '../services/bookService'

export default function BookRegisterPage() {
    const navigate = useNavigate()
    const location = useLocation()

    // 1. 수정 모드 여부
    const existingBook = location.state?.book || null
    const isEdit = !!existingBook

    // 2. 도서 기본 정보
    const [title, setTitle] = useState(existingBook?.title || '')
    const [author, setAuthor] = useState(existingBook?.author || '')
    const [genre, setGenre] = useState(existingBook?.genre || '')
    const [summary, setSummary] = useState(
        existingBook?.content || // ✅ 백엔드에서 내려주는 필드
        existingBook?.summary ||
        existingBook?.description ||
        '',
    )
    const [coverPrompt, setCoverPrompt] = useState(
        existingBook?.coverPrompt || '',
    )

    // 3. OpenAI 옵션 (백엔드로 보내진 않지만 UI 상태용)
    const [apiKey, setApiKey] = useState('')
    const [model, setModel] = useState('dall-e-3')
    const [quality, setQuality] = useState('standard')
    const [style, setStyle] = useState('vivid')
    const [size, setSize] = useState('1024x1024')

    // 4. 표지 미리보기 & 상태
    const [coverPreview, setCoverPreview] = useState(
        existingBook?.imageUrl || existingBook?.coverUrl || '',
    )
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const isFormValid = !!title.trim()

    // --------------------------------------------------
    // 5. AI 표지 생성
    // --------------------------------------------------
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

    // --------------------------------------------------
    // 6. 폼 초기화
    // --------------------------------------------------
    const handleClear = () => {
        setTitle('')
        setAuthor('')
        setGenre('')
        setSummary('')
        setCoverPrompt('')
        setCoverPreview('')
        setErrorMsg('')
        setModel('dall-e-3')
        setQuality('standard')
        setStyle('vivid')
        setSize('1024x1024')
    }

    // --------------------------------------------------
    // 7. 저장 (등록 / 수정)
    //    - 본문 필드명은 content
    //    - 표지 URL 은 imageUrl/coverUrl 에 같이 넣어줌
    // --------------------------------------------------
    const handleSave = async (e) => {
        e.preventDefault()

        if (!isFormValid) {
            alert('책 제목은 필수입니다.')
            return
        }

        // 공통 payload (백엔드 DTO 필드 이름에 맞춤)
        const payloadBase = {
            title: title.trim(),
            author: author.trim(),
            genre: genre.trim(),
            content: summary.trim(), // ✅ 백엔드가 검증하는 필드
            coverPrompt: coverPrompt.trim(),
        }

        // AI 표지 URL 하나를 공통 사용
        const finalImageUrl =
            coverPreview ||
            existingBook?.imageUrl ||
            existingBook?.coverUrl ||
            ''

        const payload = {
            ...payloadBase,
            imageUrl: finalImageUrl,
            coverUrl: finalImageUrl, // 혹시 백엔드가 coverUrl 을 쓴다면 대비
        }

        try {
            if (isEdit && existingBook) {
                // 🔧 수정 모드: PUT /books/{id}
                const bookId = existingBook.id ?? existingBook.bookId
                await updateBookApi(bookId, payload)
                alert('도서 정보가 수정되었습니다.')
            } else {
                // 🆕 등록 모드: POST /books?userId=xxx
                const currentUserId = localStorage.getItem('currentUserId')
                if (!currentUserId) {
                    alert('로그인 정보가 없습니다. 다시 로그인해주세요.')
                    navigate('/login')
                    return
                }

                await createBook(payload, currentUserId)
                alert('도서가 등록되었습니다.')
            }

            navigate('/main')
        } catch (error) {
            console.error('도서 저장 중 오류:', error)
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                '도서 저장 중 오류가 발생했습니다.'
            alert(msg)
        }
    }

    // --------------------------------------------------
    // 8. 취소
    // --------------------------------------------------
    const handleCancel = () => {
        navigate('/main')
    }

    // --------------------------------------------------
    // 9. JSX 렌더링
    // --------------------------------------------------
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
                    {isEdit ? '도서 정보 수정' : '도서 등록'}
                </Typography>

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    alignItems="flex-start"
                >
                    {/* 왼쪽: 입력 폼 */}
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
                                placeholder="예: 판타지, 로맨스, 스릴러..."
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                            />

                            <TextField
                                label="줄거리"
                                fullWidth
                                multiline
                                minRows={4}
                                placeholder="책의 줄거리 또는 내용을 입력해주세요."
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                            />

                            <TextField
                                label="표지 디테일 설정 (선택)"
                                fullWidth
                                multiline
                                minRows={2}
                                placeholder="표지의 분위기, 색감, 키워드를 적어주세요."
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
                                    {isEdit ? '수정 완료' : '등록 완료'}
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

                    {/* 오른쪽: 표지 미리보기 */}
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
                            color: coverPreview ? '#324450' : 'text.secondary',
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
                            <Typography variant="body2">
                                아직 생성된 표지가 없습니다.
                                <br />
                                왼쪽 내용을 채운 뒤
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
