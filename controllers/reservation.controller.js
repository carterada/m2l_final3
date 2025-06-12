const db = require('../db/config');
const { logAction } = require('../utils/logs'); // ✅ import du logger

// ✅ Créer une réservation (client)
exports.createReservation = (req, res) => {
  const { user_id, room_id, start_time, end_time } = req.body;

  if (!user_id || !room_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  const start = new Date(start_time);
  const end = new Date(end_time);
  const duration = end - start;
  const maxDurationMs = 3 * 60 * 60 * 1000;

  if (duration <= 0 || duration > maxDurationMs) {
    return res.status(400).json({ error: 'La réservation doit être comprise entre 1 minute et 3 heures.' });
  }

  const checkSql = `
    SELECT COUNT(*) AS count FROM reservations
    WHERE user_id = ? AND status = 'active' AND end_time > NOW()
  `;

  db.query(checkSql, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la vérification des réservations.' });
    }

    const activeCount = results[0].count;
    if (activeCount >= 3) {
      return res.status(400).json({ error: 'Limite de 3 réservations en cours atteinte.' });
    }

    const sql = `
      INSERT INTO reservations (user_id, room_id, start_time, end_time)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [user_id, room_id, start_time, end_time], (err, result) => {
      if (err) {
        console.error('Erreur MySQL :', err);
        return res.status(500).json({ error: "Erreur lors de la réservation." });
      }

      // ✅ log de l'action
      logAction(user_id, 'réservation', `Salle ID ${room_id} — du ${start_time} au ${end_time}`);

      return res.status(201).json({ message: "Réservation enregistrée." });
    });
  });
};

// ✅ Récupérer les réservations d’un utilisateur
exports.getUserReservations = (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT r.id, r.start_time, r.end_time, rm.name, rm.type, r.status, r.cancelled_by
    FROM reservations r
    JOIN rooms rm ON r.room_id = rm.id
    WHERE r.user_id = ?
    ORDER BY r.start_time DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Erreur récupération réservations :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    res.json(results);
  });
};

// ✅ Récupérer toutes les réservations (admin)
exports.getAllReservations = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé.' });
  }

  const sql = `
    SELECT r.id, u.email, rm.name AS room_name, rm.type, r.start_time, r.end_time, r.status, r.cancelled_by
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    JOIN rooms rm ON r.room_id = rm.id
    ORDER BY r.start_time DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(results);
  });
};

// ✅ Supprimer/annuler une réservation (admin OU utilisateur propriétaire)
exports.deleteReservation = (req, res) => {
  const reservationId = req.params.id;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  const checkSql = 'SELECT user_id, room_id, start_time, end_time FROM reservations WHERE id = ?';

  db.query(checkSql, [reservationId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    const resa = results[0];
    const ownerId = resa.user_id;

    if (!isAdmin && ownerId !== userId) {
      return res.status(403).json({ error: 'Non autorisé à annuler cette réservation' });
    }

    const cancelledBy = isAdmin ? 'admin' : 'user';
    const updateSql = 'UPDATE reservations SET status = ?, cancelled_by = ? WHERE id = ?';

    db.query(updateSql, ['cancelled', cancelledBy, reservationId], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur lors de l\'annulation' });

      // ✅ log de l'action
      logAction(userId, 'annulation réservation', `Réservation ID ${reservationId} — Salle ID ${resa.room_id} — du ${resa.start_time} au ${resa.end_time} — annulée par ${cancelledBy}`);

      res.json({
        message: isAdmin
          ? 'Réservation annulée par l’administration'
          : 'Votre réservation a bien été annulée'
      });
    });
  });
};
