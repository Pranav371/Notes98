import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCalendar, FiTag } from 'react-icons/fi';

const CardContainer = styled(motion(Link))`
  display: block;
  background-color: var(--surface);
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  text-decoration: none;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background-color: ${props => props.color || 'var(--primary-color)'};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h3`
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Content = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: auto;
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background-color: rgba(98, 0, 234, 0.08);
  color: var(--primary-color);
  border-radius: 30px;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  
  svg {
    font-size: 0.85rem;
  }
`;

const SubjectBadge = styled.span`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  border-radius: 30px;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const NoteCard = ({ note, showSubject = false }) => {
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
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Error formatting date';
    }
  };

  // Ensure note content is a string before trying to clean it
  const content = typeof note.content === 'string' ? note.content : String(note.content || '');
  
  // Clean the markdown content for preview
  const cleanContent = content
    .replace(/[#*`]/g, '')  // Remove markdown symbols
    .replace(/\n/g, ' ')    // Replace newlines with spaces
    .trim();

  return (
    <CardContainer 
      to={`/note/${note.id}`}
      color={note.subjectColor}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      style={{ opacity: 1 }}
    >
      {showSubject && note.subjectName && (
        <SubjectBadge color={note.subjectColor}>{note.subjectName}</SubjectBadge>
      )}
      
      <Title>{note.title}</Title>
      
      <Content>
        {cleanContent.length > 150 
          ? `${cleanContent.substring(0, 150)}...` 
          : cleanContent
        }
      </Content>
      
      {note.tags && note.tags.length > 0 && (
        <TagsContainer>
          {note.tags.slice(0, 3).map((tag, index) => (
            <Tag key={index}>
              <FiTag />
              {tag}
            </Tag>
          ))}
          {note.tags.length > 3 && (
            <Tag>+{note.tags.length - 3} more</Tag>
          )}
        </TagsContainer>
      )}
      
      <MetaInfo>
        <DateInfo>
          <FiCalendar />
          <span>{formatDate(note.updatedAt)}</span>
        </DateInfo>
      </MetaInfo>
    </CardContainer>
  );
};

export default NoteCard; 