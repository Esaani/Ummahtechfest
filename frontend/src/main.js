import './style.css'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-out-cubic',
  once: true,
  offset: 50,
})

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn')
const closeMenuBtn = document.getElementById('close-menu-btn')
const mobileMenu = document.getElementById('mobile-menu')
const mobileLinks = mobileMenu.querySelectorAll('a')

const toggleMenu = (show) => {
  if (show) {
    mobileMenu.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10')
    document.body.style.overflow = 'hidden'
  } else {
    mobileMenu.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10')
    document.body.style.overflow = ''
  }
}

mobileMenuBtn?.addEventListener('click', () => toggleMenu(true))
closeMenuBtn?.addEventListener('click', () => toggleMenu(false))
mobileLinks.forEach(link => {
  link.addEventListener('click', () => toggleMenu(false))
})

// Navbar scroll effect
const header = document.querySelector('header')
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('bg-background/90', 'py-2')
    header.classList.remove('bg-background/60', 'py-0')
  } else {
    header.classList.remove('bg-background/90', 'py-2')
    header.classList.add('bg-background/60', 'py-0')
  }
})

// Form Handling Placeholder
const registrationForm = document.querySelector('#tickets form')
registrationForm?.addEventListener('submit', (e) => {
  e.preventDefault()
  const formData = new FormData(registrationForm)
  console.log('Registration submitted:', Object.fromEntries(formData))
  alert('Thank you for registering! We will be in touch soon.')
  registrationForm.reset()
})

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute('href'))
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      })
    }
  })
})

// Active link on scroll
const sections = document.querySelectorAll('section[id]')
window.addEventListener('scroll', () => {
  let current = ''
  sections.forEach(section => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.clientHeight
    if (pageYOffset >= sectionTop - 150) {
      current = section.getAttribute('id')
    }
  })

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('nav-link-active')
    if (link.getAttribute('href').includes(current) && current !== '') {
      link.classList.add('nav-link-active')
    }
  })
})
