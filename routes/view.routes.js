const express = require('express');
const router = express.Router();
const path = require('path');
 
// Page d'accueil
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
 
// Page présentation des salles
router.get('/salles', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/salles.html'));
});
 
// Page de connexion
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
 
// Page d'inscription
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

// Page de réservation
router.get('/reservation', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/reservation.html'));
});

//page de profil
router.get('/profil', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/profile.html'));
});

// Page d'administration des réservations
router.get('/admin/reservations', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/adminReservations.html'));
});

// Page administration des utilisateurs
router.get('/admin/utilisateurs', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/adminUsers.html'));
});
 
module.exports = router;