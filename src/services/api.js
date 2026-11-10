export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-Themor-Client': 'web', ...options.headers },
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    });
  } catch {
    const error = new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    window.dispatchEvent(new CustomEvent('themor-api-error', { detail: error.message }));
    throw error;
  }
  let data;
  try { data = await response.json(); }
  catch { data = { error: '서버 응답을 확인할 수 없습니다. 사이트 서버 실행 상태를 확인해 주세요.' }; }
  if (!response.ok || data?.error) {
    const error = new Error(data?.error || '요청을 처리할 수 없습니다.');
    error.status = response.status;
    if (!path.startsWith('/auth/')) window.dispatchEvent(new CustomEvent('themor-api-error', { detail: error.message }));
    throw error;
  }
  return data;
}

export const authService = {
  me: () => api('/auth/me'),
  login: (account, password) => api('/auth/login', { method: 'POST', body: { account, password } }),
  register: body => api('/auth/register', { method: 'POST', body }),
  logout: () => api('/auth/logout', { method: 'POST' }),
  updateProfile: body => api('/auth/profile', { method: 'PATCH', body }),
  deleteAccount: () => api('/auth/me', { method: 'DELETE' }),
};
export const databaseService = {
  health: () => api('/health'),
  report: id => api(`/admin/reports/${id}`),
  importLegacy: body => api('/admin/import-legacy', { method: 'POST', body }),
};
