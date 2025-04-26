"use client";
import React, { useEffect, useState } from "react";

interface Note {
  _id: string;
  text: string;
  createdAt: string;
}

const API_URL = typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : "http://localhost:4000";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/api/notes`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      setText("");
      await fetchNotes();
    } catch (err) {
      setError("Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Notes</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a note..."
          style={{ flex: 1, padding: 8, fontSize: 16 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !text.trim()} style={{ padding: "8px 16px", fontSize: 16 }}>
          Add
        </button>
      </form>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      {loading && <div>Loading...</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {notes.map(note => (
          <li key={note._id} style={{ background: "#f6f6f6", marginBottom: 8, padding: 12, borderRadius: 6 }}>
            <div>{note.text}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{new Date(note.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
