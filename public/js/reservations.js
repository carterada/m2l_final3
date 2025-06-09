import { requireAuth } from './authGuard.js';
 
document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireAuth(); // Redirige si non connecté
  if (!user) return;

  if( user.role === 'admin') {
    alert("Accès refusé : réservée aux utilisateurs.");
    window.location.href = '/';
    return;
  }
 
  const form = document.getElementById('reservationForm');
  const messageBox = document.getElementById('messageBox');
 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
 
    const room_id = document.getElementById('room_id').value;
    const date = document.getElementById('date').value;
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
 
    const start_time = `${date} ${start}`;
    const end_time = `${date} ${end}`;
 
    // Vérification durée
    const startDate = new Date(`${date}T${start}`);
    const endDate = new Date(`${date}T${end}`);
    const durationMs = endDate - startDate;
    const maxDurationMs = 3 * 60 * 60 * 1000; // 3h
 
    if (durationMs <= 0) {
      messageBox.textContent = "L'heure de fin doit être après l'heure de début.";
      messageBox.className = "message error";
      return;
    }
 
    if (durationMs > maxDurationMs) {
      messageBox.textContent = "Durée max : 3 heures.";
      messageBox.className = "message error";
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
        messageBox.textContent = "Réservation réussie.";
        messageBox.className = "message success";
        form.reset();
      } else {
        messageBox.textContent = result.error || "Erreur lors de la réservation.";
        messageBox.className = "message error";
      }
 
    } catch (err) {
      console.error(err);
      messageBox.textContent = "Erreur réseau ou serveur.";
      messageBox.className = "message error";
    }
  });
});