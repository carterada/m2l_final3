const db = require('../db/config');
 
exports.createReservation = (req, res) => {
  const { user_id, room_id, start_time, end_time } = req.body;
 
  // Vérification basique
  if (!user_id || !room_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }
 
  // Vérification durée côté serveur (sécurité)
  const start = new Date(start_time);
  const end = new Date(end_time);
  const duration = end - start;
 
  const maxDurationMs = 3 * 60 * 60 * 1000; // 3h
 
  if (duration <= 0 || duration > maxDurationMs) {
    return res.status(400).json({ error: 'La réservation doit être comprise entre 1 minute et 3 heures.' });
  }
 
  // Insertion SQL
  const sql = `
    INSERT INTO reservations (user_id, room_id, start_time, end_time)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [user_id, room_id, start_time, end_time], (err, result) => {
    if (err) {
      console.error('Erreur MySQL :', err);
      return res.status(500).json({ error: "Erreur lors de la réservation." });
    }
 
    return res.status(201).json({ message: "Réservation enregistrée." });
  });
};

// Récupération des réservations d'un utilisateur

//récupérer les reservations de l'utilisateur

exports.getUserReservations = (req, res) => {
  const userId = req.params.id;
 
  const sql = `
    SELECT r.id, r.start_time, r.end_time, rm.name, rm.type
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

