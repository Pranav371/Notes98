import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlus, FiFilter, FiChevronDown, FiChevronUp, FiX, FiLoader } from 'react-icons/fi';
import { useNotes } from '../context/NotesContext';
import NoteCard from '../components/notes/NoteCard';

const SubjectContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SubjectHeader = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
  color: ${props => props.color || 'var(--text-primary)'};
`;

const CreateButton = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: filter 0.2s ease;
  
  &:hover {
    filter: brightness(1.1);
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  
  .value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
`;

const FilterControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  width: 300px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(98, 0, 234, 0.1);
  }
`;

const ControlGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
  position: relative;
  
  &:hover {
    border-color: var(--primary-color);
  }
  
  &.active {
    border-color: var(--primary-color);
    background-color: rgba(98, 0, 234, 0.05);
    color: var(--primary-color);
  }
`;

const FilterDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 200px;
  background-color: var(--surface);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  padding: 0.75rem;
  z-index: 10;
`;

const FilterOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  input {
    margin: 0;
  }
  
  label {
    flex: 1;
    cursor: pointer;
  }
`;

const FilterTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const TagFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: rgba(98, 0, 234, 0.1);
  color: var(--primary-color);
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    padding: 0;
    font-size: 1rem;
    
    &:hover {
      color: var(--error);
    }
  }
`;

const NotesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 5;
  margin-bottom: 2rem;
  padding: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
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

const SortSelect = styled.select`
  padding: 0.6rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: var(--surface);
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: var(--primary-color);
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

const Subject = () => {
  const { subjectId } = useParams();
  const { findSubjectById } = useNotes();
  const [subject, setSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSubject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const foundSubject = await findSubjectById(subjectId);
        
        if (foundSubject) {
          setSubject(foundSubject);
          
          // Extract all unique tags from notes
          const tags = [];
          foundSubject.notes.forEach(note => {
            if (note.tags && note.tags.length > 0) {
              note.tags.forEach(tag => {
                if (!tags.includes(tag)) {
                  tags.push(tag);
                }
              });
            }
          });
          
          // Initialize filtered notes
          setFilteredNotes(foundSubject.notes.map(note => ({
            ...note,
            subjectId: foundSubject.id,
            subjectName: foundSubject.name,
            subjectColor: foundSubject.color
          })));
        } else {
          // Subject not found, redirect to home
          setError('Subject not found');
          console.error('Subject not found:', subjectId);
          navigate('/');
        }
      } catch (error) {
        setError('Error loading subject');
        console.error('Error loading subject:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubject();
  }, [subjectId, findSubjectById, navigate]);
  
  // Filter and sort notes when criteria change
  useEffect(() => {
    if (!subject) return;
    
    let filtered = [...subject.notes];
    console.log("Subject notes:", subject.notes.length, subject.notes);
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(term) || 
        note.content.toLowerCase().includes(term)
      );
    }
    
    // Apply tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note => 
        note.tags && selectedTags.every(tag => note.tags.includes(tag))
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        break;
      case 'a-z':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'z-a':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    
    // Add subject info to notes
    const notesWithSubjectInfo = filtered.map(note => ({
      ...note,
      subjectId: subject.id,
      subjectName: subject.name,
      subjectColor: subject.color
    }));
    
    console.log("Filtered notes:", notesWithSubjectInfo.length, notesWithSubjectInfo);
    setFilteredNotes(notesWithSubjectInfo);
  }, [subject, searchTerm, selectedTags, sortOption]);
  
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSortOption('newest');
  };
  
  if (isLoading) {
    return (
      <SubjectContainer>
        <LoadingSpinner>
          <FiLoader />
        </LoadingSpinner>
      </SubjectContainer>
    );
  }
  
  if (error || !subject) {
    return (
      <SubjectContainer>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <EmptyState>
          <h3>Could not load subject</h3>
          <p>There was a problem loading this subject. Please try again later.</p>
          <CreateButton 
            to="/"
            color="var(--primary-color)"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Return to Home</span>
          </CreateButton>
        </EmptyState>
      </SubjectContainer>
    );
  }
  
  // Extract all unique tags for filter dropdown
  const allTags = [];
  subject.notes.forEach(note => {
    if (note.tags && note.tags.length > 0) {
      note.tags.forEach(tag => {
        if (!allTags.includes(tag)) {
          allTags.push(tag);
        }
      });
    }
  });
  
  return (
    <SubjectContainer>
      <SubjectHeader>
        <TitleRow>
          <Title color={subject.color}>{subject.name}</Title>
          <CreateButton 
            to={`/subject/${subject.id}/create`}
            color={subject.color}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus />
            <span>New Note</span>
          </CreateButton>
        </TitleRow>
        
        <StatsRow>
          <Stat>
            <span className="value">{subject.notes.length}</span>
            <span className="label">Notes</span>
          </Stat>
          {allTags.length > 0 && (
            <Stat>
              <span className="value">{allTags.length}</span>
              <span className="label">Tags</span>
            </Stat>
          )}
        </StatsRow>
      </SubjectHeader>
      
      <FilterControls>
        <SearchInput 
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <ControlGroup>
          <SortSelect
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">A to Z</option>
            <option value="z-a">Z to A</option>
          </SortSelect>
          
          {allTags.length > 0 && (
            <FilterButton 
              className={selectedTags.length > 0 ? 'active' : ''}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiFilter />
              <span>Filter</span>
              {isFilterOpen ? <FiChevronUp /> : <FiChevronDown />}
              
              {isFilterOpen && (
                <FilterDropdown
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {allTags.map(tag => (
                    <FilterOption key={tag} onClick={() => toggleTag(tag)}>
                      <input 
                        type="checkbox" 
                        id={`tag-${tag}`} 
                        checked={selectedTags.includes(tag)}
                        onChange={() => {}}
                      />
                      <label htmlFor={`tag-${tag}`}>{tag}</label>
                    </FilterOption>
                  ))}
                </FilterDropdown>
              )}
            </FilterButton>
          )}
        </ControlGroup>
      </FilterControls>
      
      {selectedTags.length > 0 && (
        <FilterTags>
          {selectedTags.map(tag => (
            <TagFilter key={tag}>
              {tag}
              <button onClick={() => toggleTag(tag)}>
                <FiX />
              </button>
            </TagFilter>
          ))}
        </FilterTags>
      )}
      
      {filteredNotes.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.1 }}
        >
          <NotesGrid>
            {filteredNotes.map(note => (
              <motion.div 
                key={note.id} 
                variants={item}
                initial="hidden"
                animate="show"
              >
                <NoteCard note={note} />
              </motion.div>
            ))}
          </NotesGrid>
        </motion.div>
      ) : (
        <EmptyState>
          <h3>No Notes Found</h3>
          {(searchTerm || selectedTags.length > 0) ? (
            <>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <CreateButton 
                as="button"
                onClick={clearFilters}
                color={subject.color}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiX />
                <span>Clear Filters</span>
              </CreateButton>
            </>
          ) : (
            <>
              <p>Get started by creating your first note in this subject!</p>
              <CreateButton 
                to={`/subject/${subject.id}/create`}
                color={subject.color}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiPlus />
                <span>New Note</span>
              </CreateButton>
            </>
          )}
        </EmptyState>
      )}
    </SubjectContainer>
  );
};

export default Subject; 