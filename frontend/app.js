const API_BASE = "http://127.0.0.1:5000"; 
 
let currentUser = JSON.parse(localStorage.getItem("egreenUser")) || null; 
let selectedState = 0; 
let selectedGate = "H"; 
 
/* ========================= 
   PAGE LOAD 
========================= */ 
 
document.addEventListener("DOMContentLoaded", () => { 
    setupForms(); 
 
    if (currentUser) { 
        showApp(); 
    } else { 
        showAuth(); 
    } 
 
    updateQubitDisplay(); 
}); 
 
 
/* ========================= 
   AUTH SCREEN 
========================= */ 
 
function showAuth() { 
    const authScreen = document.getElementById("authScreen"); 
    const appScreen = document.getElementById("appScreen"); 
 
    if (authScreen) { 
        authScreen.style.display = "flex"; 
    } 
 
    if (appScreen) { 
        appScreen.style.display = "none"; 
    } 
 
    showLogin(); 
} 
 
function showApp() { 
    const authScreen = document.getElementById("authScreen"); 
    const appScreen = document.getElementById("appScreen"); 
 
    if (authScreen) { 
        authScreen.style.display = "none"; 
    } 
 
    if (appScreen) { 
        appScreen.style.display = "block"; 
    } 
 
    const userName = document.getElementById("userName"); 
 
    if (userName && currentUser) { 
        userName.textContent = currentUser.name; 
    } 
 
    showSection("home"); 
    loadLessons(); 
    loadProgress(); 
} 
 
 
/* ========================= 
   LOGIN / REGISTER 
========================= */ 
 
function setupForms() { 
    const loginForm = document.getElementById("loginForm"); 
    const registerForm = document.getElementById("registerForm"); 
 
    if (loginForm) { 
        loginForm.addEventListener("submit", login); 
    } 
 
    if (registerForm) { 
        registerForm.addEventListener("submit", register); 
    } 
} 
 
function showRegister() { 
    const loginBox = document.getElementById("loginBox"); 
    const registerBox = document.getElementById("registerBox"); 
 
    if (loginBox) { 
        loginBox.style.display = "none"; 
    } 
 
    if (registerBox) { 
        registerBox.style.display = "block"; 
    } 
} 
 
function showLogin() { 
    const loginBox = document.getElementById("loginBox"); 
    const registerBox = document.getElementById("registerBox"); 
 
    if (registerBox) { 
        registerBox.style.display = "none"; 
    } 
 
    if (loginBox) { 
        loginBox.style.display = "block"; 
    } 
} 
 
async function register(event) { 
    event.preventDefault(); 
 
    const nameElement = document.getElementById("registerName"); 
    const emailElement = document.getElementById("registerEmail"); 
    const passwordElement = document.getElementById("registerPassword"); 
    const message = document.getElementById("registerMessage"); 
 
    if (!nameElement || !emailElement || !passwordElement) { 
        return; 
    } 
 
    const name = nameElement.value.trim(); 
    const email = emailElement.value.trim(); 
    const password = passwordElement.value; 
 
    if (!name || !email || !password) { 
        showMessage( 
            message, 
            "Please fill all fields.", 
            "error" 
        ); 
        return; 
    } 
 
    if (password.length < 4) { 
        showMessage( 
            message, 
            "Password must contain at least 4 characters.", 
            "error" 
        ); 
        return; 
    } 
 
    try { 
        const response = await fetch( 
            `${API_BASE}/api/register`, 
            { 
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json" 
                }, 
                body: JSON.stringify({ 
                    name, 
                    email, 
                    password 
                }) 
            } 
        ); 
 
        const data = await response.json(); 
 
        if (!response.ok) { 
            showMessage( 
                message, 
                data.error || "Registration failed.", 
                "error" 
            ); 
            return; 
        } 
 
        showMessage( 
            message, 
            "Registration successful! Please login.", 
            "success" 
        ); 
 
        document.getElementById("registerForm").reset(); 
 
        setTimeout(() => { 
            showLogin(); 
 
            const loginEmail = document.getElementById("loginEmail"); 
 
            if (loginEmail) { 
                loginEmail.value = email; 
            } 
        }, 1000); 
 
    } catch (error) { 
        console.error(error); 
 
        showMessage( 
            message, 
            "Cannot connect to backend. Start Flask server first.", 
            "error" 
        ); 
    } 
} 
 
