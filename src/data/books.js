// src/data/books.js

/**
 * 임시 Book 데이터 모듈
 *
 * - 지금은 "메모리 상의 배열"을 간단한 DB처럼 사용
 * - getBooks / addBook / updateBook / deleteBook / isDuplicateBook
 *   등의 함수로만 접근하도록 래핑해 둠
 *
 * ⚙ 백엔드 연동 시
 * - 이 파일 전체는 실제로는 사용하지 않고,
 *   같은 인터페이스를 가지는 API 래퍼 모듈로 교체할 수 있음.
 *
 *   예) Books API 설계 방향
 *   ----------------------------------------------------
 *   - getBooks()
 *       → GET /books
 *       → 또는 GET /users/:userId/books  (로그인 유저 기준)
 *
 *   - getBookById(id)
 *       → GET /books/:id
 *
 *   - addBook(book)
 *       → POST /books
 *         body: { title, author, genre, description, ownerId, coverUrl, ... }
 *         res:  { id, ...book }
 *
 *   - updateBook(id, changes)
 *       → PUT /books/:id
 *         body: { ...변경필드 }
 *
 *   - deleteBook(id)
 *       → DELETE /books/:id
 *
 *   - isDuplicateBook(ownerId, title, author)
 *       → GET /books?ownerId=...&title=...&author=...
 *         res: [ ...books ]
 *         → 길이가 1개 이상이면 "중복 있음" 처리
 *
 *   👉 프론트 입장에서는,
 *      화면 코드(LoginPage, MainPage 등)는 그대로 두고
 *      이 모듈의 함수 내부만 axios/fetch로 교체하면 됨.
 */

// ✅ 메모리 안에 있는 책 목록 (예시 데이터)
//    → Zen Garden UI와 맞추기 위해 coverPrompt / coverUrl / summary 필드도 추가
const books = [
    {
        id: '1',
        ownerId: '1111', // 이 책 주인 (로그인 사용자 ID)
        title: '샘플 도서 1',
        author: 'AIVLE',
        genre: '예시',
        imageUrl: '',     // 실제 표지 이미지 URL (현재는 비어 있음)
        coverUrl: '',     // 나중에 AI가 만든 표지 이미지 URL
        coverPrompt: '',  // AI 표지 생성에 사용한 프롬프트
        description: '처음에 보여줄 예시 도서입니다.',
    },
    {
        id: '2',
        ownerId: '1111',
        title: '1984',
        author: '조지 오웰',
        genre: '디스토피아',
        imageUrl: '',
        coverUrl: '',
        coverPrompt: '',
        description: '전체주의 감시 사회를 그린 디스토피아 소설.',
    },
    {
        id: '3',
        ownerId: '1111',
        title: '어린 왕자',
        author: '생텍쥐페리',
        genre: '동화',
        imageUrl: '',
        coverUrl: '',
        coverPrompt: '',
        description: '아이와 어른 모두에게 생각할 거리를 주는 동화.',
    },
    {
        id: '4',
        ownerId: '3333', // 다른 유저의 책 예시
        title: '샘플 도서 2',
        author: '홍길동',
        genre: '소설',
        imageUrl: '',
        coverUrl: '',
        coverPrompt: '',
        description: '두 번째 예시 도서입니다.',
    },
    {
        id: '5',
        ownerId: '3333',
        title: '데미안',
        author: '헤르만 헤세',
        genre: '성장소설',
        imageUrl: '',
        coverUrl: '',
        coverPrompt: '',
        description: '',
    },
    {
        id: '6',
        ownerId: '3333',
        title: '자기만의 방',
        author: '버지니아 울프',
        genre: '에세이',
        imageUrl: '',
        coverUrl: '',
        coverPrompt: '',
        description: '',
    },
]

/**
 * 책 목록 전체 반환
 *
 * 현재:
 *   - 단순히 메모리 배열을 그대로 리턴
 *
 * 실제 백엔드에서는:
 *   - GET /books
 *   - 또는 로그인 유저 기준으로 GET /users/:userId/books 사용 가능
 *
 *   💡 백엔드 전환 시 예시
 *   async function getBooks() {
 *     const res = await axios.get('/books')
 *     return res.data   // [{ id, title, ... }, ...]
 *   }
 */
export function getBooks() {
    return books
}

/**
 * id로 한 권의 책 찾기
 *
 * @param {string|number} id - 책 ID
 * @returns {object|undefined} - 해당 ID의 책 객체 또는 없으면 undefined
 *
 * 현재:
 *   - 메모리 배열에서 find로 바로 조회
 *
 * 실제 백엔드:
 *   - GET /books/:id
 *
 *   💡 예시
 *   async function getBookById(id) {
 *     const res = await axios.get(`/books/${id}`)
 *     return res.data   // { id, title, ... }
 *   }
 */
