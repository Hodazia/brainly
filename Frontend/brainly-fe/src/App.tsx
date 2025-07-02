import ButtonUi from './components/Button'

import './App.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={< RegisterPage/>}/>
      </Routes>
    </BrowserRouter>

    </>
  )
}

export default App
