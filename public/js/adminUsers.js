import { requireAuth } from './authGuard.js';

console.log("Chargement du script adminUsers.js");

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth({ adminOnly: true });
  if (!user) return;

  const tableBody = document.querySelector('#userTable tbody');

  try {
    const res = await fetch('/admin/users', {
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP : ${res.status}`);
    }

    const users = await res.json();

    users.forEach(u => {
      const tr = document.createElement('tr');
      tr.classList.add(u.active ? 'user-active' : 'user-inactive');

      const isSelf = u.id === user.id;
      const isAdmin = u.role === 'admin';

      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${u.active ? 'Actif' : 'Inactif'}</td>
        <td>
          ${isAdmin && isSelf
            ? '<em>Indésactivable</em>'
            : `<button data-id="${u.id}" data-active="${u.active}">
                ${u.active ? 'Désactiver' : 'Activer'}
               </button>`}
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // 🎯 Handler du bouton Activer/Désactiver
    tableBody.addEventListener('click', async (e) => {
      if (e.target.tagName === 'BUTTON') {
        const id = e.target.dataset.id;

        const row = e.target.closest('tr');
        const statusCell = row.children[3];
        const isCurrentlyActive = statusCell.textContent.trim().toLowerCase() === 'actif';

        const newStatus = !isCurrentlyActive;

        const res = await fetch(`/admin/users/${id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ active: newStatus })
        });

        const result = await res.json();

        if (res.ok) {
          showNotification(result.message || `Compte ${newStatus ? 'activé' : 'désactivé'} avec succès.`);
          setTimeout(() => location.reload(), 1000);
        } else {
          showNotification(result.error || "Erreur lors de la mise à jour.", "error");
        }
      }
    });

  } catch (err) {
    console.error("Erreur chargement utilisateurs :", err);
    showNotification("Erreur de chargement des utilisateurs.", "error");
  }
});

// ✅ Notification visuelle
function showNotification(message, type = 'success') {
  const container = document.getElementById('notification-container');
  if (!container) return;
  const notif = document.createElement('div');
  notif.className = `notification ${type === 'error' ? 'error' : ''}`;
  notif.textContent = message;
  container.appendChild(notif);
  setTimeout(() => notif.remove(), 5000);
}
