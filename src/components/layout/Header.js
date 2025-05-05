import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiSearch, FiBook, FiPlus, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../../context/NotesContext';

const HeaderContainer = styled.header`
  background-color: var(--surface);
  box-shadow: 0 2px 4px var(--shadow);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }

  svg {
    font-size: 1.8rem;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  width: ${({ isExpanded }) => (isExpanded ? '300px' : '40px')};
  transition: width 0.3s ease;
`;

const SearchButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  position: absolute;
  right: ${({ isExpanded }) => (isExpanded ? '0.5rem' : 'auto')};
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-color);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  opacity: ${({ isExpanded }) => (isExpanded ? '1' : '0')};

  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(98, 0, 234, 0.2);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  visibility: ${({ isExpanded }) => (isExpanded ? 'visible' : 'hidden')};
  opacity: ${({ isExpanded }) => (isExpanded ? '1' : '0')};
  transition: color 0.2s ease, visibility 0.2s ease, opacity 0.2s ease;

  &:hover {
    color: var(--error);
  }
`;

const CreateButton = styled(motion.button)`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--primary-light);
  }
`;

const SearchResults = styled(motion.div)`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 100%;
  background-color: var(--surface);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow);
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
`;

const SearchResultItem = styled(Link)`
  display: block;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s ease;
  color: var(--text-primary);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  h4 {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const SubjectTag = styled.span`
  display: inline-block;
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  margin-top: 0.25rem;
`;

const Header = () => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { searchNotes } = useNotes();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        isSearchExpanded
      ) {
        setIsSearchExpanded(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);

  const handleSearchClick = () => {
    if (!isSearchExpanded) {
      setIsSearchExpanded(true);
    } else if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchNotes(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsSearchExpanded(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleResultClick = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <HeaderContainer>
      <Logo to="/">
        <FiBook />
        <span>StudyNotes</span>
      </Logo>

      <RightSection>
        <SearchContainer ref={searchContainerRef} isExpanded={isSearchExpanded}>
          <CloseButton 
            isExpanded={isSearchExpanded}
            onClick={() => {
              setIsSearchExpanded(false);
              setSearchQuery('');
              setSearchResults([]);
            }}
          >
            <FiX />
          </CloseButton>
          <SearchInput
            ref={searchInputRef}
            isExpanded={isSearchExpanded}
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <SearchButton isExpanded={isSearchExpanded} onClick={handleSearchClick}>
            <FiSearch />
          </SearchButton>

          <AnimatePresence>
            {isSearchExpanded && searchResults.length > 0 && (
              <SearchResults
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {searchResults.map((result) => (
                  <SearchResultItem
                    to={`/note/${result.id}`}
                    key={result.id}
                    onClick={handleResultClick}
                  >
                    <h4>{result.title}</h4>
                    <p>
                      {result.content.replace(/[#*`]/g, '').substring(0, 60)}
                      {result.content.length > 60 ? '...' : ''}
                    </p>
                    <SubjectTag color={result.subjectColor}>{result.subjectName}</SubjectTag>
                  </SearchResultItem>
                ))}
              </SearchResults>
            )}
          </AnimatePresence>
        </SearchContainer>

        <CreateButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/create')}
        >
          <FiPlus />
          <span>New Note</span>
        </CreateButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header; 