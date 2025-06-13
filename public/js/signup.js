document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // empêche le rechargement de la page

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    showNotification("Les mots de passe ne correspondent pas.", "error");
    return;
  }

  try {
    const response = await fetch("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
      showNotification("Inscription réussie ! Vous pouvez vous connecter.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 5000);
    } else {
      showNotification(result.error || "Erreur lors de l'inscription.", "error");
    }
  } catch (error) {
    console.error("Erreur réseau ou serveur.");
    showNotification("Erreur réseau ou serveur.", "error");
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
