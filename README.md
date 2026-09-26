# AI Study Assistant

An English AI-powered study assistant that can explain topics, generate examples, create quizzes, review a student's answer, and build a short study plan.

The app uses a small Node/Express backend so the OpenAI API key never appears in browser code.

## Features

- Explain a topic in clear English
- Generate worked examples
- Create a short quiz
- Review a student's answer
- Build a practical study plan
- Save recent topics in browser local storage
- Demo mode when `OPENAI_API_KEY` is not configured

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Then open:

```text
http://localhost:3000
```

To use live AI responses, put your API key in `.env`:

```text
OPENAI_API_KEY=your_key_here
```

## Project structure

```text
server.js
public/
  index.html
  styles.css
  app.js
  assets/study-hero.png
```

## Portfolio description

AI Study Assistant is a full-stack educational AI application built with HTML, CSS, JavaScript, Node.js, Express, and the OpenAI API.
