import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, '../../build')));

import { questions } from './questions';
import { UserHistory } from './types';

let userHistory: UserHistory[] = [];
let userScore = 0;

app.get('/api/question', (req: Request, res: Response) => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  res.json(questions[randomIndex]);
});

app.post('/api/answer', (req: Request, res: Response) => {
  console.log('Backend received:', req.body);
  const { questionId, userAnswer, isRetry } = req.body;
  const question = questions.find(q => q.id === questionId);

  console.log('Found question:', question); // Add this line

  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const correctAnswer = question.answer || 'resilient distributed dataset';

  const calculateSimilarity = (userAnswer: string, correct: string): number => {
    const userWords = userAnswer.toLowerCase().split(/\W+/).filter(Boolean);
    const correctWords = correct.toLowerCase().split(/\W+/).filter(Boolean);

    if (correctWords.length === 0) return 0;

    let commonWords = 0;
    const matchedCorrectWords = new Set<string>();

    for (const userWord of userWords) {
      if (correctWords.includes(userWord) && !matchedCorrectWords.has(userWord)) {
        commonWords++;
        matchedCorrectWords.add(userWord);
      }
    }

    const keywordMatchScore = commonWords / correctWords.length;

    // Simple length similarity: closer to 1 if lengths are similar
    const lengthSimilarity = 1 - Math.abs(userAnswer.length - correct.length) / Math.max(userAnswer.length, correct.length, 1);

    // Combine scores - you can adjust weights
    return (keywordMatchScore * 0.7) + (lengthSimilarity * 0.3);
  };

  const similarity = calculateSimilarity(userAnswer, correctAnswer);
  let pointsAwarded = 0;
  let isCorrect = false;

  if (similarity >= 0.9) {
    pointsAwarded = 1.0;
    isCorrect = true;
  } else if (similarity >= 0.75) {
    pointsAwarded = 0.75;
  } else if (similarity >= 0.5) {
    pointsAwarded = 0.5;
  } else if (similarity >= 0.25) {
    pointsAwarded = 0.25;
  }

  let response: any = {};
  if (pointsAwarded > 0) {
    userScore += pointsAwarded;
    response = { isCorrect: true, score: userScore, pointsAwarded: pointsAwarded };
  } else {
    response = { isCorrect: false, correctAnswer: correctAnswer };
  }
  console.log('Backend sending:', response);
  res.json(response);
});

app.get('/api/history', (req: Request, res: Response) => {
  res.json(userHistory);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});