async function login(event) { 
    event.preventDefault(); 
 
    const emailElement = document.getElementById("loginEmail"); 
    const passwordElement = document.getElementById("loginPassword"); 
    const message = document.getElementById("loginMessage"); 
 
    if (!emailElement || !passwordElement) { 
        return; 
    } 
 
    const email = emailElement.value.trim(); 
    const password = passwordElement.value; 
 
    if (!email || !password) { 
        showMessage( 
            message, 
            "Please enter email and password.", 
            "error" 
        ); 
        return; 
    } 
 
    try { 
        const response = await fetch( 
            `${API_BASE}/api/login`, 
            { 
                method: "POST", 
                headers: { 
                    "Content-Type": "application/json" 
                }, 
                body: JSON.stringify({ 
                    email, 
                    password 
                }) 
            } 
        ); 
 
        const data = await response.json(); 
 
        if (!response.ok) { 
            showMessage( 
                message, 
                data.error || "Invalid email or password.", 
                "error" 
            ); 
            return; 
        } 
 
        currentUser = data.user; 
 
        localStorage.setItem( 
            "egreenUser", 
            JSON.stringify(currentUser) 
        ); 
 
        document.getElementById("loginForm").reset(); 
 
        showApp(); 
 
    } catch (error) { 
        console.error(error); 
 
        showMessage( 
            message, 
            "Cannot connect to backend. Start Flask server first.", 
            "error" 
        ); 
    } 
} 
 
function logout() { 
    localStorage.removeItem("egreenUser"); 
 
    currentUser = null; 
 
    showAuth(); 
 
    const loginForm = document.getElementById("loginForm"); 
 
    if (loginForm) { 
        loginForm.reset(); 
    } 
} 
 
 
/* ========================= 
   NAVIGATION 
========================= */ 
 
function showSection(sectionName) { 
 
    const sections = document.querySelectorAll(".page-section"); 
 
    sections.forEach(section => { 
        section.style.display = "none"; 
    }); 
 
    const selectedSection = 
        document.getElementById(`${sectionName}Section`); 
 
    if (selectedSection) { 
        selectedSection.style.display = "block"; 
    } 
 
    if (sectionName === "learn") { 
        loadLessons(); 
    } 
 
    if (sectionName === "progress") { 
        loadProgress(); 
    } 
 
    if (sectionName === "simulator") { 
        updateQubitDisplay(); 
    } 
} 
 
 
/* ========================= 
   LESSONS 
========================= */ 
 
async function loadLessons() { 
 
    const container = 
        document.getElementById("lessonsContainer"); 
 
    if (!container) { 
        return; 
    } 
 
    container.innerHTML = ` 
        <div class="loading-message"> 
            Loading quantum lessons... 
        </div> 
    `; 
 
    try { 
 
        const response = 
            await fetch(`${API_BASE}/api/lessons`); 
 
        if (!response.ok) { 
            throw new Error("Failed to load lessons"); 
        } 
 
        const lessons = 
            await response.json(); 
 
        if (!lessons.length) { 
 
            container.innerHTML = ` 
                <div class="loading-message"> 
                    No lessons available. 
                </div> 
            `; 
 
            return; 
        } 
 
        container.innerHTML = lessons.map(lesson => ` 
            <div class="lesson-card"> 
 
                <div class="lesson-number"> 
                    Lesson ${lesson.id} 
                </div> 
 
                <h3> 
                    ${escapeHTML(lesson.title)} 
                </h3> 
 
                <span class="level-badge"> 
                    ${escapeHTML( 
                        lesson.level || "Beginner" 
                    )} 
                </span> 
 
                <p> 
                    ${escapeHTML( 
                        lesson.description || "" 
                    )} 
                </p> 
 
                <button 
                    class="primary-btn" 
                    onclick="openLesson(${lesson.id})" 
                > 
                    Learn Now 
                </button> 
 
            </div> 
        `).join(""); 
 
    } catch (error) { 
 
        console.error(error); 
 
        container.innerHTML = ` 
            <div class="loading-message"> 
                Unable to load lessons. 
                Make sure the Flask backend is running. 
            </div> 
        `; 
    } 
} 
 
