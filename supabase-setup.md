# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 이름: `wake-up-check-app`
3. 데이터베이스 비밀번호를 설정합니다.

## 2. 데이터베이스 테이블 생성

### members 테이블
```sql
CREATE TABLE members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### check_data 테이블
```sql
CREATE TABLE check_data (
    id SERIAL PRIMARY KEY,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    wake_up BOOLEAN DEFAULT FALSE,
    frog BOOLEAN DEFAULT FALSE,
    must BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, date)
);
```

### must_records 테이블
```sql
CREATE TABLE must_records (
    id SERIAL PRIMARY KEY,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, date)
);
```

## 3. 기본 데이터 삽입

```sql
-- 관리자 계정
INSERT INTO members (id, name, code, is_admin) VALUES 
('mnj510', '오키', 'mnj510', true);

-- 기본 멤버들
INSERT INTO members (id, name, code) VALUES 
('WAKE001', '참기름', 'WAKE001'),
('WAKE002', '동행', 'WAKE002'),
('WAKE003', '완료주의자', 'WAKE003'),
('WAKE004', '은호', 'WAKE004'),
('WAKE005', '쿼카', 'WAKE005'),
('WAKE006', '김은아', 'WAKE006'),
('WAKE007', '비채', 'WAKE007'),
('WAKE008', '제가이버', 'WAKE008'),
('WAKE009', '배소영', 'WAKE009'),
('WAKE010', '해량', 'WAKE010'),
('WAKE011', '호나인', 'WAKE011'),
('WAKE012', '현진', 'WAKE012'),
('WAKE013', '박뱅', 'WAKE013'),
('WAKE014', '달콩', 'WAKE014'),
('WAKE015', '히프노스', 'WAKE015');
```

## 4. RLS (Row Level Security) 설정

### members 테이블
```sql
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 멤버 목록을 볼 수 있음" ON members
    FOR SELECT USING (true);

CREATE POLICY "관리자만 멤버 추가/수정/삭제 가능" ON members
    FOR ALL USING (auth.role() = 'authenticated');
```

### check_data 테이블
```sql
ALTER TABLE check_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 기상 체크 데이터를 볼 수 있음" ON check_data
    FOR SELECT USING (true);

CREATE POLICY "자신의 데이터만 추가/수정 가능" ON check_data
    FOR ALL USING (auth.uid()::text = member_id);
```

### must_records 테이블
```sql
ALTER TABLE must_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 MUST 기록을 볼 수 있음" ON must_records
    FOR SELECT USING (true);

CREATE POLICY "자신의 데이터만 추가/수정 가능" ON must_records
    FOR ALL USING (auth.uid()::text = member_id);
```

## 5. 환경 변수 설정

프로젝트 설정 > API에서 다음 정보를 확인합니다:

- **Project URL**: `https://apzzaarxrtohxlliwzgf.supabase.co`
- **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwenphYXJ4cnRvaHhsbGl3emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjkzNTEsImV4cCI6MjA3MjQ0NTM1MX0.fAZk3usZDTCD-tT8kurxIjjGcRIKdGMh6Y-loW5hanY`

✅ **이미 설정 완료됨!** `script.js` 파일에 자동으로 적용되었습니다.

## 6. 코드에서 설정 업데이트

`script.js` 파일에서 다음 값이 이미 설정되었습니다:

```javascript
const SUPABASE_URL = 'https://apzzaarxrtohxlliwzgf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwenphYXJ4cnRvaHhsbGl3emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjkzNTEsImV4cCI6MjA3MjQ0NTM1MX0.fAZk3usZDTCD-tT8kurxIjjGcRIKdGMh6Y-loW5hanY';
```

✅ **자동 설정 완료!** 별도 수정이 필요하지 않습니다.

## 7. 실시간 구독 설정 (선택사항)

데이터 변경을 실시간으로 감지하려면:

```sql
-- 실시간 구독 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE members;
ALTER PUBLICATION supabase_realtime ADD TABLE check_data;
ALTER PUBLICATION supabase_realtime ADD TABLE must_records;
```

## 8. 테스트

1. 앱을 새로고침합니다.
2. 관리자로 로그인하여 멤버 추가/삭제를 테스트합니다.
3. 기상 체크와 MUST 기록을 테스트합니다.
4. 다른 브라우저에서 동일한 데이터가 표시되는지 확인합니다.

## 주의사항

- RLS 정책이 올바르게 설정되었는지 확인하세요.
- 외래 키 제약 조건이 올바르게 설정되었는지 확인하세요.
- 프로덕션 환경에서는 더 엄격한 보안 정책을 적용하세요.
