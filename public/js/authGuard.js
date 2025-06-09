// Fonction principale de vérification d'authentification
export async function requireAuth({ redirect = '/login', adminOnly = false } = {}) {
  try {
    const res = await fetch('/auth/me');
    if (!res.ok) {
      window.location.href = redirect;
      return null;
    }
 
    const data = await res.json();
    const user = data.user;
 
    // Si la page est réservée aux admin
    if (adminOnly && user.role !== 'admin') {
      alert("Accès refusé : réservée à l'administrateur.");
      window.location.href = '/';
      return null;
    }
 
    return user;
  } catch (err) {
    console.error("Erreur d'accès utilisateur :", err);
    window.location.href = redirect;
    return null;
  }
}