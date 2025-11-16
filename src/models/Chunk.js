const mongoose = require("mongoose");

const ChunkSchema = new mongoose.Schema(
  {
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article" },
    text: String,
    tokens: Number,
    embeddings: [Number], // you can skip storing vector here if using external VDB
    metadata: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chunk", ChunkSchema);
