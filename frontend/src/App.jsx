import { BrowserRouter, Routes, Route } from 'react-router-dom'
import React from 'react'
import HomePage from './pages/HomePage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute.jsx'
import OnlyCreativeStaffPrivateRoute from './components/OnlyCreativeStaffPrivateRoute.jsx'
import OnlyAccountantPrivateRoute from './components/OnlyAccountantPrivateRoute.jsx'
import OnlyManagerPrivateRoute from './components/OnlyManagerPrivateRoute.jsx'
import NotFound from './pages/NotFound.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import AboutUs from './pages/AboutPage.jsx'
import DashboardDirector from './pages/DashboardDirector.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CreativeStaffDashboard from './pages/CreativeStaffDashboard.jsx'
import AccountantDashboard from './pages/AccountantDashboard.jsx'
import ManagerDashboard from './pages/ManagerDashboard.jsx'
import AdminUsersManagement from './components/AdminDash/DashUsers.jsx'
import AdminClientsManagement from './components/AdminDash/DashClients.jsx'
import AdminCampaignsManagement from './components/AdminDash/DashCampaigns.jsx'
/* import ManagerUsersManagement from './components/ManagerDash/DashUsers.jsx'
 */
import ManagerClientsManagement from './components/ManagerDash/DashClients.jsx'
import ManagerCampaignsManagement from './components/ManagerDash/DashCampaigns.jsx'

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

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard-director" element={<DashboardDirector />} />
        </Route>

        <Route element={<OnlyAdminPrivateRoute />}>
          <Route path="/admin-sign-up-page" element={<SignUpPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          {/*           <Route path="/admin-dashboard?tab=users" element={<AdminUsersManagement />} />
          <Route path="/admin-dashboard?tab=clients" element={<AdminClientsManagement />} />
          <Route path="/admin-dashboard?tab=campaigns" element={<AdminCampaignsManagement />} />
 */}
        </Route>

        <Route element={<OnlyCreativeStaffPrivateRoute />}>
          <Route path="/creative-staff-dashboard" element={<CreativeStaffDashboard />} />
        </Route>

        <Route element={<OnlyAccountantPrivateRoute />}>
          <Route path="/accountant-dashboard" element={<AccountantDashboard />} />
        </Route>

        <Route element={<OnlyManagerPrivateRoute />}>
          <Route path="/manager-sign-up-page" element={<SignUpPage />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          {/*           <Route path="/manager-dashboard?tab=clients" element={<ManagerClientsManagement />} />
          <Route path="/manager-dashboard?tab=campaigns" element={<ManagerCampaignsManagement />} />
 */}
        </Route>

      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
