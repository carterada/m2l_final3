document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch('/auth/me');
    if (!res.ok) {
      window.location.href = "/login";
      return;
    }

    const data = await res.json();
    const user = data.user;

    document.getElementById('email').textContent = user.email;
    document.getElementById('role').textContent = user.role;

    const response = await fetch(`/reservation/user/${user.id}`);
    const reservations = await response.json();

    const list = document.getElementById('reservationsList');
    list.innerHTML = "";

    if (response.ok && reservations.length > 0) {
      reservations.forEach(resa => {
        const li = document.createElement('li');
        const now = new Date();
        const startDate = new Date(resa.start_time);
        const isPast = startDate < now;
        const isCancelled = resa.status === 'cancelled';

        li.textContent = `${resa.name} (${resa.type}) — ${formatDateTime(resa.start_time)} ➡ ${formatDateTime(resa.end_time)}`;

        // Applique les classes CSS
        if (isCancelled) {
          li.classList.add('resa-cancelled');
          const annote = document.createElement('span');
          const who = resa.cancelled_by === 'user' ? 'par vous' : "par l'administration";
          annote.textContent = ` — Annulée ${who}`;
          annote.style.marginLeft = '8px';
          li.appendChild(annote);
        } else if (isPast) {
          li.classList.add('resa-past');
        } else {
          li.classList.add('resa-active');

          // Bouton d'annulation
          const btn = document.createElement('button');
          btn.textContent = "Annuler";
          btn.style.marginLeft = '12px';
          btn.addEventListener('click', async () => {
            if (confirm("Annuler cette réservation ?")) {
              try {
                const del = await fetch(`/reservation/${resa.id}`, {
                  method: 'DELETE',
                  credentials: 'include'
                });
                const result = await del.json();
                if (del.ok) {
                  alert(result.message || "Réservation annulée !");
                  location.reload();
                } else {
                  alert(result.error || "Erreur lors de l'annulation.");
                }
              } catch (err) {
                console.error("Erreur d'annulation :", err);
                alert("Erreur de communication avec le serveur.");
              }
            }
          });
          li.appendChild(btn);
        }

        list.appendChild(li);
      });
    } else {
      list.textContent = "Aucune réservation trouvée.";
    }
  } catch (err) {
    console.error("Erreur de chargement du profil :", err);
    document.getElementById('reservationsList').textContent = "Erreur de chargement.";
  }
});

function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  return date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}
