import React, { useState, useEffect } from 'react';
import './App.css';

interface Question {
  id: number;
  topic: string;
  question: string;
  difficulty: 'basic' | 'mid' | 'advanced' | 'expert';
}

function App() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    const response = await fetch('http://localhost:3001/api/question');
    const data = await response.json();
    setQuestion(data);
    // Reset all state for the new question
    setAnswer('');
    setIsCorrect(null);
    setHasAttempted(false);
    setShowAnswer(false);
    setCorrectAnswer('');
  };

  const submitAnswer = async () => {
    if (!question) return;

    const isSecondAttempt = hasAttempted;

    const response = await fetch('http://localhost:3001/api/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId: question.id,
        userAnswer: answer,
        isRetry: isSecondAttempt,
      }),
    });

    const data = await response.json();
    console.log('Frontend received:', data);
    setIsCorrect(data.isCorrect);

    if (data.isCorrect) {
      if (data.score) {
        setScore(data.score);
      }
    } else {
      // Incorrect answer
      setCorrectAnswer(data.correctAnswer);
      if (hasAttempted) {
        setShowAnswer(true);
      } else {
        setHasAttempted(true);
      }
    }
  };

  const renderFeedback = () => {
    if (isCorrect === null) return null;

    if (isCorrect) {
      return <p className="correct">Correct!</p>;
    }

    if (showAnswer) {
      return (
        <p className="incorrect">
          Incorrect. The correct answer is: {correctAnswer}
        </p>
      );
    }

    if (hasAttempted) {
      return <p className="incorrect">Incorrect. Please try again.</p>;
    }

    return null;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Study Cards</h1>
        <p>Score: {score}</p>
      </header>
      <main>
        {question && (
          <div className="card">
            <h2>{question.topic}</h2>
            <p className={`difficulty ${question.difficulty}`}>{question.difficulty}</p>
            <p>{question.question}</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer"
              disabled={isCorrect || showAnswer}
            ></textarea>
            <button onClick={submitAnswer} disabled={isCorrect || showAnswer}>
              Submit
            </button>
            {renderFeedback()}
          </div>
        )}
        <button onClick={fetchQuestion}>Next Question</button>
      </main>
    </div>
  );
}

export default App;