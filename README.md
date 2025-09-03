# 🌅 기상 체크 앱 (Wake Up Check App)

기상 체크와 일일 목표 관리를 통해 동기부여를 제공하는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🏠 대시보드
- 월별 통계 및 점수 현황
- 멤버별 순위 시스템
- 실시간 데이터 시각화

### ⏰ 기상 체크
- **기상 완료**: 00:00 ~ 04:59 사이에만 체크 가능 (1점)
- **개구리 잡기**: 05:00~09:00 사이에만 가능 (1점)
- 실시간 시계 및 날짜 표시
- 오늘의 기록 상태 확인

### 📝 MUST 기록
- 일일 목표 및 계획 기록
- 어제 기록 확인
- 23:59까지 완료 시 1점 획득

### 👨‍💼 관리자 기능
- 새 멤버 추가/삭제
- 멤버 코드 관리
- 전체 통계 모니터링

## 🎯 점수 시스템

하루 최대 **3점** 획득 가능:
- 🌅 기상 완료: 1점 (00:00-04:59)
- 🐸 개구리 잡기: 1점 (기상 체크 후)
- 📋 MUST 기록: 1점 (23:59까지)

## 🚀 시작하기

### 1. 로컬 실행
```bash
# 프로젝트 클론
git clone [your-repository-url]
cd rocket2

# 간단한 HTTP 서버 실행 (Python 3)
python -m http.server 8000

# 또는 Node.js 사용
npx http-server
```

### 2. 브라우저에서 접속
```
http://localhost:8000
```

## 🔐 로그인 정보

### 관리자 계정
- **ID**: `mnj510`
- **비밀번호**: `asdf6014!!`

### 테스트 멤버 계정
- **김철수**: `WAKE001`
- **이영희**: `WAKE002`
- **박민수**: `WAKE003`

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Custom CSS with modern design
- **Icons**: Lucide Icons
- **Responsive**: Mobile-first design
- **Storage**: Local Storage (개발용)

## 📱 반응형 디자인

- 모바일, 태블릿, 데스크톱 최적화
- 터치 친화적 인터페이스
- 직관적인 네비게이션

## 🔄 데이터 관리

현재는 브라우저 로컬 스토리지를 사용하지만, 실제 운영 시에는 Supabase와 같은 데이터베이스 연동을 권장합니다.

## 🚀 배포 가이드

### GitHub Pages 배포
1. GitHub 저장소 생성
2. 코드 푸시
3. Settings > Pages에서 배포 설정
4. `main` 브랜치에서 배포

### Supabase 연동 (권장)
1. Supabase 프로젝트 생성
2. 데이터베이스 스키마 설정
3. API 키 환경변수 설정
4. 데이터베이스 연동 코드 구현

## 📁 프로젝트 구조

```
rocket2/
├── index.html          # 메인 HTML 파일
├── styles.css          # 스타일시트
├── script.js           # JavaScript 로직
├── README.md           # 프로젝트 문서
└── .gitignore          # Git 무시 파일
```

## 🎨 커스터마이징

### 색상 테마 변경
`styles.css`에서 CSS 변수를 수정하여 색상 테마를 변경할 수 있습니다:

```css
:root {
    --primary-color: #1976d2;
    --secondary-color: #42a5f5;
    --success-color: #4caf50;
    --warning-color: #f57c00;
    --danger-color: #d32f2f;
}
```

### 멤버 추가
`script.js`의 `members` 배열에 새 멤버를 추가할 수 있습니다:

```javascript
let members = [
    { id: 'mnj510', name: '관리자', code: 'mnj510', isAdmin: true },
    { id: 'member1', name: '김철수', code: 'WAKE001' },
    // 새 멤버 추가
    { id: 'member4', name: '새멤버', code: 'WAKE004' }
];
```

## 🐛 문제 해결

### 일반적인 문제들

1. **아이콘이 표시되지 않는 경우**
   - 인터넷 연결 확인
   - Lucide CDN 접근 가능 여부 확인

2. **로그인이 안 되는 경우**
   - 멤버 코드 정확성 확인
   - 관리자 계정 정보 확인

3. **기상 체크가 안 되는 경우**
   - 현재 시간이 00:00-04:59 사이인지 확인
   - 이미 체크했는지 확인

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면:
- GitHub Issues 생성
- 이메일: [your-email@example.com]

---

**기상 체크 앱으로 건강한 생활 습관을 만들어보세요! 🌅✨**
