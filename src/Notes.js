// src/Notes.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, Timestamp, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config'; // Ensure auth is imported
import { signOut } from 'firebase/auth';
import './Notes.css';

function Notes() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState([]);
  const [editNoteId, setEditNoteId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [history, setHistory] = useState([]);
  const [viewingHistoryNoteId, setViewingHistoryNoteId] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    const notesCollection = collection(db, 'notes');
    const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
      const notesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesList);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newNote = { title, content, category, userId: user.uid, updated: Timestamp.now() };
    if (editNoteId) {
      const noteRef = doc(db, 'notes', editNoteId);
      
      // Save the current state to the history subcollection before updating
      const currentNoteSnapshot = await getDoc(noteRef);
      if (currentNoteSnapshot.exists()) {
        const currentNoteData = currentNoteSnapshot.data();
        const historyRef = collection(noteRef, 'history');
        await addDoc(historyRef, { ...currentNoteData, saved: Timestamp.now() });
      }
      
      await updateDoc(noteRef, newNote);
      setEditNoteId(null);
    } else {
      await addDoc(collection(db, 'notes'), newNote);
    }
    setTitle('');
    setContent('');
    setCategory('');
  };

  const handleEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setEditNoteId(note.id);
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      console.error('Error deleting note: ', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleViewHistory = async (noteId) => {
    if (viewingHistoryNoteId === noteId) {
      setViewingHistoryNoteId(null);
      setHistory([]);
      return;
    }
    setViewingHistoryNoteId(noteId);
    const noteRef = doc(db, 'notes', noteId);
    const historyRef = collection(noteRef, 'history');
    const historySnapshot = await getDocs(historyRef);
    const historyList = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHistory(historyList);
  };

  const handleRevert = async (noteId, version) => {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, version);
    setEditNoteId(null);
    setViewingHistoryNoteId(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to the login page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const filteredNotes = filterCategory
    ? notes.filter(note => note.category === filterCategory)
    : notes;

  return (
    <div className="notes-container">
      <header className="header">
        <div className="welcome-message">
          <span>Welcome back, {user.email}!</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <h2>{editNoteId ? 'Edit Note' : 'Create a New Note'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="other">Other</option>
        </select>
        <button type="submit">{editNoteId ? 'Update Note' : 'Add Note'}</button>
      </form>
      <h2>Notes</h2>
      <label htmlFor="filterCategory">Filter by category:</label>
      <select id="filterCategory" value={filterCategory} onChange={handleFilterChange}>
        <option value="">All</option>
        <option value="work">Work</option>
        <option value="personal">Personal</option>
        <option value="other">Other</option>
      </select>
      <ul className="notes-list">
        {filteredNotes.map(note => (
          <li key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <p><strong>Category:</strong> {note.category}</p>
            <button onClick={() => handleEdit(note)}>Edit</button>
            {note.userId === user.uid && (
              <button onClick={() => handleDelete(note.id)}>Delete</button>
            )}
            <button onClick={() => handleViewHistory(note.id)}>
              {viewingHistoryNoteId === note.id ? 'Hide History' : 'View History'}
            </button>
            {viewingHistoryNoteId === note.id && (
              <div className="history">
                <h4>Note History</h4>
                <ul>
                  {history.map((version, index) => (
                    <li key={index}>
                      <p><strong>Saved:</strong> {version.saved.toDate().toString()}</p>
                      <p><strong>Title:</strong> {version.title}</p>
                      <p><strong>Content:</strong> {version.content}</p>
                      <p><strong>Category:</strong> {version.category}</p>
                      <button onClick={() => handleRevert(note.id, version)}>Revert to this version</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Notes;
