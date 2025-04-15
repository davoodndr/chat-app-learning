

import './App.css'
import OpenChat from './pages/OpenChat';
import Chat from './pages/Chat'
import { Route, Routes } from 'react-router';
import { Room } from './pages/Room';

function App() {

  return (
    <div className='app'>
      <Routes>
        <Route path='/' element={<OpenChat />}/>
        <Route path='/room/:id' element={<Room />}/>
        <Route path='/chat' element={<Chat />}/>
      </Routes>
    </div>
  )
}

export default App
