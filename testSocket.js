const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connecté au serveur WebSocket !');

    // Tester la création de session
    socket.emit('createSession', { numberOfQuestions: 3 }, (response) => {
        console.log('Réponse de createSession :', response);

        const sessionCode = response.sessionCode;

        // Rejoindre la session
        socket.emit('joinSession', { sessionCode, playerName: 'TestPlayer' }, (joinResponse) => {
            console.log('Réponse de joinSession :', joinResponse);

            // Démarrer la session
            socket.emit('startSession', { sessionCode }, (startResponse) => {
                console.log('Réponse de startSession :', startResponse);
            });
        });
    });
});

socket.on('nextQuestion', (data) => {
    console.log('Prochaine question :', data);

    // Répondre à une question
    socket.emit('answerQuestion', {
        sessionCode: 'XXXXXX', // Remplacer par le vrai code de session
        answer: 3, // Exemple de réponse
        timeTaken: 4 // Temps de réponse
    }, (answerResponse) => {
        console.log('Réponse à answerQuestion :', answerResponse);
    });
});

socket.on('gameOver', (data) => {
    console.log('Partie terminée, classement :', data);
});