async function openLesson(lessonId) { 
 
    const details = 
        document.getElementById("lessonDetails"); 
 
    if (!details) { 
        return; 
    } 
 
    details.style.display = "flex"; 
 
    try { 
 
        const response = 
            await fetch( 
                `${API_BASE}/api/lessons/${lessonId}` 
            ); 
 
        const lesson = 
            await response.json(); 
 
        if (!response.ok) { 
            throw new Error( 
                lesson.error || "Lesson not found" 
            ); 
        } 
 
        updateElement( 
            "lessonTitle", 
            lesson.title 
        ); 
 
        updateElement( 
            "lessonLevel", 
            lesson.level 
        ); 
 
        updateElement( 
            "lessonDescription", 
            lesson.description 
        ); 
 
        updateElement( 
            "lessonContent", 
            lesson.content 
        ); 
 
    } catch (error) { 
 
        console.error(error); 
 
        updateElement( 
            "lessonContent", 
            "Unable to load this lesson." 
        ); 
    } 
} 
 
function closeLesson() { 
 
    const details = 
        document.getElementById("lessonDetails"); 
 
    if (details) { 
        details.style.display = "none"; 
    } 
} 
 
 
/* ========================= 
   QUBIT SIMULATOR 
========================= */ 
 
function selectState(state) { 
 
    selectedState = state; 
 
    const stateButtons = 
        document.querySelectorAll(".state-btn"); 
 
    stateButtons.forEach(button => { 
        button.classList.remove("active"); 
    }); 
 
    const selectedButton = 
        document.querySelector( 
            `[onclick="selectState(${state})"]` 
        ); 
 
    if (selectedButton) { 
        selectedButton.classList.add("active"); 
    } 
 
    updateQubitDisplay(); 
} 
 
function updateQubitDisplay() { 
 
    const display = 
        document.getElementById("qubitDisplay"); 
 
    if (!display) { 
        return; 
    } 
 
    display.innerHTML = ` 
        <div class="qubit-core"> 
            |${selectedState}⟩ 
        </div> 
    `; 
} 
 
async function simulate(gate) { 
 
    selectedGate = gate; 
 
    const result = 
        document.getElementById("simulationResult"); 
 
    const probabilityDisplay = 
        document.getElementById("probabilityDisplay"); 
 
    if (result) { 
        result.innerHTML = 
            "Running simulation..."; 
    } 
 
    try { 
 
        const response = 
            await fetch( 
                `${API_BASE}/api/qubit`, 
                { 
                    method: "POST", 
                    headers: { 
                        "Content-Type": "application/json" 
                    }, 
                    body: JSON.stringify({ 
                        state: selectedState, 
                        gate: gate 
                    }) 
                } 
            ); 
 
        const data = 
            await response.json(); 
 
        if (!response.ok) { 
            throw new Error( 
                data.error || "Simulation failed" 
            ); 
        } 
 
        if (result) { 
 
            result.innerHTML = ` 
                <div class="simulation-main"> 
 
                    <span>Input</span> 
                    <strong> 
                        |${data.input_state}⟩ 
                    </strong> 
 
                    <span>Gate</span> 
                    <strong> 
                        ${escapeHTML(data.gate)} 
                    </strong> 
 
                    <span>Measurement</span> 
                    <strong> 
                        |${data.measurement}⟩ 
                    </strong> 
 
                </div> 
 
                <p class="simulation-explanation"> 
                    ${escapeHTML(data.explanation)} 
                </p> 
            `; 
        } 
 
        if (probabilityDisplay) { 
 
            probabilityDisplay.innerHTML = ` 
                <div class="probability-item"> 
                    <span>|0⟩</span> 
                    <strong> 
                        ${(data.probabilities["0"] * 100).toFixed(0)}% 
                    </strong> 
                </div> 
 
                <div class="probability-item"> 
                    <span>|1⟩</span> 
                    <strong> 
                        ${(data.probabilities["1"] * 100).toFixed(0)}% 
                    </strong> 
                </div> 
            `; 
        } 
 
    } catch (error) { 
 
        console.error(error); 
 
        if (result) { 
 
            result.innerHTML = ` 
                <div class="loading-message"> 
                    ${escapeHTML(error.message)} 
                </div> 
            `; 
        } 
    } 
} 
 
 
/* ========================= 
   ALGORITHM DEMOS 
========================= */ 
 
