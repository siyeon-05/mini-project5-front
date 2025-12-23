// src/api/client.js
import axios from "axios";

// ✅ 기본 axios 인스턴스 생성
export const api = axios.create({
    baseURL: "http://a083145-back-alb-1451270773.ap-northeast-2.elb.amazonaws.com",   // 백엔드 서버 주소
    headers: {
        "Content-Type": "application/json",
    },
    // 필요하면 쿠키 기반 인증시 true
    // withCredentials: true,
});

// 🔐 매 요청마다 localStorage 에 있는 accessToken 을 Authorization 헤더에 실어 보내기
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            // headers 객체가 없는 경우를 대비
            if (!config.headers) {
                config.headers = {};
            }
            // 백엔드에서 기대하는 형태: "Bearer {token}"
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// 기본(default) export도 함께 제공
export default api;
