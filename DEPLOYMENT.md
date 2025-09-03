# 🚀 GitHub Pages 배포 가이드

기상 체크 앱을 GitHub Pages를 통해 무료로 배포하는 방법을 안내합니다.

## 📋 사전 준비

1. **GitHub 계정**이 필요합니다
2. **Git**이 로컬에 설치되어 있어야 합니다
3. **웹 브라우저** (Chrome, Firefox, Safari 등)

## 🔧 단계별 배포 과정

### 1단계: GitHub 저장소 생성

1. [GitHub.com](https://github.com)에 로그인
2. 우측 상단의 **"+"** 버튼 클릭 → **"New repository"** 선택
3. 저장소 설정:
   - **Repository name**: `wake-up-check-app` (또는 원하는 이름)
   - **Description**: `기상 체크 앱 - 동기부여를 위한 웹 애플리케이션`
   - **Public** 선택 (GitHub Pages는 Public 저장소에서만 무료)
   - **Add a README file** 체크 해제 (이미 있음)
   - **Add .gitignore** 체크 해제 (이미 있음)
   - **Choose a license** 선택 (MIT 권장)
4. **"Create repository"** 클릭

### 2단계: 로컬 저장소와 GitHub 연결

```bash
# GitHub 저장소를 원격 저장소로 추가
git remote add origin https://github.com/[사용자명]/[저장소명].git

# 예시:
git remote add origin https://github.com/yourusername/wake-up-check-app.git

# 연결 확인
git remote -v
```

### 3단계: 코드 푸시

```bash
# GitHub에 코드 푸시
git push -u origin main

# 이후 변경사항이 있을 때마다
git add .
git commit -m "업데이트 내용 설명"
git push
```

### 4단계: GitHub Pages 활성화

1. GitHub 저장소 페이지에서 **"Settings"** 탭 클릭
2. 왼쪽 메뉴에서 **"Pages"** 클릭
3. **"Source"** 섹션에서:
   - **"Deploy from a branch"** 선택
   - **"Branch"**: `main` 선택
   - **"Folder"**: `/ (root)` 선택
4. **"Save"** 클릭

### 5단계: 배포 확인

- 배포가 완료되면 **"Your site is live at"** 메시지와 함께 사이트 URL이 표시됩니다
- 일반적으로 `https://[사용자명].github.io/[저장소명]` 형태입니다
- 배포에는 몇 분 정도 소요될 수 있습니다

## 🌐 커스텀 도메인 설정 (선택사항)

### 도메인이 있는 경우:

1. **Settings > Pages**에서 **"Custom domain"** 입력
2. 도메인 입력 (예: `wakeup.yourdomain.com`)
3. **"Save"** 클릭
4. DNS 설정에서 CNAME 레코드 추가:
   ```
   wakeup.yourdomain.com CNAME [사용자명].github.io
   ```

## 🔄 자동 배포

GitHub Pages는 자동으로 배포됩니다:
- `main` 브랜치에 푸시할 때마다 자동 배포
- 배포 상태는 **"Actions"** 탭에서 확인 가능

## 📱 모바일 최적화

현재 앱은 이미 모바일 최적화되어 있습니다:
- 반응형 디자인
- 터치 친화적 인터페이스
- 모바일 브라우저 호환성

## 🐛 문제 해결

### 일반적인 문제들:

1. **404 에러**
   - 저장소가 Public인지 확인
   - GitHub Pages가 활성화되었는지 확인
   - 배포 완료까지 기다리기

2. **스타일이 적용되지 않음**
   - CSS 파일 경로 확인
   - 브라우저 캐시 삭제

3. **JavaScript 오류**
   - 브라우저 개발자 도구에서 콘솔 확인
   - 파일 경로 확인

### 배포 상태 확인:

```bash
# 로컬에서 테스트
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속

# GitHub Pages 상태 확인
# 저장소 > Settings > Pages에서 확인
```

## 🔒 보안 고려사항

- **Public 저장소**: 코드가 공개되므로 민감한 정보는 포함하지 마세요
- **API 키**: 환경변수나 별도 설정 파일 사용
- **사용자 데이터**: 실제 운영 시 Supabase 등 외부 데이터베이스 사용 권장

## 📈 성능 최적화

- 이미지 최적화
- CSS/JS 압축
- CDN 사용 (현재 Lucide Icons는 CDN 사용 중)

## 🎯 다음 단계

배포 완료 후 고려할 사항:

1. **Supabase 연동**: 데이터베이스 기능 추가
2. **사용자 인증**: 더 안전한 로그인 시스템
3. **알림 기능**: 푸시 알림 또는 이메일 알림
4. **모바일 앱**: PWA 또는 네이티브 앱 개발

## 📞 지원

문제가 발생하면:
1. GitHub Issues 생성
2. README.md의 문제 해결 섹션 참조
3. 브라우저 개발자 도구에서 오류 확인

---

**🎉 축하합니다! 이제 기상 체크 앱이 인터넷에 배포되었습니다!**
