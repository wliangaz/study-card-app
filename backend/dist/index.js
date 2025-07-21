"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Serve the frontend
app.use(express_1.default.static(path_1.default.join(__dirname, '../../build')));
const questions_1 = require("./questions");
let userHistory = [];
let userScore = 0;
app.get('/api/question', (req, res) => {
    const randomIndex = Math.floor(Math.random() * questions_1.questions.length);
    res.json(questions_1.questions[randomIndex]);
});
app.post('/api/answer', (req, res) => {
    console.log('Backend received:', req.body);
    const { questionId, userAnswer, isRetry } = req.body;
    const question = questions_1.questions.find(q => q.id === questionId);
    console.log('Found question:', question); // Add this line
    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }
    const correctAnswer = question.answer || 'resilient distributed dataset';
    const calculateSimilarity = (userAnswer, correct) => {
        const userWords = userAnswer.toLowerCase().split(/\W+/).filter(Boolean);
        const correctWords = correct.toLowerCase().split(/\W+/).filter(Boolean);
        if (correctWords.length === 0)
            return 0;
        let commonWords = 0;
        const matchedCorrectWords = new Set();
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
    }
    else if (similarity >= 0.75) {
        pointsAwarded = 0.75;
    }
    else if (similarity >= 0.5) {
        pointsAwarded = 0.5;
    }
    else if (similarity >= 0.25) {
        pointsAwarded = 0.25;
    }
    let response = {};
    if (pointsAwarded > 0) {
        userScore += pointsAwarded;
        response = { isCorrect: true, score: userScore, pointsAwarded: pointsAwarded };
    }
    else {
        response = { isCorrect: false, correctAnswer: correctAnswer };
    }
    console.log('Backend sending:', response);
    res.json(response);
});
app.get('/api/history', (req, res) => {
    res.json(userHistory);
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
