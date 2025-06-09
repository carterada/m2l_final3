window.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('navbarContainer');
  if (!container) return;
 
  try {
    const res = await fetch('/partials/navbar.html');
    const html = await res.text();
    container.innerHTML = html;
 
    const authLinks = container.querySelectorAll('.auth');
    const guestLinks = container.querySelectorAll('.guest');
    const adminLinks = container.querySelectorAll('.admin-only');
    const notAdminLinks = container.querySelectorAll('.not-admin');
 
    // Par défaut, utilisateur = null
    let user = null;
    try {
      const meRes = await fetch('/auth/me');
      if (meRes.ok) {
        const data = await meRes.json();
        user = data.user;
      }
    } catch (e) {
      user = null;
    }
 
    if (user) {
      authLinks.forEach(link => link.style.display = 'inline');
      guestLinks.forEach(link => link.style.display = 'none');
 
      if (user.role === 'admin') {
        adminLinks.forEach(link => link.style.display = 'inline');
        notAdminLinks.forEach(link => link.style.display = 'none');
      } else {
        adminLinks.forEach(link => link.style.display = 'none');
        notAdminLinks.forEach(link => link.style.display = 'inline');
      }
    } else {
      authLinks.forEach(link => link.style.display = 'none');
      guestLinks.forEach(link => link.style.display = 'inline');
      adminLinks.forEach(link => link.style.display = 'none');
      notAdminLinks.forEach(link => link.style.display = 'none');
    }
 
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await fetch('/auth/logout', { method: 'POST' });
        window.location.href = '/';
      });
    }
 
  } catch (err) {
    console.error('Erreur lors du chargement de la navbar', err);
  }
});