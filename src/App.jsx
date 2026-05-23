import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

import Home from './pages/Home.jsx'
import Schedule from './pages/Schedule.jsx'
import Ghana2026 from './pages/Ghana2026.jsx'
import Tickets from './pages/Tickets.jsx'
import Sponsor from './pages/Sponsor.jsx'
import ApplyToSpeak from './pages/ApplyToSpeak.jsx'
import Volunteer from './pages/Volunteer.jsx'
import Accommodation from './pages/Accommodation.jsx'
import VisaSupport from './pages/VisaSupport.jsx'
import SignUp from './pages/SignUp.jsx'
import CreateAccount from './pages/CreateAccount.jsx'
import Login from './pages/Login.jsx'
import SpecialAccess from './pages/SpecialAccess.jsx'
import ProfessionalDetails from './pages/ProfessionalDetails.jsx'
import Verification from './pages/Verification.jsx'
import Payment from './pages/Payment.jsx'
import Success from './pages/Success.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

import { useLocation } from 'react-router-dom'

function AppContent() {
  const location = useLocation()
  const hideNav = ['/login', '/create-account', '/special-access', '/professional-details', '/verification', '/payment', '/success'].includes(location.pathname)

  return (
    <>
      {!hideNav && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/ghana-2026" element={<Ghana2026 />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/sponsor" element={<Sponsor />} />
        <Route path="/apply-to-speak" element={<ApplyToSpeak />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/accommodation" element={<Accommodation />} />
        <Route path="/visa-support" element={<VisaSupport />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/special-access" element={<SpecialAccess />} />
        <Route path="/professional-details" element={<ProfessionalDetails />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
      </Routes>
      {!hideNav && <Footer />}
    </>
  )
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 300, // Reduced from 600 for snappier feel
      easing: 'ease-out-cubic',
      once: true,
      offset: 0,
      disableMutationObserver: false,
      debounceDelay: 50,
      throttleDelay: 99,
      startEvent: 'DOMContentLoaded',
    })
  }, [])

  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
