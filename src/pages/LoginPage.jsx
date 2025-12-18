// src/pages/LoginPage.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Stack,
} from '@mui/material'

// ✅ 백엔드 인증 API (POST /users/login, GET /users/me)
import { login as loginApi, fetchMe } from '../services/authService'

/**
 * LoginPage
 *
 * - ID / Password 입력 후 백엔드 로그인 API 호출
 * - accessToken / refreshToken 저장
 * - /users/me 로 내 프로필을 조회해서 userId, name을 확실히 확보
 */
export default function LoginPage() {
    const [loginId, setLoginId] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const navigate = useNavigate()

    /**
     * 로그인 버튼 / Enter 시 실행
     */
    const handleLogin = async (e) => {
        e.preventDefault()

        const id = loginId.trim()
        const pw = loginPassword.trim()

        if (!id || !pw) {
            alert('아이디와 비밀번호를 모두 입력해주세요.')
            return
        }

        setLoading(true)
        setErrorMsg('')

        try {
            // 1️⃣ 로그인 요청 → JWT 정보 받기 (accessToken, refreshToken 등)
            const jwt = await loginApi({ id, password: pw })

            // 우선 토큰부터 저장 (이후 /users/me 호출 시 Authorization 헤더에 실림)
            if (jwt.accessToken) {
                localStorage.setItem('accessToken', jwt.accessToken)
            }
            if (jwt.refreshToken) {
                localStorage.setItem('refreshToken', jwt.refreshToken)
            }

            // 2️⃣ 기본값: 로그인 응답 안에 있는 정보로 userId / userName 추정
            let userId = jwt.userId ?? jwt.loginId ?? id
            let userName = jwt.name ?? ''

            // 3️⃣ /users/me 로 내 프로필 다시 조회해서 확실한 값으로 덮어쓰기
            try {
                const me = await fetchMe()
                if (me) {
                    // 백엔드 스키마에 따라 id / userId / loginId 중 있는 것 사용
                    userId = me.id ?? me.userId ?? me.loginId ?? userId
                    userName = (me.name ?? userName) || userId
                }
            } catch (profileErr) {
                console.error('프로필(/users/me) 조회 실패(무시 가능):', profileErr)
            }




            // 4️⃣ 현재 로그인한 사용자 정보 localStorage에 저장
            localStorage.setItem('currentUserId', String(userId))
            localStorage.setItem('currentUserName', userName || String(userId))

            alert(`${userName || userId}님, 로그인 성공!`)
            navigate('/main')
        } catch (err) {
            console.error(err)

            const msg =
                err?.response?.data?.message ||
                err.message ||
                '아이디 또는 비밀번호가 올바르지 않습니다.'

            setErrorMsg(msg)
            alert(msg)
        } finally {
            setLoading(false)
        }
    }

    const handleGoSignup = () => {
        navigate('/signup')
    }

    return (
        <Box
            sx={{
                minHeight: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Paper
                sx={{
                    p: 4,
                    pt: 5,
                    maxWidth: 420,
                    width: '100%',
                    borderRadius: 4,
                    background:
                        'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(243, 248, 245, 0.98))',
                    boxShadow: '0 18px 40px rgba(33, 37, 41, 0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* 상단 장식용 원 */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -40,
                        right: -40,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle at 30% 30%, rgba(188,226,210,0.9), rgba(250,246,238,0))',
                    }}
                />

                <Stack spacing={3} sx={{ position: 'relative' }}>
                    {/* 인사 문구 */}
                    <Box>
                        <Typography
                            variant="overline"
                            sx={{
                                letterSpacing: '.16em',
                                color: 'text.secondary',
                            }}
                        >
                            PERSONAL LIBRARY
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, mt: 2 }}
                        >
                            AIVLE 서재에 오신 걸 환영해요
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ mt: 3, color: 'text.secondary' }}
                        >
                            오늘은 어떤 이야기를 남겨볼까요?
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ mt: 0.5, color: 'text.secondary' }}
                        >
                            오늘도 한 줄씩, 당신만의 세계를 만들어봐요.
                        </Typography>
                    </Box>

                    {/* 로그인 폼 */}
                    <Box component="form" onSubmit={handleLogin}>
                        <Stack spacing={2.2}>
                            <TextField
                                label="ID"
                                variant="outlined"
                                fullWidth
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                            />

                            <TextField
                                label="Password"
                                type="password"
                                variant="outlined"
                                fullWidth
                                value={loginPassword}
                                onChange={(e) =>
                                    setLoginPassword(e.target.value)
                                }
                            />

                            {/* 에러 메시지 */}
                            {errorMsg && (
                                <Typography
                                    variant="body2"
                                    color="error"
                                    sx={{ mt: -1 }}
                                >
                                    {errorMsg}
                                </Typography>
                            )}

                            {/* 버튼들 */}
                            <Stack spacing={1.5} sx={{ mt: 1 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                >
                                    {loading ? '로그인 중...' : '로그인'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="text"
                                    fullWidth
                                    onClick={handleGoSignup}
                                >
                                    🌿아직 계정이 없다면, 회원가입하기🌿
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}
