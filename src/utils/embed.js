// These are STUB implementations for teaching.
// In real code, call your embedding & LLM provider here.

async function embedText(text) {
  // TODO: replace with real embeddings
  // return array of numbers
  return Array(10)
    .fill(0)
    .map((_, i) => Math.random()); // fake vector
}

async function callInference(prompt) {
  // TODO: replace with OpenAI/other LLM call
  return `Fake AI answer based on prompt: ${prompt.slice(0, 60)}...`;
}

// Fake nearest-neighbor: return random chunks for demo
async function findNearest(vector, k, ChunkModel) {
  const all = await ChunkModel.find().limit(50);
  return all.slice(0, k);
}

module.exports = { embedText, callInference, findNearest };
