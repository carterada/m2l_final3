const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/signup', authController.signup);

router.post('/login', (req, res) => {
    console.log("Reçue une requête POST /auth/login");
    authController.login(req, res);
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Déconnexion réussie.' });
});

router.get('/me', verifyToken, (req, res) => {
    console.log("Route /auth/me appelée");
    res.json({user: req.user});
});

module.exports = router;