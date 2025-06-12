import { requireAuth } from './authGuard.js';

console.log("Chargement du script adminUsers.js");

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth({ adminOnly: true });
  if (!user) return;

  const tableBody = document.querySelector('#userTable tbody');
  const messageBox = document.getElementById('messageBox');

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

    // Lire la ligne actuelle pour détecter le statut texte
    const row = e.target.closest('tr');
    const statusCell = row.children[3]; // cellule "Statut"
    const isCurrentlyActive = statusCell.textContent.trim().toLowerCase() === 'actif';

    const newStatus = !isCurrentlyActive;

    console.log("🟡 PATCH envoyé :", { id, newStatus });

    const res = await fetch(`/admin/users/${id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ active: newStatus }) // ✅ bien booléen
    });

    if (res.ok) {
      location.reload();
    } else {
      const error = await res.json();
      messageBox.textContent = error.error || "Erreur lors de la mise à jour.";
      messageBox.className = "message error";
    }
  }
});


  } catch (err) {
    console.error("Erreur chargement utilisateurs :", err);
    messageBox.textContent = "Erreur de chargement.";
    messageBox.className = "message error";
  }
});
