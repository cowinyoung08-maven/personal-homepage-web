/* =========================================================
 * 개인 홈페이지 설정 파일 — 사이트의 모든 문구는 여기서만 고치면 됩니다.
 * (서버 없이 file:// 로 열어도 동작하도록 JSON 대신 JS 객체로 둡니다.)
 * 관리자 화면(오른쪽 위 자물쇠)에서 고쳐도 됩니다.
 * ========================================================= */
window.SITE_CONFIG = {
  // ── 기본 정보 ──────────────────────────────
  site: {
    university: "고려대학교",
    department: "미디어대학",
    title: "민영 Young Min · 고려대학교 미디어대학",
    shortTitle: "민영 · Young Min",
    footerNote: "© 2026 Young Min. All rights reserved."
  },

  // ── 관리자 ─────────────────────────────────
  // 비밀번호 원문은 저장하지 않고 암호화된 값(SHA-256)만 둡니다. (처음 비밀번호: 강의 사이트와 같음)
  // 비밀번호는 관리자 화면 > 사이트 정보에서 바꿀 수 있어요.
  admin: {
    passwordHash: "aaae9c9f51c2a01883f8aacb6d8434bdf3ea1c599bd4bc1c390cd7a23349c023"
  },

  // ── 화면에 보일 영역 켜기/끄기 ─────────────────
  // 강의 사이트에서 가져온 강의 전용 기능은 지우지 않고 꺼 두었습니다. true로 바꾸면 다시 보입니다.
  features: {
    notices: true,      // 공지사항
    curriculum: false,  // 주차별 일정 + 월간 수업 달력
    guide: false,       // 교재·평가 안내
    portfolio: false,   // 우수 과제 포트폴리오
    join: false,        // 참여하기 (투표·수강 신청서·로그인/출석/과제 제출)
    faq: false,         // 자주 묻는 질문
    petals: false,      // 떨어지는 꽃잎 장식
    showcase: false     // 강의 영역 아래 '학생 우수 작품' (내용은 showcase에 보관)
  },

  // ── 공지사항 (관리자 화면에서 올리고 지울 수 있어요) ──
  notices: [],

  // ── 상단 메뉴 (id는 페이지 안 영역의 id와 같아야 합니다) ──
  nav: [
    { id: "about",        label: "소개" },
    { id: "research",     label: "연구" },
    { id: "publications", label: "논문·저서" },
    { id: "teaching",     label: "강의" },
    { id: "students",     label: "연구실 소개" },
    { id: "contact",      label: "연락처" }
  ],

  // ── 첫 화면 ───────────────────────────────
  hero: {
    badge: "Political Communication · Journalism",
    name: "민영",
    nameEn: "Young Min",
    position: "고려대학교 미디어대학 교수",
    tagline: "커뮤니케이션이 시민의 정치적 삶과\n공동체의 민주주의에 미치는 영향을 연구합니다.",
    keywords: ["정치 커뮤니케이션", "저널리즘","젠더 · 세대", "테크놀로지와 민주주의"],
    photo: "images/professor.jpg",
    buttons: [
      { label: "연구 살펴보기", href: "#research", style: "primary" },
      { label: "연락하기", href: "#contact", style: "ghost" }
    ]
  },

  // ── 소개 ───────────────────────────────────
  about: {
    eyebrow: "About",
    title: "소개",
    text: "학부와 대학원에서 미디어와 정치, 디지털 미디어와 민주주의 프로젝트, 정치 커뮤니케이션 등의 과목을 강의한다. 서울대학교 사범대 졸업 후 동 대학원 언론정보학과에서 석사학위를 받았으며, 미국 텍사스주립대학(University of Texas-Austin)에서 저널리즘 박사학위를 취득했다. 미국 엘론대(Elon University) 커뮤니케이션대학 조교수와 경희대 언론정보학과 조교수를 거쳐 2007년 고려대에 부임했다. 한국언론학회 부회장, 언론중재위원회 중재위원, 고려대 성평등센터장, 고려대 다양성위원회 위원장, 한국연구재단 다양성위원회 위원장, 4단계 BK21 미디어학 교육연구단장 등을 역임했다.",
    timelineTitle: "약력",
    // group: 학력 / 경력 / 주요 활동 — year는 비워두면 표시되지 않아요. (연도를 채워 주세요)
    timeline: [
      { group: "학력", year: "", text: "서울대학교 사범대학 졸업" },
      { group: "학력", year: "", text: "서울대학교 대학원 언론정보학과 석사" },
      { group: "학력", year: "", text: "University of Texas at Austin 저널리즘 박사" },
      { group: "경력", year: "2007 ~", text: "고려대학교 미디어대학 교수" },
      { group: "경력", year: "2003 ~ 2004", text: "경희대학교 언론정보학과 조교수" },
      { group: "경력", year: "2003 ~ 2004", text: "Elon University 커뮤니케이션대학 조교수 (미국)" },
      { group: "주요 활동", year: "", text: "한국언론학회 부회장" },
      { group: "주요 활동", year: "", text: "언론중재위원회 중재위원" },
      { group: "주요 활동", year: "", text: "고려대학교 성평등센터장" },
      { group: "주요 활동", year: "", text: "고려대학교 다양성위원회 위원장" },
      { group: "주요 활동", year: "", text: "한국연구재단 다양성위원회 위원장" },
      { group: "주요 활동", year: "", text: "4단계 BK21 미디어학 교육연구단장" }
    ]
  },

  // ── 연구 ───────────────────────────────────
  research: {
    eyebrow: "Research",
    title: "연구",
    statement: "다양한 층위의 커뮤니케이션이 시민의 정치적 삶과 공동체의 민주주의에 미치는 영향력을 탐색하는 학자다. 선거와 일상 국면에서 시민의 정치적 선택과 정치참여에 미치는 미디어 효과를 연구해 왔다. 다수의 논문을 통해 새로운 미디어 환경에서 정치 극화가 발생하는 과정을 분석했으며, 갈등 주체가 소통할 수 있는 '숙의의 조건'을 규명하기도 했다. 새로운 정치 미디어와 저널리즘이 민주주의에 가지는 함의에 주목하고, 탈진실 시대의 언론 불신과 냉소 현상을 탐구하고 있다. 젠더와 세대와 연관된 다양한 정치 커뮤니케이션 현상도 주요 연구 주제다. 특히 초고령사회에서 노년층과 청년층이 마주하는 새로운 문제들에 주목하고 있다.",
    // Google Scholar 지표 — 숫자는 직접 고쳐야 바뀝니다. (asOf: 기준일)
    scholar: {
      url: "https://scholar.google.com/citations?user=NSBfSHIAAAAJ&hl=ko",
      asOf: "2026. 10. 3.",
      stats: [
        { value: "1,163", label: "총 인용" },
        { value: "20", label: "h-index" },
        { value: "31", label: "i10-index" },
        { value: "95", label: "등록 연구물" }
      ],
      interests: ["Political Communication", "Citizen Participation", "Deliberation", "Democracy"]
    },
    topicsTitle: "주요 연구 주제",
    topics: [
      { icon: "🗳️", title: "선거 캠페인과 의제설정", text: "선거 보도와 정치광고, 네거티브 캠페인, 후보자 속성 의제설정과 매체 간 의제설정" },
      { icon: "📱", title: "미디어 이용과 정치 참여", text: "뉴스·디지털 미디어·정치 팟캐스트 이용이 시민의 정치적 선택과 참여에 미치는 효과, 인터넷 이용과 정보격차" },
      { icon: "⚖️", title: "선택적 노출과 정치 극화", text: "정파적 선택성과 교차노출, 새로운 미디어 환경에서 태도 극화가 발생하는 과정" },
      { icon: "🤝", title: "숙의의 조건과 정치 대화", text: "갈등 주체가 소통할 수 있는 숙의의 조건, 이견 경험과 정치 참여, 온라인 토론의 평등 규칙" },
      { icon: "📰", title: "언론 신뢰 · 냉소와 허위정보", text: "저널리즘 전문성과 언론 신뢰, 언론 불신과 냉소, 가짜뉴스 효과와 뉴스 리터러시" },
      { icon: "👥", title: "젠더 · 세대와 정치", text: "노년층과 청년층의 정치 참여, 젠더와 정치참여 격차, 이주민·소수자에 대한 인식" },
      { icon: "🤖", title: "AI · 플랫폼과 민주주의", text: "생성형 AI의 수용과 거부, 인공지능 이슈의 뉴스 프레임, 유튜브 저널리즘과 선거" },
      { icon: "🎮", title: "미디어 폭력과 청소년", text: "텔레비전 폭력성, 청소년의 게임 이용과 공격성에 대한 종단 연구" }
    ],
    projectsTitle: "진행 중인 연구 프로젝트",
    // 관리자 화면 > 섹션 내용 > 연구에서 추가·수정할 수 있어요. 비어 있으면 이 영역은 보이지 않아요.
    // status: 진행 중 / 완료 — 끝난 과제는 '완료'로 바꾸면 회색 표시가 됩니다.
    projects: [
      { title: "미디어와 민주주의 퇴행: 정치 엘리트-미디어-시민을 연결하는 권위주의 담론의 파급 기제", period: "2026.06.01 ~ 2029.05.31", funder: "한국연구재단", role: "책임연구원", status: "진행 중", text: "" },
      { title: "초고령사회 대응 정책 관련 세대 통합 인식 개선을 위한 방안 연구", period: "2026.08.03 ~ 2026.12.30", funder: "인구전략위원회", role: "책임연구원", status: "진행 중", text: "" }
    ]
  },

  // ── 논문 · 저서 ─────────────────────────────
  // Google Scholar 프로필(2026. 10. 3. 기준)에서 가져온 목록입니다. 중복 2건은 뺐습니다.
  // type: 국내 학술지 / 해외 학술지 / 저서 · 북챕터 / 학술대회 / 보고서 · 기타
  // cites: Scholar 인용 수(직접 고쳐야 바뀜), scholar: Scholar 상세 페이지
  // doi: "10.xxxx/…" 처럼 DOI만 적으면 링크가 만들어져요. kci·url에는 주소 전체를 적어요.
  publications: {
    eyebrow: "Publications",
    title: "논문 · 저서",
    description: "Google Scholar 프로필을 바탕으로 연도별로 정리했어요. 종류별로 걸러 보거나 검색할 수 있어요.",
    types: ["국내 학술지", "해외 학술지", "저서 · 북챕터", "학술대회", "보고서 · 기타"],
    scholarUrl: "https://scholar.google.com/citations?user=NSBfSHIAAAAJ&hl=ko",
    items: [
      { year: 2026, type: "해외 학술지", authors: "S Ha, Y. Min", title: "Friend or foe? How digital artists navigate the generative AI disruption: Creative labor, appraisals, emotions, and coping", venue: "Convergence", detail: "", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:u9iWguZQMMsC" },
      { year: 2026, type: "국내 학술지", authors: "박재영 · 이해수 · 민영", title: "경쟁적 온라인 게임에서 서포터로 살아남기: 젠더화된 역할 수행에 대한 현상학적 분석", venue: "한국언론정보학보", detail: "135, 40-70", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:1sJd4Hv_s6UC" },
      { year: 2025, type: "국내 학술지", authors: "민영", title: "미디어 이용과 부정선거 신념: 유권자 정치 성향의 조절 효과", venue: "한국언론정보학보", detail: "134, 89-120", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:CHSYGLWDkRkC" },
      { year: 2025, type: "국내 학술지", authors: "박채림 · 민영", title: "뉴스 맞춤화와 허위정보 판별력: 주제 맞춤화와 이념 맞춤화를 중심으로", venue: "정치커뮤니케이션 연구", detail: "79, 107-156", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:KxtntwgDAa4C" },
      { year: 2025, type: "보고서 · 기타", authors: "민영", title: "언론조정의 의미를 돌아보며: 피해구제를 넘어 언론 신뢰의 자양분으로", venue: "언론중재", detail: "72-77", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:pqnbT2bcN3wC" },
      { year: 2024, type: "국내 학술지", authors: "CY Chan, Y. Min", title: "Online Political Participation Under Government Surveillance: Focusing on the Post National Security Law Era in Hong Kong", venue: "Asian Communication Research", detail: "", cites: 1, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:lSLTfruPkqcC" },
      { year: 2024, type: "국내 학술지", authors: "신하연 · 박채림 · 민영", title: "재난보도와 언론신뢰", venue: "한국언론정보학보", detail: "", cites: 3, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:vV6vV6tmYwMC" },
      { year: 2024, type: "국내 학술지", authors: "장미경 · 민영", title: "인공지능 이슈에 대한 뉴스 프레임이 이용자의 정서와 행동 의향에 미치는 영향", venue: "한국언론학보", detail: "75-118", cites: 1, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:RYcK_YlVTxYC" },
      { year: 2024, type: "국내 학술지", authors: "최재서 · 민영", title: "생성형 AI 콘텐츠 수용 및 거부 의도에 영향을 미치는 요인 연구: AI 커버 음악을 중심으로", venue: "방송통신연구", detail: "153-186", cites: 5, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:2P1L_qKh6hAC" },
      { year: 2023, type: "저서 · 북챕터", authors: "염운옥 · 조영태 · 민영 · 이수정 · 김학철", title: "인디아더존스: 우리는 왜 차이를 차별하는가", venue: "사람과나무사이", detail: "", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:g5m5HwL7SMYC" },
      { year: 2023, type: "국내 학술지", authors: "유혜리 · 민영", title: "생성형 인공지능 챗봇 챗지피티(ChatGPT) 이용 의도에 대한 연구: 기술 수용 모델과 어포던스를 중심으로", venue: "방송통신연구", detail: "124, 141-169", cites: 30, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:NaGl4SEjCO4C" },
      { year: 2023, type: "해외 학술지", authors: "Č Markov, Y. Min", title: "Unpacking public animosity toward professional journalism: A qualitative analysis of the differences between media distrust and cynicism", venue: "Journalism", detail: "24(10), 2136-2154", cites: 34, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:YFjsv_pBGBYC" },
      { year: 2023, type: "국내 학술지", authors: "김성민 · 민영", title: "고정관념과 오정보 수용이 난민 반대 정치참여에 미치는 영향: 분노와 두려움의 매개효과를 중심으로", venue: "미디어", detail: "103-143", cites: 7, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:qUcmZB5y_30C" },
      { year: 2023, type: "국내 학술지", authors: "김감미 · 민영", title: "‘이름짓기’의 정치적 효과: 정체성 단서를 활용한 언론의 이름짓기를 중심으로", venue: "정치커뮤니케이션연구", detail: "239-277", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:M05iB0D1s5AC" },
      { year: 2022, type: "국내 학술지", authors: "민영", title: "연령과 세대의 교차: 21대 총선에서 노년층과 청년층의 투표 선택 요인", venue: "정치커뮤니케이션연구", detail: "37-73", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:RGFaLdJalmkC" },
      { year: 2022, type: "해외 학술지", authors: "Č Markov, Y. Min", title: "Understanding the public’s animosity toward news media: Cynicism and distrust as related but distinct negative media perceptions", venue: "Journalism & Mass Communication Quarterly", detail: "99(4), 1099-1125", cites: 49, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:u5HHmVD_uO8C" },
      { year: 2022, type: "국내 학술지", authors: "민영", title: "노년층과 청년층의 차별적 정치참여 요인: 디지털 미디어 이용의 효과를 중심으로", venue: "언론정보연구", detail: "59(3), 64-97", cites: 7, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:O3NaXMp0MMsC" },
      { year: 2022, type: "국내 학술지", authors: "민영 · 양윤재 · 윤태웅 · 김지형", title: "대학의 인적 다양성과 다양성 풍토 인식이 학생 구성원의 다양성 수용도와 조직 만족도에 미치는 영향", venue: "다문화사회연구", detail: "79-113", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:NMxIlDl6LWMC" },
      { year: 2022, type: "국내 학술지", authors: "Y. Min, C Ahn", title: "How Generational, Aging, and Periodic Factors Influenced Older Adults’ Protest Participation: The Case of the Taegeukgi Rallies in South Korea", venue: "Korean Social Science Journal", detail: "49(2), 117-133", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:4OULZ7Gr8RgC" },
      { year: 2022, type: "국내 학술지", authors: "김동민 · 민영", title: "뉴스 리터러시의 하위차원 역량이 허위정보와 정정정보 수용에 미치는 효과", venue: "정치커뮤니케이션연구", detail: "66, 57-95", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:u_35RYKgDlwC" },
      { year: 2021, type: "해외 학술지", authors: "C Ahn, Y. Min", title: "Making cross-cutting exposure more deliberative: The moderating role of the equality rule in online discussions on a gender issue", venue: "Journal of Deliberative Democracy", detail: "17(2)", cites: 3, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:2osOgNQ5qMEC" },
      { year: 2021, type: "국내 학술지", authors: "김창숙 · 민영", title: "2020년 총선과 유튜브 저널리즘: 방송사 채널과 인플루언서 채널 선거 동영상의 공정성과 품질 분석", venue: "방송과 커뮤니케이션", detail: "130-166", cites: 12, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:hC7cP41nSMkC" },
      { year: 2021, type: "국내 학술지", authors: "장미경 · 민영", title: "COVID-19 백신 보도의 정치화와 극화: 주요 언론의 사설 분석", venue: "과학기술학연구", detail: "21(3), 139-173", cites: 8, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:-f6ydRqryjwC" },
      { year: 2020, type: "보고서 · 기타", authors: "민영 · 이훈 · 윤호영 · 김지원", title: "2020년 총선과 유튜브", venue: "연구보고서", detail: "1-159", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:SeFeTyx0c_EC" },
      { year: 2020, type: "국내 학술지", authors: "안재경 · 민영", title: "소통 전략으로서 미러링의 효과: 관점 수용과 외집단에 대한 부정적 감정을 중심으로", venue: "한국언론학보", detail: "64(5), 46-80", cites: 1, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:UeHWp8X0CEIC" },
      { year: 2020, type: "국내 학술지", authors: "이예찬 · 민영", title: "명예훼손 보도의 사회적 영향력 지각이 피해자의 법적대응 의향 및 규제태도에 미치는 영향: 제삼자 효과를 중심으로", venue: "미디어와 인격권", detail: "6(1), 193-234", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:hFOr9nPyWt4C" },
      { year: 2020, type: "해외 학술지", authors: "Č Markov, Y. Min", title: "The origins of media trust in a young democracy", venue: "Communication & Society", detail: "33(3), 67-84", cites: 32, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:u-x6o8ySG0sC" },
      { year: 2020, type: "해외 학술지", authors: "Y Lee, Y. Min", title: "Attribute agenda setting and affective priming in a South Korean election: How media descriptions of candidate attributes affect political decision-making", venue: "Asian Journal of Communication", detail: "30(1), 20-38", cites: 17, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:d1gkVwhDpl0C" },
      { year: 2019, type: "국내 학술지", authors: "심재철 · 민영", title: "A comparative study of fact-checking news coverage between South Korea and the United States", venue: "Asian Communication Research", detail: "13-44", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:W7OEmFMy1HYC" },
      { year: 2019, type: "국내 학술지", authors: "민영", title: "젠더와 정치참여 격차: 디지털 미디어의 동원 효과를 중심으로", venue: "아시아여성연구", detail: "39-75", cites: 5, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:LkGwnXOMwfcC" },
      { year: 2019, type: "해외 학술지", authors: "YJ Oh, HS Park, Y. Min", title: "Understanding location-based service application connectedness: Model development and cross-validation", venue: "Computers in Human Behavior", detail: "94, 82-91", cites: 36, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:zYLM7Y9cAGgC" },
      { year: 2019, type: "국내 학술지", authors: "민영", title: "'시민'으로서 노인: 노년층의 제도적, 비제도적 정치참여 동인에 대한 탐색", venue: "한국언론학보", detail: "63(1), 80-109", cites: 8, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:Tyk-4Ss8FVUC" },
      { year: 2018, type: "국내 학술지", authors: "이하경 · 민영", title: "온라인 뉴스 환경에서 프레임 경쟁의 효과", venue: "한국방송학보", detail: "32(5), 61-98", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:QIV2ME_5wuYC" },
      { year: 2017, type: "국내 학술지", authors: "노성종 · 최지향 · 민영", title: "'가짜뉴스효과'의 조건: 2017년 대통령 선거에서 나타난 '가짜뉴스효과'의 견인 및 견제 요인", venue: "사이버커뮤니케이션학보", detail: "34(4), 99-149", cites: 32, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:9yKSN-GCB0IC" },
      { year: 2017, type: "학술대회", authors: "민영 · 최지향 · 노성종", title: "가짜뉴스효과의 조건: 2017년 대통령 선거에서 나타난 가짜뉴스효과의 견인 및 견제 요인", venue: "한국방송학회 학술대회 논문집", detail: "189-193", cites: 3, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:dshw04ExmUIC" },
      { year: 2017, type: "국내 학술지", authors: "민영", title: "청소년의 게임 이용과 공격성: 자기회귀교차지연모형을 이용한 종단 분석", venue: "한국방송학보", detail: "31(6), 47-80", cites: 6, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:Wp0gIr-vW9MC" },
      { year: 2017, type: "보고서 · 기타", authors: "민영 · 채영길 · 김현정 · 유용민", title: "2017년 대선 보도 및 선거 뉴스 유통 연구", venue: "연구보고서", detail: "1-268", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:HoB7MX3m0LUC" },
      { year: 2016, type: "국내 학술지", authors: "민영", title: "신뢰의 조건: 저널리즘 전문성과 정파적 편향성이 언론 신뢰와 정치 신뢰에 미치는 영향", venue: "한국언론학보", detail: "60(6), 127-156", cites: 37, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:IjCSPb-OGe4C" },
      { year: 2016, type: "국내 학술지", authors: "민영", title: "선택적 뉴스 이용: 정파적 선택성과 뉴스 선택성의 원인과 정치적 함의", venue: "한국언론학보", detail: "60(2), 7-34", cites: 26, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:Y0pCki6q_DkC" },
      { year: 2016, type: "저서 · 북챕터", authors: "Y. Min, M McCombs", title: "Agenda setting in American political campaigning", venue: "The Praeger Handbook of Political Campaigning in the United States", detail: "45-62", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:R3hNpaxXUhUC" },
      { year: 2016, type: "해외 학술지", authors: "NS Kim, Y. Min", title: "How the media contextualize computer games: A comparative analysis of the U.S. and Korean game coverage", venue: "International Journal of Multimedia and Ubiquitous Engineering", detail: "", cites: 4, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:_xSYboBqXhAC" },
      { year: 2015, type: "저서 · 북챕터", authors: "L Willnat, Y. Min", title: "The emergence of social media politics in South Korea: The case of the 2012 presidential election", venue: "The Routledge Companion to Social Media and Politics", detail: "391-405", cites: 5, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:_Qo2XoVZTnwC" },
      { year: 2015, type: "저서 · 북챕터", authors: "J Kim, Y. Min", title: "An issue attention cycle analysis of the network agenda setting model: A case study of the nuclear issue in South Korea", venue: "The Power of Information Networks", detail: "132-143", cites: 20, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:e5wmG9Sq2KIC" },
      { year: 2015, type: "국내 학술지", authors: "권오주 · 민영", title: "정치엔터테인먼트 시청이 정치대화에 미치는 영향: 관여도와 정치정보효능감의 매개 효과", venue: "한국언론정보학보", detail: "73, 7-34", cites: 10, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:4TOpqqG69KYC" },
      { year: 2015, type: "국내 학술지", authors: "오은정 · 민영", title: "정치 엔터테인먼트 시청이 내재적 심리 욕구와 정치학습에 미치는 효과", venue: "한국언론학보", detail: "59(4), 44-73", cites: 3, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:M3ejUd6NZC8C" },
      { year: 2015, type: "국내 학술지", authors: "민영", title: "정치 풍자와 참여적 시민성: 정치 팟캐스트 이용이 정치 참여에 미치는 효과", venue: "한국방송학보", detail: "29(3), 36-69", cites: 13, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:Se3iqnhoufwC" },
      { year: 2015, type: "국내 학술지", authors: "김남수 · 민영 · 이기봉", title: "청소년폭력과 게임중독방지를 위한 스포츠프로그램 정책연구", venue: "한국체육정책학회지", detail: "13(2), 113-126", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:zA6iFVUQeVQC" },
      { year: 2014, type: "국내 학술지", authors: "민영", title: "뉴스와 엔터테인먼트의 융합: 2012년 대통령 선거에서 정치 팟캐스트의 효과", venue: "한국언론학보", detail: "58(5), 70-96", cites: 14, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:UebtZRa9Y70C" },
      { year: 2014, type: "국내 학술지", authors: "김미라 · 민영", title: "지지 후보와 추론 동기가 유권자의 선택적 노출과 교차노출에 미치는 영향: 선거에서의 인지부조화를 중심으로", venue: "한국방송학보", detail: "28(2), 7-49", cites: 9, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:ZeXyd9-uunAC" },
      { year: 2013, type: "국내 학술지", authors: "이유민 · 정세훈 · 민영", title: "적대적 매체 지각과 제삼자 지각이 정치 참여에 미치는 효과: 대선 투표 참여에 대한 상호작용 효과를 중심으로", venue: "한국언론학보", detail: "57(5), 346-367", cites: 9, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:hMod-77fHWUC" },
      { year: 2013, type: "해외 학술지", authors: "L Zhang, Y. Min", title: "Effects of entertainment media framing on support for gay rights in China: Mechanisms of attribution and value framing", venue: "Asian Journal of Communication", detail: "23(3), 248-267", cites: 41, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:3fE2CSJIrl8C" },
      { year: 2013, type: "국내 학술지", authors: "민영 · 노성종", title: "가치, 참여, 인터넷 이용: 386세대와 정보화세대의 비교", venue: "한국언론학보", detail: "57(2), 5-32", cites: 6, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:5nxA0vEk-isC" },
      { year: 2012, type: "국내 학술지", authors: "김정선 · 민영", title: "동성애에 대한 한국 영화의 시각적 프레임(visual frames): <왕의 남자>, <쌍화점>, <서양골동 양과자점 앤티크>를 중심으로", venue: "미디어, 젠더 & 문화", detail: "89-117", cites: 8, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:hqOjcs7Dif8C" },
      { year: 2012, type: "국내 학술지", authors: "민영", title: "이주 소수자의 미디어 이용, 대인 커뮤니케이션, 그리고 적대적 지각: 북한이탈주민의 심리적 적응에 대한 탐색", venue: "한국언론학보", detail: "56(4), 414-438", cites: 7, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:Zph67rFs4hoC" },
      { year: 2012, type: "국내 학술지", authors: "노정규 · 민영", title: "정치 정보에 대한 선택적 노출이 태도 극화에 미치는 효과: 비정치적 온라인 커뮤니티 이용자들을 대상으로", venue: "한국언론학보", detail: "56(2), 226-248", cites: 39, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:MXK_kJrjxJIC" },
      { year: 2012, type: "국내 학술지", authors: "민영 · 이종명 · 김미라 · 권오주", title: "이주민의 정치사회화: 커뮤니케이션 요인이 북한이탈주민의 정치심리적 성향과 정치참여에 미치는 영향", venue: "의정연구", detail: "18(3), 139-172", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:IWHjjKOFINEC" },
      { year: 2011, type: "국내 학술지", authors: "이유민 · 민영", title: "사회운동과 언론의 프레임 정렬: 일본군 ‘위안부’ 이슈에 대한 집합행위프레임을 중심으로", venue: "미디어, 젠더 & 문화", detail: "39-70", cites: 4, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:0EnyYjriUFMC" },
      { year: 2011, type: "국내 학술지", authors: "민영 · 노성종", title: "한국과 미국 청소년의 인터넷 이용, 정치의식, 그리고 정치참여", venue: "한국언론학보", detail: "55(4), 284-308", cites: 20, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:roLk4NBRz8UC" },
      { year: 2011, type: "국내 학술지", authors: "이로물로 · 민영", title: "종교방송의 공익성: 평화방송 TV 시청의 사회자본 증진 효과를 중심으로", venue: "한국방송학보", detail: "25(4), 176-212", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:HDshCWvjkbEC" },
      { year: 2011, type: "학술대회", authors: "민영 · 노성종", title: "한미 청소년의 인터넷 이용, 정치의식, 그리고 정치참여", venue: "한국언론학회 학술대회 발표논문집", detail: "204-208", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:j3f4tGmQtD8C" },
      { year: 2011, type: "저서 · 북챕터", authors: "민영 · 노성종", title: "소통의 조건: 한국 사회의 시민 간 정치 대화 탐구", venue: "한국사회와 소통위기", detail: "", cites: 13, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:D03iK_w7-QYC" },
      { year: 2011, type: "국내 학술지", authors: "김형경 · 민영", title: "조직 커뮤니케이션 매체로서 위성영상방송: 정보적·관계적 차원의 효과를 중심으로", venue: "방송통신연구", detail: "74, 42-63", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:3s1wT3WcHBgC" },
      { year: 2011, type: "국내 학술지", authors: "민영", title: "인터넷 이용과 정보격차: 접근, 활용, 참여를 중심으로", venue: "언론정보연구", detail: "48(1), 150-187", cites: 118, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:8k81kl-MbHgC" },
      { year: 2010, type: "국내 학술지", authors: "강희정 · 민영", title: "17대 대통령 선거 보도에 나타난 후보자 속성의제와 매체 간 의제설정", venue: "정치커뮤니케이션연구", detail: "5-46", cites: 3, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:ns9cj8rnVeAC" },
      { year: 2010, type: "국내 학술지", authors: "허석재 · 민영", title: "사이버모욕죄 보도의 프레이밍 효과: 핵심 가치와 귀인 양식을 중심으로", venue: "한국언론정보학보", detail: "52, 48-68", cites: 7, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:L8Ckcad2t8MC" },
      { year: 2010, type: "국내 학술지", authors: "나현정 · 민영", title: "상징적 이름짓기의 프레이밍 효과: ‘태안’ vs ‘삼성-허베이스피릿호’ 기름유출사고", venue: "한국언론학보", detail: "54(4), 209-232", cites: 11, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:kNdYIx-mwKoC" },
      { year: 2009, type: "국내 학술지", authors: "김남수 · 민영", title: "커뮤니케이션 요인과 스포츠 활동이 청소년 전기(early adolescence)의 반사회적 행위(antisocial behavior)에 미치는 영향", venue: "한국청소년연구", detail: "20(4)", cites: 8, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:mVmsd5A6BfQC" },
      { year: 2009, type: "국내 학술지", authors: "노성종 · 민영", title: "'숙의'와 '참여'의 공존: 대화의 숙의수준에 따른 정치적 이견의 경험과 정치참여의 관계 탐색", venue: "한국언론학보", detail: "53(3), 173-197", cites: 39, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:yD5IFk8b50cC" },
      { year: 2009, type: "학술대회", authors: "민영 · 김성태 · 나현정 · 김여진", title: "인터넷 이용과 정보격차: 정보접근성, 활용능력, 그리고 사회자본을 중심으로", venue: "한국언론학회 학술대회 발표논문집", detail: "85-88", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:iH-uZ7U-co4C" },
      { year: 2008, type: "국내 학술지", authors: "민영", title: "뉴스미디어, 캠페인 미디어, 그리고 정치 대화가 후보자 이미지와 정치적 의사결정에 미치는 영향: 제17대 대통령 선거를 중심으로", venue: "한국언론정보학보", detail: "108-143", cites: 27, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:ULOm3_A8WrAC" },
      { year: 2008, type: "국내 학술지", authors: "오택섭 · 박선희 · 이강형 · 민영", title: "텔레비전 후보자 토론회와 적대적 매체 지각: 제17대 대통령 후보 토론회를 중심으로", venue: "한국방송학보", detail: "22(4), 127-164", cites: 13, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:YOwf2qJgpHMC" },
      { year: 2008, type: "학술대회", authors: "오택섭 · 박선희 · 이강형 · 민영", title: "텔레비전 후보자 토론회와 적대적 매체 지각: 17대 대통령 후보자 토론회를 중심으로", venue: "한국방송학회 학술대회 논문집", detail: "25-26", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:SP6oXDckpogC" },
      { year: 2008, type: "저서 · 북챕터", authors: "Y. Min", title: "Accountability of the news", venue: "The International Encyclopedia of Communication", detail: "Vol. I", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:bFI3QPDXJZMC" },
      { year: 2008, type: "저서 · 북챕터", authors: "Y. Min", title: "Accountability of the media", venue: "The International Encyclopedia of Communication", detail: "Vol. I", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:f2IySw72cVMC" },
      { year: 2008, type: "저서 · 북챕터", authors: "민영", title: "미디어 선거와 의제설정", venue: "나남", detail: "", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:a0OBvERweLwC" },
      { year: 2008, type: "국내 학술지", authors: "민영", title: "온·오프라인 뉴스미디어 이용, 대인 커뮤니케이션, 그리고 정치 참여: 제18대 국회의원 총선거를 중심으로", venue: "의정연구", detail: "14(2), 143-172", cites: 4, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:M3NEmzRMIkIC" },
      { year: 2007, type: "보고서 · 기타", authors: "김옥현 · 심재철 · 김수정 · 김정기 · 정재민 · 송기인 · 민영 · 정재철 · 김사승 외", title: "한국적 커뮤니케이션 이론화 작업에 대한 토론", venue: "커뮤니케이션 이론", detail: "3(2), 200-207", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:P5F9QuxV20EC" },
      { year: 2007, type: "국내 학술지", authors: "민영", title: "대통령 후보 경선과 언론: 2007년 한나라당 후보들의 네거티브 캠페인을 중심으로", venue: "정치커뮤니케이션 연구", detail: "7, 121-156", cites: 1, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:ldfaerwXgEUC" },
      { year: 2007, type: "국내 학술지", authors: "하승태 · 민영 · 김창숙", title: "주시청시간대 지상파 텔레비전의 폭력성 연구: 폭력의 맥락적 변인을 중심으로", venue: "한국언론학보", detail: "317-345", cites: 9, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:7PzlFSSx8tAC" },
      { year: 2007, type: "국내 학술지", authors: "민영 · 주익현", title: "사회자본의 민주주의 효과: 미디어 이용과 사회자본이 정치적 관심과 신뢰 및 참여에 미치는 영향", venue: "한국언론학보", detail: "190-217", cites: 45, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:KlAtU1dfN6UC" },
      { year: 2007, type: "국내 학술지", authors: "민영 · 이정교 · 김태용", title: "주시청시간대 지상파 텔레비전의 폭력성 연구: 폭력의 양과 유형을 중심으로", venue: "한국방송학보", detail: "21(5), 84-126", cites: 19, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:dhFuZR0502QC" },
      { year: 2007, type: "해외 학술지", authors: "Y. Min, SI Ghanem, D Evatt", title: "Using a split-ballot survey to explore the robustness of the ‘MIP’ question in agenda-setting research: A methodological study", venue: "International Journal of Public Opinion Research", detail: "19(2), 221-236", cites: 41, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:ufrVoPGSRksC" },
      { year: 2007, type: "보고서 · 기타", authors: "민영", title: "원로교수와의 대담: 정치 커뮤니케이션 연구의 오택섭 고려대학교 명예교수", venue: "커뮤니케이션 이론", detail: "3(1), 197-216", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:b0M2c_1WBrUC" },
      { year: 2006, type: "국내 학술지", authors: "민영", title: "정치광고의 이슈현저성과 후보자 선호도에 대한 효과: 이슈소유권(issue ownership)과 네거티브 소구(negative appeals)를 중심으로", venue: "한국언론학보", detail: "50(5), 108-131", cites: 10, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:_kc_bZDykSQC" },
      { year: 2006, type: "국내 학술지", authors: "민영", title: "캠페인 의제형성: 미국 지역선거에 나타난 미디어 간 의제설정 연구", venue: "커뮤니케이션학연구", detail: "14(4), 5-25", cites: 1, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:EUQCXRtRnyEC" },
      { year: 2006, type: "학술대회", authors: "ME McCombs, Y. Min", title: "Campaign agenda formation: The intermedia agenda setting process in a state primary election", venue: "International Communication Association (ICA) Conference", detail: "", cites: 11, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:k_IJM867U9cC" },
      { year: 2005, type: "국내 학술지", authors: "민영", title: "한국 언론의 정치광고 보도경향: 14~16대 대통령선거를 중심으로", venue: "한국언론학보", detail: "177-201", cites: 3, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:4DMP91E08xMC" },
      { year: 2005, type: "국내 학술지", authors: "민영", title: "정치광고의 의제설정기능과 투표선호도에 대한 효과", venue: "광고연구", detail: "79-100", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:aqlVkmm33-oC" },
      { year: 2005, type: "저서 · 북챕터", authors: "Y. Min, M McCombs", title: "Agenda setting: Laying the foundations of public opinion", venue: "Polling America: An Encyclopedia of Public Opinion", detail: "", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:pyW8ca7W8N0C" },
      { year: 2005, type: "학술대회", authors: "Y. Min, DS Evatt, S Ghanem, S Kiousis, M McCombs, T Takeshita", title: "Using a split-ballot survey to explore the robustness of the MIP question in agenda-setting research: A methodological study", venue: "학술대회 발표논문", detail: "", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:r0BpntZqJG4C" },
      { year: 2004, type: "해외 학술지", authors: "Y. Min", title: "News coverage of negative political campaigns: An experiment of negative campaign effects on turnout and candidate preference", venue: "Harvard International Journal of Press/Politics", detail: "9(4), 95-111", cites: 124, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:eQOLeE2rZwMC" },
      { year: 2004, type: "해외 학술지", authors: "Y. Min", title: "Campaign agenda formation: The news media in the Korean congressional election of 2000", venue: "Asian Journal of Communication", detail: "14(2), 192-204", cites: 22, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:WF5omc3nYNoC" },
      { year: 2004, type: "국내 학술지", authors: "민영", title: "2000년 미국 대통령 선거에서의 뉴스의제 형성: 후보자의제의 이슈소유권과 소구기법을 중심으로", venue: "언론과 사회", detail: "12(3), 125-156", cites: 2, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:TQgYirikUcIC" },
      { year: 2002, type: "해외 학술지", authors: "Y. Min", title: "Intertwining of campaign news and advertising: The content and electoral effects of newspaper ad watches", venue: "Journalism & Mass Communication Quarterly", detail: "79(4), 927-944", cites: 29, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:YsMSGLbcyi4C" },
      { year: 2001, type: "해외 학술지", authors: "Y. Min", title: "The second level of presidential influence on the news media: A longitudinal analysis of agenda setting", venue: "LBJ Journal of Public Affairs", detail: "13, 9", cites: 0, doi: "", kci: "", url: "", scholar: "https://scholar.google.com/citations?view_op=view_citation&user=NSBfSHIAAAAJ&citation_for_view=NSBfSHIAAAAJ:ZHo1McVdvXMC" }
    ]
  },

  // ── 강의 ───────────────────────────────────
  // 학기별로 과목을 묶어 카드로 보여줍니다.
  //   syllabus: 강의계획서 링크 (구글 드라이브 공유 주소 등), site: 강의 사이트 주소
  //   '미디어와 정치'의 site는 두 사이트 폴더를 나란히 올렸을 때를 기준으로 한 상대 주소입니다.
  //   강의 사이트를 다른 주소로 배포하면 그 주소로 바꿔 주세요.
  teaching: {
    eyebrow: "Teaching",
    title: "강의",
    description: "학부와 대학원에서 미디어와 정치, 디지털 미디어와 민주주의, 정치 커뮤니케이션을 가르칩니다.",
    semesters: [
      { term: "2026년 2학기", courses: [
        { icon: "🏛️", title: "미디어와 정치", en: "Media & Politics", level: "", schedule: "화·목 12:00 ~ 13:15 · 미디어관 410호",
          text: "미디어 생태계의 급격한 변동 속에서 정치커뮤니케이션 이론과 모델을 바탕으로 정치와 민주주의에서 미디어와 커뮤니케이션의 다양한 역할을 탐색합니다.",
          syllabus: "", site: "https://lecturewebpage-production.up.railway.app/", siteLabel: "강의 사이트" }
      ] },
      { term: "그 밖의 담당 과목", courses: [
        { icon: "🌐", title: "디지털 미디어와 민주주의 프로젝트", en: "", level: "", schedule: "", text: "", syllabus: "", site: "", siteLabel: "" },
        { icon: "💬", title: "정치 커뮤니케이션", en: "Political Communication", level: "", schedule: "", text: "", syllabus: "", site: "", siteLabel: "" }
      ] }
    ]
  },

  // ── 학생 우수 작품 (강의 사이트의 우수 과제 포트폴리오에서 가져옴) ──
  // 자료는 '구글 드라이브 공유 주소(driveUrl)'로만 등록합니다. (링크가 있는 모든 사용자 · 뷰어)
  // ※ 학생 과제물과 이름은 반드시 본인 동의를 받은 뒤 게시하세요.
  //   sample: true 인 항목은 '예시' 표시가 붙습니다. 실제 작품으로 바꾸면서 지워주세요.
  showcase: {
    eyebrow: "Student Works",
    title: "학생 우수 작품",
    description: "강의에서 나온 우수 과제를 소개합니다. 카드를 누르면 자료를 바로 볼 수 있어요.",
    note: "게시된 과제는 모두 학생 본인의 동의를 받아 공개합니다.",
    works: [
      {
        sample: true, type: "팀 프로젝트", award: "최우수", semester: "2025-2학기 · 미디어와 정치", icon: "📱",
        title: "숏폼 시대의 감정적 극화: 정치 쇼츠 댓글 분석",
        authors: "OOO · OOO · OOO · OOO · OOO · OOO",
        summary: "정치 유튜브 쇼츠 댓글을 수집해 감정적 극화의 양상을 진단하고, 플랫폼과 이용자 차원의 완화 전략을 제안했습니다.",
        detail: "선택적 노출과 정치 극화 이론을 바탕으로 정치 숏폼 콘텐츠의 댓글에서 외집단에 대한 부정적 감정 표현이 어떻게 나타나는지 분석했습니다. 댓글 데이터와 이용자 인터뷰를 함께 활용했고, 추천 알고리즘 투명성 강화와 '반대 관점 보기' 기능 도입을 대안으로 제시했습니다.",
        tags: ["정치 극화", "소셜미디어", "Original data"],
        driveUrl: ""
      },
      {
        sample: true, type: "개인 프로젝트", award: "", semester: "2025-2학기 · 미디어와 정치", icon: "📊",
        title: "여론조사 보도는 경마 저널리즘인가",
        authors: "OOO",
        summary: "선거 기간 여론조사 보도의 프레임을 분석하고, 경마식 보도가 유권자 인식에 미치는 영향을 이론과 연결했습니다.",
        detail: "의제 설정과 프레이밍 이론을 적용해 주요 언론사의 여론조사 보도를 분석했습니다. 지지율 순위 중심의 보도가 정책 정보를 밀어내는 양상을 사례로 보여주었습니다.",
        tags: ["여론", "프레이밍", "선거 보도"],
        driveUrl: ""
      },
      {
        sample: true, type: "팀 프로젝트", award: "우수", semester: "2025-2학기 · 미디어와 정치", icon: "🛡️",
        title: "허위정보 백신: 20대를 위한 판별 게임 제안",
        authors: "OOO · OOO · OOO · OOO · OOO",
        summary: "허위조작정보에 취약한 지점을 설문으로 진단하고, 사전 노출(prebunking) 원리를 활용한 교육용 게임을 기획했습니다.",
        detail: "대학생 설문 조사로 허위정보 판별 능력과 미디어 이용 습관의 관계를 살펴보았습니다. 접종 이론을 바탕으로 짧은 게임 형식의 미디어 리터러시 교육안을 설계해 시연했습니다.",
        tags: ["허위조작정보", "미디어 리터러시", "설문 조사"],
        driveUrl: ""
      }
    ]
  },

  // ── 지도학생 ─────────────────────────────────
  // status: 재학 / 졸업, program: 박사과정 / 석사과정 (졸업생은 박사 / 석사), major: 전공
  // topic: 연구 주제, thesis: 학위논문 제목, year: 입학·졸업 연도 (예: "2024 입학", "2023 졸업")
  // public: false 로 두면 사이트에 이름이 보이지 않고 '비공개 N명'으로만 표시돼요.
  // stage: 학위논문 진행 단계 (0 = 시작 전, 1 = 계획서 완료 … 5 = 인준 완료), stageDates: 단계별 완료 시기
  // codeHash: 학생 전용 공간 로그인용 개인 코드(암호화된 값) — 관리자 화면 > 지도학생 관리에서 발급하세요.
  // ── 프로필 팝업 (카드를 누르면 열림) ──
  // photo: 사진 (선택) — "images/파일명.jpg" 또는 구글 드라이브 공유 주소. 비워두면 이름 첫 글자 원.
  // keywords: 연구 분야 키워드 (카드에는 앞의 3개만 보여요)
  // works: 대표 연구 업적 — { year, type: 학술지/학회 발표/수상/프로젝트/기타, title, venue, link }
  //   교수님 논문 목록(publications)에 공동저자로 이름이 있으면 그 논문도 프로필에 자동으로 함께 보여요.
  advisees: {
    eyebrow: "Lab Members",
    title: "지도학생",
    description: "함께 연구하는 대학원생들입니다.",
    stages: ["계획서", "연구윤리(IRB) 승인", "예비심사", "본심사", "인준"],
    students: [
      { name: "박채림", status: "재학", program: "박사과정", major: "미디어", topic: "", thesis: "", year: "", public: true, stage: 3, stageDates: ["", "", "", "", ""], codeHash: "b72acedc33efce6309261f0586701cd3d0fe5b182bffca7408cb0336ab77304b", photo: "", keywords: [], works: [] },
      { name: "김지연", status: "재학", program: "박사과정", major: "미디어", topic: "", thesis: "", year: "", public: true, stage: 0, stageDates: ["", "", "", "", ""], codeHash: "7ae988acf952fe9496de640c2d7b2d1f80be52b84d5e9821abc5501abba33724", photo: "", keywords: [], works: [] },
      { name: "조민경", status: "재학", program: "박사과정", major: "과학기술학", topic: "", thesis: "", year: "", public: true, stage: 0, stageDates: ["", "", "", "", ""], codeHash: "4ea12d3e48ee1a6faa7279af1f6603919a3422353f63fe9752fffc2a68374814", photo: "", keywords: [], works: [] },
      { name: "신명철", status: "재학", program: "박사과정", major: "과학기술학", topic: "", thesis: "", year: "", public: true, stage: 0, stageDates: ["", "", "", "", ""], codeHash: "a7c7dc5fb783cc6baed3393f4009f2071005fbeb130435708a60145fda723dda", photo: "", keywords: [], works: [] },
      { name: "전용준", status: "재학", program: "석사과정", major: "미디어", topic: "", thesis: "", year: "", public: true, stage: 0, stageDates: ["", "", "", "", ""], codeHash: "0a8d1f77057c709ebb15200fee1fa30aebf25895b36139acf9ffbe1f936bfe6e", photo: "", keywords: [], works: [] },
      { name: "오지운", status: "재학", program: "석사과정", major: "미디어", topic: "", thesis: "", year: "", public: true, stage: 0, stageDates: ["", "", "", "", ""], codeHash: "1dd8a320a4eecc36aa0429db997c2ed41ed9721101c1094022784d80b6d1e341", photo: "", keywords: [], works: [] },
      { name: "김재민", status: "재학", program: "석사과정", major: "미디어", topic: "", thesis: "", year: "", public: true, stage: 0, stageDates: ["", "", "", "", ""], codeHash: "38d09858337c508e72ef86ad24c3ecdd27808ab4931a5e1361f9ca4b9b7908f7", photo: "", keywords: [], works: [] },
      { name: "구현정", status: "재학", program: "석사과정", major: "과학기술학", topic: "", thesis: "", year: "", public: true, stage: 0, stageDates: ["", "", "", "", ""], codeHash: "328c3946fb102b9279872fc4b101a98137e998f990386da8511fd60e929b04cb", photo: "", keywords: [], works: [] }
    ]
  },

  // ── 연구실 소개 ───────────────────────────────
  // 지도 방식(mentoring)·연구실 규칙(rules)은 비워 두어 화면에 보이지 않아요. 항목을 넣으면 다시 나타나요.
  lab: {
    eyebrow: "Lab",
    title: "연구실 소개",
    sample: false,
    intro: "정치 커뮤니케이션과 민주주의를 연구하는 대학원 연구실입니다. 미디어와 커뮤니케이션이 시민의 정치적 삶과 공동체의 민주주의에 미치는 영향을 함께 탐구합니다.",
    topicsTitle: "함께 다루는 주제",
    topics: ["정치 커뮤니케이션", "민주주의와 숙의", "시민 참여", "저널리즘과 언론 신뢰", "허위정보와 뉴스 리터러시", "젠더 · 세대와 정치", "AI · 플랫폼과 민주주의"],
    mentoringTitle: "지도 방식",
    mentoring: [],
    rulesTitle: "연구실 규칙",
    rules: []
  },

  // ── 입학 · 지도 문의 ─────────────────────────
  // 면담 신청서는 지금은 이 브라우저에 저장됩니다. (5단계에서 구글 스프레드시트로 연결 예정)
  // 관리자 화면 > 면담 신청 탭에서 확인하고 엑셀(CSV)로 내려받을 수 있어요.
  consult: {
    eyebrow: "Admission",
    title: "입학 · 지도 문의",
    description: "지도를 희망하는 학생은 아래 안내를 읽고 면담 신청서를 보내 주세요.",
    sample: true,
    guide: [
      { icon: "📚", title: "먼저 읽어 주세요", text: "최근 논문 몇 편을 읽고, 관심 있는 연구 주제와 질문을 정리해 오면 면담이 훨씬 알차집니다." },
      { icon: "🎓", title: "입학 절차", text: "대학원 입학 전형과 일정은 고려대학교 대학원 모집 요강을 따릅니다." },
      { icon: "🗓️", title: "면담", text: "신청서를 보내면 확인 후 이메일로 면담 일정을 안내합니다." },
      { icon: "✉️", title: "문의", text: "ymin@korea.ac.kr" }
    ],
    form: {
      title: "면담 신청서",
      description: "* 표시는 꼭 채워야 하는 항목이에요.",
      submitLabel: "신청서 보내기",
      successTitle: "면담 신청이 접수되었어요",
      successText: "확인 후 입력한 이메일로 연락드릴게요.",
      fields: [
        { name: "name", label: "이름", type: "text", required: true, placeholder: "홍길동" },
        { name: "email", label: "이메일", type: "email", required: true, placeholder: "name@example.com" },
        { name: "affiliation", label: "소속 (학교 · 학과)", type: "text", required: true, placeholder: "○○대학교 ○○학과" },
        { name: "current", label: "현재 과정", type: "select", required: true, options: ["학부 재학", "학부 졸업", "석사 재학", "석사 졸업", "기타"] },
        { name: "wish", label: "희망 과정", type: "radio", required: true, options: ["석사", "박사", "석박사통합", "연구 참여 · 인턴"] },
        { name: "interest", label: "관심 연구 주제", type: "textarea", required: true, placeholder: "관심 있는 주제와 그 이유를 적어 주세요." },
        { name: "meeting", label: "희망 면담 방식", type: "radio", required: false, options: ["대면", "화상", "상관없음"] },
        { name: "when", label: "희망 면담 시기", type: "text", required: false, placeholder: "예: 11월 중 화요일 오후" },
        { name: "message", label: "하고 싶은 말 · 질문", type: "textarea", required: false, placeholder: "" },
        { name: "agree", label: "개인정보 수집·이용에 동의합니다. (면담 안내 목적, 1년 후 파기)", type: "checkbox", required: true }
      ]
    }
  },

  // ── 자료실 ───────────────────────────────────
  // 자료는 '구글 드라이브 공유 주소(driveUrl)'로만 등록합니다. 비워두면 '준비 중'으로 보여요.
  // category가 같은 자료끼리 묶여서 보입니다.
  resources: {
    eyebrow: "Resources",
    title: "자료실",
    description: "연구실에서 함께 쓰는 자료 모음입니다. 누르면 구글 드라이브에서 열려요.",
    items: [
      { category: "논문 양식", icon: "📄", title: "학위논문 작성 양식", note: "", driveUrl: "" },
      { category: "논문 양식", icon: "📄", title: "학위논문 계획서 양식", note: "", driveUrl: "" },
      { category: "연구윤리", icon: "🛡️", title: "연구윤리심의(IRB) 신청 안내", note: "", driveUrl: "" },
      { category: "연구윤리", icon: "🛡️", title: "연구윤리 교육 자료", note: "", driveUrl: "" },
      { category: "추천 문헌", icon: "📚", title: "정치 커뮤니케이션 필독 문헌 목록", note: "", driveUrl: "" },
      { category: "추천 문헌", icon: "📚", title: "연구방법론 참고 자료", note: "", driveUrl: "" }
    ]
  },

  // ── 학생 전용 공간 (5단계) ─────────────────────
  // 지도학생이 이름 + 개인 코드로 로그인해서 쓰는 곳: 학위논문 진행 단계, 주간 진행 보고, 프로필 수정 요청
  portal: {
    eyebrow: "Members Only",
    title: "학생 전용 공간",
    description: "지도학생은 이름과 개인 코드로 로그인하면 학위논문 진행 단계, 주간 진행 보고, 프로필 수정 요청을 이용할 수 있어요."
  },

  // ── 랩 미팅 · 면담 일정 (관리자 화면 > 랩 일정에서 추가·수정·삭제) ──
  // type: 랩 미팅 / 면담 / 심사 / 세미나 / 기타, who: "전체" 또는 학생 이름(쉼표로 여러 명)
  // weekly: true 이면 until 날짜까지 매주 같은 요일에 반복돼요.
  labEvents: [],

  // ── 구글 스프레드시트 연결 (주간 진행 보고 · 면담 신청서 저장) ──
  // endpoint: Apps Script 웹 앱 주소 (https://script.google.com/macros/s/…/exec)
  // sheetUrl: 기록이 쌓이는 구글 시트 주소 (관리자 화면에서 바로 열기용)
  // key: 아무 문자열 — Apps Script의 KEY와 같게 맞추면 그 값이 맞는 기록만 저장돼요. (비워도 됨)
  sheets: {
    endpoint: "https://script.google.com/macros/s/AKfycbwhvdGgvKN0aErYNUbZw84rZUqpI4cCYGtOgWx-y45jXqc8ot_M80J7Uocgftt9Lo4/exec",
    sheetUrl: "https://docs.google.com/spreadsheets/d/10ObZuygkI2oWzoncfsBX6FWUlX5rwYfTfPm6MXxRbAo/edit",
    key: ""
  },
  // ── 연락처 (페이지 끝) ─────────────────────────
  professor: {
    eyebrow: "Contact",
    name: "민영 Young Min",
    role: "고려대학교 미디어대학 교수",
    // 사진 파일을 images 폴더에 넣고 경로를 적으세요. 비워두면 이름 첫 글자가 든 원이 표시됩니다.
    photo: "images/professor.jpg",
    bio: "연구 협업, 강의, 대학원 진학 문의는 이메일로 연락해 주세요.",
    contacts: [
      { icon: "✉️", label: "이메일", value: "ymin@korea.ac.kr", href: "mailto:ymin@korea.ac.kr" },
      { icon: "🏛️", label: "연구실", value: "고려대학교 미디어관 408호" },
      { icon: "☎️", label: "전화", value: "02-3290-2265", href: "tel:0232902265" }
    ]
  },

  // =========================================================
  // 아래는 강의 사이트에서 가져온 강의 전용 설정입니다.
  // 지금은 features에서 꺼 두어 화면에 보이지 않아요. (지우지 않고 보관)
  // =========================================================

  // ── 주차별 일정 ───────────────────────────────
  curriculum: {
    eyebrow: "Schedule",
    title: "주차별 일정",
    description: "주차를 누르면 수업 날짜, 핵심 질문, 읽기 자료를 볼 수 있어요.",
    weeksTitle: "16주 주차별 일정",
    calendarTitle: "월간 수업 달력",
    topicsTitle: "핵심 질문",

    // 기본 수업 시간·장소 (주차마다 다르면 그 주에 time / location을 따로 적으세요)
    time: "12:00 ~ 13:15",
    location: "미디어관 410호",
    // 휴강일 — 달력에 표시됩니다.
    holidays: [
      { date: "2026-09-24", label: "추석 휴강" },
      { date: "2026-10-22", label: "시험 기간 휴강" }
    ],
    // 그 밖의 일정 (특강·행사·보강 등) — 관리자 화면 > 수업 일정에서 추가·수정·삭제할 수 있어요.
    // type: 일정 / 행사 / 특강 / 보강
    events: [],

    // 과제 제출 링크 (비워두면 사이트 안 '참여하기'에서 제출)
    submitUrl: "",

    // 주차별 내용
    //  - label: 주차 표시 (예: "5~6주"), dates: 수업 날짜 목록 (YYYY-MM-DD)
    //  - topics: 핵심 질문, readings: 필수 읽기(*), refs: 참고 문헌([참고]), notes: 안내 사항
    //  - exam: true 이면 시험 주간으로 표시
    //  - assignment: 과제가 있는 주만. due 형식: "YYYY-MM-DD HH:MM"
    weeks: [
      {
        label: "1-1주", dates: ["2026-09-01"],
        title: "강의 운영 안내 · 주요 개념 및 주제 소개",
        topics: [
          "정치커뮤니케이션은 어떻게 정의할 수 있는가?",
          "미디어-정치 환경의 변화에 따라 정치커뮤니케이션의 특성은 어떻게 변화해 왔는가?"
        ],
        readings: [], refs: [], notes: ["개인 프로젝트 발표 신청은 두 번째 주에 LMS로 진행합니다. (선착순)"]
      },
      {
        label: "1-2주", dates: ["2026-09-03"],
        title: "민주주의, 정치, 그리고 미디어",
        topics: [
          "미디어는 민주주의에 왜 필요한가?",
          "미디어와 커뮤니케이션이 좋은 민주주의를 만드는 데 기여할 수 있는가?"
        ],
        readings: [
          "Perloff (2014). Chapter 2. What is political communication",
          "Strömbäck, J. (2005). In search of a standard: Four models of democracy and their normative implications for journalism. Journalism Studies, 6(3), 331-345."
        ],
        refs: []
      },
      {
        label: "2주", dates: ["2026-09-08", "2026-09-10"],
        title: "정치-미디어 지형의 변화와 민주주의",
        topics: [
          "민주주의는 진보하고 있는가, 아니면 퇴행하는가? 그 근거는 무엇인가?",
          "사람들은 민주주의를 지지하는가? 반민주적 태도가 늘어난다면 그 이유는 무엇인가?",
          "미디어 지형은 어떻게 변화하고 있으며, 이것은 정치와 민주주의에 어떤 함의를 가지는가?"
        ],
        readings: [
          "Blumler, J. G. (2016). The fourth age of political communication. Politiques de Communication, 6(1), 19–30."
        ],
        refs: [
          "Levitsky, S., & Ziblatt, D. (2018). How democracies die. Crown. 박세연 (역) (2018). <어떻게 민주주의는 무너지는가>. 어크로스.",
          "권혁용 (2023). 한국의 민주주의 퇴행. <한국정치학회보>, 57권 1호, 33-58."
        ]
      },
      {
        label: "3주", dates: ["2026-09-15", "2026-09-17"],
        title: "정치심리학: 인지, 정서, 선택의 메커니즘",
        topics: [
          "사람들은 무엇을 중심으로 투표 선택을 하는가? 왜 어떤 후보를 좋아하고 싫어하는가?",
          "매일 접하는 방대한 정보는 정치적 의사결정에 어떻게 반영되는가?",
          "정치적 의사결정과 경제적 의사결정은 어떻게 유사하고, 어떻게 다른가?"
        ],
        readings: [
          "Lau, R. R., & Redlawsk, D. P. (2006). Introduction. How voters decide: Information processing during election campaigns (pp. 3-20). Cambridge University Press."
        ],
        refs: []
      },
      {
        label: "4주", dates: ["2026-09-22", "2026-09-29"],
        title: "정치심리학: 집단 정체성과 정치",
        topics: [
          "개인의 정체성은 정치적 태도와 행동에 어떤 영향을 미치는가?",
          "젠더나 세대에 따라 정치적 태도와 행동은 어떻게 달라지는가?"
        ],
        readings: [
          "Rogers, K., & Sanbonmatsu, K. (2022). The persistence of gender in campaigns and elections. In D. Osborne & C. G. Sibley (Eds.), The Cambridge handbook of political psychology (pp. 258-271). Cambridge University Press."
        ],
        refs: [
          "안재경·민영 (2020). 소통 전략으로서 미러링의 효과: 관점 수용과 외집단에 대한 부정적 감정을 중심으로. <한국언론학보>, 64권 5호, 46-80."
        ],
        notes: ["9월 24일(목)은 추석 휴강입니다."]
      },
      {
        label: "5~6주", dates: ["2026-10-01", "2026-10-06", "2026-10-08"],
        title: "미디어의 정치적 효과",
        topics: [
          "의제 설정은 누가 주도하는가? 정치세력인가, 미디어인가?",
          "각 정치세력은 어떤 프레임을 내세우며, 그것은 언론 보도에 어떻게 반영되는가?",
          "여론이란 무엇인가? 여론조사는 여론을 정확하게 대표하는가?"
        ],
        readings: [
          "Iyengar (2023). Chapter 8. News and public opinion",
          "Iyengar (2023). Chapter 6. Campaigning through the media"
        ],
        refs: [],
        notes: ["팀 프로젝트 팀(6~7명)은 10월 초까지 편성합니다."]
      },
      {
        label: "7주", dates: ["2026-10-13", "2026-10-15"],
        title: "정치 뉴스의 특성과 이용자",
        topics: [
          "정치 뉴스의 특성은 무엇이며, 미시적·거시적 효과는 어떻게 나타나는가?",
          "사람들은 정치 정보를 어떤 채널로 접하며 왜 필요로 하는가? 뉴스를 왜 읽는가, 혹은 왜 읽지 않는가?"
        ],
        readings: [
          "Perloff (2014). Chapter 10. Unpacking political news"
        ],
        refs: [
          "민영 (2016). 신뢰의 조건: 저널리즘 전문성과 정파적 편향성이 언론 신뢰와 정치 신뢰에 미치는 영향. <한국언론학보>, 60권 6호, 127-156.",
          "유용민 (2025). 기존 선거 보도 문제점 되풀이 돼, '어쩔 수 없는' 보도를 '어떻게' 할 것인가. <신문과방송>, 654호, 33-35.",
          "임영호 (2025). 정파성·선정성·받아쓰기…언론의 신뢰를 흔든 시간. <신문과방송>, 654호, 19-21.",
          "장윤재 (2022). MZ세대의 뉴스 이용 현황: 2030세대 뉴스 이용률이 알려주는 것과 알려주지 않는 것. <신문과방송>, 620호, 16-20."
        ]
      },
      {
        label: "8주", dates: ["2026-10-20"], exam: true,
        title: "중간고사",
        topics: [], readings: [], refs: [],
        notes: ["중간고사 (30%) — 10월 20일(화) 예정", "10월 22일(목)은 시험 기간 휴강입니다."]
      },
      {
        label: "9주", dates: ["2026-10-27", "2026-10-29"],
        title: "선택적 노출과 정치 극화",
        topics: [
          "사람들은 왜 선택적 노출을 하는가? 선택적 노출은 어떤 정치적 결과를 초래하는가?",
          "정치 극화는 무엇인가? 이념적 극화와 감정적 극화는 어떻게 다르며 어떻게 상호작용하는가?"
        ],
        readings: [
          "Iyengar (2023). Chapter 5. New media, new forms of campaigning"
        ],
        refs: [
          "민영 (2016). 선택적 뉴스 이용. <한국언론학보>, 60권 2호, 7-34."
        ]
      },
      {
        label: "10주", dates: ["2026-11-03", "2026-11-05"],
        title: "허위조작정보, 정치 음모론, 민주주의 퇴행",
        topics: [
          "허위조작정보는 무엇인가? 누가 만들고 확산시키며, 교정할 방법이 있는가?",
          "사람들은 왜 음모론을 믿는가? 정치 음모론은 어떻게 파급되며 어떤 결과를 초래하는가?"
        ],
        readings: [
          "민영 (2025). 미디어 이용과 부정선거 신념: 유권자 정치 성향의 조절 효과. <한국언론정보학보>, 134권, 89-120.",
          "Berlinski, N., Doyle, M., Guess, A. M., Levy, G., Lyons, B., Montgomery, J. M., Nyhan, B., & Reifler, J. (2023). The effects of unsubstantiated claims of voter fraud on confidence in elections. Journal of Experimental Political Science, 10(1), 34-49."
        ],
        refs: []
      },
      {
        label: "11주", dates: ["2026-11-10", "2026-11-12"],
        title: "소셜미디어와 정치 I: 인플루언서 정치",
        topics: [
          "소셜미디어 이용은 어떤 정치적 효과를 초래하는가?",
          "소셜미디어 인플루언서는 누구이며, 어떤 정치적 영향력을 발휘하는가?"
        ],
        readings: [
          "Harff, D., Stehr, P., & Schmuck, D. (2025). Revisiting opinion leadership in the digital realm: Social media influencers as proximal mass opinion leaders. New Media & Society, 28(6), 2341-2359."
        ],
        refs: [
          "von Sikorski, C., Merz, P., Heiss, R., Karsay, K., Naderer, B., & Schmuck, D. (2025). The political role of social media influencers: Strategies, types, and implications for democracy: An introduction. American Behavioral Scientist, Advance online publication."
        ]
      },
      {
        label: "12주", dates: ["2026-11-17", "2026-11-19"],
        title: "소셜미디어와 정치 II: 디지털 액티비즘",
        topics: [
          "소셜미디어는 시민들의 정치참여와 사회운동에 어떠한 새로운 맥락을 제공하는가?"
        ],
        readings: [
          "Klein, O. (2025). Mobilising the mob: The multifaceted role of social media in the January 6th US capitol attack. Javnost-The Public, 32(1), 33-50."
        ],
        refs: []
      },
      {
        label: "13-14주", dates: ["2026-11-24", "2026-11-26", "2026-12-01"],
        title: "AI, 알고리즘, 민주주의",
        topics: [
          "알고리즘은 정치적 편향을 가지는가? 어떤 정치적 효과를 초래할 수 있는가?",
          "AI 기술은 모두에게 고른 혜택을 가져올까? AI가 가져오는 격차는 민주주의에 어떤 결과를 초래할까?",
          "새로운 기술과 미디어는 어떤 점에서 민주주의에 긍정적이며 어떤 점에서 부정적인가?"
        ],
        readings: [
          "Formosa, P., Kashyap, B., & Sahebi, S. (2025). Generative AI and the future of democratic citizenship. Digital Government: Research and Practice, 6(2), Article 31."
        ],
        refs: [
          "Tessler, M. H., et al. (2024). AI can help humans find common ground in democratic deliberation. Science, 386(6719), eadq2852.",
          "최진응 (2025). 정치적 양극화와 소셜미디어의 책임: 추천 알고리즘 규제를 위한 입법과제(NARS 현안 분석 제358호). 국회입법조사처."
        ]
      },
      {
        label: "14~15주", dates: ["2026-12-03", "2026-12-08", "2026-12-10"],
        title: "팀 프로젝트 준비 및 발표",
        topics: [],
        readings: [], refs: [],
        notes: [
          "12월 3일(목): 수업 내 팀 활동 및 발표 준비 (기말고사 리뷰 병행)",
          "12월 8일(화), 10일(목): 팀 프로젝트 발표"
        ],
        assignment: {
          title: "팀 프로젝트 최종 제출 (25%)",
          text: "미디어 생태계의 새로운 변화가 민주주의에 미치는 부정적 영향을 이론적으로 진단하고, 이를 완화·해결할 전략과 대안을 제시하세요. Original data(인터뷰, 설문, 보도, 댓글, 소셜미디어 트렌드 등)를 반드시 활용하고, 주제 선정 이유와 목표를 분명히 밝혀야 합니다.",
          due: "2026-12-18 18:00"
        }
      },
      {
        label: "16주", dates: ["2026-12-15"], exam: true,
        title: "기말고사",
        topics: [], readings: [], refs: [],
        notes: ["기말고사 (25%) — 12월 15일(화) 예정"]
      }
    ]
  },

  // ── 교재 · 평가 안내 ───────────────────────────
  guide: {
    eyebrow: "Guide",
    title: "교재 · 평가 안내",
    description: "강의 교재와 평가 방법을 확인하세요. 강의 자료와 읽기 자료는 LMS(게시판, 주차학습)에 올라옵니다."
  },
  tools: {
    title: "강의 교재",
    items: [
      { icon: "📕", name: "Media politics: A citizen's guide (5th ed.)", text: "Iyengar, S. (2023). W.W. Norton & Company. · 도서관 도서" },
      { icon: "📗", name: "The dynamics of political communication", text: "Perloff, R. M. (2014). Media and politics in a digital age. Routledge. · 고려대 도서관 Ebook" },
      { icon: "📘", name: "The Cambridge handbook of political psychology", text: "Osborne, D., & Sibley, C. G. (Eds.) (2022). Cambridge University Press. · 고려대 도서관 Ebook" }
    ]
  },
  prep: {
    title: "평가 방법",
    items: [
      { icon: "📝", title: "중간고사 30%", text: "10월 20일(화) 예정" },
      { icon: "📝", title: "기말고사 25%", text: "12월 15일(화) 예정" },
      { icon: "🎤", title: "개인 프로젝트 15%", text: "강의 주제 하나를 골라 최근 미디어와 정치 사례를 이론과 연결해 분석하고, 해당 주 수업에서 5분 구두 발표합니다. 스크립트 없는 발표가 원칙이며, PPT 전체를 AI로 작성하는 것은 금지입니다." },
      { icon: "👥", title: "팀 프로젝트 25%", text: "6~7명 팀으로, 미디어 생태계의 변화가 민주주의에 미치는 영향을 진단하고 해법을 제시합니다. 최종 제출 12월 18일(금) 18:00." },
      { icon: "✅", title: "출석 5%", text: "매 수업 출석을 확인합니다." },
      { icon: "✨", title: "Extra Credit 최대 3점", text: "에세이(공백 포함 700~1000자). 나의 미디어 이용과 정치적 판단, 또는 나의 정치적 정체성 중 한 주제를 택해 씁니다." }
    ]
  },

  // ── 우수 과제 포트폴리오 ─────────────────────────
  // ※ 학생 과제물과 이름은 반드시 본인 동의를 받은 뒤 게시하세요.
  // 자료는 '구글 드라이브 주소'로만 등록합니다.
  //   1) 구글 드라이브에서 파일(또는 폴더)을 오른쪽 클릭 → 공유
  //   2) 일반 액세스를 '링크가 있는 모든 사용자(뷰어)'로 바꾸고 → 링크 복사
  //   3) 복사한 주소를 driveUrl에 붙여 넣기
  //   - 파일(PDF·이미지), 구글 문서·슬라이드·시트, 폴더 주소 모두 됩니다.
  //   - 공개된 파일이면 카드에 미리보기 그림이 자동으로 나옵니다.
  // sample: true 인 항목은 '예시' 표시가 붙습니다. 실제 작품으로 바꾸면서 지워주세요.
  portfolio: {
    eyebrow: "Portfolio",
    title: "우수 과제",
    description: "수강생들이 직접 분석하고 제안한 우수 과제를 소개합니다. 카드를 누르면 자료를 바로 볼 수 있어요.",
    note: "게시된 과제는 모두 학생 본인의 동의를 받아 공개합니다.",
    works: [
      {
        sample: true, type: "팀 프로젝트", award: "최우수", semester: "2025-2학기", icon: "📱",
        title: "숏폼 시대의 감정적 극화: 정치 쇼츠 댓글 분석",
        authors: "OOO · OOO · OOO · OOO · OOO · OOO",
        summary: "정치 유튜브 쇼츠 댓글을 수집해 감정적 극화의 양상을 진단하고, 플랫폼과 이용자 차원의 완화 전략을 제안했습니다.",
        detail: "선택적 노출과 정치 극화 이론을 바탕으로 정치 숏폼 콘텐츠의 댓글에서 외집단에 대한 부정적 감정 표현이 어떻게 나타나는지 분석했습니다. 댓글 데이터와 이용자 인터뷰를 함께 활용했고, 추천 알고리즘 투명성 강화와 '반대 관점 보기' 기능 도입을 대안으로 제시했습니다.",
        tags: ["정치 극화", "소셜미디어", "Original data"],
        driveUrl: ""
      },
      {
        sample: true, type: "개인 프로젝트", award: "", semester: "2025-2학기", icon: "📊",
        title: "여론조사 보도는 경마 저널리즘인가",
        authors: "OOO",
        summary: "선거 기간 여론조사 보도의 프레임을 분석하고, 경마식 보도가 유권자 인식에 미치는 영향을 이론과 연결했습니다.",
        detail: "의제 설정과 프레이밍 이론을 적용해 주요 언론사의 여론조사 보도를 분석했습니다. 지지율 순위 중심의 보도가 정책 정보를 밀어내는 양상을 사례로 보여주었습니다.",
        tags: ["여론", "프레이밍", "선거 보도"],
        driveUrl: ""
      },
      {
        sample: true, type: "팀 프로젝트", award: "우수", semester: "2025-2학기", icon: "🛡️",
        title: "허위정보 백신: 20대를 위한 판별 게임 제안",
        authors: "OOO · OOO · OOO · OOO · OOO",
        summary: "허위조작정보에 취약한 지점을 설문으로 진단하고, 사전 노출(prebunking) 원리를 활용한 교육용 게임을 기획했습니다.",
        detail: "대학생 설문 조사로 허위정보 판별 능력과 미디어 이용 습관의 관계를 살펴보았습니다. 접종 이론을 바탕으로 짧은 게임 형식의 미디어 리터러시 교육안을 설계해 시연했습니다.",
        tags: ["허위조작정보", "미디어 리터러시", "설문 조사"],
        driveUrl: ""
      }
    ]
  },

  // ── 수강생 참여 ────────────────────────────────
  // ※ 서버가 없는 정적 사이트라 투표·신청서·출석·과제 기록은
  //   '이 브라우저'에만 저장됩니다. (관리자 화면에서 CSV로 내려받을 수 있어요)
  participate: {
    eyebrow: "Join",
    title: "함께 참여해요",
    description: "투표, 수강 신청, 출석 체크와 과제 제출을 여기서 할 수 있어요."
  },

  // 실시간 투표
  poll: {
    title: "가장 기대되는 강의 주제는?",
    description: "하나를 골라 눌러주세요. 결과가 바로 그래프에 반영돼요. 다른 항목을 누르면 투표를 바꿀 수 있어요.",
    options: [
      { id: "democracy",  label: "민주주의 퇴행과 미디어" },
      { id: "psychology", label: "정치심리학: 인지·정서·정체성" },
      { id: "effects",    label: "미디어 효과와 여론" },
      { id: "polarize",   label: "선택적 노출과 정치 극화" },
      { id: "disinfo",    label: "허위조작정보와 음모론" },
      { id: "social",     label: "소셜미디어·인플루언서 정치" },
      { id: "ai",         label: "AI, 알고리즘, 민주주의" }
    ]
  },

  // 수강 신청서 — type: text | email | tel | select | radio | textarea | checkbox
  apply: {
    title: "수강 신청서",
    description: "* 표시는 꼭 채워야 하는 항목이에요.",
    submitLabel: "신청서 제출하기",
    successTitle: "신청이 완료되었어요!",
    successText: "안내 사항은 입력한 이메일로 보내드릴게요.",
    fields: [
      { name: "name", label: "이름", type: "text", required: true, placeholder: "홍길동" },
      { name: "studentId", label: "학번", type: "text", required: true, placeholder: "2026123456",
        pattern: "^\\d{10}$", patternMessage: "학번 10자리 숫자로 입력해 주세요." },
      { name: "major", label: "소속 학과", type: "text", required: true, placeholder: "○○학과" },
      { name: "year", label: "학년", type: "select", required: true, options: ["1학년", "2학년", "3학년", "4학년", "대학원생"] },
      { name: "email", label: "이메일", type: "email", required: true, placeholder: "name@korea.ac.kr" },
      { name: "phone", label: "연락처", type: "tel", required: false, placeholder: "010-0000-0000" },
      { name: "experience", label: "정치·미디어 관련 수업 수강 경험", type: "radio", required: true, options: ["처음이에요", "1~2과목", "3과목 이상"] },
      { name: "motivation", label: "수강 동기", type: "textarea", required: true, placeholder: "이 강의에서 기대하는 점이나 관심 있는 미디어·정치 이슈를 자유롭게 적어주세요." },
      { name: "agree", label: "개인정보 수집·이용에 동의합니다. (수강 관리 목적, 학기 종료 후 파기)", type: "checkbox", required: true }
    ]
  },

  // 수강생 로그인 — 학번 + 이름이 아래 명단과 맞으면 로그인됩니다.
  // (예시 명단입니다. 관리자 화면 > 수강생 명단에서 등록하세요.)
  login: {
    title: "수강생 로그인",
    description: "학번과 이름으로 로그인하면 출석 체크와 과제 제출을 할 수 있어요."
  },
  students: [
    { id: "2026000001", name: "김고대" },
    { id: "2026000002", name: "이호랑" }
  ],
  submission: {
    maxSizeMB: 20,
    accept: ".pdf,.docx,.hwp,.hwpx,.pptx,.xlsx,.csv,.zip"
  },


  // 첫 방문 안내 팝업 (홈페이지에서는 꺼 둠)
  popup: {
    enabled: false,
    delaySeconds: 2.5,
    title: "",
    text: "",
    items: [],
    button: { label: "", href: "#about" }
  },

  // 첫 방문 환영 폭죽 (홈페이지에서는 꺼 둠)
  welcome: {
    confetti: false,
    message: ""
  },

  // ── 자주 묻는 질문 ─────────────────────────────
  faq: {
    eyebrow: "FAQ",
    title: "자주 묻는 질문",
    description: "궁금한 점이 더 있다면 아래 연락처나 Office Hours를 이용해 주세요.",
    items: [
      { q: "과제는 언제까지, 어디에 내나요?", a: "과제는 마감일 오전 10시까지 LMS 과제란에 제출합니다. 마감일을 넘긴 과제에는 패널티가 있습니다. (팀 프로젝트 최종 제출은 12월 18일(금) 오후 6시)" },
      { q: "개인 프로젝트 발표는 어떻게 신청하나요?", a: "두 번째 주에 LMS를 통해 선착순으로 신청합니다. 발표는 해당 주 수업 시간에 5분(엄수) 구두 발표이며, 스크립트 없는 발표가 원칙입니다." },
      { q: "생성형 AI를 써도 되나요?", a: "아이디어 개발과 토론 파트너, 참고 자료 수집·검토 보조, 초고 작성 후 문법·표현 검토에는 활용할 수 있습니다. 단, AI 산출물을 그대로 복사해 제출하거나 과제 전체를 AI에게 작성시키는 것, 강의 녹음 파일을 AI에 업로드하는 것은 금지입니다. 모든 과제에 AI 활용 내역(산출물과 본인 기여도)을 투명하게 밝혀 주세요." },
      { q: "강의를 녹음하거나 녹화해도 되나요?", a: "교수자의 사전 허가가 없는 한 강의 녹음 및 녹화는 엄격하게 금지됩니다." },
      { q: "인용은 어떤 형식으로 하나요?", a: "한국언론학보 논문작성법이나 APA 7판(Publication Manual of the American Psychological Association) 같은 학술 가이드라인을 따릅니다. 표절, 변조, 다른 과목 과제의 재활용은 허용되지 않습니다." },
      { q: "도움이 필요한 경우 어디에 문의하나요?", a: "장애로 인해 별도의 조치나 도움이 필요하면 교수자에게 요청하거나 고려대학교 장애학생지원센터(TEL 3290-1534~7)에 문의하세요." }
    ]
  }
};
