import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase-config'; 
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Notes.css';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [history, setHistory] = useState([]);
  const [viewingHistoryNoteId, setViewingHistoryNoteId] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const notesCollection = collection(db, 'notes');
    const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
      const notesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotes(notesList);
    });

    return () => unsubscribe();
  }, []);

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
      <div style={{ marginBottom: '20px' }}></div> {/* Space between header and button */}
      <button onClick={() => navigate('/note-form')} className="add-note-button">
        Add New Note
      </button>
      <h2>Notes</h2>
      <label htmlFor="filterCategory" className="label-filter">Filter by category:</label>
      <select id="filterCategory" value={filterCategory} onChange={handleFilterChange} className="select-filter">
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
            <button onClick={() => navigate(`/note-form/${note.id}`)}>Edit</button>
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
