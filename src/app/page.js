"use client";
import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabaseClient";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("My"); // Initialize with "My" as a default or loading state
  const [deletingId, setDeletingId] = useState(null); // New state for tracking deleting note
  const [editingNoteId, setEditingNoteId] = useState(null); // New state to track the note being edited
  const [currentTitle, setCurrentTitle] = useState(""); // New state for editing title
  const [currentContent, setCurrentContent] = useState(""); // New state for editing content
  const [updatingNote, setUpdatingNote] = useState(false); // New state for updating note

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setMessage("⚠️ Please log in.");
      setUserId(user.id);

      // Try to get username from user_metadata first
      let fetchedUsername = "My"; // Default
      if (user.user_metadata && user.user_metadata.username) {
        fetchedUsername = user.user_metadata.username;
        console.log("Username from user_metadata:", fetchedUsername);
      } else {
        console.log(
          "Username not in user_metadata, attempting to fetch from 'users' table."
        );
        // Fallback: fetch from the 'users' table
        const { data: userData, error: userFetchError } = await supabase
          .from("users")
          .select("username")
          .eq("user_id", user.id)
          .single();

        if (userFetchError) {
          console.error(
            "Error fetching username from users table:",
            userFetchError
          );
        } else if (userData) {
          fetchedUsername = userData.username;
          console.log("Username from 'users' table:", fetchedUsername);
        } else {
          console.log("No username found in 'users' table for this user ID.");
        }
      }
      setUsername(fetchedUsername);
      console.log("Final username set:", fetchedUsername);

      fetchNotes(user.id);
    })();
  }, []);

  async function fetchNotes(uid) {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    if (error) return setMessage("❌ Fetch error");
    setNotes(data);
  }

  async function addNote() {
    // If editing a note, call update instead of insert
    if (editingNoteId) {
      handleUpdateNote();
      return;
    }

    // Validation for adding a new note
    if (!title || !content) {
      setMessage("⚠️ Fill all fields");
      return;
    }

    const { error } = await supabase
      .from("notes")
      .insert([{ title, content, user_id: userId }]);
    if (error) return setMessage("❌ Add failed");
    setMessage("✅ Note added!");
    setTitle("");
    setContent("");
    fetchNotes(userId);
  }

  async function handleDeleteNote(noteId) {
    setDeletingId(noteId);
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);
      if (error) {
        console.error("Delete error:", error);
        setMessage("❌ Failed to delete note.");
      } else {
        setMessage("✅ Note deleted!");
        fetchNotes(userId); // Refresh the notes list
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleUpdateNote() {
    console.log("Attempting update with:", { currentTitle, currentContent });
    if (!currentTitle || !currentContent) {
      setMessage("⚠️ Title and content are required.");
      return;
    }
    setUpdatingNote(true);
    try {
      const { error } = await supabase
        .from("notes")
        .update({ title: currentTitle, content: currentContent })
        .eq("id", editingNoteId);

      if (error) {
        console.error("Update error:", error);
        setMessage("❌ Failed to update note.");
      } else {
        setMessage("✅ Note updated successfully!");
        setEditingNoteId(null);
        setCurrentTitle("");
        setCurrentContent("");
        fetchNotes(userId);
      }
    } finally {
      setUpdatingNote(false);
    }
  }

  function handleEditClick(note) {
    setEditingNoteId(note.id);
    setCurrentTitle(note.title);
    setCurrentContent(note.content);
    setMessage(""); // Clear any previous messages
  }

  function handleCancelEdit() {
    setEditingNoteId(null);
    setCurrentTitle("");
    setCurrentContent("");
    setTitle(""); // Also clear the main input fields
    setContent("");
    setMessage("");
  }

  return (
    <div className="p-6 space-y-4">
      <h1>📝Notes</h1>
      <div className="relative">
        <Input
          placeholder="Title"
          value={editingNoteId ? currentTitle : title}
          onChange={(e) => {
            editingNoteId
              ? setCurrentTitle(e.target.value)
              : setTitle(e.target.value);
            setMessage("");
          }}
        />
      </div>
      <div className="relative">
        <Textarea
          placeholder="Content"
          value={editingNoteId ? currentContent : content}
          onChange={(e) => {
            editingNoteId
              ? setCurrentContent(e.target.value)
              : setContent(e.target.value);
            setMessage("");
          }}
        />
      </div>
      <Button onClick={addNote} disabled={updatingNote}>
        {updatingNote ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">🔄</span> Updating...
          </span>
        ) : editingNoteId ? (
          "Update Note"
        ) : (
          "Add Note"
        )}
      </Button>
      {editingNoteId && (
        <Button variant="outline" onClick={handleCancelEdit} className="ml-2">
          Cancel
        </Button>
      )}
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <hr />
      {notes.length ? (
        notes.map((n) => (
          <div
            key={n.id}
            className="border p-4 rounded-md shadow-sm flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold text-lg">{n.title}</h2>
              <p className="text-sm text-muted-foreground">{n.content}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(n)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteNote(n.id)}
                disabled={deletingId === n.id}
              >
                {deletingId === n.id ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin">🗑️</span> Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm">No notes yet.</p>
      )}
    </div>
  );
}