export function getBookById(id) {
    // 서로 다른 타입(number/string)을 대비해서 String()으로 통일 후 비교
    return books.find((b) => String(b.id) === String(id))
}

/**
 * 새 책 추가
 *
 * @param {object} book - 추가할 책 정보
 *    - ownerId, title, author, genre, imageUrl, description, coverUrl, coverPrompt ...
 * @returns {object} 생성된 책 객체
 *
 * 현재:
 *   - Date.now()를 사용해 간단한 문자열 ID를 만들고,
 *     books 배열에 push 후, push된 객체를 반환
 *
 * 실제 백엔드:
 *   - POST /books
 *     body: { title, author, genre, description, ownerId, coverUrl, ... }
 *     res:  { id, ...book, createdAt, ... }
 *
 *   💡 예시
 *   async function addBook(book) {
 *     const res = await axios.post('/books', book)
 *     return res.data      // 서버에서 생성한 id 포함
 *   }
 */
export function addBook(book) {
    const newBook = {
        // 간단한 임시 ID (현재 시간 기반)
        // 백엔드 DB에서는 auto-increment 또는 UUID 등으로 대체
        id: Date.now().toString(),
        ...book,
    }
    books.push(newBook)
    return newBook
}

/**
 * 책 정보 수정
 *
 * @param {string|number} id - 수정할 책의 ID
 * @param {object} changes - 변경할 필드만 모아둔 객체
 *
 * 현재:
 *   - books 배열에서 해당 id를 찾아서, 기존 객체에 changes를 덮어쓰기
 *
 * 실제 백엔드:
 *   - PUT /books/:id
 *     body: { ...변경할 필드 }
 *
 *   💡 예시
 *   async function updateBook(id, changes) {
 *     const res = await axios.put(`/books/${id}`, changes)
 *     return res.data      // 갱신된 책 정보
 *   }
 */
export function updateBook(id, changes) {
    const index = books.findIndex((b) => String(b.id) === String(id))
    if (index === -1) return

    // 기존 책 정보에 changes를 덮어쓰기
    books[index] = { ...books[index], ...changes }
}

/**
 * 책 삭제
 *
 * @param {string|number} id - 삭제할 책의 ID
 *
 * 현재:
 *   - 배열에서 해당 인덱스를 찾아 splice로 삭제
 *
 * 실제 백엔드:
 *   - DELETE /books/:id
 *
 *   💡 예시
 *   async function deleteBook(id) {
 *     await axios.delete(`/books/${id}`)
 *   }
 */
export function deleteBook(id) {
    const index = books.findIndex((b) => String(b.id) === String(id))
    if (index === -1) return

    books.splice(index, 1)
}

/**
 * 🔍 같은 유저의 같은 책이 이미 있는지 확인
 *
 * 기준:
 *  - ownerId(필수)
 *  - 제목(title, 필수)
 *  - 작가(author, 선택)
 *
 * @param {string|number} ownerId - 책 소유자 ID (로그인 유저 ID)
 * @param {string} title          - 책 제목
 * @param {string} author         - 작가명(없을 수 있음)
 * @returns {boolean}             - 중복이면 true, 아니면 false
 *
 * 현재:
 *   - books 배열에서 ownerId + title (+author)를 기준으로 직접 검색
 *
 * 실제 백엔드:
 *   - GET /books?ownerId=...&title=...&author=...
 *   - 응답: [ ...books ]
 *     → 길이가 1개 이상이면 중복으로 간주
 *
 *   💡 예시
 *   async function isDuplicateBook(ownerId, title, author) {
 *     const res = await axios.get('/books', {
 *       params: { ownerId, title, author }
 *     })
 *     return res.data.length > 0
 *   }
 */
export function isDuplicateBook(ownerId, title, author) {
    const normOwner = String(ownerId ?? '')
    const normTitle = (title ?? '').trim()
    const normAuthor = (author ?? '').trim()

    // 소유자나 제목이 없으면 중복 체크 의미가 없으니 false
    if (!normOwner || !normTitle) return false

    return books.some((b) => {
        // 1) 소유자(ownerId)가 다르면 비교 대상 아님
        if (String(b.ownerId ?? '') !== normOwner) return false

        const bTitle = (b.title ?? '').trim()
        const bAuthor = (b.author ?? '').trim()

        // 2) 작가를 비워둔 경우 → 제목만 기준으로 중복 체크
        if (!normAuthor) {
            return bTitle === normTitle
        }

        // 3) 작가까지 입력했으면 제목 + 작가 둘 다 같은지 체크
        return bTitle === normTitle && bAuthor === normAuthor
    })
}
