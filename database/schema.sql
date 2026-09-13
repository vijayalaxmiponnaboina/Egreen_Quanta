PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    level TEXT,
    content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO lessons
(title, description, level, content)
VALUES
(
    'What is Quantum Computing?',
    'Understand the basic idea of quantum computing.',
    'Beginner',
    'Quantum computing uses quantum states to process information.'
),
(
    'Qubits',
    'Learn the basic unit of quantum information.',
    'Beginner',
    'A qubit is the quantum version of a classical bit.'
),
(
    'Superposition',
    'Understand 0 and 1 combinations.',
    'Beginner',
    'Superposition lets a qubit exist in a combination of basis states.'
),
(
    'Quantum Gates',
    'Learn how gates change qubit states.',
    'Beginner',
    'H and X gates transform quantum states.'
),
(
    'Entanglement',
    'Learn quantum correlation.',
    'Beginner',
    'Entangled qubits have correlated quantum states.'
);