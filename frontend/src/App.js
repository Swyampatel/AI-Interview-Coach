import React, { useState } from "react";
import axios from "axios";
import './style.css';


const InterviewCoach = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [transcript, setTranscript] = useState("");

  const handleFileChange = (event) => {
    setAudioFile(event.target.files[0]);
  };

  const uploadAudio = async () => {
    if (!audioFile) {
      alert("Please select an audio file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", audioFile);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTranscript(response.data.transcript);
    } catch (error) {
      console.error("Error uploading file", error);
      alert("Failed to process audio");
    }
  };

  const evaluateAnswer = async () => {
    if (!question || !answer) {
      alert("Please enter both question and answer");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/evaluate", {
        question,
        answer,
      });
      setEvaluation(response.data.evaluation);
    } catch (error) {
      console.error("Error evaluating answer", error);
      alert("Failed to evaluate answer");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>AI Interview Coach</h1>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button onClick={uploadAudio}>Upload & Transcribe</button>
      {transcript && (
        <div>
          <h2>Transcribed Answer:</h2>
          <p>{transcript}</p>
        </div>
      )}
      <div>
        <h2>Enter Question:</h2>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <h2>Enter Answer:</h2>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button onClick={evaluateAnswer}>Evaluate Answer</button>
      </div>
      {evaluation && (
        <div>
          <h2>Evaluation Result:</h2>
          <p>{evaluation}</p>
        </div>
      )}
    </div>
  );
};

export default InterviewCoach;
