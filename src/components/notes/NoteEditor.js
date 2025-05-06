import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiChevronDown, FiEye, FiEdit, FiTag, FiPlus, FiBold, FiItalic, FiList, FiLink, FiImage, FiTable } from 'react-icons/fi';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useNotes } from '../../context/NotesContext';

const EditorContainer = styled.div`
  background-color: var(--surface);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  min-height: 500px;
`;

const EditorHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SubjectSelector = styled.div`
  position: relative;
`;

const SubjectButton = styled.button`
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    transition: transform 0.2s ease;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const SubjectDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 200px;
  background-color: var(--surface);
  border-radius: 4px;
  box-shadow: 0 2px 8px var(--shadow);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
`;

const SubjectOption = styled.button`
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.color || 'var(--primary-color)'};
  }
`;

const TitleInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  outline: none;
  border-bottom: 1px solid var(--border);
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const EditorControls = styled.div`
  display: flex;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--border);
  gap: 0.5rem;
`;

const ControlButton = styled.button`
  background: ${props => props.active ? 'rgba(0, 0, 0, 0.05)' : 'none'};
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

const EditorContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Editor = styled.textarea`
  flex: 1;
  padding: 1rem;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  overflow-y: auto;
  display: ${props => props.view === 'edit' || props.view === 'split' ? 'block' : 'none'};
  width: ${props => props.view === 'split' ? '50%' : '100%'};
`;

const Preview = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: ${props => props.view === 'preview' || props.view === 'split' ? 'block' : 'none'};
  width: ${props => props.view === 'split' ? '50%' : '100%'};
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
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
    font-size: 0.85rem;
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

const Footer = styled.div`
  padding: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TagsInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const TagPill = styled.div`
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: var(--error);
    }
  }
`;

const AddTagInput = styled.input`
  background: none;
  border: none;
  outline: none;
  font-size: 0.8rem;
  padding: 0.3rem;
  width: 100px;
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const SaveButton = styled(motion.button)`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:disabled {
    background-color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const FormattingToolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border);
  background-color: var(--surface);
`;

const FormatButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--primary-color);
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

const ToolbarDivider = styled.div`
  width: 1px;
  background-color: var(--border);
  margin: 0 0.25rem;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background-color: var(--surface);
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: var(--text-primary);
`;

const TableConfigForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: var(--primary-color-dark);
    }
  }
  
  &.secondary {
    background-color: transparent;
    color: var(--text-secondary);
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
`;

