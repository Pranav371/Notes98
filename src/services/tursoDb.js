import { createClient } from '@libsql/client';
import tursoConfig from '../config/tursoConfig';

// Initialize Turso client with your database URL and auth token from config
const client = createClient({
  url: tursoConfig.dbUrl,
  authToken: tursoConfig.authToken,
});

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Create subjects table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT
      )
    `);

    // Create notes table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
      )
    `);

    // Create tags table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Create note_tags join table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS note_tags (
        note_id TEXT NOT NULL,
        tag_name TEXT NOT NULL,
        PRIMARY KEY (note_id, tag_name),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
      )
    `);

    console.log('Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database schema:', error);
    return false;
  }
}

// Subject operations
export async function getAllSubjects() {
  try {
    const result = await client.execute('SELECT * FROM subjects');
    return result.rows;
  } catch (error) {
    console.error('Error getting subjects:', error);
    return [];
  }
}

export async function addSubject(subject) {
  try {
    await client.execute({
      sql: 'INSERT INTO subjects (id, name, color, icon) VALUES (?, ?, ?, ?)',
      args: [subject.id, subject.name, subject.color, subject.icon]
    });
    return subject.id;
  } catch (error) {
    console.error('Error adding subject:', error);
    return null;
  }
}

export async function updateSubject(id, updates) {
  try {
    const setClause = Object.entries(updates)
      .map(([key, _]) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`)
      .join(', ');
    
    const values = Object.values(updates);

    await client.execute({
      sql: `UPDATE subjects SET ${setClause} WHERE id = ?`,
      args: [...values, id]
    });
    return true;
  } catch (error) {
    console.error('Error updating subject:', error);
    return false;
  }
}

export async function deleteSubject(id) {
  try {
    // Notes will be deleted automatically due to CASCADE constraint
    await client.execute({
      sql: 'DELETE FROM subjects WHERE id = ?',
      args: [id]
    });
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    return false;
  }
}

// Helper function to log and ensure proper date formatting
function ensureDateFormat(dateValue, fieldName, noteId) {
  if (!dateValue) {
    console.error(`Missing ${fieldName} for note ${noteId}`);
    return new Date().toISOString(); // Fallback to current date
  }
  
  try {
    // Validate that this is a valid date
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      console.error(`Invalid ${fieldName} format for note ${noteId}: ${dateValue}`);
      return new Date().toISOString(); // Fallback to current date
    }
    return dateValue;
  } catch (err) {
    console.error(`Error parsing ${fieldName} for note ${noteId}:`, err);
    return new Date().toISOString(); // Fallback to current date
  }
}

// Note operations
export async function getNotesForSubject(subjectId) {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM notes WHERE subject_id = ?',
      args: [subjectId]
    });
    
    // Get tags for each note
    const notes = await Promise.all(result.rows.map(async (note) => {
      const tags = await getTagsForNote(note.id);
      return { 
        ...note, 
        tags,
        subjectId: note.subject_id,
        createdAt: ensureDateFormat(note.created_at, 'created_at', note.id),
        updatedAt: ensureDateFormat(note.updated_at, 'updated_at', note.id)
      };
    }));
    
    return notes;
  } catch (error) {
    console.error('Error getting notes for subject:', error);
    return [];
  }
}

export async function getAllNotes() {
  try {
    const result = await client.execute(`
      SELECT n.*, s.name as subject_name, s.color as subject_color
      FROM notes n
      JOIN subjects s ON n.subject_id = s.id
      ORDER BY n.updated_at DESC
    `);
    
    // Get tags for each note
    const notes = await Promise.all(result.rows.map(async (note) => {
      const tags = await getTagsForNote(note.id);
      return { 
        ...note, 
        tags,
        subjectId: note.subject_id,
        subjectName: note.subject_name,
        subjectColor: note.subject_color,
        createdAt: ensureDateFormat(note.created_at, 'created_at', note.id),
        updatedAt: ensureDateFormat(note.updated_at, 'updated_at', note.id)
      };
    }));
    
    return notes;
  } catch (error) {
    console.error('Error getting all notes:', error);
    return [];
  }
}

