const express = require('express');
const app = express();
const quizzes = require('./text.json').quizzes;
const categories = require('./categories.json').categories;

const port = 8000;

//API Design
//To get all the Categories of the Quiz - /categories
//to get a particular category quiz /categories/category
//To create a Quiz of 10 Questions of a particular category /categories/category/create-Quiz
//To create random 10 Question Quizzes /random-Quiz

const endpoints = [
  { method: 'GET', path: '/', description: 'Home endpoint' },
  {
    method: 'GET',
    path: '/categories',
    description: 'Get the List of all the Categories Available',
  },
  {
    method: 'GET',
    path: '/categories/category',
    description: 'Generate A Quiz of 10 Questions of this particular Category',
  },
  {
    method: 'GET',
    path: '/generate-random',
    description: 'Create a Random Quiz of Random Difficulty',
  },
  {
    method: 'GET',
    path: '/generate-random/easy',
    description: 'Create a Random Quiz of difficulty level as Easy',
  },
  {
    method: 'GET',
    path: '/generate-random/medium',
    description: 'Create a Random Quiz of difficulty level as Medium',
  },
  {
    method: 'GET',
    path: '/generate-random/hard',
    description: 'Create a Random Quiz of difficulty level as Hard',
  },
];

app.get('/', (req, res) => {
  let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>API Endpoints</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
          }
          th {
            background-color: #f4f4f4;
          }
        </style>
      </head>
      <body>
        <h1>Available API Endpoints</h1>
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Path</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${endpoints
              .map(
                (endpoint) => `
              <tr>
                <td>${endpoint.method}</td>
                <td>${endpoint.path}</td>
                <td>${endpoint.description}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  res.send(html);
});

app.get('/categories', (req, res) => {
  if (categories.length === 0) {
    return res.status(404).json({ message: 'No Categories Found' });
  }
  return res.json(categories);
});

app.get('/categories/:cat', (req, res) => {
  const cat = req.params.cat.trim().toLowerCase();
  if (cat == '') {
    return res.status(404).json({
      message: 'Category Not Found Please Enter the Cat ID correctly',
    });
  }

  const filteredQuizzes = quizzes.filter(
    (quiz) => quiz.category.toLowerCase() === cat
  );

  if (filteredQuizzes.length === 0) {
    return res
      .status(404)
      .json({ message: `No quizzes found for the category '${cat}'` });
  }
  const limit = 10;
  const quiz = filteredQuizzes.slice(0, limit);

  res.json({
    category: cat,
    totalQuestions: filteredQuizzes.length,
    quiz,
  });
});

app.get('/generate-random', (req, res) => {
  const randomQuestions = [];
  const usedIndices = new Set();

  // Ensure 10 unique random questions are selected
  while (randomQuestions.length < 10) {
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    if (!usedIndices.has(randomIndex)) {
      randomQuestions.push(quizzes[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }

  res.json(randomQuestions);
});

app.get('/generate-random/:diff', (req, res) => {
  const diff = req.params.diff.toLowerCase().trim(); // Get difficulty from route parameter

  // Filter questions based on the difficulty level
  const filteredQuestions = quizzes.filter(
    (q) => q.difficulty.toLowerCase() === diff
  );

  if (filteredQuestions.length === 0) {
    return res
      .status(404)
      .json({
        error: 'No questions found for the specified difficulty level.',
      });
  }

  const randomQuestions = [];
  const usedIndices = new Set();

  // Ensure up to 10 unique random questions are selected from the filtered list
  while (
    randomQuestions.length < 10 &&
    randomQuestions.length < filteredQuestions.length
  ) {
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    if (!usedIndices.has(randomIndex)) {
      randomQuestions.push(filteredQuestions[randomIndex]);
      usedIndices.add(randomIndex);
    }
  }

  res.json(randomQuestions);
});

app.use((req, res) => {
  res
    .status(404)
    .json({ message: 'Trivia Not available Read Journals for now..' });
});

app.listen(port, () =>
  console.log('Server Running Successfully on ' + port + ' Port')
);
