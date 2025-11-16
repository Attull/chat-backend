const express = require("express");
const { embedText, searchChunks } = require("../rag/index");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Query required" });

    // 1. Embed user query
    const queryEmbedding = await embedText(query);

    // 2. Vector search
    const results = await searchChunks(queryEmbedding, 5);

    const context = results
      .map((m, i) => `[#${i + 1}] ${m.articleTitle}\n${m.text}`)
      .join("\n\n");

    // 3. Build prompt
    const prompt = `
Use ONLY the context below to answer the question.
If the answer is not present, say: "I don't know".

Context:
${context}

Question: ${query}
`;

    // 4. Groq API call (using built-in fetch)
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await groqRes.json();
    const answer = data.choices?.[0]?.message?.content || "No answer";

    res.json({ answer, sources: results });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "Chat failed" });
  }
});

module.exports = router;