export async function getNoteById(noteId) {
  try {
    const result = await client.execute({
      sql: `
        SELECT n.*, s.id as subject_id, s.name as subject_name, s.color as subject_color 
        FROM notes n
        JOIN subjects s ON n.subject_id = s.id
        WHERE n.id = ?
      `,
      args: [noteId]
    });
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const note = result.rows[0];
    
    // Get tags for the note
    const tags = await getTagsForNote(noteId);
    
    return { 
      ...note, 
      tags,
      subjectId: note.subject_id,
      subjectName: note.subject_name,
      subjectColor: note.subject_color,
      createdAt: ensureDateFormat(note.created_at, 'created_at', note.id),
      updatedAt: ensureDateFormat(note.updated_at, 'updated_at', note.id)
    };
  } catch (error) {
    console.error('Error getting note by ID:', error);
    return null;
  }
}

export async function addNote(note) {
  try {
    // Insert note
    await client.execute({
      sql: 'INSERT INTO notes (id, subject_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [
        note.id,
        note.subjectId,
        note.title,
        note.content,
        note.createdAt,
        note.updatedAt
      ]
    });
    
    // Add tags
    if (note.tags && note.tags.length > 0) {
      await addTagsToNote(note.id, note.tags);
    }
    
    return note.id;
  } catch (error) {
    console.error('Error adding note:', error);
    return null;
  }
}

export async function updateNote(subjectId, noteId, updates) {
  try {
    // Begin transaction
    await client.execute('BEGIN');

    // Update note itself
    const fields = [];
    const values = [];
    
    if (updates.title) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    
    if (updates.content) {
      fields.push('content = ?');
      values.push(updates.content);
    }
    
    // Always update timestamp
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    if (fields.length > 0) {
      await client.execute({
        sql: `UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND subject_id = ?`,
        args: [...values, noteId, subjectId]
      });
    }
    
    // Update tags if provided
    if (updates.tags) {
      // Clear existing tags
      await client.execute({
        sql: 'DELETE FROM note_tags WHERE note_id = ?',
        args: [noteId]
      });
      
      // Add new tags
      await addTagsToNote(noteId, updates.tags);
    }
    
    // Commit transaction
    await client.execute('COMMIT');
    return true;
  } catch (error) {
    // Rollback transaction
    await client.execute('ROLLBACK');
    console.error('Error updating note:', error);
    return false;
  }
}

export async function deleteNote(subjectId, noteId) {
  try {
    await client.execute({
      sql: 'DELETE FROM notes WHERE id = ? AND subject_id = ?',
      args: [noteId, subjectId]
    });
    
    // note_tags entries will be removed automatically due to CASCADE
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
}

// Tag operations
async function getTagsForNote(noteId) {
  try {
    const result = await client.execute({
      sql: 'SELECT tag_name FROM note_tags WHERE note_id = ?',
      args: [noteId]
    });
    
    return result.rows.map(row => row.tag_name);
  } catch (error) {
    console.error('Error getting tags for note:', error);
    return [];
  }
}

async function addTagsToNote(noteId, tags) {
  try {
    for (const tag of tags) {
      await client.execute({
        sql: 'INSERT OR IGNORE INTO note_tags (note_id, tag_name) VALUES (?, ?)',
        args: [noteId, tag]
      });
    }
    return true;
  } catch (error) {
    console.error('Error adding tags to note:', error);
    return false;
  }
}

export async function searchNotes(query) {
  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const result = await client.execute({
      sql: `
        SELECT n.*, s.id as subject_id, s.name as subject_name, s.color as subject_color 
        FROM notes n
        JOIN subjects s ON n.subject_id = s.id
        WHERE 
          LOWER(n.title) LIKE ? OR 
          LOWER(n.content) LIKE ? OR
          n.id IN (
            SELECT note_id FROM note_tags 
            WHERE LOWER(tag_name) LIKE ?
          )
        ORDER BY n.updated_at DESC
      `,
      args: [searchTerm, searchTerm, searchTerm]
    });
    
    // Get tags for each note
    const notes = await Promise.all(result.rows.map(async (note) => {
      const tags = await getTagsForNote(note.id);
      return { 
        ...note, 
        tags,
        subjectId: note.subject_id,
        subjectName: note.subject_name,
        subjectColor: note.subject_color,
        createdAt: ensureDateFormat(note.created_at, 'created_at', note.id),
        updatedAt: ensureDateFormat(note.updated_at, 'updated_at', note.id)
      };
    }));
    
    return notes;
  } catch (error) {
    console.error('Error searching notes:', error);
    return [];
  }
} 