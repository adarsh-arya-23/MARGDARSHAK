// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const currentTheme = localStorage.getItem('theme') || 
                         (prefersDarkScheme.matches ? 'dark' : 'light');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        
        // Animate the toggle button
        this.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            this.style.transform = 'rotate(0deg)';
        }, 400);
    });

    // Initialize particles.js
    particlesJS("particles-js", {
        "particles": {
            "number": {
                "value": 150,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#0ef8bb"
            },
            "shape": {
                "type": "circle"
            },
            "opacity": {
                "value": 0.3,
                "random": true
            },
            "size": {
                "value": 10,
                "random": true
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#1DCD9F",
                "opacity": 0.2,
                "width": 1.5
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out"
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                }
            }
        }
    });

    // Chat functionality
    const sendBtn = document.getElementById("send-btn");
    const newChatBtn = document.getElementById("new-chat-btn");
    const userInput = document.getElementById("user-input");
    const chatWindow = document.getElementById("chat-window");

    sendBtn.addEventListener("click", sendMessage);
    newChatBtn.addEventListener("click", newChat);
    userInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") sendMessage();
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
        msgDiv.innerText = text;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        userInput.value = "";

        // Add thinking animation
        const thinkingDiv = document.createElement("div");
        thinkingDiv.classList.add("thinking-animation");
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement("div");
            dot.classList.add("thinking-dot");
            thinkingDiv.appendChild(dot);
        }
        chatWindow.appendChild(thinkingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        fetch("/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })
        .then(res => res.json())
        .then(data => {
            // Remove thinking animation
            chatWindow.removeChild(thinkingDiv);
            addMessage(data.response, "bot");
        })
        .catch(() => {
            // Remove thinking animation
            chatWindow.removeChild(thinkingDiv);
            addMessage("Oops! Something went wrong.", "bot");
        });
    }

    function newChat() {
        // Clear all messages except the initial bot message
        while (chatWindow.children.length > 1) {
            chatWindow.removeChild(chatWindow.lastChild);
        }
        userInput.value = "";
        userInput.focus();
    }

    // Prompt insertion function
    function insertPrompt(element) {
        const promptText = element.innerText.replace(" (Pro)", "");
        userInput.value = promptText;
        userInput.focus();
    }

    // Make insertPrompt available globally
    window.insertPrompt = insertPrompt;
});