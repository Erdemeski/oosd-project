import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import HomePage from './pages/HomePage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
/* import PrivateRoute from './components/PrivateRoute.jsx'
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute.jsx'
 */import NotFound from './pages/NotFound.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import AboutUs from './pages/AboutPage.jsx'
/* import DashboardDirector from './pages/DashboardDirector.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
 */

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/staff-sign-in" element={<SignInPage />} />
        <Route path="/admin-sign-up-page" element={<SignUpPage />} />

{/*         <Route element={<PrivateRoute />}>
          <Route path="/dashboard-director" element={<DashboardDirector />} />
        </Route>

        <Route element={<OnlyAdminPrivateRoute />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
 */}
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
