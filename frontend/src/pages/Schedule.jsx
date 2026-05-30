import { useEffect, useMemo, useState } from 'react'
import { cmsApi } from '../api/client'
import SessionModal from '../components/SessionModal'
import { SCHEDULE_DAY_OPTIONS, SCHEDULE_TRACK_OPTIONS } from '../config/adminOptions'

function toModalSession(s) {
  return {
    id: s.slug,
    time: s.time_label,
    location: s.location || '',
    track: s.track_label || '',
    title: s.title,
    description: s.description || s.subtitle || '',
    outcomes: s.outcomes || [],
    speaker: s.speaker,
  }
}

export default function Schedule() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(1)
  const [activeTrack, setActiveTrack] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    cmsApi
      .publicSchedule()
      .then((res) => setSessions(res.data || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const days = useMemo(() => {
    const fromData = [...new Set(sessions.map((s) => s.event_day))].sort((a, b) => a - b)
    if (fromData.length) return fromData
    return SCHEDULE_DAY_OPTIONS.map((d) => d.value)
  }, [sessions])

  useEffect(() => {
    if (days.length && !days.includes(activeDay)) setActiveDay(days[0])
  }, [days, activeDay])

  const dayMeta = (dayNum) => {
    const sample = sessions.find((s) => s.event_day === dayNum)
    const preset = SCHEDULE_DAY_OPTIONS.find((d) => d.value === dayNum)
    return {
      label: preset?.label || `Day ${dayNum}`,
      date: sample?.day_date_label || '',
    }
  }

  const filtered = useMemo(() => {
    return sessions
      .filter((s) => s.event_day === activeDay)
      .filter((s) => !activeTrack || s.track === activeTrack)
      .sort((a, b) => {
        const t = a.starts_at_time.localeCompare(b.starts_at_time)
        return t !== 0 ? t : a.sort_order - b.sort_order
      })
  }, [sessions, activeDay, activeTrack])

  const groupedByTime = useMemo(() => {
    const map = new Map()
    filtered.forEach((s) => {
      const key = s.starts_at_time
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(s)
    })
    return [...map.entries()]
  }, [filtered])

  const openSession = (s) => {
    if (s.item_type === 'break') return
    setSelectedSession(toModalSession(s))
    setIsModalOpen(true)
  }

  const trackFilters = SCHEDULE_TRACK_OPTIONS.filter((t) => t.value)

  return (
    <main className="pt-24 md:pt-32 pb-20">
      <SessionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} session={selectedSession} />

      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-12 md:mb-16" data-aos="fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0">
            <span className="label-md text-secondary tracking-widest uppercase mb-4 block text-xs md:text-sm">Event Timeline</span>
            <h1 className="text-4xl md:headline-xl text-primary mb-6">
              Summit <span className="text-primary-fixed">Agenda</span>
            </h1>
            <p className="body-md md:body-lg text-on-surface-variant px-4 md:px-0">
              Three days of deep dives into ethical technology, Ghanaian innovation, and the global Muslim tech ecosystem.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <button
              type="button"
              onClick={() => setActiveTrack('')}
              className={`px-4 md:px-5 py-2 rounded-lg label-md text-xs ${
                !activeTrack ? 'bg-primary-fixed text-on-primary-fixed shadow-lg' : 'glass-panel hover:border-primary-fixed'
              }`}
            >
              All Tracks
            </button>
            {trackFilters.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setActiveTrack(t.value)}
                className={`px-4 md:px-5 py-2 rounded-lg label-md text-xs ${
                  activeTrack === t.value ? 'bg-primary-fixed text-on-primary-fixed' : 'glass-panel hover:border-primary-fixed'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 flex border-b border-outline-variant/30 overflow-x-auto no-scrollbar">
          {days.map((d) => {
            const meta = dayMeta(d)
            return (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDay(d)}
                className={`px-6 md:px-8 py-4 headline-sm whitespace-nowrap text-lg md:text-2xl ${
                  activeDay === d
                    ? 'text-primary-fixed border-b-4 border-primary-fixed'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {meta.label}
                {meta.date && (
                  <span className="block label-md text-on-surface-variant text-[10px] md:text-sm">{meta.date}</span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-8 md:space-y-12">
        {loading && <p className="body-md text-on-surface-variant text-center">Loading schedule…</p>}

        {!loading && filtered.length === 0 && (
          <div className="glass-panel p-10 rounded-2xl text-center">
            <p className="body-md text-on-surface-variant">No sessions published for this day yet. Check back soon.</p>
          </div>
        )}

        {groupedByTime.map(([timeKey, block]) => (
          <div key={timeKey} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-12" data-aos="fade-up">
            <div className="md:pt-2 flex md:flex-col items-baseline md:items-start gap-2">
              <span className="text-2xl md:headline-sm text-primary">{timeKey}</span>
              <span className="label-md text-on-surface-variant uppercase text-[10px] md:text-sm tracking-widest">GMT</span>
            </div>
            <div className="space-y-4">
              {block.map((s) =>
                s.item_type === 'break' ? (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 md:gap-6 py-6 border-y border-outline-variant/10 bg-surface-container/20 px-6 md:px-8 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl">restaurant</span>
                    <span className="text-[10px] md:label-md text-secondary uppercase tracking-[0.2em] font-bold">
                      {s.title}
                    </span>
                  </div>
                ) : (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openSession(s)}
                    onKeyDown={(e) => e.key === 'Enter' && openSession(s)}
                    className={`glass-panel p-6 md:p-8 rounded-xl flex flex-col gap-4 cursor-pointer hover:bg-surface-container/60 transition-colors border border-outline-variant/20 ${
                      s.is_live_highlight ? 'border-l-4 border-l-primary-fixed' : 'border-l-2 border-l-outline-variant/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      {s.track_label && (
                        <span className="bg-primary-fixed/20 text-primary-fixed px-3 py-1 rounded text-[10px] font-bold uppercase">
                          {s.track_label}
                        </span>
                      )}
                      {s.is_live_highlight && (
                        <span className="flex items-center gap-1 text-secondary text-[10px] font-bold uppercase animate-pulse">
                          <span className="material-symbols-outlined text-sm">podcasts</span>
                          Live
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl md:headline-md text-primary">{s.title}</h3>
                    {s.subtitle && <p className="text-sm md:body-md text-on-surface-variant">{s.subtitle}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {s.speaker?.name && (
                        <div className="flex items-center gap-3">
                          {s.speaker.image && (
                            <img src={s.speaker.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                          )}
                          <div>
                            <p className="text-xs md:label-md text-primary font-bold">{s.speaker.name}</p>
                            <p className="text-[10px] text-on-surface-variant">{s.speaker.role}</p>
                          </div>
                        </div>
                      )}
                      <span className="text-sm text-on-surface-variant">{s.time_label}</span>
                    </div>
                    {s.location && (
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span className="text-[10px] md:label-md">{s.location}</span>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
