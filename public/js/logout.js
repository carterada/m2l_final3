const logoutBtn = document.getElementById('logoutBtn');
 
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (err) {
      console.error("Erreur lors de la déconnexion :", err);
    }
  });
}