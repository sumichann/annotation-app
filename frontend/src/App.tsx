import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ItemPage from './pages/ItemPage'
import StartByIndexPage from './pages/StartByIndexPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/start-by-index" element={<StartByIndexPage />} />
      <Route path="/item/:itemId" element={<ItemPage />} />
    </Routes>
  )
}

export default App
