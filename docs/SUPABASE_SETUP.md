# Google 로그인과 Supabase 연결

데모(`/demo`)는 설정 없이 사용할 수 있습니다. 개인 화면은 아래 연결 후 사용할 수 있습니다. 현재 저장·삭제 UI와 확장 프로그램은 제공하지 않습니다.

## 1. Supabase 프로젝트

Supabase 대시보드에서 개발용 프로젝트를 만듭니다. 프로젝트 URL과 **publishable key** (`sb_publishable_…`)를 확인합니다. secret key와 service_role key는 이 앱에 넣지 않습니다.

SQL Editor에서 `supabase/migrations/202609200001_memories.sql` 내용을 한 번 실행합니다. 이미 실행했다면 반복 실행하지 않습니다. `memories` 테이블과 사용자별 CRUD 정책이 생성됩니다.

## 2. Google OAuth

Google Cloud Console에서 프로젝트를 선택하고 OAuth 동의 화면과 **웹 애플리케이션** OAuth 클라이언트를 만듭니다. 테스트 모드라면 테스트 사용자로 본인의 Google 계정을 등록합니다.

승인된 리디렉션 URI에 Supabase의 Google Provider 화면에 표시된 콜백 URL을 정확하게 등록합니다. 보통 `https://프로젝트ID.supabase.co/auth/v1/callback` 형태입니다.

Supabase → Authentication → Sign In / Providers → Google에서 활성화하고 Google Client ID와 Client Secret을 입력합니다. Client Secret은 Supabase에만 입력합니다. 채팅·소스·환경변수의 공개 항목에 넣지 않습니다. Google 외 로그인 제공자는 사용하지 않습니다.

## 3. 앱 주소와 환경변수

Supabase → Authentication → URL Configuration:

- Site URL: `http://127.0.0.1:3000`
- Redirect URLs: `http://127.0.0.1:3000/auth/callback`

프로젝트 루트의 `.env.example`을 `.env.local`로 복사하고 URL과 publishable key를 입력합니다. `SITE_URL`은 위 Site URL과 같아야 합니다. 브라우저도 동일한 주소로 접속합니다. localhost와 127.0.0.1은 서로 다른 주소입니다.

`npm run dev`로 실행한 뒤 `/login`을 엽니다. 실행 중 환경변수를 바꿨다면 서버를 재시작합니다. 배포용 실행은 `npm run build` 후 `npm run start`입니다.

배포 시에는 `SITE_URL`을 실제 HTTPS 서비스 주소로 설정하고 Supabase의 Site URL과 Redirect URLs에도 그 주소 및 `/auth/callback`을 등록합니다. 와일드카드 리디렉션은 사용하지 않습니다.

## 4. 실제 연결 검증

개발용 프로젝트 SQL Editor에서 `supabase/tests/rls.sql`을 전체 실행합니다. 임시 A/B 사용자와 기억을 만든 후 타인 조회·수정·삭제·소유자 위조 차단 및 본인 수정·삭제를 검사하고 롤백합니다. 오류가 나면 성공으로 간주하지 않습니다. 이 스크립트는 DB 정책 검증이며 실제 Google 로그인 검증을 대신하지 않습니다.

서로 다른 브라우저 프로필에서 Google 계정 A/B로 로그인하고 다음을 확인합니다.

1. 로그인 후 `/home`에 도착하고 새로고침해도 로그인 상태가 유지됩니다.
2. 각 사용자의 테스트 기억을 DB에 넣고 `/api/memories`에서 자기 데이터만 보이는지 확인합니다. URL의 `user_id` 매개변수는 소유자 결정에 사용하지 않습니다.
3. 로그아웃한 뒤 `/home`은 `/login`으로 이동하고 `/api/memories`는 401을 반환합니다. 뒤로 가기·새로고침·다른 계정 로그인에서 이전 사용자의 기억이 남지 않는지도 확인합니다.
4. 동의 취소/실패 시 오류 안내가 보이며, 로그인 없이도 `/demo`를 사용할 수 있습니다.

## 데이터와 구현 범위

읽기 API는 검증된 세션에서 사용자 ID를 가져오고 RLS를 함께 적용합니다. 최근 50개만 반환하며 페이지 나누기는 아직 없습니다. DB의 기본 소유자는 `auth.uid()`이고, 타인 소유자로 입력하거나 변경하면 거절됩니다. 중복 URL은 현재 스키마에서 허용합니다. 저장 API의 중복 처리·민감정보 검사·보존/삭제 정책은 별도 구현 항목입니다. DB의 형식/길이 제한이 민감 페이지 필터를 대신하지 않습니다.

코드·migration·검증 스크립트 작성과 실제 클라우드 검증은 구분해야 합니다. Supabase/Google 설정이 없는 환경에서는 실제 OAuth, 세션 갱신, RLS 실행 검증이 완료되지 않습니다.

공식 문서: [Next.js 서버 인증](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Google 로그인](https://supabase.com/docs/guides/auth/social-login/auth-google), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
