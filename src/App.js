import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { NotesProvider } from './context/NotesContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Subject from './pages/Subject';
import NoteView from './pages/NoteView';
import CreateNote from './pages/CreateNote';
import GlobalStyle from './styles/GlobalStyle';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

function App() {
  return (
    <NotesProvider>
      <Router>
        <GlobalStyle />
        <AppContainer>
          <Header />
          <MainContent>
            <Sidebar />
            <ContentArea>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/subject/:subjectId" element={<Subject />} />
                <Route path="/note/:noteId" element={<NoteView />} />
                <Route path="/create" element={<CreateNote />} />
                <Route path="/subject/:subjectId/create" element={<CreateNote />} />
              </Routes>
            </ContentArea>
          </MainContent>
        </AppContainer>
      </Router>
    </NotesProvider>
  );
}

export default App;
