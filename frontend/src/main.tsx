import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'
import { AlertsProvider } from './components/alerts/AlertsProvider'

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <AlertsProvider>
            <App/>
        </AlertsProvider>
    </React.StrictMode>
)
