const { ChromaClient } = require("chromadb");
const fs = require("fs");
const crypto = require("crypto");

let embedder = null;
let db = null;
let collection = null;

const COLLECTION_NAME = "articles_rag";

// -----------------------------
// 1. Load Xenova Embedding Model
// -----------------------------
async function loadEmbedder() {
  if (!embedder) {
    // IMPORTANT: Dynamic import because transformers is ESM-only
    const { pipeline } = await import("@xenova/transformers");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

// -----------------------------
// 2. Initialize ChromaDB Storage
// -----------------------------
async function initChroma() {
  if (!db) {
    db = new ChromaClient({
      path: "file://C:/Users/Atul Sharma/Desktop/chatbot/backend/src/rag/chroma",
    });
  }

  if (!collection) {
    try {
      collection = await db.getCollection(COLLECTION_NAME);
    } catch {
      collection = await db.createCollection({ name: COLLECTION_NAME });
    }
  }

  return collection;
}

// -----------------------------
// 3. Embed a single text
// -----------------------------
async function embedText(text) {
  const model = await loadEmbedder();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

// -----------------------------
// 4. Add chunks to vector DB
// -----------------------------
async function addChunks(chunks) {
  const col = await initChroma();

  const ids = chunks.map(() => crypto.randomUUID());
  const texts = chunks.map((c) => c.text);

  // Generate embeddings
  const embeddings = [];
  for (let t of texts) {
    embeddings.push(await embedText(t));
  }

  await col.add({
    ids,
    embeddings,
    metadatas: chunks,
    documents: texts,
  });

  return ids.length;
}

// -----------------------------
// 5. Search vector DB
// -----------------------------
async function searchChunks(queryEmbedding, topK = 5) {
  const col = await initChroma();

  const result = await col.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  const matches = [];

  for (let i = 0; i < result.ids[0].length; i++) {
    matches.push({
      score: result.distances[0][i],
      ...result.metadatas[0][i],
      text: result.documents[0][i],
    });
  }

  return matches;
}

module.exports = {
  embedText,
  addChunks,
  searchChunks,
  initChroma,
};
