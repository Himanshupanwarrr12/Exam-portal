import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store/store'
import App from './App.jsx'
import './index.css'

// main.jsx — the entry point of the React application.
// <Provider store={store}> makes the Redux store available to every
// component in the tree — no need to pass it down via props.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
