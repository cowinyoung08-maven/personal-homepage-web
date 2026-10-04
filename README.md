# 민영 교수 개인 홈페이지

고려대학교 미디어대학 민영 교수의 개인 홈페이지 및 지도학생(연구실) 사이트입니다.

- 화면: `index.html` + `css/` + `js/` + `images/` — 사이트의 모든 내용은 `js/config.js` 한 파일에서 관리합니다.
- 서버: `server.js` (Node.js) — 홈페이지 파일을 보여 주고, 면담 신청 · 주간 진행 보고를 PostgreSQL에 저장합니다.

## Railway 설정
1. 이 저장소로 서비스를 만들면 `package.json`을 보고 Node.js로 실행합니다 (`npm start`).
2. 같은 프로젝트에 **PostgreSQL**을 추가합니다.
3. 홈페이지 서비스 → **Variables**에 `DATABASE_URL`을 추가하고 값으로 `${{Postgres.DATABASE_URL}}`을 고릅니다.
4. 표(submissions)는 서버가 처음 켜질 때 자동으로 만들어집니다.

데이터베이스가 연결되지 않아도 홈페이지는 그대로 열리고, 신청 내용은 방문자 브라우저에만 저장됩니다.
`/api/health`에서 `"db": true`가 보이면 연결된 것입니다.