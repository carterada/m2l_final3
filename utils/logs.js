const db = require('../db/config');

exports.logAction = (userId, action, details = null) => {
  const sql = 'INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)';
  db.query(sql, [userId, action, details], (err) => {
    if (err) console.error('Erreur lors de l’enregistrement du log :', err);
  });
};
