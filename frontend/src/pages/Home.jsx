import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, cmsApi, outreachApi } from '../api/client'
import DonationWidget from '../components/DonationWidget.jsx'
import DonationModal from '../components/DonationModal.jsx'
import SkeletonImage from '../components/SkeletonImage'
import SpeakerBioModal from '../components/SpeakerBioModal'
import HoneypotField from '../components/HoneypotField'
import { FormField, FormInput } from '../components/forms/FormField'
import { useCmsSections } from '../hooks/useCmsSections'
import { validateWaitlist } from '../utils/formValidation'
import { cmsMediaUrl } from '../utils/mediaUrl'

const DEFAULT_HERO = {
  badge: 'ACCRA, GHANA • NOV 2026',
  headline: 'The Future of',
  headline_highlight: 'Muslim Tech',
  headline_suffix: 'Excellence',
  subtitle:
    "Join 5,000+ developers, innovators, and visionaries for Africa's largest gathering of Muslim tech talent. Bridging tradition and transformation in the heart of West Africa.",
  subtitle_mobile: "Join 5,000+ innovators for Africa's largest gathering of Muslim tech talent.",
  video_url: '',
  poster_url: '',
}

const DEFAULT_WHY_BUILD = {
  title: 'Why we',
  title_highlight: 'build',
  cards: [
    {
      title: "We've always been pioneers",
      text: "Algebra. Medicine. Optics. Two-thirds of the stars bear names we gave them. From the stars to the algorithm — we've always led.",
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    },
    {
      title: 'Owning the platform shift',
      text: 'Bricks to bytes. Factories to platforms. The greatest opportunity of our lifetime is here, and we intend to own it.',
      image_url: '',
    },
    {
      title: 'We are the guardians of tech',
      text: "We are guardians of mankind. It's our responsibility to ensure technology serves humanity the right way.",
      image_url: '',
    },
    {
      title: 'Ummah is the standard',
      text: "Pioneers. Category-defining founders. Legendary engineers. Excellence isn't the goal — it's the entry requirement.",
      image_url: '',
    },
  ],
}

const DEFAULT_STATS = {
  items: [
    { icon: 'diversity_3', value: '5,000+', label: 'Global Attendees' },
    { icon: 'rocket_launch', value: '40+', label: 'Workshops' },
    { icon: 'trophy', value: '$50k', label: 'Hackathon Prize' },
    { icon: 'record_voice_over', value: '20', label: 'Legendary speakers' },
  ],
}

const DEFAULT_PARTNERS = {
  title: 'Global Partners & Sponsors',
  names: [],
}

const DEFAULT_CTA = {
  badge: 'Open applications',
  headline: 'Ready to build the future?',
  body: 'Register for a free account, then apply to speak or volunteer for Ummah Tech Fest Ghana 2026.',
  button_text: 'APPLY TO VOLUNTEER',
  button_url: '/volunteer/apply',
}

