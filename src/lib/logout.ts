export function logout() {
  try {
    localStorage.clear();
  } catch {}
  // To'liq yo'naltirish: React Query keshi va xotiradagi holat ham tozalanadi
  window.location.href = '/register';
}
