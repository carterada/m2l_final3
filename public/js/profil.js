document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 🔐 Récupère les infos via le token JWT
    const res = await fetch('/auth/me');
    if (!res.ok) {
      window.location.href = "/login";
      return;
    }
 
    const data = await res.json();
    const user = data.user;
 
    // Affiche les infos perso
    document.getElementById('email').textContent = user.email;
    document.getElementById('role').textContent = user.role;
 
    // Récupère ses réservations
    const response = await fetch(`/reservation/user/${user.id}`);
    const reservations = await response.json();
 
    const list = document.getElementById('reservationsList');
    if (response.ok && reservations.length > 0) {
      reservations.forEach(resa => {
        const li = document.createElement('li');
        li.textContent = `${resa.name} (${resa.type}) - ${formatDateTime(resa.start_time)} ➡ ${formatDateTime(resa.end_time)}`;
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