from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import random

# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend"
)

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BACKEND_DIR, "egreen_quanta.db")

# ============================================================
# FLASK APP
# ============================================================

app = Flask(
    __name__,
    static_folder=BASE_DIR,
    static_url_path=""
)

CORS(app)


# ============================================================
# DATABASE
# ============================================================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def initialize_database():

    conn = get_db()
    cursor = conn.cursor()

    # ---------------- USERS ----------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ---------------- LESSONS ----------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            level TEXT,
            content TEXT NOT NULL
        )
    """)

    # ---------------- QUIZ RESULTS ----------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
        )
    """)

    # ========================================================
    # DEFAULT LESSONS
    # ========================================================

    cursor.execute("SELECT COUNT(*) FROM lessons")
    lesson_count = cursor.fetchone()[0]

    if lesson_count == 0:

        lessons = [

            (
                "What is Quantum Computing?",
                "Understand the basic idea of quantum computing.",
                "Beginner",
                """
Quantum computing is a type of computing that uses the
principles of quantum mechanics.

Classical computers use bits that are either 0 or 1.

Quantum computers use qubits.

A qubit can represent quantum states that allow us to
work with 0, 1, and combinations of these states.

Quantum computing is useful for solving certain types
of complex problems.
"""
            ),

            (
                "Qubits",
                "Learn the basic unit of quantum information.",
                "Beginner",
                """
A qubit is the basic unit of quantum information.

A classical bit can have only one value:

0 or 1

A qubit uses quantum states.

The two basic states are:

|0⟩
|1⟩

A qubit can also exist in a combination of these states.
This property is called superposition.
"""
            ),

            (
                "Superposition",
                "Understand 0 and 1 combinations.",
                "Beginner",
                """
Superposition means that a quantum system can exist in
a combination of different states.

For example:

|ψ⟩ = α|0⟩ + β|1⟩

Here α and β are probability amplitudes.

When a qubit is measured, it gives either |0⟩ or |1⟩.

The Hadamard gate is commonly used to create an equal
superposition from |0⟩.
"""
            ),

            (
                "Quantum Gates",
                "Learn how gates change qubit states.",
                "Beginner",
                """
Quantum gates change the state of qubits.

Some important single-qubit gates are:

H - Hadamard Gate
X - Pauli-X Gate
I - Identity Gate

The X gate changes:

|0⟩ → |1⟩
|1⟩ → |0⟩

The H gate creates superposition.

The I gate leaves the state unchanged.
"""
            ),

            (
                "Entanglement",
                "Learn quantum correlation.",
                "Beginner",
                """
Quantum entanglement is a special relationship between
quantum particles.

When qubits are entangled, their states become correlated.

Measuring one qubit can provide information about the
state of another qubit.

Entanglement is an important concept in quantum computing
and quantum communication.
"""
            )
        ]

        cursor.executemany("""
            INSERT INTO lessons
            (title, description, level, content)
            VALUES (?, ?, ?, ?)
        """, lessons)

    conn.commit()
    conn.close()


# ============================================================
# HOME PAGE
# ============================================================

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "success",
        "message": "Egreen Quanta backend is running"
    })


# ============================================================
# REGISTER
# ============================================================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid request."
        }), 400

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not name or not email or not password:
        return jsonify({
            "error": "Please fill all fields."
        }), 400

    if len(password) < 4:
        return jsonify({
            "error": "Password must contain at least 4 characters."
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            INSERT INTO users
            (name, email, password)
            VALUES (?, ?, ?)
        """, (name, email, password))

        conn.commit()

    except sqlite3.IntegrityError:

        conn.close()

        return jsonify({
            "error": "Email already registered."
        }), 409

    user_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "message": "Registration successful.",
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 201


# ============================================================
# LOGIN
# ============================================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid request."
        }), 400

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return jsonify({
            "error": "Please enter email and password."
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, email, password
        FROM users
        WHERE email = ?
    """, (email,))

    user = cursor.fetchone()

    conn.close()

    if not user:
        return jsonify({
            "error": "Invalid email or password."
        }), 401

    # Compatible with the current local/demo database
    if user["password"] != password:
        return jsonify({
            "error": "Invalid email or password."
        }), 401

    return jsonify({
        "message": "Login successful.",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    })


# ============================================================
# GET ALL LESSONS
# ============================================================

@app.route("/api/lessons", methods=["GET"])
def get_lessons():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, description, level
        FROM lessons
        ORDER BY id
    """)

    lessons = cursor.fetchall()

    conn.close()

    result = []

    for lesson in lessons:

        result.append({
            "id": lesson["id"],
            "title": lesson["title"],
            "description": lesson["description"],
            "level": lesson["level"]
        })

    return jsonify(result)


# ============================================================
# GET SINGLE LESSON
# ============================================================

@app.route("/api/lessons/<int:lesson_id>", methods=["GET"])
def get_lesson(lesson_id):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title, description, level, content
        FROM lessons
        WHERE id = ?
    """, (lesson_id,))

    lesson = cursor.fetchone()

    conn.close()

    if not lesson:
        return jsonify({
            "error": "Lesson not found."
        }), 404

    return jsonify({
        "id": lesson["id"],
        "title": lesson["title"],
        "description": lesson["description"],
        "level": lesson["level"],
        "content": lesson["content"]
    })


