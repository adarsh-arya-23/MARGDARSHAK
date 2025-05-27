from flask import Flask, send_from_directory, request, jsonify
import subprocess
import os

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def style():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def script():
    return send_from_directory('.', 'script.js')

@app.route('/ask', methods=['POST'])
def ask():
    messages = request.json.get('history', [])
    user_msg = request.json.get('message')

    try:
        # Build few-turn history from messages
        chat_history = ""
        for m in messages[-4:]:  # last 2 exchanges max
            chat_history += f"User: {m['user']}\nCareerBotX: {m['bot']}\n"
        # Strong system prompt with examples
        system_prompt = (
            # "You are CareerBotX, a smart and friendly chatbot that gives concise, helpful advice only related to careers, jobs, education, skill-building, and professional growth. "
            "You are Career Councellor, a friendly career guide who provides short and specific answers about careers, jobs, education, and skills.\n\n "
            # "Politely refuse off-topic questions. Be smart, clear, and on-topic.\n\n"
            # f"User: {user_msg}\nCareerBotX:"
        )

        full_prompt = f"{system_prompt}{chat_history}User: {user_msg}\nCareerBotX:"

        # Run model via subprocess
        response = subprocess.run(
            ["ollama", "run", "phi3:mini", full_prompt],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8"
        )

        if response.returncode == 0:
            bot_reply = response.stdout.strip()
        else:
            bot_reply = "There was an error getting a response from the model."

    except Exception as e:

        
        bot_reply = f"Error: {str(e)}"

    return jsonify({"response": bot_reply})

if __name__ == '__main__':
    app.run(debug=True)