const algorithms = { 
 
    superposition: { 
        title: "Superposition", 
 
        steps: [ 
            "Start with one qubit in the state |0⟩.", 
            "Apply the Hadamard (H) gate.", 
            "The qubit enters an equal superposition.", 
            "The qubit now has 50% probability of measuring |0⟩.", 
            "The qubit also has 50% probability of measuring |1⟩.", 
            "When measured, the state becomes either |0⟩ or |1⟩." 
        ] 
    }, 
 
    teleportation: { 
        title: "Quantum Teleportation", 
 
        steps: [ 
            "Prepare the qubits required for teleportation.", 
            "Create an entangled pair of qubits.", 
            "Perform operations on the sender's qubit.", 
            "Measure the sender's qubits.", 
            "Send the classical measurement information.", 
            "Apply the required gates to the receiver's qubit.", 
            "The receiver obtains the original quantum state." 
        ] 
    }, 
 
    grover: { 
        title: "Grover's Search Algorithm", 
 
        steps: [ 
            "Prepare the qubits in an equal superposition.", 
            "Use an oracle to mark the target state.", 
            "Apply the diffusion operation.", 
            "The probability of the target state increases.", 
            "Repeat the oracle and diffusion steps.", 
            "Measure the qubits to obtain the searched state." 
        ] 
    } 
}; 
 
function showAlgorithm(name) { 
 
    const algorithm = 
        algorithms[name]; 
 
    if (!algorithm) { 
        return; 
    } 
 
    const viewer = 
        document.getElementById("algorithmViewer"); 
 
    const title = 
        document.getElementById("algorithmTitle"); 
 
    const steps = 
        document.getElementById("algorithmSteps"); 
 
    if (!viewer || !title || !steps) { 
        return; 
    } 
 
    title.textContent = 
        algorithm.title; 
 
    steps.innerHTML = 
        algorithm.steps.map( 
            (step, index) => ` 
                <div class="step"> 
 
                    <strong> 
                        Step ${index + 1} 
                    </strong> 
 
                    <p> 
                        ${escapeHTML(step)} 
                    </p> 
 
                </div> 
            ` 
        ).join(""); 
 
    viewer.style.display = "flex"; 
} 
 
function closeAlgorithm() { 
 
    const viewer = 
        document.getElementById("algorithmViewer"); 
 
    if (viewer) { 
        viewer.style.display = "none"; 
    } 
} 
 
 
/* ========================= 
   QUIZ 
========================= */ 
 
async function submitQuiz() { 
 
    const answers = { 
    q1: "qubit", 
    q2: "h", 
    q3: "connection" 
    }; 
 
    let score = 0; 
 
    const total = 
        Object.keys(answers).length; 
 
    for (const question of Object.keys(answers)) { 
 
        const selected = 
            document.querySelector( 
                `input[name="${question}"]:checked` 
            ); 
 
        if ( 
            selected && 
            selected.value === answers[question] 
        ) { 
            score++; 
        } 
    } 
 
    const result = 
        document.getElementById("quizResult"); 
 
    if (!result) { 
        return; 
    } 
 
    const percentage = 
        Math.round((score / total) * 100); 
 
    result.innerHTML = ` 
        <h3> 
            Quiz Completed! 
        </h3> 
 
        <div class="score-number"> 
            ${score}/${total} 
        </div> 
 
        <p> 
            Your score: ${percentage}% 
        </p> 
    `; 
 
    if (currentUser) { 
 
        try { 
 
            await fetch( 
                `${API_BASE}/api/quiz`, 
                { 
                    method: "POST", 
                    headers: { 
                        "Content-Type": "application/json" 
                    }, 
                    body: JSON.stringify({ 
                        user_id: currentUser.id, 
                        score: score, 
                        total: total 
                    }) 
                } 
            ); 
 
            loadProgress(); 
 
        } catch (error) { 
 
            console.error( 
                "Could not save quiz result.", 
                error 
            ); 
        } 
    } 
} 
 
 
/* ========================= 
   AI TUTOR 
========================= */ 
 
