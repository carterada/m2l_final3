import { requireAuth } from './authGuard.js';

console.log("Chargement du script adminReservation.js");

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth({ adminOnly: true });
  console.log("Utilisateur connecté :", user);
  if (!user) return;

  const tableBody = document.querySelector('#reservationTable tbody');

  try {
    const res = await fetch('/reservation/all', {
      credentials: 'include'
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP : ${res.status}`);
    }

    const data = await res.json();
    console.log("Réservations reçues :", data);

    data.forEach(resa => {
      const isCancelled = resa.status === 'cancelled';
      const tr = document.createElement('tr');
      if (isCancelled) tr.classList.add('resa-cancelled');
      tr.innerHTML = `
        <td>${resa.id}</td>
        <td>${resa.email}</td>
        <td>${resa.room_name}</td>
        <td>${resa.type}</td>
        <td>${formatDateTime(resa.start_time)}</td>
        <td>${formatDateTime(resa.end_time)}</td>
        <td>${resa.status}</td>
        <td>
          ${isCancelled
            ? `<em>Annulée par ${resa.cancelled_by === 'user' ? 'l’utilisateur' : 'admin'}</em>`
            : `<button data-id="${resa.id}">Annuler</button>`}
        </td>
      `;
      tableBody.appendChild(tr);
    });

    tableBody.addEventListener('click', async (e) => {
      if (e.target.tagName === 'BUTTON') {
        const id = e.target.dataset.id;

        const delRes = await fetch(`/reservation/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        const result = await delRes.json();

        if (delRes.ok) {
          e.target.closest('tr').classList.add('resa-cancelled');
          e.target.closest('td').innerHTML = '<em>Annulée par vous</em>';
          showNotification("Réservation annulée avec succès !");
        } else {
          showNotification(result.error || "Erreur lors de l'annulation.", "error");
        }
      }
    });

  } catch (err) {
    console.error("Erreur lors du chargement des réservations :", err);
    showNotification("Erreur de chargement des réservations", "error");
  }
});

function formatDateTime(dateTime) {
  const d = new Date(dateTime);
  return d.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

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
