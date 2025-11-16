const express = require("express");
const auth = require("../middleware/auth");
const Article = require("../models/Article");
const Chunk = require("../models/Chunk");
const { chunkTextBySentences } = require("../utils/chunker");
const { embedText, callInference, findNearest } = require("../utils/embed");

const router = express.Router();

// Ingest all articles -> chunks + embeddings (admin)
router.post("/ingest", auth, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Forbidden" });

  const articles = await Article.find();
  await Chunk.deleteMany({}); // clear for demo

  for (const art of articles) {
    const chunks = chunkTextBySentences(art.body, 300);
    for (const c of chunks) {
      const emb = await embedText(c.text);
      await Chunk.create({
        articleId: art._id,
        text: c.text,
        tokens: c.tokens,
        embeddings: emb,
        metadata: { articleTitle: art.title },
      });
    }
  }

  res.json({ ok: true, ingested: articles.length });
});

// Chat endpoint
router.post("/chat", auth, async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ message: "query is required" });

  const qEmb = await embedText(query);
  const nearest = await findNearest(qEmb, 5, Chunk);

  const context = nearest
    .map(
      (c, idx) =>
        `[#${idx + 1} - ${c.metadata.articleTitle || c.articleId}]\n${c.text}`
    )
    .join("\n\n");

  const prompt = `
You are an assistant for a documentation portal.
Use ONLY the following context to answer the user's question.
If you don't find the answer in the context, say you don't know.

Context:
${context}

User question: ${query}
  `;

  const answer = await callInference(prompt);

  res.json({
    answer,
    sources: nearest.map((c, idx) => ({
      label: `#${idx + 1}`,
      articleId: c.articleId,
      meta: c.metadata,
    })),
  });
});

module.exports = router;
