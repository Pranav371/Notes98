import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlus, FiClock, FiBookOpen, FiLoader } from 'react-icons/fi';
import { useNotes } from '../context/NotesContext';
import NoteCard from '../components/notes/NoteCard';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
`;

const CreateButton = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  box-shadow: 0 4px 6px rgba(98, 0, 234, 0.2);
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--primary-light);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--primary-color);
  }
`;

const ViewAllLink = styled(Link)`
  font-size: 0.9rem;
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: var(--surface);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow);
  
  h3 {
    color: var(--text-primary);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.3,
      when: "beforeChildren"
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const Home = () => {
  const { getAllNotes, subjects, loading, error } = useNotes();
  const [recentNotes, setRecentNotes] = useState([]);
  const [isNotesLoading, setIsNotesLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsNotesLoading(true);
        const notes = await getAllNotes();
        setRecentNotes(notes);
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setIsNotesLoading(false);
      }
    };
    
    fetchNotes();
  }, [getAllNotes]);
  
  if (loading) {
    return (
      <HomeContainer>
        <LoadingSpinner>
          <FiLoader />
        </LoadingSpinner>
      </HomeContainer>
    );
  }
  
  if (error) {
    return (
      <HomeContainer>
        <ErrorMessage>{error}</ErrorMessage>
        <EmptyState>
          <h3>Could not load your notes</h3>
          <p>There was a problem connecting to the database. Please check your connection and try again.</p>
        </EmptyState>
      </HomeContainer>
    );
  }
  
  return (
    <HomeContainer>
      <WelcomeSection>
        <Title>Welcome to Study Notes</Title>
        <Subtitle>Organize and access your learning materials all in one place</Subtitle>
        <CreateButton 
          to="/create"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus />
          <span>Create New Note</span>
        </CreateButton>
      </WelcomeSection>
      
      {isNotesLoading ? (
        <LoadingSpinner>
          <FiLoader />
        </LoadingSpinner>
      ) : recentNotes.length > 0 ? (
        <>
          <SectionHeader>
            <SectionTitle>
              <FiClock />
              <span>Recent Notes</span>
            </SectionTitle>
          </SectionHeader>
          
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.1 }}
          >
            <NotesGrid>
              {recentNotes.slice(0, 12).map(note => (
                <motion.div 
                  key={note.id} 
                  variants={item}
                  initial="hidden"
                  animate="show"
                >
                  <NoteCard note={note} showSubject={true} />
                </motion.div>
              ))}
            </NotesGrid>
          </motion.div>
        </>
      ) : (
        <EmptyState>
          <h3>No Notes Yet</h3>
          <p>Get started by creating your first note!</p>
          <CreateButton 
            to="/create"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus />
            <span>Create New Note</span>
          </CreateButton>
        </EmptyState>
      )}
    </HomeContainer>
  );
};

export default Home; 