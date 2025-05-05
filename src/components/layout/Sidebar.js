import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFolder, 
  FiPlus, 
  FiHome, 
  FiMoreVertical, 
  FiEdit, 
  FiTrash2, 
  FiX,
  FiBookOpen
} from 'react-icons/fi';
import { useNotes } from '../../context/NotesContext';

const SidebarContainer = styled(motion.aside)`
  width: 260px;
  background-color: var(--surface);
  border-right: 1px solid var(--border);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.95rem;
  position: relative;
  transition: background-color 0.2s ease;
  
  svg {
    margin-right: 0.75rem;
    font-size: 1.1rem;
    color: var(--text-secondary);
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &.active {
    color: var(--primary-color);
    background-color: rgba(98, 0, 234, 0.05);
    
    svg {
      color: var(--primary-color);
    }
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background-color: var(--primary-color);
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  padding: 0 1.5rem;
  margin: 1.5rem 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const SubjectItem = styled.div`
  position: relative;
`;

const SubjectLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.95rem;
  position: relative;
  transition: background-color 0.2s ease;
  
  svg {
    margin-right: 0.75rem;
    font-size: 1.1rem;
  }
  
  .subject-icon {
    color: ${props => props.color || 'var(--text-secondary)'};
  }
  
  .subject-menu {
    color: var(--text-secondary);
    margin-left: auto;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    
    .subject-menu {
      opacity: 1;
    }
  }
  
  &.active {
    color: var(--primary-color);
    background-color: rgba(98, 0, 234, 0.05);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background-color: var(--primary-color);
    }
  }
`;

const SubjectMenu = styled(motion.div)`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--surface);
  border-radius: 4px;
  box-shadow: 0 2px 8px var(--shadow);
  overflow: hidden;
  z-index: 10;
`;