# ============================================================
# QUBIT SIMULATOR
# ============================================================

@app.route("/api/qubit", methods=["POST"])
def qubit_simulator():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid request."
        }), 400

    try:
        state = int(data.get("state", 0))
    except (TypeError, ValueError):
        return jsonify({
            "error": "Invalid qubit state."
        }), 400

    gate = str(data.get("gate", "")).upper()

    if state not in [0, 1]:
        return jsonify({
            "error": "State must be 0 or 1."
        }), 400

    if gate not in ["H", "X", "I"]:
        return jsonify({
            "error": "Supported gates are H, X and I."
        }), 400

    # --------------------------------------------------------
    # IDENTITY GATE
    # --------------------------------------------------------

    if gate == "I":

        measurement = state

        if state == 0:
            probabilities = {
                "0": 1.0,
                "1": 0.0
            }
        else:
            probabilities = {
                "0": 0.0,
                "1": 1.0
            }

        explanation = (
            "The Identity gate does not change the qubit state."
        )

    # --------------------------------------------------------
    # PAULI-X GATE
    # --------------------------------------------------------

    elif gate == "X":

        measurement = 1 if state == 0 else 0

        if measurement == 0:
            probabilities = {
                "0": 1.0,
                "1": 0.0
            }
        else:
            probabilities = {
                "0": 0.0,
                "1": 1.0
            }

        explanation = (
            "The Pauli-X gate flips the qubit state. "
            "|0⟩ becomes |1⟩ and |1⟩ becomes |0⟩."
        )

    # --------------------------------------------------------
    # HADAMARD GATE
    # --------------------------------------------------------

    else:

        measurement = random.choice([0, 1])

        probabilities = {
            "0": 0.5,
            "1": 0.5
        }

        explanation = (
            "The Hadamard gate creates an equal superposition. "
            "The qubit has a 50% probability of being measured "
            "as |0⟩ and a 50% probability of being measured as |1⟩."
        )

    return jsonify({
        "input_state": state,
        "gate": gate,
        "measurement": measurement,
        "probabilities": probabilities,
        "explanation": explanation
    })


# ============================================================
# SAVE QUIZ RESULT
# ============================================================

@app.route("/api/quiz", methods=["POST"])
def save_quiz():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid request."
        }), 400

    try:
        user_id = int(data.get("user_id"))
        score = int(data.get("score"))
        total = int(data.get("total"))
    except (TypeError, ValueError):
        return jsonify({
            "error": "Invalid quiz data."
        }), 400

    if score < 0 or total <= 0 or score > total:
        return jsonify({
            "error": "Invalid score."
        }), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check user
    cursor.execute("""
        SELECT id
        FROM users
        WHERE id = ?
    """, (user_id,))

    user = cursor.fetchone()

    if not user:
        conn.close()

        return jsonify({
            "error": "User not found."
        }), 404

    cursor.execute("""
        INSERT INTO quiz_results
        (user_id, score, total)
        VALUES (?, ?, ?)
    """, (user_id, score, total))

    conn.commit()

    result_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "message": "Quiz result saved.",
        "result_id": result_id,
        "score": score,
        "total": total
    }), 201


# ============================================================
# PROGRESS
# ============================================================

