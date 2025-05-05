import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiTag, FiCalendar, FiArrowLeft, FiShare2, FiX, FiChevronLeft, FiLoader } from 'react-icons/fi';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useNotes } from '../context/NotesContext';
import NoteEditor from '../components/notes/NoteEditor';
import Modal from '../components/ui/Modal';

const NoteViewContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const SubjectLink = styled(Link)`
  color: ${props => props.color || 'var(--primary-color)'};
  text-decoration: none;
  margin-left: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NoteHeader = styled.div`
  margin-bottom: 2rem;
`;

const NoteActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Tag = styled.span`
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-secondary);
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  
  &:hover {
    border-color: ${props => props.variant === 'delete' ? 'var(--error)' : 'var(--primary-color)'};
    color: ${props => props.variant === 'delete' ? 'var(--error)' : 'var(--primary-color)'};
    background-color: ${props => props.variant === 'delete' ? 'rgba(176, 0, 32, 0.05)' : 'rgba(98, 0, 234, 0.05)'};
  }
  
  &.edit {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    
    &:hover {
      background-color: var(--primary-light);
      border-color: var(--primary-light);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const NoteContent = styled.article`
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-primary);
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
  }
  
  h1 {
    font-size: 1.8rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: 1.25rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  ul, ol {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  blockquote {
    border-left: 4px solid var(--primary-color);
    padding-left: 1rem;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
    color: var(--text-secondary);
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.9rem;
  }
  
  pre {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 1rem;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    
    th, td {
      border: 1px solid var(--border);
      padding: 0.5rem;
    }
    
    th {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1rem 0;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background-color: var(--surface);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  width: 400px;
  max-width: 90%;
  padding: 1.5rem;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-primary);
  }
  
  button {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.25rem;
    cursor: pointer;
    transition: color 0.2s ease;
    
    &:hover {
      color: var(--error);
    }
  }
`;

const ModalText = styled.p`
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const ModalButton = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &.cancel {
    background-color: transparent;
    border: 1px solid var(--border);
    color: var(--text-primary);
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  &.delete {
    background-color: var(--error);
    border: none;
    color: white;
    
    &:hover {
      background-color: #d32f2f;
    }
  }
`;

const ShareLinkContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  input {
    flex: 1;
    padding: 0.6rem 1rem;
    border: 1px solid var(--border);
    border-radius: 4px 0 0 4px;
    font-size: 0.9rem;
    outline: none;
  }
  
  button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    padding: 0 1rem;
    cursor: pointer;
    
    &:hover {
      background-color: var(--primary-light);
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  
  svg {
    animation: spin 1s linear infinite;
    color: var(--primary-color);
    font-size: 2rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: var(--error-bg);
  color: var(--error-text);
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const SubjectIndicator = styled.span`
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  background-color: ${props => props.backgroundColor || 'var(--primary-color)'};
  color: white;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const NoteTitle = styled.h1`
  font-size: 2.25rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
`;

const NoteMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CancelButton = styled.button`
  background-color: transparent;
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 0.6rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const DeleteButton = styled.button`
  background-color: var(--error);
  border: none;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const ShareLink = styled.div`
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--text-primary);
  background-color: var(--surface);
`;

const CopyButton = styled.button`
  background-color: var(--primary-color);
  border: none;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: var(--primary-light);
  }
`;

const NoteView = () => {
  const { noteId } = useParams();
  const { findNoteById, deleteNote, updateNote } = useNotes();
  const [note, setNote] = useState(null);
  const [contentHtml, setContentHtml] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const foundNote = await findNoteById(noteId);
        
        if (foundNote) {
          setNote(foundNote);
          
          // Convert markdown to HTML
          const html = marked(foundNote.content);
          const sanitizedHtml = DOMPurify.sanitize(html);
          setContentHtml(sanitizedHtml);
        } else {
          // Note not found, redirect to home
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to load note data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNote();
  }, [noteId, findNoteById, navigate]);
  
  const handleDelete = async () => {
    try {
      const success = await deleteNote(note.subjectId, note.id);
      if (success) {
        navigate(`/subject/${note.subjectId}`);
      } else {
        setError('Failed to delete note');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    }
  };
  
  const handleSaveEdit = async (subjectId, updatedNote) => {
    try {
      const success = await updateNote(subjectId, note.id, updatedNote);
      
      if (success) {
        setIsEditing(false);
        
        // Refetch the note to update the view
        const updatedNoteData = await findNoteById(note.id);
        if (updatedNoteData) {
          setNote(updatedNoteData);
          
          // Convert markdown to HTML
          const html = marked(updatedNoteData.content);
          const sanitizedHtml = DOMPurify.sanitize(html);
          setContentHtml(sanitizedHtml);
        }
      } else {
        setError('Failed to update note');
      }
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const formatDate = (dateString) => {
    try {
      // Handle case when dateString may be undefined or invalid
      if (!dateString) return 'Unknown date';
      
      // First ensure we're working with a valid date string
      // This handles ISO strings like 2025-05-05T06:33:21.676Z
      const date = new Date(dateString);
      
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Error formatting date';
    }
  };
  
  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
    setIsShareModalOpen(false);
  };
  
  if (loading) {
    return (
      <NoteViewContainer>
        <LoadingSpinner>
          <FiLoader />
        </LoadingSpinner>
      </NoteViewContainer>
    );
  }
  
  if (error) {
    return (
      <NoteViewContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <BackLink to="/">
          <FiChevronLeft />
          <span>Back to Home</span>
        </BackLink>
      </NoteViewContainer>
    );
  }
  
  if (!note) {
    return (
      <NoteViewContainer>
        <ErrorMessage>Note not found</ErrorMessage>
        <BackLink to="/">
          <FiChevronLeft />
          <span>Back to Home</span>
        </BackLink>
      </NoteViewContainer>
    );
  }
  
  if (isEditing) {
    return (
      <NoteViewContainer>
        <NoteEditor
          initialNote={note}
          subjectId={note.subjectId}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      </NoteViewContainer>
    );
  }
  
  return (
    <NoteViewContainer>
      <BreadcrumbNav>
        <BackButton to={`/subject/${note.subjectId}`}>
          <FiArrowLeft />
          <span>Back to</span>
        </BackButton>
        <SubjectLink 
          to={`/subject/${note.subjectId}`}
          color={note.subjectColor}
        >
          {note.subjectName}
        </SubjectLink>
      </BreadcrumbNav>
      
      <NoteHeader>
        <NoteActions>
          <ButtonGroup>
            <ActionButton 
              onClick={() => setIsShareModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiShare2 />
              <span>Share</span>
            </ActionButton>
            <ActionButton 
              variant="delete"
              onClick={() => setIsDeleteModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiTrash2 />
              <span>Delete</span>
            </ActionButton>
          </ButtonGroup>
          
          <ActionButton 
            className="edit"
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiEdit />
            <span>Edit Note</span>
          </ActionButton>
        </NoteActions>
        
        <Title>{note.title}</Title>
        
        <MetaInfo>
          <MetaItem>
            <FiCalendar />
            <span>Last updated: {formatDate(note.updatedAt)}</span>
          </MetaItem>
        </MetaInfo>
        
        {note.tags && note.tags.length > 0 && (
          <TagsContainer>
            {note.tags.map((tag, index) => (
              <Tag key={index}>
                <FiTag />
                {tag}
              </Tag>
            ))}
          </TagsContainer>
        )}
      </NoteHeader>
      
      <NoteContent dangerouslySetInnerHTML={{ __html: contentHtml }} />
      
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Delete Note"
      >
        <ModalContent>
          <p>Are you sure you want to delete "{note.title}"?</p>
          <p>This action cannot be undone.</p>
          <ModalActions>
            <CancelButton onClick={() => setIsDeleteModalOpen(false)}>Cancel</CancelButton>
            <DeleteButton onClick={handleDelete}>Delete</DeleteButton>
          </ModalActions>
        </ModalContent>
      </Modal>
      
      <Modal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        title="Share Note"
      >
        <ModalContent>
          <p>Share this link to your note:</p>
          <ShareLink>{window.location.href}</ShareLink>
          <ModalActions>
            <CopyButton onClick={copyShareLink}>Copy Link</CopyButton>
          </ModalActions>
        </ModalContent>
      </Modal>
    </NoteViewContainer>
  );
};

export default NoteView; 