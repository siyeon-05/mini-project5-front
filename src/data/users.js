// src/data/users.js

/**
 * 임시 유저 데이터 모듈
 *
 * - 지금은 메모리 상의 배열(users)을 간단한 유저 DB처럼 사용
 * - 로그인 / 회원가입 / 아이디 중복 체크를 모두 "프론트 단에서" 처리하는 구조
 *
 * ⚙ 실제 서비스로 확장할 때는:
 *   - 이 파일의 함수들을 그대로 쓰지 않고,
 *     같은 인터페이스를 가진 Auth API 래퍼 모듈로 교체하면 됨.
 *
 *   예) 백엔드 API 설계 방향
 *   ----------------------------------------------------
 *   1) 아이디 중복 체크
 *      - isDuplicateId(id)
 *        → GET  /auth/check-id?id=...
 *        → 또는 POST /auth/check-id  { id }
 *        - 응답: { exists: true/false }
 *
 *   2) 회원가입
 *      - registerUser(id, password, name)
 *        → POST /auth/signup  { id, password, name }
 *        - 응답: { id, name, createdAt, ... }
 *
 *   3) 로그인
 *      - validateLogin(id, password)
 *        → POST /auth/login   { id, password }
 *        - 응답: { id, name, accessToken, refreshToken, ... }
 *
 *   👉 프론트 입장에서는
 *      - "함수 이름 + 파라미터 + 리턴 형태"를 최대한 유지하고,
 *      - 내부 구현만 axios/fetch 호출로 바꿔주면 화면 코드는 거의 그대로 쓸 수 있음.
 */

// ✅ 메모리 상에 하드코딩된 유저 목록
//    - 데모/테스트용 계정
//    - 실제 서비스에서는 DB 또는 외부 인증 시스템으로 대체
const users = [
    { id: '1111', password: '2222', name: '효성' },
    { id: '3333', password: '4444', name: '대호' },
]

/**
 * 아이디 중복 여부 확인
 *
 * @param {string} id - 새로 가입하려는 아이디
 * @returns {boolean} - 이미 존재하면 true, 없으면 false
 *
 * 💡 백엔드 전환 시 예시
 *   async function isDuplicateId(id) {
 *     const res = await axios.get('/auth/check-id', { params: { id } })
 *     return res.data.exists   // true/false
 *   }
 */
export function isDuplicateId(id) {
    return users.some((user) => user.id === id)
}

/**
 * 회원가입
 *
 * @param {string} id        - 회원 아이디
 * @param {string} password  - 비밀번호 (현재는 평문 / 데모용)
 * @param {string} name      - 사용자 이름
 * @returns {boolean}        - 중복 아이디면 false, 성공하면 true
 *
 * 현재:
 *   - 단순히 메모리 배열(users)에 push만 해주는 구조 (브라우저 새로고침하면 날아감)
 *
 * 실제 백엔드에서는:
 *   - 비밀번호 해싱(BCrypt 등)
 *   - 유효성 검증(길이, 패턴 등)
 *   - DB 저장
 *   - 에러 코드(409 Conflict 등) 반환
 *
 *   💡 백엔드 전환 시 예시
 *   async function registerUser(id, password, name) {
 *     const res = await axios.post('/auth/signup', { id, password, name })
 *     return res.data   // { id, name, ... } 또는 성공 여부
 *   }
 */
export function registerUser(id, password, name) {
    if (isDuplicateId(id)) {
        return false
    }
    users.push({ id, password, name })
    return true
}

/**
 * ✅ 로그인 검증
 *
 * @param {string} id        - 로그인 시 입력한 아이디
 * @param {string} password  - 로그인 시 입력한 비밀번호
 * @returns {object|null}    - 일치하는 유저 객체 또는 null
 *
 * 현재(프론트-only):
 *   - users 배열에서 id+password가 모두 일치하는 유저를 찾음
 *   - LoginPage에서 이 반환값을 이용해
 *     localStorage('currentUserId', 'currentUserName')를 세팅
 *
 * 실제 백엔드 Auth API에서는:
 *   - POST /auth/login  { id, password }
 *   - 성공 시:
 *       { id, name, accessToken, refreshToken, ... }
 *   - 실패 시:
 *       401 Unauthorized, { message: '비밀번호가 올바르지 않습니다.' }
 *
 *   💡 백엔드 전환 시 예시
 *   async function validateLogin(id, password) {
 *     const res = await axios.post('/auth/login', { id, password })
 *     return res.data      // { id, name, accessToken, ... }
 *   }
 */
export function validateLogin(id, password) {
    return (
        users.find(
            (user) => user.id === id && user.password === password
        ) || null
    )
}