@app.route("/api/progress/<int:user_id>", methods=["GET"])
def get_progress(user_id):

    conn = get_db()
    cursor = conn.cursor()

    # --------------------------------------------------------
    # Check user
    # --------------------------------------------------------

    cursor.execute("""
        SELECT id
        FROM users
        WHERE id = ?
    """, (user_id,))

    user = cursor.fetchone()

    if not user:
        conn.close()

        return jsonify({
            "error": "User not found."
        }), 404

    # --------------------------------------------------------
    # Attempts
    # --------------------------------------------------------

    cursor.execute("""
        SELECT
            COUNT(*) AS attempts,
            COALESCE(MAX(score), 0) AS best_score,
            COALESCE(SUM(score), 0) AS total_correct,
            COALESCE(SUM(total), 0) AS total_questions
        FROM quiz_results
        WHERE user_id = ?
    """, (user_id,))

    progress = cursor.fetchone()

    conn.close()

    attempts = progress["attempts"]
    best_score = progress["best_score"]
    total_correct = progress["total_correct"]
    total_questions = progress["total_questions"]

    if total_questions > 0:
        percentage = round(
            (total_correct / total_questions) * 100
        )
    else:
        percentage = 0

    return jsonify({
        "attempts": attempts,
        "best_score": best_score,
        "total_correct": total_correct,
        "total_questions": total_questions,
        "percentage": percentage
    })


# ============================================================
# AI TUTOR
# ============================================================

@app.route("/api/ai", methods=["POST"])
def ai_tutor():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Invalid request."
        }), 400

    question = str(
        data.get("question", "")
    ).strip()

    if not question:
        return jsonify({
            "error": "Please enter a question."
        }), 400

    q = question.lower()

    # --------------------------------------------------------
    # Simple built-in AI Tutor
    # --------------------------------------------------------

    if "qubit" in q:

        answer = (
            "A qubit is the basic unit of quantum information. "
            "A classical bit is either 0 or 1, while a qubit "
            "can exist in a quantum combination of |0⟩ and |1⟩."
        )

    elif "superposition" in q:

        answer = (
            "Superposition means a qubit can exist in a "
            "combination of |0⟩ and |1⟩ before measurement. "
            "The Hadamard gate can create an equal superposition."
        )

    elif "hadamard" in q or " h gate" in q:

        answer = (
            "The Hadamard or H gate is a quantum gate that "
            "creates superposition. For example, applying H "
            "to |0⟩ gives equal probabilities of measuring "
            "|0⟩ or |1⟩."
        )

    elif "pauli" in q or "x gate" in q:

        answer = (
            "The Pauli-X gate works like a NOT gate for a qubit. "
            "It changes |0⟩ to |1⟩ and |1⟩ to |0⟩."
        )

    elif "entanglement" in q:

        answer = (
            "Quantum entanglement is a strong correlation "
            "between quantum systems. The states of entangled "
            "qubits are connected so that measuring one provides "
            "information about the other."
        )

    elif "teleportation" in q:

        answer = (
            "Quantum teleportation is a protocol used to transfer "
            "the quantum state of one qubit to another location. "
            "It uses entanglement and classical communication."
        )

    elif "grover" in q:

        answer = (
            "Grover's algorithm is a quantum search algorithm. "
            "It increases the probability of finding a desired "
            "item in an unsorted search space."
        )

    elif "quantum computer" in q or "quantum computing" in q:

        answer = (
            "Quantum computing uses quantum-mechanical principles "
            "to process information. Its basic concepts include "
            "qubits, superposition, entanglement and quantum gates."
        )

    elif "quantum gate" in q or "gates" in q:

        answer = (
            "Quantum gates are operations that change the state "
            "of qubits. Examples include H, X and I gates."
        )

    elif "measurement" in q:

        answer = (
            "Measurement converts a quantum state into a classical "
            "result. For a single qubit, measurement gives either "
            "|0⟩ or |1⟩."
        )

    else:

        answer = (
            "Quantum computing is a fascinating topic. "
            "Try asking me about qubits, superposition, "
            "quantum gates, entanglement, Hadamard gate, "
            "quantum teleportation or Grover's algorithm."
        )

    return jsonify({
        "answer": answer
    })


# ============================================================
# ERROR HANDLERS
# ============================================================

@app.errorhandler(404)
def page_not_found(error):

    return jsonify({
        "error": "Endpoint not found."
    }), 404


@app.errorhandler(500)
def internal_server_error(error):

    return jsonify({
        "error": "Internal server error."
    }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    initialize_database()

    print("=" * 60)
    print("        EGREEN QUANTA BACKEND")
    print("=" * 60)
    print("Backend running at:")
    print("http://127.0.0.1:5000")
    print()
    print("Database:")
    print(DATABASE)
    print("=" * 60)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )