// VERY simple chunker for workshop demo
function chunkTextBySentences(text, maxTokens = 300) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let current = "";

  for (const s of sentences) {
    const words = (current + " " + s).trim().split(/\s+/);
    if (words.length > maxTokens) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += " " + s;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.map((c) => ({
    text: c,
    tokens: c.split(/\s+/).length,
    meta: {},
  }));
}

module.exports = { chunkTextBySentences };
