const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const viewRoutes = require('./routes/view.routes');
const reservationRoutes = require('./routes/reservation.routes');



const db = require('./db/config');
const PORT = process.env.PORT || 3000;

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

// Middleware pour servir les fichiers statiques
app.use(express.static('public'));
app.use('/partials', express.static(path.join(__dirname, 'public/partials')));

// routes
app.use('/', viewRoutes);
app.use('/reservation', reservationRoutes);


//lancement server
app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port ${PORT}`)
})
