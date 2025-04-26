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
  try {
    await connectToMongo();
    const notes = await Note.find().sort({ createdAt: -1 });
    return {
      statusCode: 200,
      body: JSON.stringify(notes),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch notes', details: err.message }),
    };
  }
};
