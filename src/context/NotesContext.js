import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as tursoDb from '../services/tursoDb';

const NotesContext = createContext();

// Custom hook to use notes context
export const useNotes = () => useContext(NotesContext);

export const NotesProvider = ({ children }) => {
  // Initial data structure with some example subjects and notes
  const initialSubjects = [
    {
      id: 'subject-1',
      name: 'Mathematics',
      color: '#ff5722',
      icon: 'calculator',
      notes: [
        {
          id: 'note-1',
          title: 'Calculus Fundamentals',
          content: '# Calculus Fundamentals\n\n## Derivatives\nA derivative measures the rate at which a function is changing.\n\n## Integrals\nIntegration is the inverse of differentiation.',
          tags: ['calculus', 'math'],
          createdAt: new Date('2023-01-15').toISOString(),
          updatedAt: new Date('2023-01-15').toISOString(),
        },
        {
          id: 'note-2',
          title: 'Linear Algebra Basics',
          content: '# Linear Algebra\n\n## Vectors\nVectors are quantities that have both magnitude and direction.\n\n## Matrices\nMatrices are rectangular arrays of numbers arranged in rows and columns.',
          tags: ['linear algebra', 'math'],
          createdAt: new Date('2023-02-10').toISOString(),
          updatedAt: new Date('2023-02-15').toISOString(),
        }
      ]
    },
    {
      id: 'subject-2',
      name: 'Computer Science',
      color: '#2196f3',
      icon: 'computer',
      notes: [
        {
          id: 'note-3',
          title: 'Data Structures',
          content: '# Data Structures\n\n## Arrays\nArrays store elements in contiguous memory locations.\n\n## Linked Lists\nLinked lists consist of nodes where each node contains data and a reference to the next node.',
          tags: ['data structures', 'computer science'],
          createdAt: new Date('2023-03-05').toISOString(),
          updatedAt: new Date('2023-03-05').toISOString(),
        }
      ]
    }
  ];

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize database and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Initialize database schema
        await tursoDb.initializeDatabase();
        
        // Load subjects from database
        const loadedSubjects = await tursoDb.getAllSubjects();
        
        // If no subjects exist, seed with initial data
        if (loadedSubjects.length === 0) {
          // Add initial subjects and notes
          for (const subject of initialSubjects) {
            const subjectCopy = { ...subject };
            const notes = [...subject.notes];
            delete subjectCopy.notes;
            
            // Add subject
            await tursoDb.addSubject(subjectCopy);
            
            // Add notes for this subject
            for (const note of notes) {
              await tursoDb.addNote({
                ...note,
                subjectId: subject.id
              });
            }
          }
          
          // Reload subjects
          const seededSubjects = await tursoDb.getAllSubjects();
          
          // Load notes for each subject
          const subjectsWithNotes = await Promise.all(seededSubjects.map(async subject => {
            const notes = await tursoDb.getNotesForSubject(subject.id);
            return {
              ...subject,
              notes: notes || []
            };
          }));
          
          setSubjects(subjectsWithNotes);
        } else {
          // Load notes for each subject
          const subjectsWithNotes = await Promise.all(loadedSubjects.map(async subject => {
            const notes = await tursoDb.getNotesForSubject(subject.id);
            return {
              ...subject,
              notes: notes || []
            };
          }));
          
          setSubjects(subjectsWithNotes);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to initialize database. Please try again later.');
        setLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // Add a new subject
  const addSubject = async (subject) => {
    try {
      const newSubject = {
        ...subject,
        id: `subject-${uuidv4()}`,
        notes: [], // Initialize with empty notes array
      };
      
      const subjectId = await tursoDb.addSubject(newSubject);
      
      if (subjectId) {
        // Update local state
        setSubjects(prevSubjects => [...prevSubjects, newSubject]);
        return subjectId;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding subject:', error);
      return null;
    }
  };

  // Update an existing subject
  const updateSubject = async (id, updates) => {
    try {
      const success = await tursoDb.updateSubject(id, updates);
      
      if (success) {
        // Update local state
        setSubjects(prevSubjects =>
          prevSubjects.map(subject => 
            subject.id === id ? { ...subject, ...updates } : subject
          )
        );
      }
      
      return success;
    } catch (error) {
      console.error('Error updating subject:', error);
      return false;
    }
  };

  // Delete a subject and all its notes
  const deleteSubject = async (id) => {
    try {
      const success = await tursoDb.deleteSubject(id);
      
      if (success) {
        // Update local state
        setSubjects(prevSubjects => prevSubjects.filter(subject => subject.id !== id));
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting subject:', error);
      return false;
    }
  };

  // Add a new note to a subject
  const addNote = async (subjectId, note) => {
    try {
      const newNote = {
        ...note,
        id: `note-${uuidv4()}`,
        subjectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const noteId = await tursoDb.addNote(newNote);
      
      if (noteId) {
        // Update local state
        setSubjects(prevSubjects => 
          prevSubjects.map(subject => {
            if (subject.id === subjectId) {
              return {
                ...subject,
                notes: [...subject.notes, newNote]
              };
            }
            return subject;
          })
        );
      }
      
      return noteId;
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  };

  // Update an existing note
  const updateNote = async (subjectId, noteId, updates) => {
    try {
      const success = await tursoDb.updateNote(subjectId, noteId, updates);
      
      if (success) {
        // Update local state
        setSubjects(prevSubjects => 
          prevSubjects.map(subject => {
            if (subject.id === subjectId) {
              return {
                ...subject,
                notes: subject.notes.map(note => 
                  note.id === noteId ? 
                  { 
                    ...note, 
                    ...updates, 
                    updatedAt: new Date().toISOString() 
                  } : note
                )
              };
            }
            return subject;
          })
        );
      }
      
      return success;
    } catch (error) {
      console.error('Error updating note:', error);
      return false;
    }
  };

  // Delete a note
  const deleteNote = async (subjectId, noteId) => {
    try {
      const success = await tursoDb.deleteNote(subjectId, noteId);
      
      if (success) {
        // Update local state
        setSubjects(prevSubjects => 
          prevSubjects.map(subject => {
            if (subject.id === subjectId) {
              return {
                ...subject,
                notes: subject.notes.filter(note => note.id !== noteId)
              };
            }
            return subject;
          })
        );
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  };

  // Get all notes across all subjects
  const getAllNotes = async () => {
    try {
      const notes = await tursoDb.getAllNotes();
      return notes;
    } catch (error) {
      console.error('Error getting all notes:', error);
      return [];
    }
  };

  // Search notes by query
  const searchNotes = async (query) => {
    if (!query.trim()) return [];
    
    try {
      const results = await tursoDb.searchNotes(query);
      return results;
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  };

  // Find a note by ID
  const findNoteById = async (noteId) => {
    try {
      const note = await tursoDb.getNoteById(noteId);
      return note;
    } catch (error) {
      console.error('Error finding note by ID:', error);
      return null;
    }
  };

  // Find a subject by ID
  const findSubjectById = async (subjectId) => {
    try {
      const subject = subjects.find(subject => subject.id === subjectId);
      
      // If subject is found, fetch its notes from the database
      if (subject) {
        // Get notes for this subject from the database
        const notes = await tursoDb.getNotesForSubject(subjectId);
        
        return {
          ...subject,
          notes: notes || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding subject by ID:', error);
      return null;
    }
  };

  const value = {
    subjects,
    loading,
    error,
    addSubject,
    updateSubject,
    deleteSubject,
    addNote,
    updateNote,
    deleteNote,
    getAllNotes,
    searchNotes,
    findNoteById,
    findSubjectById
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

export default NotesContext; 