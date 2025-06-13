const express = require('express');
const router = express.Router();
const db = require('../db/config');
const { verifyToken } = require('../middlewares/auth.middleware');
const { logAction } = require('../utils/logs');


// ✅ Récupérer tous les comptes utilisateurs
router.get('/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const sql = 'SELECT id, email, role, active FROM users ORDER BY id ASC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(results);
  });
});

// ✅ Activer / désactiver un compte utilisateur
router.patch('/users/:id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  const userId = req.params.id;
  let { active } = req.body;

  // 🔍 Log pour debug
  console.log("📩 PATCH reçu :", req.body);

  // 🔁 Convertit proprement en booléen
  if (typeof active === 'string') {
    active = active === 'true';
  } else {
    active = Boolean(active);
  }

  console.log("🔄 Mise à jour vers :", active);

  const sql = 'UPDATE users SET active = ? WHERE id = ?';
  db.query(sql, [active, userId], (err) => {
    if (err) return res.status(500).json({ error: 'Erreur mise à jour utilisateur' });
    res.json({ message: 'Statut utilisateur mis à jour' });
  });

  const action = active ? 'activation compte' : 'désactivation compte';
const message = `Admin ${req.user.email} a ${active ? 'activé' : 'désactivé'} l’utilisateur ID ${userId}`;
logAction(req.user.id, action, message);

});

module.exports = router;
