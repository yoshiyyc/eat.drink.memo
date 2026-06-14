const KEY = 'edm_guest_nickname';

export function getGuestNickname() {
  return localStorage.getItem(KEY);
}

export function setGuestNickname(nickname) {
  localStorage.setItem(KEY, nickname);
}

export function clearGuestNickname() {
  localStorage.removeItem(KEY);
}
