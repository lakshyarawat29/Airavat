const express = require("express");
const { getGroqChatCompletion } = require("../utils/Groq");

const router = express.Router();

/**
 * Generate a structured test for a given technology.
 * Example: POST /test/generate { "technology": "JavaScript" }
 */
router.post("/generate", async (req, res) => {
  try {
    const { technology } = req.body;
    if (!technology) {
      return res
        .status(400)
        .json({ success: false, error: "Technology is required" });
    }

    // Define a strict prompt for AI to generate structured JSON output
    const prompt = `
      You are an AI tutor. Generate a structured test in JSON format for ${technology}.
      - The test should contain **5 multiple-choice questions (MCQs)**.
      - Each question must have exactly **4 options**.
      - There must be only **one correct answer per question**.
      - The output format must strictly match this JSON structure:
      {
        "technology": "${technology}",
        "questions": [
          {
            "question": "What does '===' do in JavaScript?",
            "options": ["Strict equality", "Loose equality", "Assignment", "None"],
            "correct_answer": "Strict equality"
          },
          ...
        ]
      }
      Ensure that the AI provides a **valid and parseable JSON response**.
    `;

    // Generate test from AI
    const response = await getGroqChatCompletion(prompt);
    console.log("Test generation response:", response);
    const testContent = response;

    // Parse and validate JSON output
    const test = testContent;
    if (!test.questions || test.questions.length !== 5) {
      throw new Error("Invalid test format received");
    }

    res.json({ success: true, test });
  } catch (error) {
    console.error("Test generation failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Validate student responses against the test schema
 * Example: POST /test/validate { "test": {...}, "answers": [{"question": "...", "answer": "..."}] }
 */
router.post("/validate", async (req, res) => {
  try {
    const { questions } = req.body; // Extract the correct field
    if (!questions || !Array.isArray(questions)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Questions are required in an array format",
        });
    }

    let score = 0;
    let totalQuestions = questions.length;
    let results = [];

    // Compare each student's answer with the correct answer
    questions.forEach((q) => {
      const studentAnswer = q.student_answer || "No answer"; // Get student answer
      const isCorrect = studentAnswer === q.correct_answer; // Compare with correct answer

      results.push({
        question: q.question,
        studentAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
      });

      if (isCorrect) score++;
    });

    res.json({ success: true, score, totalQuestions, results });
  } catch (error) {
    console.error("Test validation failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