const DEFAULT_SPEAKERS = [
  {
    id: 'default-1',
    name: 'Ibrahim Mansour',
    role: 'CTO @ HALAL AI',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqTgN95a6yn9xwWWqeqejPPtdw-cwCHAXciweIRsMwrXpdwuLrSxH_X63I3sQjLM2WM3LsTiW8g61_tHr04QrzFClaJfHp6L79N8eHghjWAgQhWTXRVY2nrjvygQ9919hL_Y5GcTpHsy6xP7AiEVThRW00kC1kAHNvgTxypQrrRuZjv1A1SrrA6v4xEvsmgubWyB0bbSU1u7YZFdrTFHOEBb8g2E4oIsCARNVlDTLtaB7L_xMz-8C1hj5aiqe0AwT5Z3tQFnNQmvo',
    bio: 'Ibrahim Mansour is the CTO of HALAL AI, pioneering ethical AI models built on Islamic principles and modern machine learning frameworks. He has over a decade of experience in machine learning and data infrastructure.'
  },
  {
    id: 'default-2',
    name: 'Amina Asante',
    role: 'Lead Dev @ EthioChain',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPWjqckz1gnKbmGg4e2basC3v_phddOPw1Z4UxVu5nM7aaBN-x1c-JlBQfkIuuhKP079EETqkmK0T5vCAmUEoyd8aGf1HC6taxCVCv2I_EjN6Ll9p2vJICkvnRZzZ3bK8IfoHpQnGqHfJBL237GCTf5ez_1MWB90NO9bEGHWUOy3rLTuSTYiaFIFUNiS6Zaf7LMRi8b756izXB1wGx2EDFXUNgFEssErgKmx4xY-fxe7xY_4xtIJJp5QeqQrLDnsjKcz6HNQ-SF_0',
    bio: 'Amina Asante is the Lead Developer at EthioChain. She builds scalable, decentralized smart contracts for the future of ethical African fintech, focusing on microfinance and peer-to-peer economic networks.'
  },
  {
    id: 'default-3',
    name: 'Yusuf Osei',
    role: 'Founder @ AccraData',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtvxwpKcSNPZH1odV5tKDI9jOyetIneUw2p9VrdzN6ozc_NFWtMrqTYwbPx8XjyGCx0F6rbsxwSQhGWYF70aCfhaol__XO3W01n_F4i77hvtBwFXz8FZ-UTwmRdobxQpOfGXEaWJx9baDXh7Usco5iLMHuB4ljkNaVTlyt5sn4vEBvEpx0mOkEP0v98UOTbxu07Qw_Wh8o6qKaZnGcJSnetAy0q2q3Ti29F-8uWR1XPwPIgzw9r5d9ZYT4rynz2Tqk7-CeRvBHwQc',
    bio: 'Yusuf Osei is the Founder of AccraData. He specializes in helping companies scale their operations through modern data analytics pipelines, distributed systems, and highly optimized search engines.'
  }
]