const NoteEditor = ({ initialNote, subjectId, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'split'
  const [previewHtml, setPreviewHtml] = useState('');
  const [editorRef, setEditorRef] = useState(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableConfig, setTableConfig] = useState({ rows: 3, columns: 3 });
  
  const { subjects } = useNotes();
  
  // Initialize editor with initial note data if provided
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setTags(initialNote.tags || []);
    }
  }, [initialNote]);
  
  // Set initial subject
  useEffect(() => {
    if (subjectId) {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject) {
        setSelectedSubject(subject);
      }
    } else if (subjects.length > 0) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjectId, subjects]);
  
  // Update preview when content changes
  useEffect(() => {
    const html = marked(content);
    const sanitizedHtml = DOMPurify.sanitize(html);
    setPreviewHtml(sanitizedHtml);
  }, [content]);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    const noteData = {
      title,
      content,
      tags
    };
    
    onSave(selectedSubject.id, noteData);
  };
  
  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };
  
  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setIsSubjectDropdownOpen(false);
  };

  const insertMarkdown = (prefix, suffix = '') => {
    if (!editorRef) return;
    
    const start = editorRef.selectionStart;
    const end = editorRef.selectionEnd;
    const text = editorRef.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    editorRef.value = newText;
    
    // Update the content state
    setContent(newText);
    
    // Set cursor position after the inserted text
    const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
    editorRef.setSelectionRange(newCursorPos, newCursorPos);
    editorRef.focus();
  };

  const generateTableMarkdown = (rows, columns) => {
    let table = '\n';
    
    // Generate header row
    table += '| ' + Array(columns).fill('Header').map((h, i) => `${h} ${i + 1}`).join(' | ') + ' |\n';
    
    // Generate separator row
    table += '| ' + Array(columns).fill('---').join(' | ') + ' |\n';
    
    // Generate data rows
    for (let i = 0; i < rows; i++) {
      table += '| ' + Array(columns).fill('Cell').map((c, j) => `${c} ${i + 1}-${j + 1}`).join(' | ') + ' |\n';
    }
    
    return table;
  };

  const handleTableInsert = () => {
    const tableMarkdown = generateTableMarkdown(tableConfig.rows, tableConfig.columns);
    insertMarkdown(tableMarkdown);
    setIsTableModalOpen(false);
  };

  return (
    <EditorContainer>
      <EditorHeader>
        <SubjectSelector>
          <SubjectButton 
            color={selectedSubject?.color}
            onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
            isOpen={isSubjectDropdownOpen}
          >
            {selectedSubject?.name || 'Select Subject'}
            <FiChevronDown />
          </SubjectButton>
          
          {isSubjectDropdownOpen && (
            <SubjectDropdown
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {subjects.map(subject => (
                <SubjectOption 
                  key={subject.id}
                  color={subject.color}
                  onClick={() => handleSubjectSelect(subject)}
                >
                  <span className="color-dot"></span>
                  {subject.name}
                </SubjectOption>
              ))}
            </SubjectDropdown>
          )}
        </SubjectSelector>
        
        <ControlButton onClick={onCancel}>
          <FiX />
          <span>Cancel</span>
        </ControlButton>
      </EditorHeader>
      
      <TitleInput 
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <FormattingToolbar>
        <FormatButton onClick={() => insertMarkdown('**', '**')} title="Bold">
          <FiBold />
        </FormatButton>
        <FormatButton onClick={() => insertMarkdown('*', '*')} title="Italic">
          <FiItalic />
        </FormatButton>
        <ToolbarDivider />
        <FormatButton onClick={() => insertMarkdown('- ')} title="Bullet List">
          <FiList />
        </FormatButton>
        <FormatButton onClick={() => insertMarkdown('1. ')} title="Numbered List">
          <FiList />
        </FormatButton>
        <ToolbarDivider />
        <FormatButton onClick={() => insertMarkdown('[', '](url)')} title="Link">
          <FiLink />
        </FormatButton>
        <FormatButton onClick={() => insertMarkdown('![', '](image-url)')} title="Image">
          <FiImage />
        </FormatButton>
        <ToolbarDivider />
        <FormatButton onClick={() => setIsTableModalOpen(true)} title="Insert Table">
          <FiTable />
        </FormatButton>
      </FormattingToolbar>
      
      <EditorControls>
        <ControlButton 
          active={viewMode === 'edit'}
          onClick={() => setViewMode('edit')}
        >
          <FiEdit />
          <span>Edit</span>
        </ControlButton>
        <ControlButton 
          active={viewMode === 'preview'}
          onClick={() => setViewMode('preview')}
        >
          <FiEye />
          <span>Preview</span>
        </ControlButton>
        <ControlButton 
          active={viewMode === 'split'}
          onClick={() => setViewMode('split')}
        >
          <FiEdit />
          <FiEye />
          <span>Split</span>
        </ControlButton>
      </EditorControls>
      
      <EditorContent>
        <Editor 
          ref={setEditorRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          view={viewMode}
        />
        
        <Preview 
          view={viewMode}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </EditorContent>
      
      <Footer>
        <TagsInput>
          <FiTag />
          {tags.map((tag, index) => (
            <TagPill key={index}>
              {tag}
              <button onClick={() => handleTagRemove(tag)}>
                <FiX />
              </button>
            </TagPill>
          ))}
          <AddTagInput 
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagAdd}
          />
        </TagsInput>
        
        <SaveButton 
          onClick={handleSave}
          disabled={!title.trim() || !selectedSubject}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiSave />
          <span>Save Note</span>
        </SaveButton>
      </Footer>
      
      <AnimatePresence>
        {isTableModalOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTableModalOpen(false)}
          >
            <ModalContent
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <ModalHeader>Insert Table</ModalHeader>
              <TableConfigForm>
                <FormGroup>
                  <Label>Number of Rows</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={tableConfig.rows}
                    onChange={(e) => setTableConfig(prev => ({ ...prev, rows: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)) }))}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Number of Columns</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={tableConfig.columns}
                    onChange={(e) => setTableConfig(prev => ({ ...prev, columns: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)) }))}
                  />
                </FormGroup>
                <ButtonGroup>
                  <Button 
                    className="secondary"
                    onClick={() => setIsTableModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="primary"
                    onClick={handleTableInsert}
                  >
                    Insert Table
                  </Button>
                </ButtonGroup>
              </TableConfigForm>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </EditorContainer>
  );
};

export default NoteEditor; 