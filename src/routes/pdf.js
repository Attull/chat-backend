const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse"); // ✅ plain require
const { chunkTextBySentences } = require("../utils/chunker");
const { addChunks } = require("../rag/index");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF uploaded" });
    }

    // 1️⃣ Extract text from PDF buffer
    const pdfData = await pdf(req.file.buffer); // ✅ pdf() is the function
    const text = pdfData.text || "";

    if (!text.trim()) {
      return res.status(400).json({
        message: "No text content found in PDF",
      });
    }

    // 2️⃣ Chunk text (your existing chunker)
    const chunks = chunkTextBySentences(text, 300);

    const formatted = chunks.map((c) => ({
      articleTitle: req.file.originalname,
      text: c.text,
    }));

    // 3️⃣ Store in Chroma via addChunks
    const count = await addChunks(formatted);

    return res.json({
      ok: true,
      message: "PDF ingested successfully",
      chunksAdded: count,
    });
  } catch (err) {
    console.error("PDF INGEST ERROR →", err);
    return res.status(500).json({
      message: "PDF ingestion failed",
      error: err.message,
    });
  }
});

module.exports = router;
