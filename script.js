        // Supabase 설정
        const SUPABASE_URL = 'https://apzzaarxrtohxlliwzgf.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwenphYXJ4cnRvaHhsbGl3emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NjkzNTEsImV4cCI6MjA3MjQ0NTM1MX0.fAZk3usZDTCD-tT8kurxIjjGcRIKdGMh6Y-loW5hanY';
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 앱 상태
let currentUser = null;
let currentPage = 'dashboard';
let members = [];
let checkData = {};
let mustRecords = {};

        // 초기화
        document.addEventListener('DOMContentLoaded', async function() {
            // Supabase에서 데이터 로드
            await loadDataFromSupabase();
            
            // lucide 라이브러리가 로드될 때까지 대기
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            } else {
                // lucide가 로드되지 않은 경우 재시도
                setTimeout(() => {
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }, 1000);
            }
            
            updateClock();
            
            // 시계를 100ms마다 업데이트하여 부드러운 카운터 효과
            setInterval(updateClock, 100);
            
            // 2025년 9월부터 시작하도록 설정
            document.getElementById('yearSelect').value = '2025';
            document.getElementById('monthSelect').value = '9';
            
            // 날짜 제목 업데이트
            updateDateTitles();
        });

        // 시계 업데이트
        function updateClock() {
            const now = new Date();
            
            // 시간을 HH:MM:SS 형태로 포맷팅
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const milliseconds = Math.floor(now.getMilliseconds() / 100);
            const timeStr = `${hours}:${minutes}:${seconds}.${milliseconds}`;
            
            // 날짜를 한국어로 포맷팅
            const dateStr = now.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            });
            
            const timeElement = document.getElementById('currentTime');
            const dateElement = document.getElementById('currentDate');
            
            if (timeElement) {
                timeElement.textContent = timeStr;
                
                // 밀리초 단위로 부드러운 깜빡임 효과
                const opacity = 0.9 + (milliseconds * 0.1);
                timeElement.style.opacity = opacity;
                
                // 초가 바뀔 때마다 강조 효과
                if (seconds !== lastSeconds) {
                    timeElement.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        if (timeElement) {
                            timeElement.style.transform = 'scale(1)';
                        }
                    }, 150);
                    lastSeconds = seconds;
                }
            }
            
            if (dateElement) dateElement.textContent = dateStr;
            
            // 기상 체크 가능 시간 확인 (1초마다만)
            if (seconds !== lastCheckSeconds) {
                updateWakeUpButton();
                lastCheckSeconds = seconds;
            }
        }

        // 마지막 업데이트된 초와 체크 시간을 추적
        let lastSeconds = -1;
        let lastCheckSeconds = -1;

// 기상 체크 버튼 상태 업데이트
function updateWakeUpButton() {
    if (!currentUser || currentPage !== 'check') return;
    
    const now = new Date();
    const hours = now.getHours();
    const canCheck = hours >= 0 && hours < 5;
    const today = now.toDateString();
    const todayData = checkData[currentUser.id]?.[today] || {};
    
    const wakeUpBtn = document.getElementById('wakeUpBtn');
    const frogBtn = document.getElementById('frogBtn');
    
    // 기상 체크 버튼
    if (todayData.wakeUp) {
        wakeUpBtn.textContent = '이미 체크 완료';
        wakeUpBtn.disabled = true;
    } else if (canCheck) {
        wakeUpBtn.textContent = '기상 완료!';
        wakeUpBtn.disabled = false;
    } else {
        wakeUpBtn.textContent = '체크 가능 시간이 아닙니다';
        wakeUpBtn.disabled = true;
    }
    
    // 개구리 잡기 버튼
    if (todayData.frog) {
        frogBtn.textContent = '이미 체크 완료';
        frogBtn.disabled = true;
    } else if (todayData.wakeUp) {
        frogBtn.textContent = '개구리 잡기!';
        frogBtn.disabled = false;
    } else {
        frogBtn.textContent = '기상 체크를 먼저 해주세요';
        frogBtn.disabled = true;
    }
    
    // 기록 상태 업데이트
    updateTodayRecords();
}

// 오늘의 기록 상태 업데이트
function updateTodayRecords() {
    if (!currentUser) return;
    
    const today = new Date().toDateString();
    const todayData = checkData[currentUser.id]?.[today] || {};
    const todayMust = mustRecords[currentUser.id]?.[today];
    
    // 기상 체크
    const wakeUpRecord = document.getElementById('wakeUpRecord');
    const wakeUpStatus = document.getElementById('wakeUpStatus');
    if (todayData.wakeUp) {
        wakeUpRecord.classList.add('completed');
        wakeUpStatus.textContent = `완료 (${todayData.wakeUpTime})`;
    } else {
        wakeUpRecord.classList.remove('completed');
        wakeUpStatus.textContent = '미완료';
    }
    
    // 개구리 잡기
    const frogRecord = document.getElementById('frogRecord');
    const frogStatus = document.getElementById('frogStatus');
    if (todayData.frog) {
        frogRecord.classList.add('completed');
        frogStatus.textContent = '완료';
    } else {
        frogRecord.classList.remove('completed');
        frogStatus.textContent = '미완료';
    }
    
    // MUST 기록
    const mustRecord = document.getElementById('mustRecord');
    if (todayMust) {
        mustRecord.classList.add('completed');
    } else {
        mustRecord.classList.remove('completed');
    }
}

// 날짜 제목 업데이트
function updateDateTitles() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayTitle = document.getElementById('todayTitle');
    const yesterdayTitle = document.getElementById('yesterdayTitle');
    
    if (todayTitle) {
        todayTitle.textContent = `오늘 (${today.getMonth() + 1}/${today.getDate()})`;
    }
    if (yesterdayTitle) {
        yesterdayTitle.textContent = `어제 (${yesterday.getMonth() + 1}/${yesterday.getDate()})`;
    }
}

        // 로그인 타입 선택
        function selectLoginType(type) {
            const memberForm = document.getElementById('memberLoginForm');
            const adminForm = document.getElementById('adminLoginForm');
            const memberBtn = document.querySelector('.login-type-btn:first-child');
            const adminBtn = document.querySelector('.login-type-btn:last-child');
            
            // 모든 버튼 비활성화
            memberBtn.classList.remove('active');
            adminBtn.classList.remove('active');
            
            // 모든 폼 숨기기
            memberForm.classList.add('hidden');
            adminForm.classList.add('hidden');
            
            if (type === 'member') {
                memberBtn.classList.add('active');
                memberForm.classList.remove('hidden');
            } else if (type === 'admin') {
                adminBtn.classList.add('active');
                adminForm.classList.remove('hidden');
            }
        }

        // 멤버 로그인 처리
        function handleMemberLogin() {
            const memberCode = document.getElementById('memberCode').value.trim();
            
            if (!memberCode) {
                alert('멤버 코드를 입력해주세요.');
                return;
            }
            
            const member = members.find(m => m.code === memberCode);
            if (member) {
                currentUser = member;
                loginSuccess();
            } else {
                alert('올바른 멤버 코드를 입력해주세요.');
                return;
            }
        }

        // 관리자 로그인 처리
        function handleAdminLogin() {
            const adminId = document.getElementById('adminId').value.trim();
            const adminPassword = document.getElementById('adminPassword').value;
            
            if (!adminId || !adminPassword) {
                alert('관리자 ID와 비밀번호를 모두 입력해주세요.');
                return;
            }
            
            if (adminId === 'mnj510' && adminPassword === 'asdf6014!!') {
                currentUser = members.find(m => m.id === 'mnj510');
                
                if (!currentUser) {
                    alert('관리자 계정이 등록되어 있지 않습니다. Supabase의 members 테이블에 관리자 계정을 추가해 주세요.');
                    return;
                }
                
                console.log('관리자 로그인 성공:', currentUser);
                console.log('isAdmin 값:', currentUser.isAdmin);
                
                loginSuccess();
            } else {
                alert('올바른 관리자 정보를 입력해주세요.');
                return;
            }
        }

        // 로그인 성공 공통 처리
        function loginSuccess() {
            // 로그인 성공
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appScreen').style.display = 'block';
            
            console.log('로그인 성공 함수 실행');
            console.log('currentUser:', currentUser);
            console.log('currentUser.isAdmin:', currentUser.isAdmin);
            console.log('typeof currentUser.isAdmin:', typeof currentUser.isAdmin);
            
            // 관리자 여부에 따른 UI 설정
            if (currentUser.isAdmin === true) {
                console.log('관리자로 인식됨 - UI 설정 중...');
                document.getElementById('userInfo').textContent = '관리자';
                document.getElementById('adminTab').classList.remove('hidden');
                
                // 관리자용 컨트롤 표시
                document.getElementById('adminMemberSelect').classList.remove('hidden');
                document.getElementById('adminMustMemberSelect').classList.remove('hidden');
                
                // 관리자용 체크 버튼 표시
                document.getElementById('userCheckButtons').classList.add('hidden');
                document.getElementById('adminCheckButtons').classList.remove('hidden');
                
                // 멤버 선택 드롭다운 초기화
                updateMemberSelects();
            } else {
                console.log('일반 사용자로 인식됨 - UI 설정 중...');
                document.getElementById('userInfo').textContent = `${currentUser.name}님 환영합니다`;
                document.getElementById('adminTab').classList.add('hidden');
                
                // 관리자용 컨트롤 숨김
                document.getElementById('adminMemberSelect').classList.add('hidden');
                document.getElementById('adminMustMemberSelect').classList.add('hidden');
                
                // 일반 사용자용 체크 버튼 표시
                document.getElementById('userCheckButtons').classList.remove('hidden');
                document.getElementById('adminCheckButtons').classList.add('hidden');
            }
            
            // 대시보드 초기화 (약간의 지연 후)
            setTimeout(() => {
                updateDashboard();
            }, 100);
            
            // MUST 페이지 초기화
            updateMustPage();
        }

        // 로그아웃
        function handleLogout() {
            currentUser = null;
            currentPage = 'dashboard';
            
            document.getElementById('appScreen').style.display = 'none';
            document.getElementById('loginScreen').style.display = 'block';
            document.getElementById('adminTab').classList.add('hidden');
            
            // 폼 초기화
            document.getElementById('memberCode').value = '';
            document.getElementById('adminId').value = '';
            document.getElementById('adminPassword').value = '';
            
            // 멤버 로그인 폼으로 초기화
            selectLoginType('member');
        }

