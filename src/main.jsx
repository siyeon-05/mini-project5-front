// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import './index.css'

/**
 * 🌿 Zen Garden 스타일 MUI 커스텀 테마
 *
 * - 전체 앱의 색상 / 폰트 / 컴포넌트 기본 스타일을 여기서 정의
 * - ThemeProvider로 감싸서 모든 MUI 컴포넌트에서 공통으로 사용
 *
 * ✅ 백엔드 연동과는 직접적인 연관은 없지만,
 *   "이 프로젝트가 어떤 분위기/디자인 콘셉트인지"를 보여주는 핵심 부분
 */
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            // 메인 포인트 컬러: 민트 그린
            main: '#62b7a2',
        },
        secondary: {
            // 서브 포인트 컬러: 스카이 블루
            main: '#8ac2ff',
        },
        background: {
            // 전체 배경: 라이트 베이지 톤
            default: '#f7f3eb',
            // 카드/패널 배경은 거의 흰색
            paper: '#ffffff',
        },
        text: {
            primary: '#324450',   // 잉크 느낌의 딥 블루그레이
            secondary: '#6f7f86', // 부드러운 그레이
        },
    },
    shape: {
        // 대부분의 컴포넌트 모서리를 살짝 둥글게
        borderRadius: 16,
    },
    typography: {
        // 전체 기본 폰트
        fontFamily:
            '"Noto Sans KR", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        h4: {
            fontWeight: 600,
        },
        body1: {
            lineHeight: 1.7,
        },
    },
    components: {
        // MUI Button 공통 스타일 오버라이드
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 999,    // 완전 동글동글한 pill 형태
                    textTransform: 'none', // 대문자 변환 방지
                    paddingInline: 20,
                },
            },
        },
        // Paper(Card 계열) 은은한 그림자 효과
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
                },
            },
        },
    },
})

/**
 * 리액트 앱 진입점
 *
 * - #root DOM 요소에 React 앱을 마운트
 * - BrowserRouter: 라우팅 지원
 * - ThemeProvider: 위에서 정의한 MUI 테마를 전체 앱에 적용
 * - CssBaseline: 브라우저 기본 스타일 초기화 + MUI 기본 스타일 세팅
 *
 * 🔌 백엔드 연동 관점
 * - 여기서는 직접 백엔드와 통신하진 않지만,
 *   나중에 전역 상태 관리(ex. AuthProvider, QueryClientProvider 등)를 추가하려면
 *   <ThemeProvider>와 <App> 사이에 끼워 넣으면 됨.
 *   예)
 *     <AuthProvider>
 *       <App />
 *     </AuthProvider>
 */
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* SPA 라우팅 구성 */}
        <BrowserRouter>
            {/* MUI 전역 테마 적용 */}
            <ThemeProvider theme={theme}>
                {/* 기본 스타일 초기화 */}
                <CssBaseline />
                {/* 실제 페이지 구조/라우팅은 App.jsx에서 처리 */}
                <App />
            </ThemeProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
