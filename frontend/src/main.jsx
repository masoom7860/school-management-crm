import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConfigProvider } from 'antd'; // Import ConfigProvider
import "antd/dist/reset.css";
import './api/axiosInstance'; // Import axiosInstance to ensure interceptors are set up

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider> {/* Wrap App with ConfigProvider */}
      <App />
    </ConfigProvider>
  </StrictMode>,
)