function handleAIKey(event) { 
 
    if (event.key === "Enter") { 
        askAI(); 
    } 
} 
 
async function askAI() { 
 
    const input = 
        document.getElementById("aiQuestion"); 
 
    const messages = 
        document.getElementById("chatMessages"); 
 
    if (!input || !messages) { 
        return; 
    } 
 
    const question = 
        input.value.trim(); 
 
    if (!question) { 
        return; 
    } 
 
    addChatMessage( 
        question, 
        "user" 
    ); 
 
    input.value = ""; 
 
    addChatMessage( 
        "Thinking...", 
        "bot", 
        "thinking-message" 
    ); 
 
    try { 
 
        const response = 
            await fetch( 
                `${API_BASE}/api/ai`, 
                { 
                    method: "POST", 
                    headers: { 
                        "Content-Type": "application/json" 
                    }, 
                    body: JSON.stringify({ 
                        question: question 
                    }) 
                } 
            ); 
 
        const data = 
            await response.json(); 
 
        const thinkingMessage = 
            document.querySelector( 
                ".thinking-message" 
            ); 
 
        if (thinkingMessage) { 
            thinkingMessage.remove(); 
        } 
 
        if (!response.ok) { 
            throw new Error( 
                data.error || "AI request failed" 
            ); 
        } 
 
        addChatMessage( 
            data.answer, 
            "bot" 
        ); 
 
    } catch (error) { 
 
        console.error(error); 
 
        const thinkingMessage = 
            document.querySelector( 
                ".thinking-message" 
            ); 
 
        if (thinkingMessage) { 
            thinkingMessage.remove(); 
        } 
 
        addChatMessage( 
            "Sorry, I could not connect to the AI tutor.", 
            "bot" 
        ); 
    } 
} 
 
function addChatMessage( 
    message, 
    sender, 
    extraClass = "" 
) { 
 
    const messages = 
        document.getElementById("chatMessages"); 
 
    if (!messages) { 
        return; 
    } 
 
    const messageElement = 
        document.createElement("div"); 
 
    messageElement.className = 
        `chat-message ${sender} ${extraClass}`; 
 
    messageElement.textContent = 
        message; 
 
    messages.appendChild( 
        messageElement 
    ); 
 
    messages.scrollTop = 
        messages.scrollHeight; 
} 
 
 
/* ========================= 
   PROGRESS 
========================= */ 
 
async function loadProgress() { 
 
    if (!currentUser) { 
        return; 
    } 
 
    try { 
 
        const response = 
            await fetch( 
                `${API_BASE}/api/progress/${currentUser.id}` 
            ); 
 
        const data = 
            await response.json(); 
 
        if (!response.ok) { 
            throw new Error( 
                data.error || "Progress unavailable" 
            ); 
        } 
 
        updateElement( 
            "attempts", 
            data.attempts 
        ); 
 
        updateElement( 
            "bestScore", 
            data.best_score 
        ); 
 
        updateElement( 
            "totalCorrect", 
            `${data.total_correct}/${data.total_questions}` 
        ); 
 
        updateElement( 
            "accuracy", 
            `${data.percentage}%` 
        ); 
 
    } catch (error) { 
 
        console.error( 
            "Progress could not be loaded.", 
            error 
        ); 
    } 
} 
 
 
/* ========================= 
   HELPERS 
========================= */ 
 
function updateElement(id, value) { 
 
    const element = 
        document.getElementById(id); 
 
    if (element) { 
        element.textContent = value; 
    } 
} 
 
function showMessage( 
    element, 
    text, 
    type 
) { 
 
    if (!element) { 
        return; 
    } 
 
    element.textContent = text; 
 
    element.className = 
        `form-message ${type}`; 
} 
 
function escapeHTML(value) { 
 
    const div = 
        document.createElement("div"); 
 
    div.textContent = 
        value ?? ""; 
 
    return div.innerHTML; 
} 