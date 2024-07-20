import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, getDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from './firebase-config';
import './NoteForm.css';

function NoteForm() {
  const { noteId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (noteId) {
      const fetchNote = async () => {
        const noteDoc = await getDoc(doc(db, 'notes', noteId));
        if (noteDoc.exists()) {
          const note = noteDoc.data();
          setTitle(note.title);
          setContent(note.content);
          setCategory(note.category);
        }
      };
      fetchNote();
    }
  }, [noteId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const newNote = { title, content, category, userId: user.uid, updated: Timestamp.now() };
    try {
      if (noteId) {
        const noteRef = doc(db, 'notes', noteId);
        // Save the current state to the history subcollection before updating
        const currentNoteSnapshot = await getDoc(noteRef);
        if (currentNoteSnapshot.exists()) {
          const currentNoteData = currentNoteSnapshot.data();
          const historyRef = collection(noteRef, 'history');
          await addDoc(historyRef, { ...currentNoteData, saved: Timestamp.now() });
        }
        await updateDoc(noteRef, newNote);
      } else {
        await addDoc(collection(db, 'notes'), newNote);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving note: ', error);
    }
  };

  return (
    <div>
      <h2>{noteId ? 'Edit Note' : 'Create a New Note'}</h2>
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
        <label htmlFor="category" className="label-category">Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select-category"
          required
        >
          <option value="">Select a category</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="other">Other</option>
        </select>
        <button type="submit">{noteId ? 'Update Note' : 'Add Note'}</button>
      </form>
      <button onClick={() => navigate('/')} className="back-button">Back to Notes</button>
    </div>
  );
}

export default NoteForm;
