// 앱 상태
let currentUser = null;
let currentPage = 'dashboard';
        let members = [
            { id: 'mnj510', name: '오키', code: 'mnj510', isAdmin: true },
            { id: 'member1', name: '참기름', code: 'WAKE001' },
            { id: 'member2', name: '동행', code: 'WAKE002' },
            { id: 'member3', name: '완료주의자', code: 'WAKE003' },
            { id: 'member4', name: '은호', code: 'WAKE004' },
            { id: 'member5', name: '쿼카', code: 'WAKE005' },
            { id: 'member6', name: '김은아', code: 'WAKE006' },
            { id: 'member7', name: '비채', code: 'WAKE007' },
            { id: 'member8', name: '제가이버', code: 'WAKE008' },
            { id: 'member9', name: '배소영', code: 'WAKE009' },
            { id: 'member10', name: '해량', code: 'WAKE010' },
            { id: 'member11', name: '호나인', code: 'WAKE011' },
            { id: 'member12', name: '현진', code: 'WAKE012' },
            { id: 'member13', name: '박뱅', code: 'WAKE013' },
            { id: 'member14', name: '달콩', code: 'WAKE014' },
            { id: 'member15', name: '히프노스', code: 'WAKE015' }
        ];

// 데이터 저장 (실제로는 Supabase 등 DB 사용)
let checkData = {};
let mustRecords = {};

        // 초기화
        document.addEventListener('DOMContentLoaded', function() {
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
            document.getElementById('userInfo').textContent = `${currentUser.name}님 환영합니다`;
            
            // 관리자 탭 표시
            if (currentUser.isAdmin) {
                document.getElementById('adminTab').classList.remove('hidden');
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
            
            // 해당 월의 모든 날짜 확인
            for (let day = 1; day <= 31; day++) {
                const date = new Date(year, month - 1, day);
                if (date.getMonth() + 1 !== month) break;
                if (date > new Date()) break;
                
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
    let totalDays = 0;
    for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month - 1, day);
        if (date.getMonth() + 1 !== month) break;
        if (date > new Date()) break;
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
    
    // 체크 데이터에서 점수 계산
    Object.keys(memberCheckData).forEach(date => {
        const dateObj = new Date(date);
        if (dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year) {
            const dayData = memberCheckData[date];
            if (dayData.wakeUp) score += 1;
            if (dayData.frog) score += 1;
        }
    });
    
    // MUST 기록에서 점수 계산
    Object.keys(memberMustData).forEach(date => {
        const dateObj = new Date(date);
        if (dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year) {
            score += 1;
        }
    });
    
    return score;
}

        // 개인 달력 업데이트
        function updatePersonalCalendar() {
            if (!currentUser || currentUser.isAdmin) return;
            
            const personalCalendar = document.getElementById('personalCalendar');
            const selectedYear = parseInt(document.getElementById('yearSelect').value);
            const selectedMonth = parseInt(document.getElementById('monthSelect').value);
            
            let calendarHTML = '<div class="calendar-header">';
            
            // 요일 헤더
            calendarHTML += '<div class="member-name">날짜</div>';
            for (let day = 1; day <= 31; day++) {
                const date = new Date(selectedYear, selectedMonth - 1, day);
                if (date.getMonth() + 1 !== selectedMonth) break;
                calendarHTML += `<div class="date-header">${day}</div>`;
            }
            calendarHTML += '</div>';
            
            // 개인 기상 현황
            calendarHTML += '<div class="calendar-row">';
            calendarHTML += '<div class="member-name">기상</div>';
            
            let successCount = 0;
            let failureCount = 0;
            
            for (let day = 1; day <= 31; day++) {
                const date = new Date(selectedYear, selectedMonth - 1, day);
                if (date.getMonth() + 1 !== selectedMonth) break;
                
                const dateStr = date.toDateString();
                const dayData = checkData[currentUser.id]?.[dateStr];
                const mustData = mustRecords[currentUser.id]?.[dateStr];
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
                    <p>이번 달 나의 기상 완료: <strong>${successCount}회</strong> / 실패: <strong>${failureCount}회</strong></p>
                </div>
            `;
            
            personalCalendar.innerHTML = calendarHTML;
        }

        // 멤버별 기상 현황 그리드 업데이트
        function updateMemberCalendarGrid() {
            if (!currentUser || !currentUser.isAdmin) return;
            
            const memberCalendarGrid = document.getElementById('memberCalendarGrid');
            const selectedYear = parseInt(document.getElementById('yearSelect').value);
            const selectedMonth = parseInt(document.getElementById('monthSelect').value);
            
            let gridHTML = '<div class="calendar-header">';
            
            // 멤버 이름 헤더
            gridHTML += '<div class="member-name">멤버</div>';
            for (let day = 1; day <= 31; day++) {
                const date = new Date(selectedYear, selectedMonth - 1, day);
                if (date.getMonth() + 1 !== selectedMonth) break;
                gridHTML += `<div class="date-header">${day}</div>`;
            }
            gridHTML += '</div>';
            
            // 각 멤버별 기상 현황
            const regularMembers = members.filter(m => !m.isAdmin);
            regularMembers.forEach(member => {
                gridHTML += '<div class="calendar-row">';
                gridHTML += `<div class="member-name">${member.name}</div>`;
                
                for (let day = 1; day <= 31; day++) {
                    const date = new Date(selectedYear, selectedMonth - 1, day);
                    if (date.getMonth() + 1 !== selectedMonth) break;
                    
                    const dateStr = date.toDateString();
                    const dayData = checkData[member.id]?.[dateStr];
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
                    } else {
                        // 기상 실패 (빨간색)
                        cellClass = 'failure';
                        cellContent = '';
                    }
                    
                    gridHTML += `<div class="calendar-cell ${cellClass}">${cellContent}</div>`;
                }
                gridHTML += '</div>';
            });
            
            memberCalendarGrid.innerHTML = gridHTML;
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
function handleWakeUpCheck() {
    const now = new Date();
    const hours = now.getHours();
    const today = now.toDateString();
    
    if (hours >= 0 && hours < 5) {
        if (!checkData[currentUser.id]) {
            checkData[currentUser.id] = {};
        }
        
        checkData[currentUser.id][today] = {
            ...checkData[currentUser.id][today],
            wakeUp: true,
            wakeUpTime: now.toLocaleTimeString('ko-KR')
        };
        
        alert('기상 체크 완료! 1점 획득했습니다.');
        updateWakeUpButton();
    } else {
        alert('기상 체크는 00:00 ~ 04:59 사이에만 가능합니다.');
    }
}

// 개구리 잡기 처리
function handleFrogCheck() {
    const today = new Date().toDateString();
    const todayData = checkData[currentUser.id]?.[today];
    
    if (todayData?.wakeUp) {
        checkData[currentUser.id][today] = {
            ...checkData[currentUser.id][today],
            frog: true
        };
        
        alert('개구리 잡기 완료! 1점 획득했습니다.');
        updateWakeUpButton();
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
                // 날짜 선택기 초기화
                initializeDatePicker();
            }
        }

        // MUST 페이지 업데이트
        function updateMustPage() {
            // 기본적으로 작성 탭을 보여줌
            switchMustTab('creation');
        }

        // MUST 기록 저장 (새로운 형식)
        function saveMustCreation() {
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
            
            if (!mustRecords[currentUser.id]) {
                mustRecords[currentUser.id] = {};
            }
            
            // 새로운 형식으로 저장
            mustRecords[currentUser.id][today] = {
                type: 'creation',
                must: [must1, must2, must3, must4, must5],
                frog: [frog1, frog2, frog3],
                dailyReview: dailyReview,
                timestamp: new Date().toISOString()
            };
            
            alert('MUST 기록이 저장되었습니다! 1점 획득했습니다.');
            
            // 폼 초기화
            clearMustForm();
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
            
            let content = '';
            
            if (must1 || must2 || must3 || must4 || must5) {
                content += '📋 내일 우선순위 MUST 5가지\n';
                if (must1) content += `1. ${must1}\n`;
                if (must2) content += `2. ${must2}\n`;
                if (must3) content += `3. ${must3}\n`;
                if (must4) content += `4. ${must4}\n`;
                if (must5) content += `5. ${must5}\n\n`;
            }
            
            if (frog1 || frog2 || frog3) {
                content += '🐸 개구리 3가지\n';
                if (frog1) content += `• ${frog1}\n`;
                if (frog2) content += `• ${frog2}\n`;
                if (frog3) content += `• ${frog3}\n\n`;
            }
            
            if (dailyReview) {
                content += '📝 하루 복기\n';
                content += dailyReview;
            }
            
            if (content) {
                navigator.clipboard.writeText(content).then(() => {
                    alert('복사되었습니다!');
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
            const today = new Date();
            
            // 오늘 날짜를 기본값으로 설정
            datePicker.value = today.toISOString().split('T')[0];
            
            // 오늘 날짜의 기록이 있으면 자동으로 로드
            loadMustRecord();
        }

        // 선택된 날짜의 MUST 기록 로드
        function loadMustRecord() {
            const datePicker = document.getElementById('recordDatePicker');
            const selectedDate = datePicker.value;
            const selectedDateTitle = document.getElementById('selectedDateTitle');
            const recordDisplay = document.getElementById('recordDisplay');
            
            if (!selectedDate) return;
            
            // 날짜 형식 변환
            const date = new Date(selectedDate);
            const dateStr = date.toDateString();
            const formattedDate = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
            
            selectedDateTitle.textContent = formattedDate;
            
            // 해당 날짜의 기록 확인
            const record = mustRecords[currentUser.id]?.[dateStr];
            
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
            } else {
                recordDisplay.innerHTML = '<div class="no-record-message">해당 날짜에 기록이 없습니다.</div>';
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
function addMember() {
    const name = document.getElementById('newMemberName').value.trim();
    const code = document.getElementById('newMemberCode').value.trim();
    
    if (name && code) {
        // 중복 코드 검사
        if (members.find(m => m.code === code)) {
            alert('이미 존재하는 멤버 코드입니다.');
            return;
        }
        
        const newId = `member${Date.now()}`;
        members.push({
            id: newId,
            name: name,
            code: code
        });
        
        // 폼 초기화
        document.getElementById('newMemberName').value = '';
        document.getElementById('newMemberCode').value = '';
        
        alert('멤버가 추가되었습니다.');
        updateAdminPage();
    }
}

// 멤버 삭제
function deleteMember(memberId) {
    if (confirm('정말로 이 멤버를 삭제하시겠습니까?')) {
        members = members.filter(m => m.id !== memberId);
        
        // 관련 데이터도 삭제
        delete checkData[memberId];
        delete mustRecords[memberId];
        
        alert('멤버가 삭제되었습니다.');
        updateAdminPage();
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
