const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/questions.db', (err) => {
    if (err) {
        console.error('Erreur lors de la connexion à la base de données :', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        reponse1 TEXT NOT NULL,
        reponse2 TEXT NOT NULL,
        reponse3 TEXT NOT NULL,
        reponse4 TEXT NOT NULL,
        bonne_reponse INTEGER NOT NULL CHECK(bonne_reponse BETWEEN 1 AND 4),
        categorie TEXT DEFAULT 'Général' -- Colonne pour la catégorie (thématique) des questions
    )`, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table :', err.message);
        } else {
            console.log('Table "questions" créée avec succès.');
        }
    });
});

db.serialize(() => {
    const questions = [
        {
            question: "Quel est le prénom de cette personne ?",
            reponse1: "Ahmed",
            reponse2: "Azzedine",
            reponse3: "Karim",
            reponse4: "Sofiane",
            bonne_reponse: 2,
            categorie: "Identité"
        },
        {
            question: "Quel est le nom de famille d'Azzedine ?",
            reponse1: "Ouahalou",
            reponse2: "Benali",
            reponse3: "El Mansouri",
            reponse4: "Ouhadad",
            bonne_reponse: 1,
            categorie: "Identité"
        },
        {
            question: "Quel âge a Azzedine ?",
            reponse1: "23 ans",
            reponse2: "24 ans",
            reponse3: "25 ans",
            reponse4: "26 ans",
            bonne_reponse: 3,
            categorie: "Âge"
        },
        {
            question: "Quelle est la taille d'Azzedine ?",
            reponse1: "1m70",
            reponse2: "1m85",
            reponse3: "1m89",
            reponse4: "1m92",
            bonne_reponse: 3,
            categorie: "Physique"
        },
        {
            question: "Quelle est la date de naissance d'Azzedine ?",
            reponse1: "3 octobre 1999",
            reponse2: "3 octobre 2000",
            reponse3: "3 novembre 2000",
            reponse4: "13 octobre 2000",
            bonne_reponse: 2,
            categorie: "Identité"
        },
        {
            question: "Quelle est sa nationalité ?",
            reponse1: "Française et Belge",
            reponse2: "Marocaine",
            reponse3: "Française uniquement",
            reponse4: "Belge uniquement",
            bonne_reponse: 1,
            categorie: "Nationalité"
        },
        {
            question: "De quelle origine est Azzedine ?",
            reponse1: "Algérienne",
            reponse2: "Tunisienne",
            reponse3: "Marocaine",
            reponse4: "Égyptienne",
            bonne_reponse: 3,
            categorie: "Origine"
        },
        {
            question: "Quelle est la passion principale d'Azzedine ?",
            reponse1: "Jeux vidéo",
            reponse2: "Escape game",
            reponse3: "Lecture",
            reponse4: "Football",
            bonne_reponse: 2,
            categorie: "Loisirs"
        },
        {
            question: "Quelle est sa pointure de chaussures ?",
            reponse1: "42",
            reponse2: "43",
            reponse3: "44",
            reponse4: "45",
            bonne_reponse: 4,
            categorie: "Physique"
        },
        {
            question: "Quel mois est associé à la naissance d'Azzedine ?",
            reponse1: "Janvier",
            reponse2: "Mars",
            reponse3: "Octobre",
            reponse4: "Décembre",
            bonne_reponse: 3,
            categorie: "Identité"
        },
        {
            question: "Quel type de jeu intéresse Azzedine ?",
            reponse1: "Jeux d'évasion",
            reponse2: "Jeux de société classiques",
            reponse3: "Jeux de rôle",
            reponse4: "Jeux vidéo",
            bonne_reponse: 1,
            categorie: "Loisirs"
        },
        {
            question: "Quel est le jour exact de la naissance d'Azzedine ?",
            reponse1: "1",
            reponse2: "2",
            reponse3: "3",
            reponse4: "4",
            bonne_reponse: 3,
            categorie: "Identité"
        },
        {
            question: "Combien mesure Azzedine en centimètres ?",
            reponse1: "180 cm",
            reponse2: "185 cm",
            reponse3: "189 cm",
            reponse4: "190 cm",
            bonne_reponse: 3,
            categorie: "Physique"
        },
        {
            question: "Quelle est une caractéristique unique d'Azzedine concernant ses loisirs ?",
            reponse1: "Il aime les énigmes",
            reponse2: "Il collectionne des jeux vidéo",
            reponse3: "Il pratique la musique",
            reponse4: "Il participe à des compétitions sportives",
            bonne_reponse: 1,
            categorie: "Loisirs"
        },
        {
            question: "Quelle combinaison décrit correctement les nationalités d'Azzedine ?",
            reponse1: "Française uniquement",
            reponse2: "Belge uniquement",
            reponse3: "Française et Marocaine",
            reponse4: "Française et Belge",
            bonne_reponse: 4,
            categorie: "Nationalité"
        },
        {
            question: "Quel est le principal intérêt d'Azzedine dans les escape games ?",
            reponse1: "Résolution d'énigmes",
            reponse2: "Aspect compétitif",
            reponse3: "Design immersif",
            reponse4: "Travail en équipe",
            bonne_reponse: 1,
            categorie: "Loisirs"
        },
        {
            question: "En quelle année Azzedine est-il né ?",
            reponse1: "1998",
            reponse2: "1999",
            reponse3: "2000",
            reponse4: "2001",
            bonne_reponse: 3,
            categorie: "Identité"
        },
        {
            question: "Quelle est la passion spécifique liée aux jeux d'Azzedine ?",
            reponse1: "Jeux vidéo",
            reponse2: "Escape game",
            reponse3: "Sports électroniques",
            reponse4: "Jeux de cartes",
            bonne_reponse: 2,
            categorie: "Loisirs"
        },
        {
            question: "Quelle est la combinaison correcte des origines et nationalités d'Azzedine ?",
            reponse1: "Origine algérienne, nationalité française et belge",
            reponse2: "Origine marocaine, nationalité française et belge",
            reponse3: "Origine marocaine, nationalité française uniquement",
            reponse4: "Origine tunisienne, nationalité belge uniquement",
            bonne_reponse: 2,
            categorie: "Identité"
        }
    ];

    const stmt = db.prepare(`INSERT INTO questions (question, reponse1, reponse2, reponse3, reponse4, bonne_reponse, categorie)
                             VALUES (?, ?, ?, ?, ?, ?, ?)`);
    questions.forEach(({ question, reponse1, reponse2, reponse3, reponse4, bonne_reponse, categorie }) => {
        stmt.run(question, reponse1, reponse2, reponse3, reponse4, bonne_reponse, categorie, (err) => {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    console.log(`La question suivante existe déjà : "${question}"`);
                } else {
                    console.error('Erreur lors de l\'insertion de la question :', err.message);
                }
            } else {
                console.log(`Question ajoutée : "${question}"`);
            }
        });
    });
    stmt.finalize(() => {
        console.log('Insertion des questions terminée.');
    });
});

db.close((err) => {
    if (err) {
        console.error('Erreur lors de la fermeture de la base de données :', err.message);
    } else {
        console.log('Connexion à la base de données fermée.');
    }
});