// 페이지 전환
function showPage(pageName) {
    // 모든 페이지 숨기기
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    
    // 모든 탭 비활성화
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 선택된 페이지 표시
    document.getElementById(pageName + 'Page').classList.remove('hidden');
    
    // 선택된 탭 활성화
    event.target.closest('.nav-tab').classList.add('active');
    
    currentPage = pageName;
    
                // 페이지별 초기화
            if (pageName === 'dashboard') {
                setTimeout(() => {
                    updateDashboard();
                }, 100);
            } else if (pageName === 'check') {
                updateWakeUpButton();
            } else if (pageName === 'must') {
                updateMustPage();
            } else if (pageName === 'admin') {
                updateAdminPage();
            }
}

        // 대시보드 업데이트
        function updateDashboard() {
            updateStats();
            updatePersonalCalendar();
            updateMemberCalendarGrid();
            updateRanking();
        }

        // 통계 업데이트
        function updateStats() {
            const statsGrid = document.getElementById('statsGrid');
            const today = new Date();
            const selectedYear = parseInt(document.getElementById('yearSelect').value);
            const selectedMonth = parseInt(document.getElementById('monthSelect').value);
            
            let statsHTML = '';
            
            // 이번 달 카드
            statsHTML += `
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-icon blue">
                            <i data-lucide="calendar"></i>
                        </div>
                        <div class="stat-info">
                            <h3>이번 달</h3>
                            <p>${selectedMonth}월</p>
                        </div>
                    </div>
                </div>
            `;
    
                if (currentUser.isAdmin) {
                // 관리자용 통계
                const allStats = getAllStats(selectedMonth, selectedYear);
                
                statsHTML += `
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-icon green">
                                <i data-lucide="users"></i>
                            </div>
                            <div class="stat-info">
                                <h3>전체 멤버</h3>
                                <p>${allStats.totalMembers}명</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-icon blue">
                                <i data-lucide="check-circle"></i>
                            </div>
                            <div class="stat-info">
                                <h3>전체 기상률</h3>
                                <p>${allStats.totalWakeUpRate}%</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-icon yellow">
                                <i data-lucide="trophy"></i>
                            </div>
                            <div class="stat-info">
                                <h3>전체 점수</h3>
                                <p>${allStats.totalScore}점</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // 멤버용 통계
                const memberStats = getMemberStats(currentUser.id, selectedMonth, selectedYear);
                
                statsHTML += `
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-icon blue">
                                <i data-lucide="check-circle"></i>
                            </div>
                            <div class="stat-info">
                                <h3>기상 완료</h3>
                                <p>${memberStats.wakeUpSuccess}일</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-icon red">
                                <i data-lucide="x-circle"></i>
                            </div>
                            <div class="stat-info">
                                <h3>기상 실패</h3>
                                <p>${memberStats.wakeUpFailure}일</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-content">
                            <div class="stat-icon yellow">
                                <i data-lucide="trophy"></i>
                            </div>
                            <div class="stat-info">
                                <h3>총 점수</h3>
                                <p>${memberStats.totalScore}점</p>
                            </div>
                        </div>
                    </div>
                `;
            }
    
                statsGrid.innerHTML = statsHTML;
            // lucide 아이콘 안전하게 생성
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
}

        // 개별 멤버 통계 계산
        function getMemberStats(memberId, month, year) {
            const memberCheckData = checkData[memberId] || {};
            let wakeUpSuccess = 0;
            let wakeUpFailure = 0;
            let totalDays = 0;
            
            // 해당 월의 실제 날짜 수 계산
            const daysInMonth = new Date(year, month, 0).getDate();
            const today = new Date();
            
            // 해당 월의 모든 날짜 확인
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month - 1, day);
                
                // 미래 날짜는 제외
                if (date > today) break;
                
                totalDays++;
                const dateStr = date.toDateString();
                if (memberCheckData[dateStr]?.wakeUp) {
                    wakeUpSuccess++;
                } else {
                    wakeUpFailure++;
                }
            }
            
            return {
                wakeUpSuccess,
                wakeUpFailure,
                wakeUpRate: totalDays > 0 ? Math.round((wakeUpSuccess / totalDays) * 100) : 0,
                totalScore: calculateScore(memberId, month, year)
            };
        }

// 전체 통계 계산 (관리자용)
function getAllStats(month, year) {
    let totalWakeUp = 0;
    let totalScore = 0;
    const regularMembers = members.filter(m => !m.isAdmin);
    
    regularMembers.forEach(member => {
        const stats = getMemberStats(member.id, month, year);
        totalWakeUp += stats.wakeUpSuccess;
        totalScore += stats.totalScore;
    });
    
    // 전체 가능한 날짜 수 계산
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    let totalDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        
        // 미래 날짜는 제외
        if (date > today) break;
        
        totalDays++;
    }
    
    const totalPossibleWakeUps = totalDays * regularMembers.length;
    
    return {
        totalMembers: regularMembers.length,
        totalWakeUp,
        totalWakeUpRate: totalPossibleWakeUps > 0 ? Math.round((totalWakeUp / totalPossibleWakeUps) * 100) : 0,
        totalScore
    };
}

// 점수 계산
function calculateScore(memberId, month, year) {
    let score = 0;
    const memberCheckData = checkData[memberId] || {};
    const memberMustData = mustRecords[memberId] || {};
    
    // 해당 월의 실제 날짜 수 계산
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    
    // 체크 데이터에서 점수 계산
    Object.keys(memberCheckData).forEach(date => {
        const dateObj = new Date(date);
        if (dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year) {
            const dayData = memberCheckData[date];
            
            // 미래 날짜는 제외
            if (dateObj > today) return;
            
            if (dayData.wakeUp) score += 1;
            if (dayData.frog) score += 1;
        }
    });
    
    // MUST 기록에서 점수 계산 (20:00~23:59 작성만 1점)
    Object.keys(memberMustData).forEach(date => {
        const dateObj = new Date(date);
        if (dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year) {
            // 미래 날짜는 제외
            if (dateObj > today) return;
            const record = memberMustData[date];
            if (record && typeof record === 'object') {
                if (record.timestamp) {
                    const ts = new Date(record.timestamp);
                    if (isWithinMustScoringWindow(ts)) {
                        score += 1;
                    }
                } else {
                    // 과거(타임스탬프 없는) 데이터는 호환성 위해 1점 처리
                    score += 1;
                }
            } else if (record) {
                // 문자열 등 구형 포맷도 1점 처리
                score += 1;
            }
        }
    });
    
    console.log(`[점수 계산] ${memberId}의 ${year}년 ${month}월 점수: ${score}점`);
    console.log(`[점수 상세] 기상: ${Object.keys(memberCheckData).filter(date => {
        const dateObj = new Date(date);
        return dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year && dateObj <= today;
    }).filter(date => memberCheckData[date]?.wakeUp).length}일, 개구리: ${Object.keys(memberCheckData).filter(date => {
        const dateObj = new Date(date);
        return dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year && dateObj <= today;
    }).filter(date => memberCheckData[date]?.frog).length}일, MUST: ${Object.keys(memberMustData).filter(date => {
        const dateObj = new Date(date);
        return dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year && dateObj <= today;
    }).filter(date => {
        const r = memberMustData[date];
        if (r?.timestamp) return isWithinMustScoringWindow(new Date(r.timestamp));
        return true; // 구형 데이터 호환
    }).length}일`);
    
    return score;
}

        // 개인 달력 업데이트
        function updatePersonalCalendar() {
            if (!currentUser) return;
            
            const personalCalendar = document.getElementById('personalCalendar');
            if (!personalCalendar) return;
            
            const selectedYear = parseInt(document.getElementById('yearSelect').value);
            const selectedMonth = parseInt(document.getElementById('monthSelect').value);
            
            // 관리자인 경우 선택된 멤버의 달력 표시
            let targetMemberId = currentUser.id;
            let targetMemberName = currentUser.name;
            
            if (currentUser.isAdmin) {
                const selectedMember = document.getElementById('checkMemberSelect')?.value;
                if (selectedMember) {
                    targetMemberId = selectedMember;
                    const member = members.find(m => m.id === selectedMember);
                    targetMemberName = member ? member.name : '선택된 멤버';
                } else {
                    // 멤버가 선택되지 않은 경우 기본 메시지
                    personalCalendar.innerHTML = '<div class="calendar-summary"><p>멤버를 선택하면 해당 멤버의 기상 현황을 볼 수 있습니다.</p></div>';
                    return;
                }
            }
            
            // 해당 월의 실제 날짜 수 계산
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            
            // 고정 폭 칼럼 템플릿(셀 크기와 동일) 생성
            const cellSize = 36; // styles.css --cell-size와 동일 값(px)
            const columnsTemplate = `80px repeat(${daysInMonth}, ${cellSize}px)`;
            
            let calendarHTML = `<div class="calendar-header" style="grid-template-columns: ${columnsTemplate};">`;
            
            // 요일 헤더
            calendarHTML += '<div class="member-name">날짜</div>';
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(selectedYear, selectedMonth - 1, day);
                const dayOfWeek = date.getDay();
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const dayName = dayNames[dayOfWeek];
                
                calendarHTML += `
                    <div class="date-header">
                        <div class="day-name">${dayName}</div>
                        <div class="date-number">${day}</div>
                    </div>
                `;
            }
            calendarHTML += '</div>';
            
            // 개인 기상 현황
            calendarHTML += `<div class="calendar-row" style="grid-template-columns: ${columnsTemplate};">`;
            calendarHTML += `<div class="member-name">${targetMemberName}</div>`;
            
            let successCount = 0;
            let failureCount = 0;
            
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(selectedYear, selectedMonth - 1, day);
                const dateStr = date.toDateString();
                const dayData = checkData[targetMemberId]?.[dateStr];
                const today = new Date();
                
                let cellClass = '';
                let cellContent = '';
                
                // 미래 날짜는 빈칸으로 표시
                if (date > today) {
                    cellClass = 'future';
                    cellContent = '';
                } else if (dayData?.wakeUp) {
                    // 기상 성공 (파란색)
                    cellClass = 'success';
                    cellContent = '';
                    successCount++;
                } else {
                    // 기상 실패 (빨간색)
                    cellClass = 'failure';
                    cellContent = '';
                    failureCount++;
                }
                
                calendarHTML += `<div class="calendar-cell ${cellClass}">${cellContent}</div>`;
            }
            calendarHTML += '</div>';
            
            // 요약 정보 추가
            calendarHTML += `
                <div class="calendar-summary">
                    <p>이번 달 ${targetMemberName}의 기상 완료: <strong>${successCount}회</strong> / 실패: <strong>${failureCount}회</strong></p>
                </div>
            `;
            
            personalCalendar.innerHTML = calendarHTML;
        }

        // Supabase에서 데이터 로드
        async function loadDataFromSupabase() {
            try {
                console.log('Supabase 데이터 로드 시작...');
                
                // 멤버 목록 로드
                const { data: membersData, error: membersError } = await supabase
                    .from('members')
                    .select('*')
                    .order('name');
                
                if (membersError) {
                    console.warn('멤버 데이터 로드 실패, 기본 데이터 사용:', membersError);
                    initializeDefaultData();
                } else {
                    // Supabase 데이터를 로컬 형식으로 변환
                    members = (membersData || []).map(member => ({
                        id: member.id,
                        name: member.name,
                        code: member.code,
                        isAdmin: member.is_admin || member.isAdmin || false
                    }));
                    console.log('멤버 데이터 로드 완료:', members.length + '명');
                    console.log('관리자 계정 확인:', members.find(m => m.id === 'mnj510'));
                }
                
                // 기본 데이터가 없으면 초기화
                if (members.length === 0) {
                    console.log('기본 멤버 데이터 초기화');
                    initializeDefaultData();
                }
                
                // 기상 체크 데이터 로드
                try {
                    const { data: checkDataResult, error: checkError } = await supabase
                        .from('check_data')
                        .select('*');
                    
                    if (checkError) {
                        console.warn('기상 체크 데이터 로드 실패:', checkError);
                        checkData = {};
                    } else {
                        // 데이터를 객체 형태로 변환
                        checkData = {};
                        checkDataResult?.forEach(record => {
                            if (!checkData[record.member_id]) {
                                checkData[record.member_id] = {};
                            }
                            checkData[record.member_id][record.date] = {
                                wakeUp: record.wake_up,
                                frog: record.frog,
                                must: record.must
                            };
                        });
                        console.log('기상 체크 데이터 로드 완료');
                    }
                } catch (error) {
                    console.warn('기상 체크 데이터 로드 중 오류:', error);
                    checkData = {};
                }
                
                // MUST 기록 데이터 로드
                try {
                    const { data: mustDataResult, error: mustError } = await supabase
                        .from('must_records')
                        .select('*');
                    
                    if (mustError) {
                        console.warn('MUST 기록 데이터 로드 실패:', mustError);
                        mustRecords = {};
                    } else {
                        // 데이터를 객체 형태로 변환
                        mustRecords = {};
                        mustDataResult?.forEach(record => {
                            if (!mustRecords[record.member_id]) {
                                mustRecords[record.member_id] = {};
                            }
                            try {
                                mustRecords[record.member_id][record.date] = 
                                    typeof record.content === 'string' 
                                        ? JSON.parse(record.content) 
                                        : record.content;
                            } catch (parseError) {
                                console.warn('MUST 기록 파싱 오류:', parseError);
                                mustRecords[record.member_id][record.date] = record.content;
                            }
                        });
                        console.log('MUST 기록 데이터 로드 완료');
                    }
                } catch (error) {
                    console.warn('MUST 기록 데이터 로드 중 오류:', error);
                    mustRecords = {};
                }
                
                console.log('Supabase에서 데이터 로드 완료');
                
            } catch (error) {
                console.error('Supabase 데이터 로드 중 치명적 오류:', error);
                // 기본 데이터로 초기화
                initializeDefaultData();
                checkData = {};
                mustRecords = {};
            }
        }

        // 기본 데이터 초기화
        function initializeDefaultData() {
            members = [
                { id: 'mnj510', name: '오키', code: 'mnj510', isAdmin: true },
                { id: 'WAKE001', name: '참기름', code: 'WAKE001', isAdmin: false },
                { id: 'WAKE002', name: '동행', code: 'WAKE002', isAdmin: false },
                { id: 'WAKE003', name: '완료주의자', code: 'WAKE003', isAdmin: false },
                { id: 'WAKE004', name: '은호', code: 'WAKE004', isAdmin: false },
                { id: 'WAKE005', name: '쿼카', code: 'WAKE005', isAdmin: false },
                { id: 'WAKE006', name: '김은아', code: 'WAKE006', isAdmin: false },
                { id: 'WAKE007', name: '비채', code: 'WAKE007', isAdmin: false },
                { id: 'WAKE008', name: '제가이버', code: 'WAKE008', isAdmin: false },
                { id: 'WAKE009', name: '배소영', code: 'WAKE009', isAdmin: false },
                { id: 'WAKE010', name: '해량', code: 'WAKE010', isAdmin: false },
                { id: 'WAKE011', name: '호나인', code: 'WAKE011', isAdmin: false },
                { id: 'WAKE012', name: '현진', code: 'WAKE012', isAdmin: false },
                { id: 'WAKE013', name: '박뱅', code: 'WAKE013', isAdmin: false },
                { id: 'WAKE014', name: '달콩', code: 'WAKE014', isAdmin: false },
                { id: 'WAKE015', name: '히프노스', code: 'WAKE015', isAdmin: false }
            ];
            
            console.log('기본 데이터 초기화 완료');
            console.log('관리자 계정:', members.find(m => m.id === 'mnj510'));
            console.log('관리자 isAdmin 값:', members.find(m => m.id === 'mnj510')?.isAdmin);
        }

        // 멤버 선택 드롭다운 업데이트
        function updateMemberSelects() {
            const checkMemberSelect = document.getElementById('checkMemberSelect');
            const mustMemberSelect = document.getElementById('mustMemberSelect');
            const existingMemberSelect = document.getElementById('existingMemberSelect');
            const checkDateSelect = document.getElementById('checkDateSelect');
            
            if (checkMemberSelect) {
                checkMemberSelect.innerHTML = '<option value="">멤버를 선택하세요</option>';
                members.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.id;
                    option.textContent = member.name;
                    checkMemberSelect.appendChild(option);
                });
                
                // 멤버 선택 변경 시 대시보드 업데이트
                checkMemberSelect.addEventListener('change', updateDashboard);
            }
            
            if (mustMemberSelect) {
                mustMemberSelect.innerHTML = '<option value="">멤버를 선택하세요</option>';
                members.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.id;
                    option.textContent = member.name;
                    mustMemberSelect.appendChild(option);
                });
            }
            
            if (existingMemberSelect) {
                existingMemberSelect.innerHTML = '<option value="">멤버를 선택하세요</option>';
                members.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.id;
                    option.textContent = member.name;
                    existingMemberSelect.appendChild(option);
                });
            }
            
            // 날짜 선택 필드 기본값을 오늘 날짜로 설정
            if (checkDateSelect) {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                checkDateSelect.value = `${year}-${month}-${day}`;
            }
        }

        // 멤버별 기상 현황 그리드 업데이트
        function updateMemberCalendarGrid() {
            const memberCalendarContainer = document.getElementById('memberCalendarContainer');
            const selectedYear = parseInt(document.getElementById('yearSelect').value);
            const selectedMonth = parseInt(document.getElementById('monthSelect').value);
            
            if (!memberCalendarContainer) return;
            
            // 해당 월의 실제 날짜 수 계산
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            
            // 고정 폭 칼럼 템플릿(셀 크기와 동일) 생성
            const cellSize = 36; // styles.css --cell-size와 동일 값(px)
            const columnsTemplate = `80px repeat(${daysInMonth}, ${cellSize}px)`;
            
            // 전체 그리드 HTML 생성 (헤더와 멤버 행을 하나의 컨테이너에)
            let fullGridHTML = '';
            
            // 헤더 행 생성
            fullGridHTML += `<div class="member-calendar-header" style="display: grid; grid-template-columns: ${columnsTemplate}; gap: 2px; margin-bottom: 1rem;">`;
            fullGridHTML += `<div class="member-name-header">멤버</div>`;
            
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(selectedYear, selectedMonth - 1, day);
                const dayOfWeek = date.getDay();
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const dayName = dayNames[dayOfWeek];
                
                fullGridHTML += `
                    <div class="date-header">
                        <div class="day-name">${dayName}</div>
                        <div class="date-number">${day}</div>
                    </div>
                `;
            }
            fullGridHTML += '</div>';
            
            // 멤버별 기상 현황 행 생성
            members.forEach(member => {
                fullGridHTML += `<div class="member-row" style="display: grid; grid-template-columns: ${columnsTemplate}; gap: 2px; margin-bottom: 0.5rem;">`;
                fullGridHTML += `<div class="member-name">${member.name}</div>`;
                
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(selectedYear, selectedMonth - 1, day);
                    const dateStr = date.toDateString();
                    const dayData = checkData[member.id]?.[dateStr];
                    const today = new Date();
                    
                    let cellClass = '';
                    let cellContent = '';
                    
                    if (date > today) {
                        cellClass = 'future';
                        cellContent = '';
                    } else if (dayData?.wakeUp) {
                        cellClass = 'success';
                        cellContent = '';
                    } else {
                        cellClass = 'failure';
                        cellContent = '';
                    }
                    
                    fullGridHTML += `<div class="calendar-cell ${cellClass}">${cellContent}</div>`;
                }
                
                fullGridHTML += '</div>';
            });
            
            memberCalendarContainer.innerHTML = fullGridHTML;
            
            // lucide 아이콘 안전하게 생성
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        // 순위 업데이트
        function updateRanking() {
            const rankingList = document.getElementById('rankingList');
            const selectedYear = parseInt(document.getElementById('yearSelect').value);
            const selectedMonth = parseInt(document.getElementById('monthSelect').value);
            
            // 멤버별 점수 계산 및 정렬
            const memberScores = members
                .filter(m => !m.isAdmin)
                .map(member => ({
                    ...member,
                    score: calculateScore(member.id, selectedMonth, selectedYear)
                }))
                .sort((a, b) => b.score - a.score);
            
            // 동일 점수 처리
            let currentRank = 1;
            let currentScore = -1;
            const rankedMembers = memberScores.map((member, index) => {
                if (member.score !== currentScore) {
                    currentRank = index + 1;
                    currentScore = member.score;
                }
                return { ...member, rank: currentRank };
            });
            
            let rankingHTML = '';
            rankedMembers.forEach((member) => {
                const isCurrentUser = currentUser && member.id === currentUser.id;
                rankingHTML += `
                    <div class="ranking-item ${isCurrentUser ? 'current-user' : ''}">
                        <div class="ranking-left">
                            <span class="rank-number">${member.rank}</span>
                            <span class="member-name">${member.name}</span>
                        </div>
                        <div class="score">${member.score}점</div>
                    </div>
                `;
            });
            
            rankingList.innerHTML = rankingHTML;
        }

        // 기상 체크 처리
        async function handleWakeUpCheck() {
            let targetMemberId = currentUser.id;
            let targetDate = new Date().toDateString();
            
            // 관리자인 경우 선택된 멤버와 날짜 사용
            if (currentUser.isAdmin) {
                const selectedMember = document.getElementById('checkMemberSelect').value;
                const selectedDate = document.getElementById('checkDateSelect').value;
                
                if (!selectedMember) {
                    alert('멤버를 선택해주세요.');
                    return;
                }
                
                if (!selectedDate) {
                    alert('날짜를 선택해주세요.');
                    return;
                }
                
                targetMemberId = selectedMember;
                targetDate = new Date(selectedDate).toDateString();
            } else {
                // 일반 사용자는 현재 시간 제한 확인
                const now = new Date();
                const hours = now.getHours();
                
                if (hours < 0 || hours >= 5) {
                    alert('기상 체크는 00:00 ~ 04:59 사이에만 가능합니다.');
                    return;
                }
            }
            
            try {
                console.log('기상 체크 저장 시작...', { targetMemberId, targetDate });
                
                // Supabase에 기상 체크 데이터 저장
                const { data, error } = await supabase
                    .from('check_data')
                    .upsert([{
                        member_id: targetMemberId,
                        date: targetDate,
                        wake_up: true,
                        frog: checkData[targetMemberId]?.[targetDate]?.frog || false,
                        must: checkData[targetMemberId]?.[targetDate]?.must || false
                    }], {
                        onConflict: 'member_id,date'
                    });
                
                if (error) {
                    console.error('Supabase 저장 오류:', error);
                    throw error;
                }
                
                console.log('Supabase 저장 성공:', data);
                
                // 로컬 데이터 업데이트
                if (!checkData[targetMemberId]) {
                    checkData[targetMemberId] = {};
                }
                
                checkData[targetMemberId][targetDate] = {
                    ...checkData[targetMemberId][targetDate],
                    wakeUp: true,
                    wakeUpTime: new Date().toLocaleTimeString('ko-KR')
                };
                
                alert('기상 체크 완료! 1점 획득했습니다.');
                
                // 관리자인 경우 대시보드 업데이트
                if (currentUser.isAdmin) {
                    updateDashboard();
                } else {
                    updateWakeUpButton();
                }
                
            } catch (error) {
                console.error('기상 체크 저장 오류:', error);
                
                // 로컬에만 저장 (오프라인 모드)
                console.log('로컬에만 저장합니다.');
                if (!checkData[targetMemberId]) {
                    checkData[targetMemberId] = {};
                }
                
                checkData[targetMemberId][targetDate] = {
                    ...checkData[targetMemberId][targetDate],
                    wakeUp: true,
                    wakeUpTime: new Date().toLocaleTimeString('ko-KR')
                };
                
                alert('기상 체크 완료! 1점 획득했습니다. (로컬 저장)');
                
                if (currentUser.isAdmin) {
                    updateDashboard();
                } else {
                    updateWakeUpButton();
                }
            }
        }

// 개구리 잡기 처리
async function handleFrogCheck() {
    let targetMemberId = currentUser.id;
    let targetDate = new Date().toDateString();
    
    // 관리자인 경우 선택된 멤버와 날짜 사용
    if (currentUser.isAdmin) {
        const selectedMember = document.getElementById('checkMemberSelect').value;
        const selectedDate = document.getElementById('checkDateSelect').value;
        
        if (!selectedMember) {
            alert('멤버를 선택해주세요.');
            return;
        }
        
        if (!selectedDate) {
            alert('날짜를 선택해주세요.');
            return;
        }
        
        targetMemberId = selectedMember;
        targetDate = new Date(selectedDate).toDateString();
    }
    
    const todayData = checkData[targetMemberId]?.[targetDate];
    
    if (todayData?.wakeUp) {
        try {
            console.log('개구리 잡기 저장 시작...', { targetMemberId, targetDate });
            
            // Supabase에 개구리 잡기 데이터 저장
            const { data, error } = await supabase
                .from('check_data')
                .upsert([{
                    member_id: targetMemberId,
                    date: targetDate,
                    wake_up: true,
                    frog: true,
                    must: checkData[targetMemberId]?.[targetDate]?.must || false
                }], {
                    onConflict: 'member_id,date'
                });
            
            if (error) {
                console.error('Supabase 저장 오류:', error);
                throw error;
            }
            
            console.log('Supabase 저장 성공:', data);
            
            // 로컬 데이터 업데이트
            checkData[targetMemberId][targetDate] = {
                ...checkData[targetMemberId][targetDate],
                frog: true
            };
            
            alert('개구리 잡기 완료! 1점 획득했습니다.');
            
            // 관리자인 경우 대시보드 업데이트
            if (currentUser.isAdmin) {
                updateDashboard();
            } else {
                updateWakeUpButton();
            }
            
        } catch (error) {
            console.error('개구리 잡기 저장 오류:', error);
            
            // 로컬에만 저장 (오프라인 모드)
            console.log('로컬에만 저장합니다.');
            checkData[targetMemberId][targetDate] = {
                ...checkData[targetMemberId][targetDate],
                frog: true
            };
            
            alert('개구리 잡기 완료! 1점 획득했습니다. (로컬 저장)');
            
            if (currentUser.isAdmin) {
                updateDashboard();
            } else {
                updateDashboard();
            }
        }
    } else {
        alert('기상 체크를 먼저 완료해주세요.');
    }
}

        // MUST 탭 전환
        function switchMustTab(tabName) {
            const creationTab = document.getElementById('mustCreationTab');
            const recordTab = document.getElementById('mustRecordTab');
            const creationBtn = document.querySelector('.must-tab:first-child');
            const recordBtn = document.querySelector('.must-tab:last-child');
            
            // 모든 탭 비활성화
            creationTab.classList.add('hidden');
            recordTab.classList.add('hidden');
            creationBtn.classList.remove('active');
            recordBtn.classList.remove('active');
            
            if (tabName === 'creation') {
                creationTab.classList.remove('hidden');
                creationBtn.classList.add('active');
            } else if (tabName === 'record') {
                recordTab.classList.remove('hidden');
                recordBtn.classList.add('active');
                
                // MUST 기록 탭으로 전환 시 날짜 선택기 강제 초기화
                setTimeout(() => {
                    console.log('MUST 기록 탭으로 전환 - 날짜 선택기 초기화 시작');
                    initializeDatePicker();
                }, 100);
            }
        }

        // MUST 페이지 업데이트
        function updateMustPage() {
            // 기본적으로 작성 탭을 보여줌
            switchMustTab('creation');
            
            // 페이지 로드 시 날짜 선택기도 초기화 (MUST 기록 탭용)
            setTimeout(() => {
                initializeDatePicker();
            }, 100);
        }

        // MUST 기록 저장 (새로운 형식)
        async function saveMustCreation() {
            const must1 = document.getElementById('must1').value.trim();
            const must2 = document.getElementById('must2').value.trim();
            const must3 = document.getElementById('must3').value.trim();
            const must4 = document.getElementById('must4').value.trim();
            const must5 = document.getElementById('must5').value.trim();
            
            const frog1 = document.getElementById('frog1').value.trim();
            const frog2 = document.getElementById('frog2').value.trim();
            const frog3 = document.getElementById('frog3').value.trim();
            
            const dailyReview = document.getElementById('dailyReview').value.trim();
            
            if (!must1 && !must2 && !must3 && !must4 && !must5 && 
                !frog1 && !frog2 && !frog3 && !dailyReview) {
                alert('최소한 하나의 항목을 입력해주세요.');
                return;
            }
            
            const today = new Date().toDateString();
            const now = new Date();
            const isScoringTime = isWithinMustScoringWindow(now);
            
            try {
                console.log('MUST 기록 저장 시작...');
                
                // 저장할 데이터 준비
                const recordData = {
                    type: 'creation',
                    must: [must1, must2, must3, must4, must5],
                    frog: [frog1, frog2, frog3],
                    dailyReview: dailyReview,
                    timestamp: now.toISOString()
                };
                
                console.log('저장할 데이터:', recordData);
                
                // Supabase에 MUST 기록 저장
                const { data, error } = await supabase
                    .from('must_records')
                    .upsert([{
                        member_id: currentUser.id,
                        date: today,
                        content: recordData
                    }], {
                        onConflict: 'member_id,date'
                    });
                
                if (error) {
                    console.error('Supabase 저장 오류:', error);
                    throw error;
                }
                
                console.log('Supabase 저장 성공:', data);
                
                // 로컬 데이터 업데이트
                if (!mustRecords[currentUser.id]) {
                    mustRecords[currentUser.id] = {};
                }
                
                mustRecords[currentUser.id][today] = recordData;
                
                if (isScoringTime) {
                    alert('MUST 기록이 저장되었습니다! (20:00~23:59 작성 → 1점)');
                } else {
                    alert('MUST 기록이 저장되었습니다! (점수는 20:00~23:59 작성 시에만 부여됩니다)');
                }
                
                // 폼 초기화
                clearMustForm();
                
                // 저장 완료 후 MUST 기록 탭으로 자동 전환하여 오늘 저장된 기록 표시
                setTimeout(() => {
                    switchMustTab('record');
                }, 500);
                
            } catch (error) {
                console.error('MUST 기록 저장 오류:', error);
                
                // 오류 상세 정보 표시
                let errorMessage = 'MUST 기록 저장 중 오류가 발생했습니다.';
                if (error.message) {
                    errorMessage += `\n\n오류 내용: ${error.message}`;
                }
                if (error.details) {
                    errorMessage += `\n\n상세 정보: ${error.details}`;
                }
                
                alert(errorMessage);
                
                // 로컬에만 저장 (오프라인 모드)
                console.log('로컬에만 저장합니다.');
                if (!mustRecords[currentUser.id]) {
                    mustRecords[currentUser.id] = {};
                }
                mustRecords[currentUser.id][today] = {
                    type: 'creation',
                    must: [must1, must2, must3, must4, must5],
                    frog: [frog1, frog2, frog3],
                    dailyReview: dailyReview,
                    timestamp: now.toISOString()
                };
            }
        }

        // MUST 기록 복사 (새로운 형식)
        function copyMustCreation() {
            const must1 = document.getElementById('must1').value.trim();
            const must2 = document.getElementById('must2').value.trim();
            const must3 = document.getElementById('must3').value.trim();
            const must4 = document.getElementById('must4').value.trim();
            const must5 = document.getElementById('must5').value.trim();
            
            const frog1 = document.getElementById('frog1').value.trim();
            const frog2 = document.getElementById('frog2').value.trim();
            const frog3 = document.getElementById('frog3').value.trim();
            
            const dailyReview = document.getElementById('dailyReview').value.trim();
            
            // 날짜 계산
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // 날짜 포맷팅 (YYMMDD 형식)
            const todayStr = today.getFullYear().toString().slice(-2) + 
                           String(today.getMonth() + 1).padStart(2, '0') + 
                           String(today.getDate()).padStart(2, '0');
            const tomorrowStr = tomorrow.getFullYear().toString().slice(-2) + 
                              String(tomorrow.getMonth() + 1).padStart(2, '0') + 
                              String(tomorrow.getDate()).padStart(2, '0');
            
            // 멤버 이름 (현재 로그인한 사용자)
            const memberName = currentUser ? currentUser.name : '사용자';
            
            let content = '';
            
            // 헤더 (다음 날 날짜 + 멤버 이름)
            content += `${tomorrowStr} ${memberName}\n\n`;
            
            // MUST 5가지
            if (must1 || must2 || must3 || must4 || must5) {
                content += '[📋 우선순위 MUST 5가지]\n';
                if (must1) content += `1. ${must1}\n`;
                if (must2) content += `2. ${must2}\n`;
                if (must3) content += `3. ${must3}\n`;
                if (must4) content += `4. ${must4}\n`;
                if (must5) content += `5. ${must5}\n\n`;
            }
            
            // 개구리 3가지
            if (frog1 || frog2 || frog3) {
                content += '[🐸 개구리 3가지]\n';
                if (frog1) content += `1. ${frog1}\n`;
                if (frog2) content += `2. ${frog2}\n`;
                if (frog3) content += `3. ${frog3}\n\n`;
            }
            
            // 하루 복기 (오늘 날짜)
            if (dailyReview) {
                content += `[${todayStr} 하루 복기]\n`;
                content += dailyReview;
            }
            
            if (content) {
                navigator.clipboard.writeText(content).then(() => {
                    alert('복사되었습니다! 텔레그램에 바로 붙여넣기 할 수 있습니다.');
                });
            } else {
                alert('복사할 내용이 없습니다.');
            }
        }

        // MUST 폼 초기화
        function clearMustForm() {
            document.getElementById('must1').value = '';
            document.getElementById('must2').value = '';
            document.getElementById('must3').value = '';
            document.getElementById('must4').value = '';
            document.getElementById('must5').value = '';
            document.getElementById('frog1').value = '';
            document.getElementById('frog2').value = '';
            document.getElementById('frog3').value = '';
            document.getElementById('dailyReview').value = '';
        }

        // 날짜 선택기 초기화
        function initializeDatePicker() {
            const datePicker = document.getElementById('recordDatePicker');
            if (!datePicker) {
                console.warn('recordDatePicker를 찾을 수 없습니다.');
                return;
            }
            
            const today = new Date();
            
            // 오늘 날짜를 기본값으로 설정
            datePicker.value = today.toISOString().split('T')[0];
            
            // 날짜 선택기 최소값을 2025년 9월로 설정
            const minDate = new Date(2025, 8, 1); // 9월은 8 (0부터 시작)
            datePicker.min = minDate.toISOString().split('T')[0];
            
            // 날짜 선택기 최대값을 오늘로 설정 (미래 날짜 선택 방지)
            datePicker.max = today.toISOString().split('T')[0];
            
            console.log('날짜 선택기 초기화 완료:', {
                value: datePicker.value,
                min: datePicker.min,
                max: datePicker.max
            });
            
            // 오늘 날짜의 기록이 있으면 자동으로 로드
            loadMustRecord();
        }

        // 선택된 날짜의 MUST 기록 로드
        function loadMustRecord() {
            let targetMemberId = currentUser.id;
            const datePicker = document.getElementById('recordDatePicker');
            const selectedDate = datePicker.value;
            const selectedDateTitle = document.getElementById('selectedDateTitle');
            const recordDisplay = document.getElementById('recordDisplay');
            const recordEditSection = document.getElementById('recordEditSection');
            const recordViewActions = document.getElementById('recordViewActions');
            const saveOwnBtn = document.getElementById('saveOwnMustEditBtn');
            const saveAdminBtn = document.getElementById('saveAdminMustEditBtn');
            
            if (!selectedDate) return;
            
            // 관리자인 경우 선택된 멤버 사용
            let isViewingOwn = true;
            if (currentUser.isAdmin) {
                const selectedMember = document.getElementById('mustMemberSelect').value;
                if (!selectedMember) {
                    alert('멤버를 선택해주세요.');
                    return;
                }
                targetMemberId = selectedMember;
                isViewingOwn = false;
            }
            
            // 날짜 형식 변환
            const date = new Date(selectedDate);
            const dateStr = date.toDateString();
            const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
            
            selectedDateTitle.textContent = formattedDate;
            
            // 해당 날짜의 기록 확인
            const record = mustRecords[targetMemberId]?.[dateStr];
            
            if (record) {
                if (record.type === 'creation') {
                    // 새로운 형식의 기록 표시
                    let displayContent = '';
                    
                    if (record.must && record.must.some(m => m)) {
                        displayContent += '📋 내일 우선순위 MUST 5가지\n';
                        record.must.forEach((item, index) => {
                            if (item) {
                                displayContent += `${index + 1}. ${item}\n`;
                            }
                        });
                        displayContent += '\n';
                    }
                    
                    if (record.frog && record.frog.some(f => f)) {
                        displayContent += '🐸 개구리 3가지\n';
                        record.frog.forEach((item, index) => {
                            if (item) {
                                displayContent += `• ${item}\n`;
                            }
                        });
                        displayContent += '\n';
                    }
                    
                    if (record.dailyReview) {
                        displayContent += '📝 하루 복기\n';
                        displayContent += record.dailyReview;
                    }
                    
                    recordDisplay.innerHTML = `<div class="record-content">${displayContent}</div>`;
                } else {
                    // 기존 형식의 기록 표시
                    recordDisplay.innerHTML = `<div class="record-content">${record}</div>`;
                }
                
                // 본인 보기일 때 복사/수정 버튼 노출, 관리자는 숨김
                if (!currentUser.isAdmin && recordViewActions) {
                    recordViewActions.classList.remove('hidden');
                } else if (recordViewActions) {
                    recordViewActions.classList.add('hidden');
                }
            } else {
                recordDisplay.innerHTML = '<div class="no-record-message">해당 날짜에 기록이 없습니다.</div>';
                if (recordViewActions) recordViewActions.classList.add('hidden');
            }
            
            // 편집 섹션 토글 및 저장 버튼 가시성 설정
            if (currentUser.isAdmin) {
                saveAdminBtn.classList.remove('hidden');
                saveOwnBtn.classList.add('hidden');
                if (record) {
                    recordEditSection.classList.remove('hidden');
                    const must = record.must || [];
                    document.getElementById('mustEdit1').value = must[0] || '';
                    document.getElementById('mustEdit2').value = must[1] || '';
                    document.getElementById('mustEdit3').value = must[2] || '';
                    document.getElementById('mustEdit4').value = must[3] || '';
                    document.getElementById('mustEdit5').value = must[4] || '';
                    const frog = record.frog || [];
                    document.getElementById('frogEdit1').value = frog[0] || '';
                    document.getElementById('frogEdit2').value = frog[1] || '';
                    document.getElementById('frogEdit3').value = frog[2] || '';
                    document.getElementById('dailyReviewEdit').value = record.dailyReview || '';
                } else {
                    recordEditSection.classList.remove('hidden');
                    document.getElementById('mustEdit1').value = '';
                    document.getElementById('mustEdit2').value = '';
                    document.getElementById('mustEdit3').value = '';
                    document.getElementById('mustEdit4').value = '';
                    document.getElementById('mustEdit5').value = '';
                    document.getElementById('frogEdit1').value = '';
                    document.getElementById('frogEdit2').value = '';
                    document.getElementById('frogEdit3').value = '';
                    document.getElementById('dailyReviewEdit').value = '';
                }
            } else if (recordEditSection) {
                // 멤버는 자동으로 편집 섹션을 숨기고, '수정' 클릭 시 열림
                recordEditSection.classList.add('hidden');
                saveAdminBtn.classList.add('hidden');
                saveOwnBtn.classList.add('hidden');
            }
        }

        // 본인 기록: 복사
        function copyLoadedRecord() {
            const datePicker = document.getElementById('recordDatePicker');
            const selected = new Date(datePicker.value);
            const dateStr = selected.toDateString();
            const record = mustRecords[currentUser.id]?.[dateStr];
            if (!record) { alert('해당 날짜에 기록이 없습니다.'); return; }
            let content = '';
            
            // 선택한 날짜 YYMMDD
            const yymmdd = selected.getFullYear().toString().slice(-2) + String(selected.getMonth()+1).padStart(2,'0') + String(selected.getDate()).padStart(2,'0');
            // 다음 날 YYMMDD (MUST는 다음 날 계획)
            const next = new Date(selected);
            next.setDate(next.getDate() + 1);
            const nextYYMMDD = next.getFullYear().toString().slice(-2) + String(next.getMonth()+1).padStart(2,'0') + String(next.getDate()).padStart(2,'0');
            
            content += `${yymmdd} ${currentUser.name}\n\n`;
            
            if (record.must?.some(m=>m)) {
                content += `[📋 ${nextYYMMDD} 우선순위 MUST 5가지]\n`;
                record.must.forEach((m,i)=>{ if(m) content += `${i+1}. ${m}\n`; });
                content += '\n';
            }
            if (record.frog?.some(f=>f)) {
                content += '[🐸 개구리 3가지]\n';
                record.frog.forEach((f,i)=>{ if(f) content += `${i+1}. ${f}\n`; });
                content += '\n';
            }
            if (record.dailyReview) {
                content += `[📝 ${yymmdd} 하루 복기]\n`;
                content += record.dailyReview;
            }
            navigator.clipboard.writeText(content).then(()=>alert('복사되었습니다!'));
        }

        // 본인 기록: 수정 시작
        function startOwnEdit() {
            const datePicker = document.getElementById('recordDatePicker');
            const dateStr = new Date(datePicker.value).toDateString();
            const record = mustRecords[currentUser.id]?.[dateStr];
            const recordEditSection = document.getElementById('recordEditSection');
            const saveOwnBtn = document.getElementById('saveOwnMustEditBtn');
            const saveAdminBtn = document.getElementById('saveAdminMustEditBtn');
            if (!record) { alert('해당 날짜에 기록이 없습니다.'); return; }
            recordEditSection.classList.remove('hidden');
            saveOwnBtn.classList.remove('hidden');
            saveAdminBtn.classList.add('hidden');
            const must = record.must || [];
            document.getElementById('mustEdit1').value = must[0] || '';
            document.getElementById('mustEdit2').value = must[1] || '';
            document.getElementById('mustEdit3').value = must[2] || '';
            document.getElementById('mustEdit4').value = must[3] || '';
            document.getElementById('mustEdit5').value = must[4] || '';
            const frog = record.frog || [];
            document.getElementById('frogEdit1').value = frog[0] || '';
            document.getElementById('frogEdit2').value = frog[1] || '';
            document.getElementById('frogEdit3').value = frog[2] || '';
            document.getElementById('dailyReviewEdit').value = record.dailyReview || '';
        }

        // 본인 기록: 수정 저장 (점수 증가 없음)
        async function saveOwnMustEdit() {
            const datePicker = document.getElementById('recordDatePicker');
            if (!datePicker.value) { alert('날짜를 선택해주세요.'); return; }
            const dateStr = new Date(datePicker.value).toDateString();
            const must = [
                document.getElementById('mustEdit1').value.trim(),
                document.getElementById('mustEdit2').value.trim(),
                document.getElementById('mustEdit3').value.trim(),
                document.getElementById('mustEdit4').value.trim(),
                document.getElementById('mustEdit5').value.trim()
            ];
            const frog = [
                document.getElementById('frogEdit1').value.trim(),
                document.getElementById('frogEdit2').value.trim(),
                document.getElementById('frogEdit3').value.trim()
            ];
            const dailyReview = document.getElementById('dailyReviewEdit').value.trim();
            const existing = mustRecords[currentUser.id]?.[dateStr];
            const keepTimestamp = existing?.timestamp || new Date().toISOString();
            const recordData = { type: 'creation', must, frog, dailyReview, timestamp: keepTimestamp };
            try {
                const { error } = await supabase
                    .from('must_records')
                    .upsert([{ member_id: currentUser.id, date: dateStr, content: recordData }], { onConflict: 'member_id,date' });
                if (error) throw error;
                if (!mustRecords[currentUser.id]) mustRecords[currentUser.id] = {};
                mustRecords[currentUser.id][dateStr] = recordData;
                alert('수정이 저장되었습니다. (점수는 20:00~23:59 작성 기준으로 계산됩니다)');
                loadMustRecord();
            } catch (e) {
                console.error('본인 MUST 수정 저장 오류:', e);
                alert('저장 중 오류가 발생했습니다.');
            }
        }

        // 관리자: MUST 기록 수정 저장
        async function saveMustEdit() {
            if (!currentUser?.isAdmin) return;
            const selectedMember = document.getElementById('mustMemberSelect').value;
            const datePicker = document.getElementById('recordDatePicker');
            if (!selectedMember) { alert('멤버를 선택해주세요.'); return; }
            if (!datePicker.value) { alert('날짜를 선택해주세요.'); return; }
            
            const dateStr = new Date(datePicker.value).toDateString();
            const must = [
                document.getElementById('mustEdit1').value.trim(),
                document.getElementById('mustEdit2').value.trim(),
                document.getElementById('mustEdit3').value.trim(),
                document.getElementById('mustEdit4').value.trim(),
                document.getElementById('mustEdit5').value.trim()
            ];
            const frog = [
                document.getElementById('frogEdit1').value.trim(),
                document.getElementById('frogEdit2').value.trim(),
                document.getElementById('frogEdit3').value.trim()
            ];
            const dailyReview = document.getElementById('dailyReviewEdit').value.trim();
            const existing = mustRecords[selectedMember]?.[dateStr];
            const keepTimestamp = existing?.timestamp || new Date().toISOString();
            const recordData = { type: 'creation', must, frog, dailyReview, timestamp: keepTimestamp };
            
            try {
                const { error } = await supabase
                    .from('must_records')
                    .upsert([{ member_id: selectedMember, date: dateStr, content: recordData }], { onConflict: 'member_id,date' });
                if (error) throw error;
                if (!mustRecords[selectedMember]) mustRecords[selectedMember] = {};
                mustRecords[selectedMember][dateStr] = recordData;
                alert('수정이 저장되었습니다. (점수는 20:00~23:59 작성 기준으로 계산됩니다)');
                loadMustRecord();
            } catch (e) {
                console.error('MUST 기록 수정 저장 오류:', e);
                alert('저장 중 오류가 발생했습니다.');
            }
        }

        // 기존 함수들 유지 (하위 호환성)
        function saveMustRecord() {
            const content = document.getElementById('todayMust')?.value?.trim();
            if (content) {
                const today = new Date().toDateString();
                
                if (!mustRecords[currentUser.id]) {
                    mustRecords[currentUser.id] = {};
                }
                
                mustRecords[currentUser.id][today] = content;
                
                alert('MUST 기록이 저장되었습니다! 1점 획득했습니다.');
            }
        }

        function copyMustRecord() {
            const content = document.getElementById('todayMust')?.value;
            if (content) {
                navigator.clipboard.writeText(content).then(() => {
                    alert('복사되었습니다!');
                });
            }
        }

// 관리자 페이지 업데이트
function updateAdminPage() {
    const memberList = document.getElementById('memberList');
    const regularMembers = members.filter(m => !m.isAdmin);
    
    if (regularMembers.length === 0) {
        memberList.innerHTML = `
            <div style="text-align: center; color: #666; padding: 2rem;">
                등록된 멤버가 없습니다.
            </div>
        `;
        return;
    }
    
    let memberHTML = '';
    regularMembers.forEach(member => {
        memberHTML += `
            <div class="member-item">
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p>코드: ${member.code}</p>
                </div>
                <button class="delete-btn" onclick="deleteMember('${member.id}')">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
    });
    
                memberList.innerHTML = memberHTML;
            // lucide 아이콘 안전하게 생성
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
}

