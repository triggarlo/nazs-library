import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalogue from './pages/Catalogue'
import SubmitResource from './pages/SubmitResource'
import ResourceDetail from './pages/ResourceDetail'
import Login from './pages/Login'
import MyAccount from './pages/MyAccount'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/resource/:id" element={<ResourceDetail />} />
            <Route path="/submit" element={<SubmitResource />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  )
}
