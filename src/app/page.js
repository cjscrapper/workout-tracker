'use client';

import { useState, useEffect } from 'react';
import { PLAN, WEEKDAYS } from './plan';

const todayKey = () => new Date().toISOString().split('T')[0];

// Light theme colors
const T = {
  bg: '#F5F5F0',
  surface: '#FFFFFF',
  surface2: '#EFEFEA',
  border: '#E0DED8',
  text: '#1A1A1A',
  textSecondary: '#555550',
  textMuted: '#999990',
};

export default function WorkoutTracker() {
  const [activeDay, setActiveDay] = useState('Day 1');
  const [logs, setLogs] = useState({});
  const [sessionDate, setSessionDate] = useState(todayKey());
  const [sessionData, setSessionData] = useState({});
  const [view, setView] = useState('plan');
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [coachQuestion, setCoachQuestion] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);
  const [cardio, setCardio] = useState({ treadmill: { mins: '', speed: '', incline: '' }, sauna: { mins: '' } });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wt_logs') || '{}');
      setLogs(saved);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('wt_logs', JSON.stringify(logs));
  }, [logs]);

  const day = PLAN[activeDay];

  const initSession = () => {
    const initial = {};
    day.exercises.forEach((ex, ei) => {
      initial[ei] = Array.from({ length: ex.sets }, (_, si) => ({
        weight: ex.startWeight > 0 ? ex.startWeight + si * 5 : '',
        reps: ex.targetReps,
        done: false,
      }));
    });
    setSessionData(initial);
    setCardio({ treadmill: { mins: '', speed: '', incline: '' }, sauna: { mins: '' } });
    setView('log');
  };

  const updateSet = (ei, si, field, value) => {
    setSessionData(prev => {
      const updated = { ...prev };
      updated[ei] = [...(updated[ei] || [])];
      updated[ei][si] = { ...updated[ei][si], [field]: value };
      return updated;
    });
  };

  const updateCardio = (type, field, value) => {
    setCardio(prev => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };

  const saveSession = () => {
    const key = `${sessionDate}_${activeDay}`;
    const exerciseNames = {};
    day.exercises.forEach((ex, ei) => { exerciseNames[ei] = ex.name; });
    setLogs(prev => ({
      ...prev,
      [key]: {
        day: activeDay,
        label: day.label,
        date: sessionDate,
        data: sessionData,
        exercises: exerciseNames,
        cardio: cardio,
      }
    }));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const totalVolume = (data) => {
    if (!data) return 0;
    return Object.values(data).flat().reduce(
      (sum, s) => sum + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0
    );
  };

  const askCoach = async () => {
    if (!coachQuestion.trim()) return;
    setCoachLoading(true);
    setCoachResponse('');
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs, question: coachQuestion }),
      });
      const data = await res.json();
      setCoachResponse(data.assessment || data.error || 'No response.');
    } catch {
      setCoachResponse('Failed to reach coach. Check your connection.');
    }
    setCoachLoading(false);
  };

  const historyEntries = Object.entries(logs).sort((a, b) => b[0].localeCompare(a[0]));

  const btnStyle = (active, color) => ({
    background: active ? color : 'transparent',
    color: active ? '#fff' : T.textMuted,
    border: `1px solid ${active ? color : T.border}`,
    borderRadius: 6,
    padding: '6px 13px',
    fontSize: 11,
    letterSpacing: 1.5,
    cursor: 'pointer',
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
    fontWeight: active ? 500 : 400,
  });

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Mono', monospace", color: T.text }}>

      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${T.border}`, padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: T.bg, zIndex: 10,
      }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 3, color: day.color }}>
            SMACK LIFTS
          </div>
          <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 2, marginTop: -2 }}>5-DAY PROGRAM</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['plan', 'log', 'coach', 'history'].map(v => (
            <button key={v} onClick={() => setView(v)} style={btnStyle(view === v, day.color)}>{v}</button>
          ))}
        </div>
      </div>

      {/* Day Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.surface, overflowX: 'auto' }}>
        {Object.entries(PLAN).map(([key, d], i) => (
          <button key={key} onClick={() => { setActiveDay(key); setSessionData({}); setView('plan'); }} style={{
            flex: 1, minWidth: 64, padding: '12px 6px', background: 'transparent', border: 'none',
            borderBottom: activeDay === key ? `3px solid ${d.color}` : '3px solid transparent',
            color: activeDay === key ? d.color : T.textMuted, cursor: 'pointer',
            fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 1,
          }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 17, letterSpacing: 1 }}>{WEEKDAYS[i]}</div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, marginTop: 2 }}>{d.label.toUpperCase()}</div>
          </button>
        ))}
      </div>

      <div style={{ padding: '16px', maxWidth: 580, margin: '0 auto' }}>

        {/* PLAN VIEW */}
        {view === 'plan' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, letterSpacing: 2, color: day.color, lineHeight: 1 }}>
                {activeDay}: {day.label}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 2, marginTop: 4 }}>{day.subtitle}</div>
            </div>

            {day.exercises.map((ex, i) => (
              <div key={i} onClick={() => setExpandedExercise(expandedExercise === i ? null : i)}
                style={{
                  background: T.surface,
                  border: `1px solid ${expandedExercise === i ? day.color : T.border}`,
                  borderRadius: 10, marginBottom: 8, overflow: 'hidden', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{ex.name}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3, letterSpacing: 1 }}>
                      {ex.sets} sets · {ex.targetReps}{ex.name.includes('Treadmill') ? ' min' : ' reps'} · {ex.startWeight > 0 ? `from ${ex.startWeight}lbs` : 'bodyweight'}
                    </div>
                  </div>
                  <div style={{ color: day.color, fontSize: 20, minWidth: 16 }}>{expandedExercise === i ? '−' : '+'}</div>
                </div>
                {expandedExercise === i && (
                  <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 11, color: T.textSecondary, marginTop: 12, lineHeight: 1.7 }}>{ex.note}</div>
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {Array.from({ length: ex.sets }, (_, si) => (
                        <div key={si} style={{ background: T.surface2, borderRadius: 6, padding: '8px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: 8, color: T.textMuted, letterSpacing: 1 }}>SET {si + 1}</div>
                          <div style={{ fontSize: 14, color: day.color, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>
                            {ex.startWeight > 0 ? `${ex.startWeight + si * 5}` : 'BW'}
                          </div>
                          <div style={{ fontSize: 9, color: T.textMuted }}>{ex.targetReps}r</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: 16, padding: '14px 16px', background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 2 }}>SESSION STRUCTURE</div>
              <div style={{ marginTop: 8, fontSize: 12, color: T.textSecondary, lineHeight: 2 }}>
                <span style={{ color: day.color }}>▸</span> 5 min treadmill warm-up<br />
                <span style={{ color: day.color }}>▸</span> Lifting ~30 min<br />
                <span style={{ color: day.color }}>▸</span> Treadmill 10–15 min {activeDay === 'Day 5' ? '(25 min today)' : ''}<br />
                <span style={{ color: day.color }}>▸</span> Sauna optional 10 min
              </div>
            </div>

            <div style={{ marginTop: 10, padding: '14px 16px', background: T.surface2, borderRadius: 10, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 2, marginBottom: 8 }}>PROGRESSIVE OVERLOAD</div>
              <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.9 }}>
                <span style={{ color: day.color }}>→</span> Hit all sets at target reps → add 5lbs (upper) / 10lbs (lower)<br />
                <span style={{ color: day.color }}>→</span> Miss by &gt;2 reps → repeat same weight next session
              </div>
            </div>

            <button onClick={initSession} style={{
              marginTop: 16, width: '100%', padding: '16px',
              background: day.color, color: '#fff', border: 'none', borderRadius: 10,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, cursor: 'pointer',
              boxShadow: `0 4px 14px ${day.color}44`,
            }}>
              START SESSION →
            </button>
          </div>
        )}

        {/* LOG VIEW */}
        {view === 'log' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2, color: day.color }}>
                  LOG: {day.label}
                </div>
                <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
                  style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.textSecondary, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontFamily: "'DM Mono'", marginTop: 4 }} />
              </div>
              {Object.keys(sessionData).length === 0 && (
                <button onClick={initSession} style={{
                  background: 'transparent', border: `1px solid ${day.color}`, color: day.color,
                  padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontFamily: "'DM Mono'", letterSpacing: 1
                }}>INIT SETS</button>
              )}
            </div>

            {day.exercises.map((ex, ei) => (
              <div key={ei} style={{ marginBottom: 12, background: T.surface, borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '11px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{ex.name}</div>
                  <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 1 }}>×{ex.targetReps} REPS</div>
                </div>
                <div style={{ padding: '10px 16px' }}>
                  {(sessionData[ei] || []).map((set, si) => (
                    <div key={si} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 36px', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 1 }}>S{si + 1}</div>
                      <div style={{ position: 'relative' }}>
                        <input type="number" value={set.weight} onChange={e => updateSet(ei, si, 'weight', e.target.value)} placeholder="lbs"
                          style={{ width: '100%', background: set.done ? `${day.color}12` : T.surface2, border: `1px solid ${set.done ? day.color : T.border}`, color: T.text, padding: '8px 10px', borderRadius: 6, fontSize: 14, fontFamily: "'DM Mono'", boxSizing: 'border-box' }} />
                        <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 8, color: T.textMuted }}>LBS</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input type="number" value={set.reps} onChange={e => updateSet(ei, si, 'reps', e.target.value)} placeholder="reps"
                          style={{ width: '100%', background: set.done ? `${day.color}12` : T.surface2, border: `1px solid ${set.done ? day.color : T.border}`, color: T.text, padding: '8px 10px', borderRadius: 6, fontSize: 14, fontFamily: "'DM Mono'", boxSizing: 'border-box' }} />
                        <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 8, color: T.textMuted }}>REPS</span>
                      </div>
                      <button onClick={() => updateSet(ei, si, 'done', !set.done)} style={{
                        width: 36, height: 36, borderRadius: 6, border: `1px solid ${set.done ? day.color : T.border}`,
                        background: set.done ? day.color : T.surface2, color: set.done ? '#fff' : T.textMuted,
                        cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>✓</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}


            {/* CARDIO + SAUNA */}
            <div style={{ marginTop: 12, background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 2 }}>CARDIO + RECOVERY</div>
              </div>
              <div style={{ padding: '12px 16px' }}>

                {/* Treadmill */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.text, marginBottom: 8 }}>Treadmill</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <input type="number" value={cardio.treadmill.mins} onChange={e => updateCardio('treadmill', 'mins', e.target.value)} placeholder="0"
                        style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, color: T.text, padding: '8px 10px', borderRadius: 6, fontSize: 14, fontFamily: "'DM Mono'", boxSizing: 'border-box' }} />
                      <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 8, color: T.textMuted }}>MIN</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input type="number" step="0.1" value={cardio.treadmill.speed} onChange={e => updateCardio('treadmill', 'speed', e.target.value)} placeholder="0.0"
                        style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, color: T.text, padding: '8px 10px', borderRadius: 6, fontSize: 14, fontFamily: "'DM Mono'", boxSizing: 'border-box' }} />
                      <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 8, color: T.textMuted }}>MPH</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input type="number" step="0.5" value={cardio.treadmill.incline} onChange={e => updateCardio('treadmill', 'incline', e.target.value)} placeholder="0"
                        style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, color: T.text, padding: '8px 10px', borderRadius: 6, fontSize: 14, fontFamily: "'DM Mono'", boxSizing: 'border-box' }} />
                      <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 8, color: T.textMuted }}>%</span>
                    </div>
                  </div>
                </div>

                {/* Sauna */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.text, marginBottom: 8 }}>Sauna</div>
                  <div style={{ width: '33%' }}>
                    <div style={{ position: 'relative' }}>
                      <input type="number" value={cardio.sauna.mins} onChange={e => updateCardio('sauna', 'mins', e.target.value)} placeholder="0"
                        style={{ width: '100%', background: T.surface2, border: `1px solid ${T.border}`, color: T.text, padding: '8px 10px', borderRadius: 6, fontSize: 14, fontFamily: "'DM Mono'", boxSizing: 'border-box' }} />
                      <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 8, color: T.textMuted }}>MIN</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div style={{ marginTop: 6, padding: '12px 16px', background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 1 }}>SESSION VOLUME</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: day.color, letterSpacing: 2 }}>
                {totalVolume(sessionData).toLocaleString()} LBS
              </div>
            </div>

            <button onClick={saveSession} style={{
              marginTop: 10, width: '100%', padding: '16px',
              background: savedFlash ? '#27AE60' : day.color, color: '#fff', border: 'none', borderRadius: 10,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, cursor: 'pointer',
              transition: 'background 0.3s', boxShadow: `0 4px 14px ${day.color}44`,
            }}>
              {savedFlash ? 'SAVED ✓' : 'SAVE SESSION'}
            </button>
          </div>
        )}

        {/* COACH VIEW */}
        {view === 'coach' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, letterSpacing: 2, color: day.color }}>AI COACH</div>
              <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 2 }}>POWERED BY CLAUDE</div>
            </div>

            <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 9, color: T.textMuted, letterSpacing: 2, marginBottom: 10 }}>QUICK QUESTIONS</div>
              {[
                'Am I ready to increase weight on any exercises?',
                'Which muscle groups need more attention?',
                'How is my overall progress looking?',
                'Any form cues I should focus on?',
              ].map(q => (
                <button key={q} onClick={() => setCoachQuestion(q)} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: coachQuestion === q ? `${day.color}12` : T.surface2,
                  border: `1px solid ${coachQuestion === q ? day.color : T.border}`,
                  borderRadius: 6, color: coachQuestion === q ? day.color : T.textSecondary,
                  padding: '10px 12px', marginBottom: 6, cursor: 'pointer', fontSize: 12, fontFamily: "'DM Mono'",
                }}>{q}</button>
              ))}
            </div>

            <div style={{ marginBottom: 10 }}>
              <textarea
                value={coachQuestion}
                onChange={e => setCoachQuestion(e.target.value)}
                placeholder="Or ask anything about your workouts..."
                rows={3}
                style={{
                  width: '100%', background: T.surface, border: `1px solid ${T.border}`, color: T.text,
                  padding: '12px', borderRadius: 10, fontSize: 13, fontFamily: "'DM Mono'",
                  resize: 'none', boxSizing: 'border-box', outline: 'none',
                }}
              />
            </div>

            <button onClick={askCoach} disabled={coachLoading || !coachQuestion.trim()} style={{
              width: '100%', padding: '16px',
              background: coachLoading ? T.border : day.color,
              color: coachLoading ? T.textMuted : '#fff',
              border: 'none', borderRadius: 10,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3,
              cursor: coachLoading ? 'not-allowed' : 'pointer',
              boxShadow: coachLoading ? 'none' : `0 4px 14px ${day.color}44`,
            }}>
              {coachLoading ? 'THINKING...' : 'ASK COACH →'}
            </button>

            {coachResponse && (
              <div style={{ marginTop: 16, background: T.surface, borderRadius: 10, border: `1px solid ${day.color}`, padding: '16px', boxShadow: `0 2px 12px ${day.color}22` }}>
                <div style={{ fontSize: 9, color: day.color, letterSpacing: 2, marginBottom: 10 }}>COACH RESPONSE</div>
                <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{coachResponse}</div>
              </div>
            )}

            {Object.keys(logs).length === 0 && (
              <div style={{ marginTop: 12, padding: '12px', background: T.surface2, borderRadius: 10, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.7 }}>
                  Log a few sessions first for personalized coaching. The AI coach analyzes your actual workout data to give specific recommendations.
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY VIEW */}
        {view === 'history' && (
          <div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 34, letterSpacing: 2, color: day.color, marginBottom: 20 }}>
              HISTORY
            </div>
            {historyEntries.length === 0 ? (
              <div style={{ color: T.textMuted, fontSize: 13, textAlign: 'center', padding: 40 }}>No sessions logged yet.</div>
            ) : historyEntries.map(([key, entry]) => (
              <div key={key} style={{ marginBottom: 10, background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{entry.day}: {PLAN[entry.day]?.label || entry.label}</div>
                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3, letterSpacing: 1 }}>{entry.date}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: PLAN[entry.day]?.color || '#888', letterSpacing: 2, textAlign: 'right' }}>
                      {totalVolume(entry.data).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 8, color: T.textMuted, textAlign: 'right', letterSpacing: 1 }}>LBS VOLUME</div>
                  </div>
                </div>
                {entry.cardio && (entry.cardio.treadmill?.mins || entry.cardio.sauna?.mins) && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    {entry.cardio.treadmill?.mins && (
                      <div style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, background: T.surface2, border: `1px solid ${T.border}`, color: T.textSecondary }}>
                        🚶 {entry.cardio.treadmill.mins}min {entry.cardio.treadmill.speed && `· ${entry.cardio.treadmill.speed}mph`} {entry.cardio.treadmill.incline && `· ${entry.cardio.treadmill.incline}%`}
                      </div>
                    )}
                    {entry.cardio.sauna?.mins && (
                      <div style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, background: T.surface2, border: `1px solid ${T.border}`, color: T.textSecondary }}>
                        🧖 {entry.cardio.sauna.mins}min sauna
                      </div>
                    )}
                  </div>
                )}
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {Object.entries(entry.data).map(([ei, sets]) => {
                    const exName = entry.exercises?.[ei] || PLAN[entry.day]?.exercises[ei]?.name || `Ex ${parseInt(ei)+1}`;
                    const completed = sets.filter(s => s.done).length;
                    const color = PLAN[entry.day]?.color || '#888';
                    return (
                      <div key={ei} style={{
                        fontSize: 9, letterSpacing: 1, padding: '4px 8px', borderRadius: 4,
                        background: completed === sets.length ? `${color}15` : T.surface2,
                        border: `1px solid ${completed === sets.length ? color : T.border}`,
                        color: completed === sets.length ? color : T.textMuted,
                      }}>
                        {exName.split(' ').slice(0, 2).join(' ').toUpperCase()} {completed}/{sets.length}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
