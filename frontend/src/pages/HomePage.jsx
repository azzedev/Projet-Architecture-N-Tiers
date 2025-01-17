import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function HomePage() {
    const [playerName, setPlayerName] = useState('');
    const [sessionCode, setSessionCode] = useState('');
    const [sessions, setSessions] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        fetch('http://localhost:3000/api/sessions')
            .then((res) => res.json())
            .then((data) => {
                console.log('Sessions initiales récupérées :', data);
                setSessions(data);
            })
            .catch((err) => console.error('Erreur lors de la récupération des sessions :', err));
    }, []);


    useEffect(() => {
        socket.on('updateSessions', (updatedSessions) => {
            console.log('Sessions reçues :', updatedSessions);
            setSessions(updatedSessions);
        });
        return () => {
            socket.off('updateSessions');
        };
    }, []);

    const handleCreateSession = () => {
        fetch('http://localhost:3000/api/createSession', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numberOfQuestions: 5 }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    console.log('Session créée avec le code :', data.sessionCode);

                    navigate(`/game/${data.sessionCode}`, { state: { playerName: playerName || 'Host' } });
                }
            })
            .catch((err) => console.error('Erreur lors de la création de la session :', err));
    };

    const handleJoinSession = () => {
        if (!sessionCode || !playerName) {
            alert('Veuillez entrer votre nom et un code de session !');
            return;
        }


        fetch(`http://localhost:3000/api/validateSession/${sessionCode}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    // OK
                    console.log('Rejoindre la session :', sessionCode);
                    navigate(`/game/${sessionCode}`, { state: { playerName } });
                } else {
                    alert(data.error); 
                }
            })
            .catch((err) => {
                console.error('Erreur lors de la validation de la session :', err);
                alert('Session en cours');
            });

    };

    return (
        <div className="homepage">
            <h1>Trivia Game</h1>

            <div>
                <h2>Créer une session</h2>
                <button onClick={handleCreateSession}>Créer</button>
            </div>

            <div>
                <h2>Rejoindre une session</h2>
                <input
                    type="text"
                    placeholder="Code de session"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Votre nom"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
                <button onClick={handleJoinSession}>Rejoindre</button>
            </div>

            <div>
                <h2>Sessions disponibles</h2>
                {sessions.length > 0 ? (
                    <ul>
                        {sessions.map((session) => (
                            <li key={session.sessionCode}>
                                Code : {session.sessionCode} - Joueurs : {session.playerCount}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucune session disponible.</p>
                )}
            </div>
        </div>
    );
}

export default HomePage;
