const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
 
router.post('/', verifyToken, reservationController.createReservation);
 
router.get('/user/:id', verifyToken, reservationController.getUserReservations);
 
router.get('/all', verifyToken, reservationController.getAllReservations);
 
router.delete('/:id', verifyToken, reservationController.deleteReservation);
 
module.exports = router;