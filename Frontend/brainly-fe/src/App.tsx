import ButtonUi from './components/Button'

import './App.css'
import PlusIcon from './icons/PlusIcon'
import ShareIcon from './icons/ShareIcon'

function App() {
  return (
    <>
    <ButtonUi variant="primary" size="sm" text="Click me" startIcon={<PlusIcon />} />
    <ButtonUi variant="secondary" size="lg" text="Click me" endIcon={<ShareIcon />} />
    </>
  )
}

export default App