const MenuItem = styled.button`
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  svg {
    margin-right: 0.5rem;
    font-size: 1rem;
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &.delete {
    color: var(--error);
    
    svg {
      color: var(--error);
    }
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  input {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    
    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(98, 0, 234, 0.1);
    }
  }
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ColorOption = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? 'var(--text-primary)' : 'transparent'};
  background-color: ${props => props.color};
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.6rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &.cancel {
    background-color: transparent;
    border: 1px solid var(--border);
    color: var(--text-primary);
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  &.primary {
    background-color: var(--primary-color);
    border: none;
    color: white;
    
    &:hover {
      background-color: var(--primary-light);
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

const DeleteConfirmation = styled.div`
  text-align: center;
  padding: 1rem 0;
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const Sidebar = () => {
  const [activeSubjectMenu, setActiveSubjectMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'delete'
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    color: '#6200ea'
  });
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  
  const { subjects, addSubject, updateSubject, deleteSubject } = useNotes();
  const navigate = useNavigate();
  
  const colorOptions = [
    '#6200ea', // Primary
    '#2196f3', // Blue
    '#ff5722', // Orange
    '#4caf50', // Green
    '#f44336', // Red
    '#9c27b0', // Purple
    '#ff9800', // Amber
    '#795548', // Brown
    '#607d8b', // Blue Grey
  ];
  
  const handleMenuClick = (e, subjectId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSubjectMenu(activeSubjectMenu === subjectId ? null : subjectId);
  };
  
  const openCreateModal = () => {
    setModalType('create');
    setSubjectForm({ name: '', color: '#6200ea' });
    setIsModalOpen(true);
  };
  
  const openEditModal = (subject) => {
    setModalType('edit');
    setSubjectToEdit(subject);
    setSubjectForm({ name: subject.name, color: subject.color });
    setIsModalOpen(true);
    setActiveSubjectMenu(null);
  };
  
  const openDeleteModal = (subject) => {
    setModalType('delete');
    setSubjectToEdit(subject);
    setIsModalOpen(true);
    setActiveSubjectMenu(null);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSubjectForm({ name: '', color: '#6200ea' });
    setSubjectToEdit(null);
  };
  
  const handleInputChange = (e) => {
    setSubjectForm({ ...subjectForm, [e.target.name]: e.target.value });
  };
  
  const handleColorSelect = (color) => {
    setSubjectForm({ ...subjectForm, color });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'create') {
      const newSubjectId = addSubject({
        name: subjectForm.name,
        color: subjectForm.color,
        icon: 'book-open' // Default icon
      });
      navigate(`/subject/${newSubjectId}`);
    } else if (modalType === 'edit') {
      updateSubject(subjectToEdit.id, {
        name: subjectForm.name,
        color: subjectForm.color
      });
    }
    
    closeModal();
  };
  
  const handleDelete = () => {
    deleteSubject(subjectToEdit.id);
    navigate('/');
    closeModal();
  };
  
  const clickOutside = (e) => {
    if (activeSubjectMenu && !e.target.closest('.subject-menu-container')) {
      setActiveSubjectMenu(null);
    }
  };
  
  return (
    <>
      <SidebarContainer 
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={clickOutside}
      >
        <NavItem to="/" end>
          <FiHome />
          <span>Home</span>
        </NavItem>
        
        <SectionTitle>
          <span>Subjects</span>
          <AddButton onClick={openCreateModal}>
            <FiPlus />
          </AddButton>
        </SectionTitle>
        
        {subjects.map((subject) => (
          <SubjectItem key={subject.id}>
            <SubjectLink 
              to={`/subject/${subject.id}`} 
              color={subject.color}
            >
              <FiBookOpen className="subject-icon" />
              <span>{subject.name}</span>
              <FiMoreVertical 
                className="subject-menu"
                onClick={(e) => handleMenuClick(e, subject.id)}
              />
            </SubjectLink>
            
            <AnimatePresence>
              {activeSubjectMenu === subject.id && (
                <SubjectMenu
                  className="subject-menu-container"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <MenuItem onClick={() => openEditModal(subject)}>
                    <FiEdit />
                    <span>Edit Subject</span>
                  </MenuItem>
                  <MenuItem 
                    className="delete" 
                    onClick={() => openDeleteModal(subject)}
                  >
                    <FiTrash2 />
                    <span>Delete Subject</span>
                  </MenuItem>
                </SubjectMenu>
              )}
            </AnimatePresence>
          </SubjectItem>
        ))}
      </SidebarContainer>
      
      <AnimatePresence>
        {isModalOpen && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <ModalContent
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {modalType === 'delete' ? (
                <>
                  <ModalHeader>
                    <h3>Delete Subject</h3>
                    <button onClick={closeModal}>
                      <FiX />
                    </button>
                  </ModalHeader>
                  <DeleteConfirmation>
                    <p>
                      Are you sure you want to delete <strong>{subjectToEdit?.name}</strong>?
                      All notes in this subject will be permanently deleted.
                    </p>
                    <ButtonGroup>
                      <Button className="cancel" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button className="delete" onClick={handleDelete}>
                        Delete
                      </Button>
                    </ButtonGroup>
                  </DeleteConfirmation>
                </>
              ) : (
                <>
                  <ModalHeader>
                    <h3>{modalType === 'create' ? 'Create' : 'Edit'} Subject</h3>
                    <button onClick={closeModal}>
                      <FiX />
                    </button>
                  </ModalHeader>
                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <label htmlFor="name">Subject Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={subjectForm.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Mathematics, History, Physics"
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>Color</label>
                      <ColorPicker>
                        {colorOptions.map((color) => (
                          <ColorOption
                            key={color}
                            color={color}
                            selected={subjectForm.color === color}
                            onClick={() => handleColorSelect(color)}
                            type="button"
                          />
                        ))}
                      </ColorPicker>
                    </FormGroup>
                    <ButtonGroup>
                      <Button className="cancel" type="button" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button className="primary" type="submit">
                        {modalType === 'create' ? 'Create' : 'Save'}
                      </Button>
                    </ButtonGroup>
                  </Form>
                </>
              )}
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar; 