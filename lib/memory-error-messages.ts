export const MEMORY_ERROR_MESSAGES: Record<string, string> = {
  invalid_url: 'https로 시작하는 공개 페이지 주소만 저장할 수 있어요. (로컬/사설 주소는 저장할 수 없어요)',
  invalid_title: '제목이 너무 길어요. 500자 이하로 입력해 주세요.',
  invalid_body: '요청 형식이 올바르지 않아요.',
  invalid_json: '요청 형식이 올바르지 않아요.',
  payload_too_large: '입력이 너무 길어요.',
  unauthorized: '로그인이 필요해요. 새로고침 후 다시 시도해 주세요.',
  forbidden: '요청이 거부됐어요. 새로고침 후 다시 시도해 주세요.',
  auth_unavailable: '로그인 연결을 준비하고 있어요.',
  save_failed: '저장에 실패했어요. 잠시 후 다시 시도해 주세요.',
};
