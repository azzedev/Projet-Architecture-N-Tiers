import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function GamePage() {
    const { sessionCode } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const playerName = location.state?.playerName || 'Unknown';

    const [question, setQuestion] = useState(null);
    const [score, setScore] = useState(0);
    const [players, setPlayers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(10);
    const [hasAnswered, setHasAnswered] = useState(false);


    useEffect(() => {
        socket.emit('joinSession', { sessionCode, playerName }, (response) => {
            if (!response.success) {
                console.error('Impossible de rejoindre la session :', response.error);
                alert(response.error);
                navigate('/');
            } else {
                console.log('Joueur rejoint la session avec succès');
            }
        });

        return () => {
        };
    }, [sessionCode, playerName, navigate]);


    useEffect(() => {

        socket.on('nextQuestion', (data) => {
            console.log('Prochaine question reçue :', data.question);
            setQuestion(data.question);
            setTimeLeft(10);
            setHasAnswered(false);
        });

        socket.on('playerJoined', (data) => {
            setPlayers(data.players);
        });


        socket.on('gameOver', () => {
            console.log('Partie terminée, redirection vers la page de classement.');
            navigate(`/ranking/${sessionCode}`);
        });

        return () => {
            socket.off('nextQuestion');
            socket.off('playerJoined');
            socket.off('gameOver');
        };
    }, [sessionCode, navigate]);


    useEffect(() => {

        if (!question) return;

        const interval = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {

                    socket.emit('nextQuestion', { sessionCode });
                    return 10;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [question, sessionCode]);


    const handleStartSession = () => {
        console.log('Bouton Démarrer cliqué');
        socket.emit('startSession', { sessionCode }, (response) => {
            if (response.success) {
                console.log('Session démarrée');
            } else {
                console.error('Erreur lors du démarrage de la session :', response.error);
            }
        });
    };


    const handleAnswer = (answer) => {
        if (hasAnswered) return;
        setHasAnswered(true);

        socket.emit('answerQuestion', { sessionCode, answer, timeLeft }, (response) => {
            if (!response.success) {
                console.log('Erreur lors de la réponse :', response.error);
                return;
            }
            console.log('Réponse du joueur :', answer);
            
            if (response.isCorrect) {
                setScore(response.newScore);
                console.log(
                    `Réponse correcte ! +${response.points} points, Score = ${response.newScore}`
                );
                console.log(timeLeft)
            } else {
                console.log('Réponse incorrecte, aucun point ajouté.');
            }
        });
    };

    return (
        <div>
            <h1>Session : {sessionCode}</h1>
            <h2>Bienvenue, {playerName} !</h2>

            <h3>Joueurs dans la session :</h3>
            <ul>
                {players.map((player) => (
                    <li key={player.id}>
                        {player.name} {player.id === socket.id ? '(Vous)' : ''}
                        {' | Score: '}{player.score}
                    </li>
                ))}
            </ul>

            {question ? (
                <div>
                    <h3>{question.question}</h3>
                    <div>
                        <button
                            onClick={() => handleAnswer(1)}
                            disabled={hasAnswered}
                        >
                            {question.reponse1}
                        </button>
                        <button
                            onClick={() => handleAnswer(2)}
                            disabled={hasAnswered}
                        >
                            {question.reponse2}
                        </button>
                        <button
                            onClick={() => handleAnswer(3)}
                            disabled={hasAnswered}
                        >
                            {question.reponse3}
                        </button>
                        <button
                            onClick={() => handleAnswer(4)}
                            disabled={hasAnswered}
                        >
                            {question.reponse4}
                        </button>
                    </div>
                    <p>Temps restant : {timeLeft} secondes</p>
                </div>
            ) : (
                <div>
                    <p>En attente de la prochaine question...</p>
                    <button onClick={handleStartSession}>Démarrer</button>
                </div>
            )}
            <p>Mon Score local : {score}</p>
        </div>
    );
}

export default GamePage;
