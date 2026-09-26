import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;
const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
const client = hasApiKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const modePrompts = {
  explain:
    "Explain the topic clearly and step by step. Use simple language, then add one short advanced insight.",
  example:
    "Teach through examples. Provide two worked examples and explain why each step matters.",
  quiz:
    "Create a short quiz. Include five questions, a mix of multiple-choice and short-answer, and put the answer key at the end.",
  feedback:
    "Review the student's answer. Be kind but direct. Explain what is correct, what is missing, and how to improve it.",
  plan:
    "Create a practical study plan. Break the topic into milestones, daily tasks, practice ideas, and checkpoints."
};

function buildPrompt({ subject, topic, mode, studentAnswer }) {
  const selectedMode = modePrompts[mode] || modePrompts.explain;

  return [
    "You are an expert AI study coach.",
    "Your goal is to help a motivated student understand deeply, not just memorize.",
    "Write in English. Keep the answer structured, friendly, and practical.",
    "",
    `Subject: ${subject || "General study"}`,
    `Topic: ${topic}`,
    `Mode instructions: ${selectedMode}`,
    studentAnswer ? `Student answer to review: ${studentAnswer}` : "",
    "",
    "Format the response with short sections, bullets when useful, and a clear next step."
  ]
    .filter(Boolean)
    .join("\n");
}

function createMockResponse({ subject, topic, mode, studentAnswer }) {
  const cleanSubject = subject || "General study";
  const cleanTopic = topic || "your topic";

  if (mode === "quiz") {
    return `Practice Quiz: ${cleanTopic}

Subject: ${cleanSubject}

1. What is the main idea behind ${cleanTopic}?
2. Name one real-world situation where this concept is useful.
3. Which detail is most important to remember, and why?
4. Give a short example in your own words.
5. What mistake do beginners often make with this topic?

Answer Key
Use your notes to check the core idea, a correct example, and a clear explanation. When you add an API key, I will generate a custom answer key automatically.`;
  }

  if (mode === "feedback") {
    return `Feedback on Your Answer

Topic: ${cleanTopic}

What works:
- You started addressing the topic directly.
- Your answer gives us something to improve from.

What to improve:
- Add one definition.
- Add one example.
- Explain the "why" behind your answer.

Your submitted answer:
${studentAnswer || "No answer was provided yet."}

Next step:
Rewrite your answer in 4-6 sentences. When an OpenAI API key is configured, this feedback will become specific to your exact response.`;
  }

  if (mode === "plan") {
    return `Study Plan: ${cleanTopic}

Day 1: Learn the core definition and write it in your own words.
Day 2: Study two examples and explain each step.
Day 3: Solve practice questions without looking at notes.
Day 4: Review mistakes and build a one-page summary.
Day 5: Teach the topic to someone else or record yourself explaining it.

Checkpoint:
You are ready to move on when you can explain ${cleanTopic} simply and solve a new problem without hints.`;
  }

  if (mode === "example") {
    return `Examples for ${cleanTopic}

Example 1:
Start with the simplest version of the concept. Identify the main rule, apply it once, then check the result.

Example 2:
Use the same idea in a slightly harder situation. Compare it with the first example and notice what changed.

Why this helps:
Examples turn an abstract idea into a pattern you can recognize later.`;
  }

  return `Simple Explanation: ${cleanTopic}

${cleanTopic} is easier to learn when you break it into three parts:

1. The core idea
Understand what the concept is really about.

2. The process
Learn the steps or logic used to apply it.

3. The mistake to avoid
Do not memorize only the final answer. Focus on why the answer makes sense.

Next step:
Ask for an example or generate a quiz to test yourself.`;
}

app.post("/api/study", async (req, res) => {
  try {
    const { subject, topic, mode = "explain", studentAnswer = "" } = req.body || {};

    if (!topic || topic.trim().length < 2) {
      return res.status(400).json({ error: "Please enter a topic to study." });
    }

    if (!hasApiKey) {
      return res.json({
        mode: "demo",
        content: createMockResponse({ subject, topic, mode, studentAnswer })
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a careful AI tutor. Never claim certainty when unsure. Keep explanations age-appropriate and educational."
        },
        {
          role: "user",
          content: buildPrompt({ subject, topic, mode, studentAnswer })
        }
      ],
      temperature: 0.7
    });

    return res.json({
      mode: "live",
      content: response.choices[0]?.message?.content || "No response was generated."
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "The assistant could not generate a response. Check the server logs and API key."
    });
  }
});

app.listen(port, () => {
  console.log(`AI Study Assistant is running at http://localhost:${port}`);
  if (!hasApiKey) {
    console.log("OPENAI_API_KEY is not set. The app is running in demo mode.");
  }
});