// 멤버 추가
async function addMember() {
    const name = document.getElementById('newMemberName').value.trim();
    const code = document.getElementById('newMemberCode').value.trim();
    
    if (!name || !code) {
        alert('멤버 이름과 코드를 모두 입력해주세요.');
        return;
    }
    
    // 중복 코드 확인(로컬)
    if (members.find(m => m.code === code)) {
        alert('이미 존재하는 멤버 코드입니다.');
        return;
    }
    
    // 중복 코드 확인(Supabase)
    try {
        const { data: existRows, error: existErr } = await supabase
            .from('members')
            .select('code')
            .eq('code', code)
            .limit(1);
        if (existErr) {
            console.warn('중복 확인 중 오류:', existErr);
        } else if (existRows && existRows.length > 0) {
            alert('이미 Supabase에 같은 멤버 코드가 있습니다. 다른 코드를 사용해주세요.');
            return;
        }
    } catch (e) {
        console.warn('중복 확인 예외:', e);
    }
    
    const newMember = {
        id: code,
        name: name,
        code: code,
        isAdmin: false
    };
    
    try {
        // Supabase에 저장할 데이터 (is_admin 필드명 사용)
        const supabaseMember = {
            id: code,
            name: name,
            code: code,
            is_admin: false
        };
        
        const { error } = await supabase
            .from('members')
            .insert([supabaseMember]);
        
        if (error) {
            console.error('멤버 추가 오류(서버):', error);
            let msg = '멤버 추가 중 오류가 발생했습니다.';
            if (error.message) msg += `\n- message: ${error.message}`;
            if (error.details) msg += `\n- details: ${error.details}`;
            if (error.hint) msg += `\n- hint: ${error.hint}`;
            alert(msg);
            return;
        }
        
        // 로컬 배열에 추가
        members.push(newMember);
        
        // 입력 필드 초기화
        document.getElementById('newMemberName').value = '';
        document.getElementById('newMemberCode').value = '';
        
        // 관리자 페이지/셀렉트 갱신
        updateAdminPage();
        updateMemberSelects();
        
        alert('새 멤버가 추가되었습니다!');
        
    } catch (error) {
        console.error('멤버 추가 오류(클라이언트 예외):', error);
        alert(`멤버 추가 중 오류가 발생했습니다.\n${error?.message || error}`);
    }
}

