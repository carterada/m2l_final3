const bcrypt = require('bcrypt');
const db = require ('../db/config');
const { logAction } = require('../utils/logs');

exports.signup = (req, res) => {
    const { email, password } = req.body || {};
    if ( !email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe sont requis.'});
    }

//hash du mot de passe

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Erreur lors du hachage du mot de passe.' });

// Inserer les données en BDD

        const sql = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
        const values = [email, hash, 'client']; // Role par défaut

        db.query(sql, values, (error, results) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email déjà utilisé.' });
                }
                return res.status(500).json({ error: 'Erreur base de données' });
            }

            res.status(201).json({ message: 'Inscription réussie !' });
            });
        });
    }; 

const jwt = require('jsonwebtoken');
 
exports.login = (req, res) => {
  console.log("Reçu une requête POST /auth/login");
  const { email, password } = req.body || {};
 
  if (!email || !password) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }
 
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (error, results) => {
    if (error) {
      return res.status(500).json({ error: 'Erreur Serveur' });
    }
 
    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }
 
    const user = results[0];

if (!user.active) {
  return res.status(403).json({ error: 'Compte désactivé. Veuillez contacter un administrateur.' });
}

bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      }

      //log de vérification
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
      console.log("payload:", { id: user.id, email: user.email, role: user.role });
 
      // Création du token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '3h' }
      );

      // Log de l'action de connexion
      logAction(user.id, 'connexion', `Connexion réussie pour l'utilisateur ${user.email}`);
 
      // Enregistrement du token dans un cookie httpOnly
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // true en production avec HTTPS
        maxAge: 3 * 60 * 60 * 1000 // 3h en ms
      });
 
      res.status(200).json({
        message: 'Connexion réussie !'
        // On ne retourne plus userData ici car il est dans le token
      });
    });
  });
};