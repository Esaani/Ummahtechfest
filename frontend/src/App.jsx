import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Schedule from './pages/Schedule.jsx'
import Ghana2026 from './pages/Ghana2026.jsx'
import Tickets from './pages/Tickets.jsx'
import Sponsor from './pages/Sponsor.jsx'
import ApplyToSpeak from './pages/ApplyToSpeak.jsx'
import AcceptParticipantInvite from './pages/AcceptParticipantInvite.jsx'
import SpeakerOnboarding from './pages/SpeakerOnboarding.jsx'
import Accommodation from './pages/Accommodation.jsx'
import VisaSupport from './pages/VisaSupport.jsx'
import SignUp from './pages/SignUp.jsx'
import CreateAccount from './pages/CreateAccount.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import AcceptInvite from './pages/AcceptInvite.jsx'
import NotFound from './pages/NotFound.jsx'
import SpecialAccess from './pages/SpecialAccess.jsx'
import ProfessionalDetails from './pages/ProfessionalDetails.jsx'
import Verification from './pages/Verification.jsx'
import Payment from './pages/Payment.jsx'
import PaymentVerify from './pages/PaymentVerify.jsx'
import DonateVerify from './pages/DonateVerify.jsx'
import Success from './pages/Success.jsx'
import RegistrationConfirmation from './pages/RegistrationConfirmation.jsx'
import RegistrationStatus from './pages/RegistrationStatus.jsx'
import Volunteer from './pages/Volunteer.jsx'
import VolunteerApply from './pages/VolunteerApply.jsx'
import VolunteerStatus from './pages/VolunteerStatus.jsx'
import AdminPortal from './pages/admin/AdminPortal.jsx'
import GatedPage from './components/GatedPage.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ParticleBackground from './components/ParticleBackground.jsx'
import { PAGES } from './config/pages'

import { useLocation } from 'react-router-dom'

function AppContent() {
  const location = useLocation()
  const hideNav = [
    '/login', '/forgot-password', '/reset-password', '/accept-invite', '/accept-participant-invite',
    '/create-account', '/special-access',
    '/professional-details', '/verification', '/payment', '/payment/verify', '/donate/verify', '/success',
    '/registration/confirmation', '/registration/status',
  ].includes(location.pathname) || location.pathname.startsWith('/admin')

  return (
    <div className="app-shell relative min-h-screen">
      <ParticleBackground />
      <div className="relative z-[1]">
        {!hideNav && <Header />}
        <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/schedule"
          element={
            <GatedPage path={PAGES.schedule.path}>
              <Schedule />
            </GatedPage>
          }
        />
        <Route
          path="/ghana-2026"
          element={
            <GatedPage path={PAGES.ghana2026.path}>
              <Ghana2026 />
            </GatedPage>
          }
        />
        <Route
          path="/tickets"
          element={
            <GatedPage path={PAGES.tickets.path}>
              <Tickets />
            </GatedPage>
          }
        />
        <Route path="/sponsor" element={<Sponsor />} />
        <Route path="/register" element={<Navigate to="/create-account" replace />} />
        <Route path="/apply-to-speak" element={<Navigate to="/speaker/apply" replace />} />
        <Route path="/speaker/apply" element={<ApplyToSpeak />} />
        <Route path="/speaker/onboarding" element={<SpeakerOnboarding />} />
        <Route path="/accept-participant-invite" element={<AcceptParticipantInvite />} />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/visa-support" element={<VisaSupport />} />
        <Route
          path="/signup"
          element={
            <GatedPage path={PAGES.signup.path}>
              <SignUp />
            </GatedPage>
          }
        />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/special-access" element={<SpecialAccess />} />
        <Route path="/professional-details" element={<ProfessionalDetails />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/verify" element={<PaymentVerify />} />
        <Route path="/donate/verify" element={<DonateVerify />} />
        <Route path="/success" element={<Success />} />
        <Route path="/registration/confirmation" element={<RegistrationConfirmation />} />
        <Route path="/registration/status" element={<RegistrationStatus />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/volunteer/apply" element={<VolunteerApply />} />
        <Route path="/volunteer/status" element={<VolunteerStatus />} />
        <Route path="/admin/*" element={<AdminPortal />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
        {!hideNav && <Footer />}
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
