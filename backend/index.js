const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const db = new sqlite3.Database('./database/questions.db', (err) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données :', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

const calculateRanking = (players) => {
    return players
        .sort((a, b) => b.score - a.score)
        .map((player, index) => ({
            rank: index + 1,
            name: player.name,
            score: player.score,
        }));
};

const sessions = {};

app.get('/', (req, res) => {
    res.send('Backend en cours de configuration !');
});

app.get('/api/questions', (req, res) => {
    db.all('SELECT * FROM questions', [], (err, rows) => {
        if (err) {
            console.error('Erreur lors de la récupération des questions :', err.message);
            res.status(500).json({ error: 'Erreur serveur.' });
        } else {
            res.json(rows);
        }
    });
});

app.get('/api/question/random', (req, res) => {
    db.get('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1', [], (err, row) => {
        if (err) {
            console.error('Erreur lors de la récupération de la question :', err.message);
            res.status(500).json({ error: 'Erreur serveur.' });
        } else {
            res.json(row);
        }
    });
});

app.get('/api/sessions', (req, res) => {
    const sessionList = Object.entries(sessions).map(([sessionCode, session]) => ({
        sessionCode,
        playerCount: session.players.length,
    }));

    console.log('Liste des sessions disponibles :', sessionList);
    res.json(sessionList);
});

app.post('/api/createSession', (req, res) => {
    const { numberOfQuestions, category } = req.body;

    if (!numberOfQuestions || numberOfQuestions <= 0) {
        return res.status(400).json({ success: false, error: 'Le nombre de questions est requis et doit être supérieur à 0.' });
    }

    const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    sessions[sessionCode] = {
        players: [],
        questions: [],
        currentQuestionIndex: 0,
        hasStarted: false,
    };

    const query = category
        ? 'SELECT * FROM questions WHERE categorie = ? ORDER BY RANDOM() LIMIT ?'
        : 'SELECT * FROM questions ORDER BY RANDOM() LIMIT ?';

    db.all(query, category ? [category, numberOfQuestions] : [numberOfQuestions], (err, rows) => {
        if (err) {
            console.error('Erreur lors du chargement des questions :', err.message);
            return res.status(500).json({ success: false, error: 'Erreur serveur.' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Pas assez de questions disponibles.' });
        }

        sessions[sessionCode].questions = rows;
        console.log(`Session créée avec le code : ${sessionCode}, Questions :`, JSON.stringify(rows));

        io.emit('updateSessions', getSessionsList());
        return res.status(201).json({ success: true, sessionCode });
    });
});

app.get('/api/ranking/:sessionCode', (req, res) => {
    const { sessionCode } = req.params;
    const session = sessions[sessionCode];

    if (!session) {
        return res.status(404).json({ error: 'Session non trouvée.' });
    }

    const ranking = calculateRanking(session.players);
    res.json(ranking);
});

app.get('/api/validateSession/:sessionCode', (req, res) => {
    const { sessionCode } = req.params;
    const session = sessions[sessionCode];

    if (!session) {
        return res.status(404).json({ success: false, error: 'Session non trouvée.' });
    }

    if (session.hasStarted) {
        return res.status(400).json({ success: false, error: 'Impossible de rejoindre une session déjà lancée.' });
    }

    return res.json({ success: true });
});


io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté', socket.id);

    socket.on('joinSession', ({ sessionCode, playerName }, callback) => {
        const session = sessions[sessionCode];
        if (!session) {
            return callback({ success: false, error: 'Session non trouvée.' });
        }

        if (session.hasStarted) {
            return callback({ success: false, error: 'Impossible de rejoindre une session déjà lancée.' });
        }

        let player = session.players.find((p) => p.id === socket.id);
        if (!player) {
            player = { id: socket.id, name: playerName, score: 0 };
            session.players.push(player);
        }

        socket.join(sessionCode);

        io.emit('updateSessions', getSessionsList());

        io.to(sessionCode).emit('playerJoined', { players: session.players });

        console.log(`Joueur "${playerName}" a rejoint la session ${sessionCode} :`, session.players);

        return callback({ success: true });
    });

    socket.on('startSession', ({ sessionCode }, callback) => {
        const session = sessions[sessionCode];
        if (!session) {
            return callback({ success: false, error: 'Session non trouvée.' });
        }

        if (session.questions.length === 0) {
            return callback({ success: false, error: 'Aucune question disponible.' });
        }

        session.hasStarted = true;
        session.currentQuestionIndex = 0;

        const question = session.questions[session.currentQuestionIndex];
        io.to(sessionCode).emit('nextQuestion', { question });

        callback({ success: true });
    });

    socket.on('nextQuestion', ({ sessionCode }, callback) => {
        const session = sessions[sessionCode];
        if (!session) {
            callback && callback({ success: false, error: 'Session non trouvée.' });
            return;
        }

        session.currentQuestionIndex++;

        if (session.currentQuestionIndex >= session.questions.length) {
            const ranking = calculateRanking(session.players);
            io.to(sessionCode).emit('gameOver', { ranking });
            callback && callback({ success: true, message: 'Partie terminée.' });
        } else {
            const nextQuestion = session.questions[session.currentQuestionIndex];
            io.to(sessionCode).emit('nextQuestion', { question: nextQuestion });
            callback && callback({ success: true });
        }
    });

    socket.on('answerQuestion', ({ sessionCode, answer, timeLeft }, callback) => {
        const session = sessions[sessionCode];
        if (!session) {
            return callback({ success: false, error: 'Session non trouvée.' });
        }

        const player = session.players.find((p) => p.id === socket.id);
        if (!player) {
            return callback({ success: false, error: 'Joueur non trouvé dans cette session.' });
        }

        const currentQuestion = session.questions[session.currentQuestionIndex];
        const isCorrect = (parseInt(answer) === parseInt(currentQuestion.bonne_reponse));

        let points = 0;
        if (isCorrect) {

            if (timeLeft > 5 ) {
                points = 10;
            } else if (timeLeft >=2 && timeLeft <=5 ) {
                points = 5;
            } else if (timeLeft < 2){
                points = 1;
            }
            player.score += points;
        }

        return callback({
            success: true,
            isCorrect,
            points,
            newScore: player.score,
        });
    });

    socket.on('leaveSession', ({ sessionCode }) => {
        const session = sessions[sessionCode];
        if (!session) return;

        const playerIndex = session.players.findIndex((p) => p.id === socket.id);
        if (playerIndex !== -1) {
            session.players.splice(playerIndex, 1);
            socket.leave(sessionCode);
            console.log(`Le joueur ${socket.id} a quitté la session ${sessionCode}`);

            if (session.players.length === 0) {
                delete sessions[sessionCode];
            }
            io.emit('updateSessions', getSessionsList());
        }
    });

    socket.on('disconnect', () => {
        for (const [sessionCode, session] of Object.entries(sessions)) {
            const playerIndex = session.players.findIndex((p) => p.id === socket.id);

            if (playerIndex !== -1) {
                session.players.splice(playerIndex, 1);

                if (session.players.length === 0) {
                    delete sessions[sessionCode];
                    io.emit('updateSessions', getSessionsList());
                } else {
                    io.to(sessionCode).emit('playerJoined', { players: session.players });
                }

                break;
            }
        }
    });
});

const getSessionsList = () => {
    return Object.entries(sessions).map(([sessionCode, session]) => ({
        sessionCode,
        playerCount: session.players.length
    }));
};

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