export default function Home() {
  const { get } = useCmsSections('home')
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const hero = { ...DEFAULT_HERO, ...get('home-hero') }
  const whyBuild = { ...DEFAULT_WHY_BUILD, ...get('home-why-build') }
  const stats = { ...DEFAULT_STATS, ...get('home-stats') }
  const partners = { ...DEFAULT_PARTNERS, ...get('home-partners') }
  const finalCta = { ...DEFAULT_CTA, ...get('home-final-cta') }
  const whyCards = whyBuild.cards?.length ? whyBuild.cards : DEFAULT_WHY_BUILD.cards
  const statItems = stats.items?.length ? stats.items : DEFAULT_STATS.items
  const [partnerNames, setPartnerNames] = useState([])

  // Homepage marquee uses global_partner tier only (Admin → Sponsors → Homepage logos → Global partners).
  // Do not merge sponsor tier here — that caused seeded names (Flutterwave, Paystack, etc.) to appear
  // when only global_partner was configured.
  useEffect(() => {
    cmsApi
      .publicSponsors('global_partner')
      .then((res) => {
        const names = (res.data || []).map((s) => s.name).filter(Boolean)
        setPartnerNames(names)
      })
      .catch(() => {})
  }, [])

  return (
    <main>
      <section className="relative min-h-[90vh] flex items-center py-12 md:py-24 pt-24 md:pt-32 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none bg-black overflow-hidden">
          {hero.video_url ? (
            <video
              key={hero.video_url}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={hero.poster_url || undefined}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
              <source src={hero.video_url} type="video/mp4" />
            </video>
          ) : hero.poster_url ? (
            <img src={hero.poster_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : null}
          <div className="absolute inset-0 w-full h-full bg-black/40" />
        </div>

        <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col items-center justify-center max-w-4xl mx-auto h-full text-center">
            <div className="space-y-6 md:space-y-8" data-aos="fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full border border-outline-variant/30 mx-auto">
                <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
                <span className="label-md text-secondary uppercase tracking-widest text-[10px] md:text-xs">{hero.badge}</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline text-primary uppercase leading-[1.1] md:leading-[1.1]">
                {hero.headline} <br className="md:hidden" />
                <span className="text-primary-fixed">{hero.headline_highlight}</span>
                {hero.headline_suffix ? ` ${hero.headline_suffix}` : ''}
              </h1>
              <p className="text-sm md:text-base lg:text-lg text-on-surface-variant max-w-xl mx-auto px-4 md:px-0">
                <span className="md:hidden">{hero.subtitle_mobile || hero.subtitle}</span>
                <span className="hidden md:inline">{hero.subtitle}</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/create-account" className="btn-primary w-full sm:w-auto px-10 py-4 font-bold uppercase tracking-widest text-sm text-center">
                  Register
                </Link>
                <Link to="/volunteer/apply" className="btn-secondary w-full sm:w-auto px-10 py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-sm">
                  Apply to Volunteer
                </Link>
                <Link to="/schedule" className="hidden md:inline-flex btn-secondary px-10 py-4 font-bold uppercase tracking-widest items-center justify-center gap-2 text-sm">
                  View Agenda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="mb-12 md:mb-16 text-center md:text-left" data-aos="fade-up">
          <h2 className="headline-lg text-primary uppercase">
            {whyBuild.title} <span className="text-primary-fixed">{whyBuild.title_highlight}</span>
          </h2>
          <div className="w-24 h-1 bg-primary-fixed mt-4 mx-auto md:mx-0" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-gutter">
          {whyCards.map((card, i) => (
            <div
              key={i}
              className="glass-panel group overflow-hidden rounded-xl border border-outline-variant/20 hover:border-primary-fixed transition-all duration-500"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              {(() => {
                const src = cmsMediaUrl(card.image_url, '')
                const imgSrc = src
                  ? src.startsWith('http') ? `${src}${src.includes('?') ? '&' : '?'}w=800` : src
                  : undefined
                return (
                  <SkeletonImage
                    src={imgSrc}
                    alt={card.title}
                    className="aspect-video"
                    imgClassName="object-cover transition-transform duration-500 md:group-hover:scale-110"
                    loading="lazy"
                  />
                )
              })()}
              <div className="p-6 md:p-8">
                <h4 className="headline-sm text-primary mb-3 text-lg md:text-xl">{card.title}</h4>
                <p className="body-md text-on-surface-variant text-sm md:text-base">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 border-y border-outline-variant/10 overflow-hidden">
        <p className="text-center label-md text-on-surface-variant uppercase tracking-widest mb-10 text-[10px] md:text-xs">
          {partners.title}
        </p>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
          {partnerNames.length === 0 ? (
            <p className="text-center text-sm text-on-surface-variant/60 py-2">Partner announcements coming soon</p>
          ) : (
            <div className="flex gap-16 md:gap-24 w-max animate-marquee">
              {[...partnerNames, ...partnerNames].map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="text-sm md:text-xl font-headline text-primary opacity-50 hover:opacity-100 hover:text-primary-fixed transition-all duration-300 whitespace-nowrap shrink-0"
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-gutter">
          {statItems.map((stat, i) => (
            <div
              key={i}
              className="glass-panel p-6 md:p-10 flex flex-col items-center text-center rounded-2xl border border-outline-variant/20 shadow-2xl hover:border-primary-fixed/30 transition-all duration-500"
              data-aos="zoom-in"
              data-aos-delay={i * 100}
            >
              <span className="material-symbols-outlined text-primary-fixed text-3xl md:text-4xl mb-4 md:mb-6">{stat.icon}</span>
              <h3 className="text-2xl md:text-4xl lg:text-5xl font-headline text-primary-fixed mb-1 md:mb-2 font-black">{stat.value}</h3>
              <p className="text-[8px] md:text-xs lg:label-md text-primary font-bold uppercase tracking-widest leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Remaining sections stay static until wired in CMS */}
      <AttendeeVoices />
      <Speakers />
      <AgendaPreview />
      <Waitlist />
      <FinalCta cta={finalCta} onDonateClick={() => setIsDonationModalOpen(true)} />
      <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
    </main>
  )
}

function AttendeeVoices() {
  const voices = [
    {
      name: 'Fatima Zahra',
      role: 'Software Engineer, Lagos',
      text: "Ummah Tech Fest wasn't just a conference; it was a homecoming. Seeing so many talented Muslim developers in one space changed my career trajectory.",
      img: 'https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?q=80&w=400&auto=format&fit=crop',
      color: 'primary-fixed',
    },
    {
      name: 'Omar Mansour',
      role: 'CTO, Cairo',
      text: 'The quality of technical workshops was world-class. Integrating ethical Islamic values with cutting-edge AI is exactly what the industry needs right now.',
      img: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=400&auto=format&fit=crop',
      color: 'secondary',
    },
    {
      name: 'Kwame Bello',
      role: 'Startup Founder, Nairobi',
      text: 'Winning the hackathon was great, but the connections I made were better. I found my co-founder and secured seed funding within two months.',
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
      color: 'primary-fixed',
    },
  ]
  return (
    <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
      <div className="mb-12 md:mb-16 text-center md:text-left" data-aos="fade-up">
        <h2 className="headline-lg text-primary uppercase">
          Attendee <span className="text-primary-fixed">Voices</span>
        </h2>
        <p className="body-md text-on-surface-variant mt-4 text-sm md:text-base">Real impact from our global community of innovators.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {voices.map((v, i) => (
          <div
            key={i}
            className={`glass-panel p-6 md:p-8 relative rounded-2xl border border-outline-variant/20 ${v.color === 'secondary' ? 'border-l-4 border-l-secondary' : ''}`}
            data-aos="fade-up"
            data-aos-delay={i * 100}
          >
            <span className={`material-symbols-outlined text-${v.color}/10 text-5xl md:text-7xl absolute top-4 right-4`}>format_quote</span>
            <p className="body-lg text-primary italic mb-6 relative z-10 text-base md:text-lg">&ldquo;{v.text}&rdquo;</p>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-variant border border-${v.color}/30 overflow-hidden`}>
                <img alt={v.name} className="w-full h-full object-cover" src={`${v.img}&w=200`} loading="lazy" />
              </div>
              <div>
                <h5 className="label-md text-primary text-xs md:text-sm">{v.name}</h5>
                <p className="text-[8px] md:text-[10px] text-on-surface-variant uppercase tracking-widest">{v.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SpeakerCardSkeleton() {
  return (
    <div className="w-[calc(100vw-64px)] sm:w-[320px] shrink-0 snap-center animate-pulse">
      <div className="kente-border p-1 bg-background">
        <div className="aspect-[4/5] w-full bg-surface-container-high" />
      </div>
    </div>
  )
}

function Speakers() {
  const [speakers, setSpeakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    cmsApi
      .publicSpeakers()
      .then((res) => {
        setSpeakers(res.data || [])
        setLoadError(false)
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  const displaySpeakers = speakers.length > 0 ? speakers : DEFAULT_SPEAKERS

  const scrollBy = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = window.innerWidth < 640 ? window.innerWidth - 64 : 320
    const gap = 24
    el.scrollBy({ left: direction * (cardWidth + gap), behavior: 'smooth' })
  }

  return (
    <section className="py-24 md:py-32 bg-surface-container-low/30 border-y border-outline-variant/10">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="mb-12 max-w-[1008px] lg:mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6" data-aos="fade-up">
          <div className="text-center md:text-left md:max-w-[664px]">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary uppercase mb-4 leading-tight">
              Inspiring Voices, <span className="text-primary-fixed">Real Impact</span>
            </h2>
            <p className="body-md text-on-surface-variant max-w-2xl text-sm md:text-base">
              Connect with entrepreneurs, creators, engineers, and changemakers who are driving innovation across industries. Our speakers share authentic stories, lessons learned, and actionable knowledge to help you grow, build, and lead with purpose.
            </p>
          </div>
          <div className="shrink-0 flex justify-center md:justify-start md:w-[320px]">
            <Link to="/speaker/apply" className="bg-primary-fixed text-on-primary-fixed hover:bg-white hover:text-black transition-colors px-8 py-3 uppercase tracking-widest font-bold text-xs w-full text-center btn-cutout md:py-4 md:text-sm">
              Apply to Speak
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex gap-6 overflow-x-auto pb-8 pt-2 no-scrollbar lg:justify-center">
            <SpeakerCardSkeleton />
            <SpeakerCardSkeleton />
            <SpeakerCardSkeleton />
          </div>
        )}

        {!loading && loadError && (
          <p className="text-center body-md text-on-surface-variant py-8">
            Unable to load speakers right now. Please refresh the page.
          </p>
        )}

        {!loading && !loadError && (
          <div
            ref={scrollRef}
            className={`flex gap-6 overflow-x-auto pb-8 pt-2 snap-x snap-mandatory scroll-smooth no-scrollbar ${
              displaySpeakers.length <= 3 ? 'lg:justify-center' : ''
            }`}
            data-aos="fade-up"
          >
            {displaySpeakers.map((s, i) => {
              const image = s.image || s.img || ''
              return (
                <button
                  key={s.id || i}
                  type="button"
                  onClick={() => setSelectedSpeaker(s)}
                  className="group relative text-left cursor-pointer focus:outline-none w-[calc(100vw-64px)] sm:w-[320px] shrink-0 snap-center"
                  aria-label={`View bio for ${s.name}`}
                >
                  <div className="kente-border p-1 bg-background">
                    <div className="relative overflow-hidden aspect-[4/5] w-full">
                      <SkeletonImage
                        src={image || undefined}
                        alt={s.name}
                        className="w-full h-full"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h4 className="headline-sm text-primary mb-1 group-hover:text-primary-fixed transition-colors duration-300">{s.name}</h4>
                        <p className="label-md text-primary-fixed uppercase tracking-tighter">{s.role}</p>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-8 flex justify-center items-center gap-4" data-aos="fade-up">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="w-11 h-11 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed transition-all duration-300"
            aria-label="Previous speakers"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="w-11 h-11 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed transition-all duration-300"
            aria-label="Next speakers"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <SpeakerBioModal
        isOpen={!!selectedSpeaker}
        onClose={() => setSelectedSpeaker(null)}
        speaker={selectedSpeaker}
      />
    </section>
  )
}

const FALLBACK_AGENDA = [
  { day: '01', title: 'Genesis: Opening Keynote', desc: 'Building Ethical Tech for the Ummah', time: '09:00 AM' },
  { day: '02', title: 'The Hackathon Begins', desc: '24 Hours of Intensive Building', time: 'LIVE NOW', live: true },
  { day: '03', title: 'Future Horizons', desc: 'Awards & Closing Iftar', time: '06:00 PM' },
]

function AgendaPreview() {
  const [items, setItems] = useState(FALLBACK_AGENDA)

  useEffect(() => {
    cmsApi
      .publicSchedule(true)
      .then((res) => {
        if (res.data?.length) {
          setItems(
            res.data.map((a) => ({
              day: a.day || a.day_label,
              title: a.title,
              desc: a.desc || a.subtitle,
              time: a.time || a.time_label,
              live: a.live || a.is_live_highlight,
            })),
          )
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="py-24 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
        <div className="lg:w-1/3 text-center lg:text-left" data-aos="fade-right">
          <h2 className="headline-lg text-primary uppercase mb-6 leading-none">
            The <span className="text-secondary italic">Blueprint</span>
          </h2>
          <p className="body-md text-on-surface-variant mb-8 md:mb-10 text-sm md:text-base">Three days of intensive learning, networking, and spiritual growth in the heart of Accra.</p>
          <Link to="/schedule" className="inline-flex items-center gap-4 text-primary-fixed label-md uppercase tracking-widest group font-bold text-xs md:text-sm">
            Full Schedule
            <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
          </Link>
        </div>
        <div className="lg:w-2/3 space-y-4 px-4 md:px-0" data-aos="fade-left">
          {items.map((a, i) => (
            <div
              key={i}
              className={`glass-panel p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8 group hover:bg-primary-fixed/5 transition-all duration-300 rounded-2xl border border-outline-variant/20 ${a.live ? 'border-l-4 border-l-primary-fixed' : ''}`}
            >
              <div className="flex flex-col items-center">
                <span className="label-md text-primary-fixed uppercase text-[10px]">Day</span>
                <span className="text-2xl md:text-3xl font-headline text-primary">{a.day}</span>
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h4 className="text-base md:text-lg font-headline text-primary group-hover:text-primary-fixed transition-colors">{a.title}</h4>
                <p className="text-xs md:text-sm text-on-surface-variant">{a.desc}</p>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className={`text-[10px] md:label-md ${a.live ? 'text-secondary animate-pulse font-bold' : 'text-on-surface-variant'}`}>{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Waitlist() {
  const [form, setForm] = useState({ full_name: '', email: '', tier_interest: 'general' })
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateWaitlist(form)
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    setError('')
    setSubmitting(true)
    try {
      await outreachApi.submitTicketWaitlist({ ...form, website: honeypot })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to join waitlist. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="tickets" className="py-10 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="text-center lg:text-left" data-aos="fade-up">
          <h2 className="headline-lg text-primary uppercase mb-6">
            Join the <span className="text-primary-fixed">Waitlist</span>
          </h2>
          <p className="body-lg text-on-surface-variant max-w-md mb-8 md:mb-10 mx-auto lg:mx-0 text-sm md:text-base">
            Be the first to know when ticket sales go live.
          </p>
        </div>
        <div className="glass-panel p-6 md:p-10 rounded-3xl border border-outline-variant/30 shadow-2xl relative overflow-hidden" data-aos="zoom-in">
          {submitted ? (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-primary-fixed text-5xl mb-4">check_circle</span>
              <p className="headline-sm text-primary mb-2">You&apos;re on the list</p>
              <p className="body-md text-on-surface-variant">We&apos;ll email you when tickets go on sale.</p>
            </div>
          ) : (
            <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
              <HoneypotField value={honeypot} onChange={setHoneypot} />
              {error && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-sm" role="alert">
                  {error}
                </div>
              )}
              <FormField label="Full name" htmlFor="waitlist-name" required error={fieldErrors.full_name}>
                <FormInput
                  id="waitlist-name"
                  autoComplete="name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  hasError={!!fieldErrors.full_name}
                />
              </FormField>
              <FormField label="Email" htmlFor="waitlist-email" required error={fieldErrors.email}>
                <FormInput
                  id="waitlist-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  hasError={!!fieldErrors.email}
                />
              </FormField>
              <button type="submit" disabled={submitting} className="w-full btn-primary py-4 disabled:opacity-60">
                {submitting ? 'Joining…' : 'Pre-register'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function FinalCta({ cta, onDonateClick }) {
  return (
    <section className="py-10 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-6 md:mb-20">
      <div className="relative bg-primary-fixed p-8 md:p-12 lg:p-16 overflow-hidden rounded-3xl group shadow-[0_20px_50px_rgba(163,250,1,0.3)]">
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-black/5 rounded-full -mr-32 md:-mr-64 -mt-32 md:-mt-64 transition-transform duration-1000 group-hover:scale-125" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-block px-4 md:px-6 py-1 md:py-2 bg-black text-primary-fixed text-[10px] md:label-md rounded-full mb-6 uppercase tracking-widest font-black">
              {cta.badge}
            </div>
            <h2 className="text-3xl md:text-5xl lg:headline-xl text-on-primary-fixed uppercase mb-6 max-w-4xl leading-tight">
              {cta.headline}
            </h2>
            <p className="body-md md:body-lg text-on-primary-fixed-variant mb-8 max-w-2xl font-medium opacity-90 text-sm md:text-base">
              {cta.body}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to={cta.button_url || '/volunteer/apply'}
                className="bg-background text-primary-fixed px-12 md:px-16 py-4 md:py-6 text-base md:headline-sm font-black uppercase tracking-[0.1em] hover:scale-105 transition-all duration-500 shadow-2xl rounded-xl text-center"
              >
                {cta.button_text}
              </Link>
            </div>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-2xl border border-black/10 bg-black/5 backdrop-blur-sm flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-black text-5xl mb-6 opacity-40">volunteer_activism</span>
            <h3 className="headline-sm text-on-primary-fixed uppercase mb-4">Support the Mission</h3>
            <p className="body-md text-on-primary-fixed-variant mb-8 opacity-80">
              Help us provide scholarships, workshops, and community tools. Your contribution drives the future of Muslim Tech.
            </p>
            <button
              onClick={onDonateClick}
              className="w-full bg-black text-primary-fixed py-4 rounded-xl label-md font-black uppercase tracking-widest hover:scale-105 transition-all duration-500"
            >
              Donate Now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
