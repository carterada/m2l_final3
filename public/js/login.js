document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
 
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageBox = document.getElementById('messageBox');
 
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
 
    const result = await response.json();
 
    if (response.ok) {
      messageBox.textContent = 'Connexion réussie !';
      messageBox.className = 'message success';
      setTimeout(() => window.location.href = '/', 1500);
    } else {
      messageBox.textContent = result.error || 'Erreur de connexion.';
      messageBox.className = 'message error';
    }
 
  } catch (error) {
    console.error(error);
    messageBox.textContent = 'Erreur réseau ou serveur.';
    messageBox.className = 'message error';
  }
});