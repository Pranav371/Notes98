import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useNotes } from '../context/NotesContext';
import NoteEditor from '../components/notes/NoteEditor';

const CreateNoteContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
`;

const CreateNote = () => {
  const { subjectId } = useParams();
  const { addNote } = useNotes();
  const navigate = useNavigate();
  
  const handleSave = (selectedSubjectId, noteData) => {
    const newNoteId = addNote(selectedSubjectId, noteData);
    navigate(`/note/${newNoteId}`);
  };
  
  const handleCancel = () => {
    // If we came from a subject page, go back to that subject
    if (subjectId) {
      navigate(`/subject/${subjectId}`);
    } else {
      // Otherwise go to home
      navigate('/');
    }
  };
  
  return (
    <CreateNoteContainer>
      <PageTitle>Create New Note</PageTitle>
      <NoteEditor
        subjectId={subjectId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </CreateNoteContainer>
  );
};

export default CreateNote; 