// 멤버 삭제
async function deleteMember(memberId) {
    if (!confirm('정말로 이 멤버를 삭제하시겠습니까?\n관련된 모든 데이터가 함께 삭제됩니다.')) {
        return;
    }
    
    try {
        // Supabase에서 멤버 삭제
        const { error: memberError } = await supabase
            .from('members')
            .delete()
            .eq('id', memberId);
        
        if (memberError) throw memberError;
        
        // 관련 기상 체크 데이터 삭제
        const { error: checkError } = await supabase
            .from('check_data')
            .delete()
            .eq('member_id', memberId);
        
        if (checkError) throw checkError;
        
        // 관련 MUST 기록 삭제
        const { error: mustError } = await supabase
            .from('must_records')
            .delete()
            .eq('member_id', memberId);
        
        if (mustError) throw mustError;
        
        // 로컬 배열에서 제거
        members = members.filter(m => m.id !== memberId);
        
        // 관련 데이터도 삭제
        delete checkData[memberId];
        delete mustRecords[memberId];
        
        alert('멤버와 관련 데이터가 모두 삭제되었습니다.');
        updateAdminPage();
        updateMemberSelects();
        
    } catch (error) {
        console.error('멤버 삭제 오류:', error);
        alert('멤버 삭제 중 오류가 발생했습니다.');
    }
}

        // 멤버 코드 추가
        async function addMemberCode() {
            const memberId = document.getElementById('existingMemberSelect').value;
            const newCode = document.getElementById('newMemberCodeForExisting').value.trim();
            
            if (!memberId) {
                alert('멤버를 선택해주세요.');
                return;
            }
            
            if (!newCode) {
                alert('새 멤버 코드를 입력해주세요.');
                return;
            }
            
            // 코드 중복 확인
            const existingMember = members.find(m => m.code === newCode);
            if (existingMember) {
                alert('이미 사용 중인 멤버 코드입니다.');
                return;
            }
            
            try {
                const member = members.find(m => m.id === memberId);
                
                // Supabase에 새 멤버 코드 추가 (is_admin 필드명 사용)
                const { error } = await supabase
                    .from('members')
                    .insert([{
                        name: member.name,
                        code: newCode,
                        is_admin: false
                    }]);
                
                if (error) throw error;
                
                // 로컬 데이터에 새 멤버 추가
                const newMember = {
                    id: Date.now().toString(),
                    name: member.name,
                    code: newCode,
                    isAdmin: false
                };
                members.push(newMember);
                
                alert('멤버 코드가 추가되었습니다.');
                
                // 폼 초기화
                document.getElementById('existingMemberSelect').value = '';
                document.getElementById('newMemberCodeForExisting').value = '';
                
                // 관리자 페이지 업데이트
                updateAdminPage();
                updateMemberSelects();
                
            } catch (error) {
                console.error('멤버 코드 추가 오류:', error);
                alert('멤버 코드 추가 중 오류가 발생했습니다.');
            }
        }

        // 관리자용 기상 완료 처리
        async function handleAdminWakeUpSuccess() {
            const selectedMember = document.getElementById('checkMemberSelect').value;
            const selectedDate = document.getElementById('checkDateSelect').value;
            
            if (!selectedMember) {
                alert('멤버를 선택해주세요.');
                return;
            }
            
            if (!selectedDate) {
                alert('날짜를 선택해주세요.');
                return;
            }
            
            try {
                console.log('관리자 기상 완료 처리 시작...', { selectedMember, selectedDate });
                
                const targetDate = new Date(selectedDate).toDateString();
                
                // Supabase에 기상 체크 데이터 저장
                const { data, error } = await supabase
                    .from('check_data')
                    .upsert([{
                        member_id: selectedMember,
                        date: targetDate,
                        wake_up: true,
                        frog: checkData[selectedMember]?.[targetDate]?.frog || false,
                        must: checkData[selectedMember]?.[targetDate]?.must || false
                    }], {
                        onConflict: 'member_id,date'
                    });
                
                if (error) {
                    console.error('Supabase 저장 오류:', error);
                    throw error;
                }
                
                console.log('Supabase 저장 성공:', data);
                
                // 로컬 데이터 업데이트
                if (!checkData[selectedMember]) {
                    checkData[selectedMember] = {};
                }
                
                checkData[selectedMember][targetDate] = {
                    ...checkData[selectedMember][targetDate],
                    wakeUp: true,
                    wakeUpTime: new Date().toLocaleTimeString('ko-KR')
                };
                
                alert('기상 완료로 설정되었습니다! 1점이 반영됩니다.');
                
                // 대시보드 업데이트
                updateDashboard();
                
            } catch (error) {
                console.error('관리자 기상 완료 처리 오류:', error);
                alert('기상 완료 처리 중 오류가 발생했습니다.');
            }
        }

        // 관리자용 기상 실패 처리
        async function handleAdminWakeUpFailure() {
            const selectedMember = document.getElementById('checkMemberSelect').value;
            const selectedDate = document.getElementById('checkDateSelect').value;
            
            if (!selectedMember) {
                alert('멤버를 선택해주세요.');
                return;
            }
            
            if (!selectedDate) {
                alert('날짜를 선택해주세요.');
                return;
            }
            
            try {
                console.log('관리자 기상 실패 처리 시작...', { selectedMember, selectedDate });
                
                const targetDate = new Date(selectedDate).toDateString();
                
                // Supabase에 기상 체크 데이터 저장 (실패)
                const { data, error } = await supabase
                    .from('check_data')
                    .upsert([{
                        member_id: selectedMember,
                        date: targetDate,
                        wake_up: false,
                        frog: false,
                        must: checkData[selectedMember]?.[targetDate]?.must || false
                    }], {
                        onConflict: 'member_id,date'
                    });
                
                if (error) {
                    console.error('Supabase 저장 오류:', error);
                    throw error;
                }
                
                console.log('Supabase 저장 성공:', data);
                
                // 로컬 데이터 업데이트
                if (!checkData[selectedMember]) {
                    checkData[selectedMember] = {};
                }
                
                checkData[selectedMember][targetDate] = {
                    ...checkData[selectedMember][targetDate],
                    wakeUp: false,
                    wakeUpTime: null
                };
                
                alert('기상 실패로 설정되었습니다! 0점이 반영됩니다.');
                
                // 대시보드 업데이트
                updateDashboard();
                
            } catch (error) {
                console.error('관리자 기상 실패 처리 오류:', error);
                alert('기상 실패 처리 중 오류가 발생했습니다.');
            }
        }

        // 관리자용 개구리 잡기 완료 처리
        async function handleAdminFrogSuccess() {
            const selectedMember = document.getElementById('checkMemberSelect').value;
            const selectedDate = document.getElementById('checkDateSelect').value;
            
            if (!selectedMember) {
                alert('멤버를 선택해주세요.');
                return;
            }
            
            if (!selectedDate) {
                alert('날짜를 선택해주세요.');
                return;
            }
            
            try {
                console.log('관리자 개구리 잡기 완료 처리 시작...', { selectedMember, selectedDate });
                
                const targetDate = new Date(selectedDate).toDateString();
                
                // 기상 체크가 완료되어야 개구리 잡기 가능
                if (!checkData[selectedMember]?.[targetDate]?.wakeUp) {
                    alert('기상 체크를 먼저 완료해야 합니다.');
                    return;
                }
                
                // Supabase에 개구리 잡기 데이터 저장
                const { data, error } = await supabase
                    .from('check_data')
                    .upsert([{
                        member_id: selectedMember,
                        date: targetDate,
                        wake_up: true,
                        frog: true,
                        must: checkData[selectedMember]?.[targetDate]?.must || false
                    }], {
                        onConflict: 'member_id,date'
                    });
                
                if (error) {
                    console.error('Supabase 저장 오류:', error);
                    throw error;
                }
                
                console.log('Supabase 저장 성공:', data);
                
                // 로컬 데이터 업데이트
                checkData[selectedMember][targetDate] = {
                    ...checkData[selectedMember][targetDate],
                    frog: true
                };
                
                alert('개구리 잡기 완료로 설정되었습니다! 1점이 반영됩니다.');
                
                // 대시보드 업데이트
                updateDashboard();
                
            } catch (error) {
                console.error('관리자 개구리 잡기 완료 처리 오류:', error);
                alert('개구리 잡기 완료 처리 중 오류가 발생했습니다.');
            }
        }

        // 관리자용 개구리 잡기 실패 처리
        async function handleAdminFrogFailure() {
            const selectedMember = document.getElementById('checkMemberSelect').value;
            const selectedDate = document.getElementById('checkDateSelect').value;
            
            if (!selectedMember) {
                alert('멤버를 선택해주세요.');
                return;
            }
            
            if (!selectedDate) {
                alert('날짜를 선택해주세요.');
                return;
            }
            
            try {
                console.log('관리자 개구리 잡기 실패 처리 시작...', { selectedMember, selectedDate });
                
                const targetDate = new Date(selectedDate).toDateString();
                
                // Supabase에 개구리 잡기 데이터 저장 (실패)
                const { data, error } = await supabase
                    .from('check_data')
                    .upsert([{
                        member_id: selectedMember,
                        date: targetDate,
                        wake_up: checkData[selectedMember]?.[targetDate]?.wakeUp || false,
                        frog: false,
                        must: checkData[selectedMember]?.[targetDate]?.must || false
                    }], {
                        onConflict: 'member_id,date'
                    });
                
                if (error) {
                    console.error('Supabase 저장 오류:', error);
                    throw error;
                }
                
                console.log('Supabase 저장 성공:', data);
                
                // 로컬 데이터 업데이트
                if (!checkData[selectedMember]) {
                    checkData[selectedMember] = {};
                }
                
                checkData[selectedMember][targetDate] = {
                    ...checkData[selectedMember][targetDate],
                    frog: false
                };
                
                alert('개구리 잡기 실패로 설정되었습니다! 0점이 반영됩니다.');
                
                // 대시보드 업데이트
                updateDashboard();
                
            } catch (error) {
                console.error('관리자 개구리 잡기 실패 처리 오류:', error);
                alert('개구리 잡기 실패 처리 중 오류가 발생했습니다.');
            }
        }

// 월/년도 변경 이벤트
document.addEventListener('DOMContentLoaded', function() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    
    if (yearSelect && monthSelect) {
        yearSelect.addEventListener('change', updateDashboard);
        monthSelect.addEventListener('change', updateDashboard);
    }
});

// MUST 점수 시간창: 20:00 ~ 23:59 (로컬 시간)
function isWithinMustScoringWindow(dateObj) {
    try {
        const h = dateObj.getHours();
        return h >= 20 && h <= 23; // 20:00 이상 23:59 이하
    } catch (e) {
        return false;
    }
}
