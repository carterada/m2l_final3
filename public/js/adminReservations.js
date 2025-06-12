import { requireAuth } from './authGuard.js';

console.log("Chargement du script adminReservation.js");

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth({ adminOnly: true });
  console.log("Utilisateur connecté :", user);
  if (!user) return;

  const tableBody = document.querySelector('#reservationTable tbody');
  const messageBox = document.getElementById('messageBox');

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
      const tr = document.createElement('tr');

      const now = new Date();
      const endTime = new Date(resa.end_time);
      const isPast = endTime < now;
      const isCancelled = resa.status === 'cancelled';

      // Ajouter classes CSS selon le statut
      if (isCancelled) {
        tr.classList.add('cancelled');
      } else if (isPast) {
        tr.classList.add('past');
      } else {
        tr.classList.add('upcoming');
      }

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

    // Gestion du bouton "Annuler"
    tableBody.addEventListener('click', async (e) => {
      if (e.target.tagName === 'BUTTON') {
        const id = e.target.dataset.id;
        if (confirm("Annuler cette réservation ?")) {
          const delRes = await fetch(`/reservation/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          const result = await delRes.json();

          if (delRes.ok) {
            // Met à jour la ligne sans la supprimer
            const row = e.target.closest('tr');
            row.className = 'cancelled';
            row.cells[6].textContent = 'cancelled';
            row.cells[7].innerHTML = '<em>Annulée par admin</em>';

            messageBox.textContent = "Réservation annulée.";
            messageBox.className = "message success";
          } else {
            messageBox.textContent = result.error || "Erreur lors de l'annulation.";
            messageBox.className = "message error";
          }
        }
      }
    });

  } catch (err) {
    console.error("Erreur lors du chargement des réservations :", err);
    messageBox.textContent = "Erreur de chargement.";
    messageBox.className = "message error";
  }
});

function formatDateTime(dateTime) {
  const d = new Date(dateTime);
  return d.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}
