import os
import speech_recognition as sr
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")

@app.route("/upload", methods=["POST"])
def upload_audio():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    
    recognizer = sr.Recognizer()
    with sr.AudioFile(file_path) as source:
        audio = recognizer.record(source)
    
    try:
        text = recognizer.recognize_google(audio)
        return jsonify({"transcript": text})
    except sr.UnknownValueError:
        return jsonify({"error": "Speech not recognized"}), 400
    except sr.RequestError:
        return jsonify({"error": "Could not request results"}), 500

@app.route("/evaluate", methods=["POST"])
def evaluate_answer():
    data = request.json
    question = data.get("question", "")
    answer = data.get("answer", "")
    
    if not question or not answer:
        return jsonify({"error": "Missing question or answer"}), 400
    
    result = qa_pipeline(question=question, context=answer)
    score = result["score"] * 100
    
    return jsonify({"evaluation": f"Confidence Score: {score:.2f}%"})
    
if __name__ == "__main__":
    app.run(debug=True)
