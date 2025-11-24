import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom'
import Layout from './components/layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import InventoryAnalyzer from './pages/InventoryAnalyser.jsx'
import MaterialTracking from './pages/MaterialTracking.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import ProjectForecast from './pages/ProjectForecast.jsx'
import Report from './pages/Report.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/inventory" element={<Layout><InventoryAnalyzer /></Layout>} />
        <Route path="/material-tracking" element={<Layout><MaterialTracking /></Layout>} />
        <Route path="/forecast" element={<Layout><ProjectForecast /></Layout>} />
        <Route path="/forecast" element={<Layout><Report /></Layout>} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
