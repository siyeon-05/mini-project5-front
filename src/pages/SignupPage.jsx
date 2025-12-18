// src/pages/SignupPage.jsx

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

// ✅ 현재는 프론트에서 만든 Auth 서비스 모듈 사용
//    실제 구현: POST /signup 또는 POST /auth/signup 등에 연결
import { signup as signupApi } from '../services/authService';

/**
 * SignupPage
 *
 * - 새 계정을 만드는 회원가입 페이지
 * - ID / Password / 이름을 입력받아 백엔드 회원가입 API 호출
 */
export default function SignupPage() {
    const navigate = useNavigate()

    // 폼 입력값 상태
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    // 로딩 & 에러 메시지 상태
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    /**
     * 회원가입 폼 제출 시 실행
     */
    const handleSignupSubmit = async (e) => {
        e.preventDefault()

        // 양쪽 공백 제거
        const id = userId.trim()
        const pw = password.trim()
        const displayName = name.trim()

        // 간단한 필수값 검증
        if (!id || !pw) {
            alert('ID와 비밀번호는 필수입니다.')
            return
        }

        setLoading(true)
        setErrorMsg('')

        try {
            /**
             * 🔐 백엔드 회원가입 API 호출
             *
             * authService.signup 내부 예시:
             *   axios.post('/signup', { id, password, name })
             */
            await signupApi({ id, password: pw, name: displayName });

            alert('회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.')
            navigate('/login')
        } catch (err) {
            console.error(err)

            // 백엔드에서 내려주는 에러 메시지 우선 사용
            const msg =
                err?.response?.data?.message ||
                err.message ||
                '회원가입 중 오류가 발생했습니다.'

            setErrorMsg(msg)
            alert(msg)
        } finally {
            setLoading(false)
        }
    }

    /**
     * 취소 버튼 / "로그인으로 돌아가기"
     */
    const handleCancel = () => {
        navigate('/login')
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
                    maxWidth: 460,
                    width: '100%',
                    borderRadius: 4,
                    background:
                        'linear-gradient(145deg, rgba(255,255,255,0.97), rgba(232, 244, 238, 0.98))',
                    boxShadow: '0 18px 40px rgba(33, 37, 41, 0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* 하단 장식용 원형 그래픽 (배경 데코) */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -40,
                        left: -40,
                        width: 140,
                        height: 140,
                        borderRadius: '50%',
                        background:
                            'radial-gradient(circle at 30% 30%, rgba(186,210,242,0.85), rgba(247,243,235,0))',
                    }}
                />

                {/* 실제 내용 영역 */}
                <Stack spacing={3} sx={{ position: 'relative' }}>
                    {/* 상단 타이틀/설명 */}
                    <Box>
                        <Typography
                            variant="overline"
                            sx={{
                                letterSpacing: '.16em',
                                color: 'text.secondary',
                            }}
                        >
                            NEW ACCOUNT
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, mt: 0.5 }}
                        >
                            나만의 서재 만들기
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ mt: 0.5, color: 'text.secondary' }}
                        >
                            앞으로 관리할 책들을 위한 개인 서재 계정을
                            만들어주세요.
                        </Typography>
                    </Box>

                    {/* 회원가입 폼 */}
                    <Box component="form" onSubmit={handleSignupSubmit}>
                        <Stack spacing={2.2}>
                            {/* ID 입력 */}
                            <TextField
                                label="ID"
                                fullWidth
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />

                            {/* 비밀번호 입력 */}
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                            {/* 이름 입력 (선택 사항) */}
                            <TextField
                                label="이름 (선택)"
                                fullWidth
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />

                            {/* 에러 메시지 표시 */}
                            {errorMsg && (
                                <Typography
                                    variant="body2"
                                    color="error"
                                    sx={{ mt: -0.5 }}
                                >
                                    {errorMsg}
                                </Typography>
                            )}

                            {/* 하단 버튼: 회원가입 / 로그인으로 돌아가기 */}
                            <Stack
                                direction="row"
                                spacing={1.5}
                                sx={{ mt: 1 }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                >
                                    {loading ? '처리 중...' : '회원가입'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="text"
                                    fullWidth
                                    onClick={handleCancel}
                                >
                                    로그인으로 돌아가기
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    )
}
