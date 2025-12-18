// src/services/authService.js
import apiClient from './apiClient'

/**
 * 로그인
 * - POST /users/login
 * - 백엔드 응답: ApiResponse<JWTResponse> 형태라고 가정
 *   → { success, data: { userId, loginId, name, accessToken, refreshToken, ... } }
 */
export async function login({ id, password }) {
    const res = await apiClient.post('/users/login', {
        loginId: id,
        password,
    })

    // 📝 보통 { success, data: {...} } 구조라서 data 안의 data 를 우선 사용
    const data = res.data?.data ?? res.data
    return data
}

/**
 * 회원가입
 * - POST /users/signup
 * - 요청 스키마: { userId, loginId, password, name }
 *   (Swagger 예시: userId: 0 같이 보냄)
 */
export async function signup({ id, password, name }) {
    const res = await apiClient.post('/users/signup', {
        userId: 0,   // Swagger 예시에 맞춰 더미 값
        loginId: id,
        password,
        name,
    })
    // 일반적으로 res.data 안에 { success, data, message } 등이 들어있음
    return res.data
}

/**
 * 내 프로필 조회
 * - GET /users/me
 * - Authorization: Bearer {accessToken} 필요
 */
export async function fetchMe() {
    const res = await apiClient.get('/users/me')
    const data = res.data?.data ?? res.data
    return data
}

/**
 * (옵션) 회원정보 수정
 * - PUT /users/update
 * - userData 구조는 Swagger의 UpdateUserRequest 에 맞춰서 넘기면 됨
 */
export async function updateUser(userData) {
    const res = await apiClient.put('/users/update', userData)
    return res.data
}

/**
 * (옵션) 회원 탈퇴
 * - DELETE /users/resign
 * - loginId 를 body 로 보냄
 */
export async function resign(loginId) {
    const res = await apiClient.delete('/users/resign', {
        data: { loginId },
    })
    return res.data
}
