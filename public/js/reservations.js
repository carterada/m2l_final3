import { requireAuth } from './authGuard.js';

document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth();
  if (!user) return;

  if (user.role === 'admin') {
    showNotification("Accès refusé : réservée aux utilisateurs.", "error");
    setTimeout(() => window.location.href = '/', 2000);
    return;
  }

  const form = document.getElementById('reservationForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const room_id = document.getElementById('room_id').value;
    const date = document.getElementById('date').value;
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    const start_time = `${date} ${start}`;
    const end_time = `${date} ${end}`;

    const startDate = new Date(`${date}T${start}`);
    const endDate = new Date(`${date}T${end}`);
    const durationMs = endDate - startDate;
    const maxDurationMs = 3 * 60 * 60 * 1000;

    if (durationMs <= 0) {
      showNotification("L'heure de fin doit être après l'heure de début.", "error");
      return;
    }

    if (durationMs > maxDurationMs) {
      showNotification("Durée max : 3 heures.", "error");
      return;
    }

    try {
      const res = await fetch('/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          room_id,
          start_time,
          end_time
        })
      });

      const result = await res.json();

      if (res.ok) {
        showNotification("Réservation réussie !");
        form.reset();
      } else {
        showNotification(result.error || "Erreur lors de la réservation.", "error");
      }

    } catch (err) {
      console.error(err);
      showNotification("Erreur réseau ou serveur.", "error");
    }
  });
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
