//Fonction inscription
document.getElementById("signupForm").addEventListener("submit", async (e) => {

    e.preventDefault(); // êmpêche le rechargement de la page

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const messageBox = document.getElementById("message");

    messageBox.textContent = ""; // Réinitialise le message

    if (password !== confirmPassword) {
        messageBox.textContent = "Les mots de passe ne correspondent pas.";
        messageBox.className = "message error";
        return;
    }   

    try {
        const response = await fetch("/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
    });

    const result = await response.json();

        if (response.ok) {
            messageBox.textContent = "Inscription réussie ! Vous pouvez vous connecter.";
            messageBox.className = "message success";
            setTimeout(() => {
                window.location.href = "/login"; // Redirige vers la page de connexion après 2 secondes
            }, 5000);

        } else {
            messageBox.textContent = result.error || "Erreur lors de l'inscription.";
            messageBox.className = "message error";
        }
    } catch (error) {
        console.error("Erreur réseau ou serveur.");
        messageBox.textContent = "Erreur réseau ou serveur.";
        messageBox.className = "message error";
    }
});