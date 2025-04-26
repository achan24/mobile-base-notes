const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

let conn = null;
async function connectToMongo() {
  if (conn) return conn;
  conn = await mongoose.connect(process.env.MONGODB_URI);
  return conn;
}

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    await connectToMongo();
    const { text } = JSON.parse(event.body);
    if (!text || !text.trim()) {
      return { statusCode: 400, body: 'Note text is required' };
    }
    const note = await Note.create({ text });
    return {
      statusCode: 201,
      body: JSON.stringify(note),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create note', details: err.message }),
    };
  }
};
