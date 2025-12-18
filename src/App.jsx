// src/App.jsx
import './App.css'
import { Routes, Route } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material'

import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import MainPage from './pages/MainPage.jsx'
import BookRegisterPage from './pages/BookRegisterPage.jsx'
import BookDetailPage from './pages/BookDetailPage.jsx'
import BookEditPage from './pages/BookEditPage.jsx'

/**
 * App 컴포넌트
 *
 * - 전체 SPA의 공통 레이아웃 + 라우팅 설정을 담당
 * - 상단에는 항상 고정된 AppBar(헤더)가 있고,
 *   그 아래 Container 영역에 각 페이지(Login, Main, Book 등)가 렌더링됨
 *
 * 라우트 구조 요약
 * - "/"        → LoginPage (루트에서도 로그인 화면)
 * - "/login"  → LoginPage
 * - "/signup" → SignupPage
 * - "/main"   → MainPage (로그인 후 내 서재 메인)
 * - "/books/new"   → BookRegisterPage (새 도서 등록)
 * - "/books/:id"   → BookDetailPage   (도서 상세)
 * - "/books/edit"  → BookEditPage     (도서 수정 – location.state로 book 전달)
 *
 * 🔌 백엔드와의 관계
 * - 이 파일에서는 직접 API를 호출하지 않고,
 *   각 Page 컴포넌트에서 data 모듈(/data/books.js, /data/users.js)을 통해 데이터를 다룸
 * - 실제 서비스에서는:
 *   - /data/* 모듈들이 HTTP API 래퍼로 교체
 *   - 필요하다면 /main, /books/* 라우트에 대해 "로그인 여부 체크(Protected Route)"를
 *     별도 컴포넌트로 만들어 감싸는 방식으로 확장 가능
 */
function App() {
    return (
        // 전체 배경 및 높이 설정
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* 상단바: 심플하지만 웹앱 느낌 나게 */}
            <AppBar
                position="sticky"
                elevation={0}
                color="transparent"
                sx={{
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)', // 살짝 블러 효과로 유리 느낌
                }}
            >
                <Toolbar
                    sx={{
                        maxWidth: 1200,
                        mx: 'auto',
                        width: '100%',
                        py: 1.5,
                    }}
                >
                    {/* 좌측 상단 로고/타이틀 역할 */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '.08em',
                            textTransform: 'uppercase',
                        }}
                    >
                        AIVLE 서재
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* 페이지별 내용이 들어가는 메인 컨테이너 영역 */}
            <Container
                maxWidth="md"
                sx={{
                    py: 5,
                    minHeight: 'calc(100vh - 72px)', // 상단 AppBar 높이를 뺀 영역
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* 라우팅 설정: URL path에 따라 각 페이지 컴포넌트 렌더링 */}
                <Routes>
                    {/* 루트( / ) 접근 시 로그인 페이지로 */}
                    <Route path="/" element={<LoginPage />} />
                    {/* 명시적인 로그인 경로 */}
                    <Route path="/login" element={<LoginPage />} />
                    {/* 회원가입 페이지 */}
                    <Route path="/signup" element={<SignupPage />} />
                    {/* 로그인 후 개인 서재 메인 */}
                    <Route path="/main" element={<MainPage />} />
                    {/* 새 도서 등록 페이지 */}
                    <Route path="/books/new" element={<BookRegisterPage />} />
                    {/* 도서 상세 페이지 (id 파라미터 사용) */}
                    <Route path="/books/:id" element={<BookDetailPage />} />
                    {/* 도서 수정 페이지
                        - 현재는 BookDetailPage에서 navigate('/books/edit', { state: { book } }) 로 진입
                        - 나중에 /books/:id/edit 형태로 확장할 수도 있음 */}
                    <Route path="/books/edit" element={<BookEditPage />} />
                </Routes>
            </Container>
        </Box>
    )
}

export default App
