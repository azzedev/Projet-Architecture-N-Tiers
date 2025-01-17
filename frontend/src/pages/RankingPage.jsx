import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function RankingPage() {
    const navigate = useNavigate();
    const { sessionCode } = useParams();
    const [ranking, setRanking] = useState([]);
    const handleGoHomePage = () => {
                    navigate(`/`);
            };

    useEffect(() => {
        fetch(`http://localhost:3000/api/ranking/${sessionCode}`)
            .then((res) => res.json())
            .then((data) => setRanking(data))
            .catch((err) => console.error('Erreur récupération du classement :', err));
    }, [sessionCode]);

    return (
        <div>
            <h1>Classement final</h1>
            <ul>
                {ranking.map((player, index) => (
                    <li key={index}>
                        {player.rank}. {player.name} - {player.score} points
                    </li>
                ))}
            </ul>
            <button onClick={handleGoHomePage}> go back</button>
        </div>
    );
}

export default RankingPage;
