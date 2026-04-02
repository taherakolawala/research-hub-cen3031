import { useEffect, useState } from 'react';
import { Mail, GraduationCap, Clock } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../lib/api';
import type { ActiveResearcher, Participant } from '../../types';
import './lab-roster.css';

function initials(first?: string, last?: string): string {
  const a = (first?.[0] || '').toUpperCase();
  const b = (last?.[0] || '').toUpperCase();
  return (a + b) || '?';
}

function formatJoined(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function LabRoster() {
  const [activeResearchers, setActiveResearchers] = useState<ActiveResearcher[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.pis.roster()
      .then((data) => {
        setActiveResearchers(data.activeResearchers);
        setParticipants(data.participants);
      })
      .catch(() => {
        setActiveResearchers([]);
        setParticipants([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="lr-container">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-48" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="lr-container">
        <header className="lr-header">
          <h1 className="lr-title">Lab Roster</h1>
          <p className="lr-subtitle">
            {activeResearchers.length} active researcher{activeResearchers.length !== 1 ? 's' : ''}
            {participants.length > 0 && ` · ${participants.length} participant${participants.length !== 1 ? 's' : ''}`}
          </p>
        </header>

        {activeResearchers.length === 0 && participants.length === 0 ? (
          <div className="lr-empty">
            <p>No lab members yet. Members appear here after you accept their applications.</p>
          </div>
        ) : (
          <>
            {activeResearchers.length > 0 && (
              <section>
                <h2 className="lr-section-title">Active Researchers</h2>
                <div className="lr-cards">
                  {activeResearchers.map((r) => {
                    const name = [r.firstName, r.lastName].filter(Boolean).join(' ') || 'Student';
                    const metaParts = [
                      r.major?.trim(),
                      r.yearLevel,
                      r.graduationYear ? `Class of ${r.graduationYear}` : '',
                    ].filter(Boolean);
                    const metaLine = metaParts.join(' · ');

                    return (
                      <div key={r.applicationId} className="lr-card">
                        <div className="lr-card-header">
                          <div className="lr-card-avatar">{initials(r.firstName, r.lastName)}</div>
                          <div className="lr-card-info">
                            <div className="lr-card-name">{name}</div>
                            <div className="lr-card-meta">
                              <GraduationCap size={14} strokeWidth={2} />
                              <span>{metaLine || '—'}</span>
                            </div>
                          </div>
                          <div className="lr-card-position">{r.positionTitle}</div>
                        </div>
                        <div className="lr-card-body">
                          {r.gpa != null && (
                            <span className="lr-card-gpa">GPA: {Number(r.gpa).toFixed(2)}</span>
                          )}
                          {r.bio?.trim() && <p className="lr-card-bio">{r.bio}</p>}
                          {(r.skills || []).length > 0 && (
                            <div className="lr-card-chips">
                              {(r.skills || []).map((sk) => (
                                <span key={sk} className="lr-chip">{sk}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="lr-card-footer">
                          <div />
                          <div className="lr-card-actions">
                            <span className="lr-card-joined">Joined {formatJoined(r.joinedAt)}</span>
                            {r.email && (
                              <a href={`mailto:${r.email}`} className="lr-card-email">
                                <Mail size={14} strokeWidth={2} />
                                <span>{r.email}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {participants.length > 0 && (
              <section>
                <h2 className="lr-section-title">Study Participants</h2>
                <div className="lr-cards">
                  {participants.map((p) => {
                    const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Participant';
                    const metaParts = [
                      p.major?.trim(),
                      p.yearLevel,
                    ].filter(Boolean);
                    const metaLine = metaParts.join(' · ');

                    return (
                      <div key={p.participantId} className="lr-card">
                        <div className="lr-card-header">
                          <div className="lr-card-avatar">{initials(p.firstName, p.lastName)}</div>
                          <div className="lr-card-info">
                            <div className="lr-card-name">{name}</div>
                            <div className="lr-card-meta">
                              <GraduationCap size={14} strokeWidth={2} />
                              <span>{metaLine || '—'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="lr-card-body">
                          {p.gpa != null && (
                            <span className="lr-card-gpa">GPA: {Number(p.gpa).toFixed(2)}</span>
                          )}
                          {p.hoursPerWeek != null && (
                            <span className="lr-card-hours">
                              <Clock size={14} strokeWidth={2} />
                              {p.hoursPerWeek}h/week
                            </span>
                          )}
                          {(p.availableDays || []).length > 0 && (
                            <div className="lr-card-chips">
                              {(p.availableDays || []).map((d) => (
                                <span key={d} className="lr-chip">{d}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="lr-card-footer">
                          <div />
                          {p.email && (
                            <a href={`mailto:${p.email}`} className="lr-card-email">
                              <Mail size={14} strokeWidth={2} />
                              <span>{p.email}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
