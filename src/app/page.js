'use client';

import { useState, useEffect } from 'react';
import { PLAN, WEEKDAYS } from './plan';

const todayKey = () => new Date().toISOString().split('T')[0];

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
      initial[ei] = Array.from({ length: ex.sets }, () => ({
        weight: ex.startWeight || '',
        reps: ex.targetReps,
        done: false,
      }));
    });
    setSessionData(initial);
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
    color: active ? '#000' : '#555',
    border: `1px solid ${active ? color : '#222'}`,
    borderRadius: 4,
    padding: '5px 12px',
    fontSize: 10,
    letterSpacing: 1.5,
    cursor: 'pointer',
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: "'DM Mono', monospace", color: '#E8E4DC' }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1E1E1E', padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: '#0A0A0A', zIndex: 10,
      }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 3, color: day.color }}>
            SMACK LIFTS
          </div>
          <div style={{ fontSize: 9, color: '#444', letterSpacing: 2, marginTop: -2 }}>5-DAY PROGRAM</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['plan', 'log', 'coach', 'history'].map(v => (
            <button key={v} onClick={() => setView(v)} style={btnStyle(view === v, day.color)}>{v}</button>
          ))}
        </div>
      </div>

      {/* Day Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1E1E1E', overflowX: 'auto' }}>
        {Object.entries(PLAN).map(([key, d], i) => (
          <button key={key} onClick={() => { setActiveDay(key); setSessionData({}); setView('plan'); }} style={{
            flex: 1, minWidth: 64, padding: '12px 6px', background: 'transparent', border: 'none',
            borderBottom: activeDay === key ? `3px solid ${d.color}` : '3px solid transparent',
            color: activeDay === key ? d.color : '#333', cursor: 'pointer',
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
              <div style={{ fontSize: 10, color: '#555', letterSpacing: 2, marginTop: 4 }}>{day.subtitle}</div>
            </div>

            {day.exercises.map((ex, i) => (
              <div key={i} onClick={() => setExpandedExercise(expandedExercise === i ? null : i)}
                style={{
                  background: '#111', border: `1px solid ${expandedExercise === i ? day.color : '#1A1A1A'}`,
                  borderRadius: 8, marginBottom: 8, overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s',
                }}>
                <div style={{ padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#E8E4DC' }}>{ex.name}</div>
                    <div style={{ fontSize: 9, color: '#555', marginTop: 3, letterSpacing: 1 }}>
                      {ex.sets} sets · {ex.targetReps}{ex.name.includes('Treadmill') ? ' min' : ' reps'} · {ex.startWeight > 0 ? `from ${ex.startWeight}lbs` : 'bodyweight'}
                    </div>
                  </div>
                  <div style={{ color: day.color, fontSize: 18, minWidth: 16 }}>{expandedExercise === i ? '−' : '+'}</div>
                </div>
                {expandedExercise === i && (
                  <div style={{ padding: '0 16px 14px', borderTop: '1px solid #1A1A1A' }}>
                    <div style={{ fontSize: 11, color: '#777', marginTop: 12, lineHeight: 1.7 }}>{ex.note}</div>
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {Array.from({ length: ex.sets }, (_, si) => (
                        <div key={si} style={{ background: '#0A0A0A', borderRadius: 4, padding: '8px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: 8, color: '#444', letterSpacing: 1 }}>SET {si + 1}</div>
                          <div style={{ fontSize: 13, color: day.color, fontFamily: "'Bebas Neue'", letterSpacing: 1 }}>
                            {ex.startWeight > 0 ? `${ex.startWeight + si * 5}` : 'BW'}
                          </div>
                          <div style={{ fontSize: 9, color: '#555' }}>{ex.targetReps}r</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: 16, padding: '14px 16px', background: '#111', borderRadius: 8, border: '1px solid #1A1A1A' }}>
              <div style={{ fontSize: 9, color: '#444', letterSpacing: 2 }}>SESSION STRUCTURE</div>
              <div style={{ marginTop: 8, fontSize: 11, color: '#666', lineHeight: 2 }}>
                <span style={{ color: day.color }}>▸</span> 5 min treadmill warm-up<br />
                <span style={{ color: day.color }}>▸</span> Lifting ~30 min<br />
                <span style={{ color: day.color }}>▸</span> Treadmill 10–15 min {activeDay === 'Day 5' ? '(25 min today)' : ''}<br />
                <span style={{ color: day.color }}>▸</span> Sauna optional 10 min
              </div>
            </div>

            <div style={{ marginTop: 12, padding: '14px 16px', background: '#0D0D0D', borderRadius: 8, border: '1px solid #1A1A1A' }}>
              <div style={{ fontSize: 9, color: '#444', letterSpacing: 2, marginBottom: 8 }}>PROGRESSIVE OVERLOAD</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.9 }}>
                <span style={{ color: day.color }}>→</span> Hit all sets at target reps → add 5lbs (upper) / 10lbs (lower)<br />
                <span style={{ color: day.color }}>→</span> Miss by &gt;2 reps → repeat same weight next session
              </div>
            </div>

            <button onClick={initSession} style={{
              marginTop: 16, width: '100%', padding: '15px',
              background: day.color, color: '#000', border: 'none', borderRadius: 8,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 3, cursor: 'pointer',
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
                  style={{ background: 'transparent', border: '1px solid #222', color: '#666', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontFamily: "'DM Mono'", marginTop: 4 }} />
              </div>
              {Object.keys(sessionData).length === 0 && (
                <button onClick={initSession} style={{
                  background: 'transparent', border: `1px solid ${day.color}`, color: day.color,
                  padding: '8px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontFamily: "'DM Mono'", letterSpacing: 1
                }}>INIT SETS</button>
              )}
            </div>

            {day.exercises.map((ex, ei) => (
              <div key={ei} style={{ marginBottom: 12, background: '#111', borderRadius: 8, overflow: 'hidden', border: '1px solid #1A1A1A' }}>
                <div style={{ padding: '11px 16px', borderBottom: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 12, color: '#E8E4DC' }}>{ex.name}</div>
                  <div style={{ fontSize: 9, color: '#444', letterSpacing: 1 }}>×{ex.targetReps} REPS</div>
                </div>
                <div style={{ padding: '10px 16px' }}>
                  {(sessionData[ei] || []).map((set, si) => (
                    <div key={si} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 34px', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 9, color: '#444', letterSpacing: 1 }}>S{si + 1}</div>
                      <div style={{ position: 'relative' }}>
                        <input type="number" value={set.weight} onChange={e => updateSet(ei, si, 'weight', e.target.value)} placeholder="lbs"
                          style={{ width: '100%', background: '#0A0A0A', border: `1px solid ${set.done ? day.color : '#222'}`, color: '#E8E4DC', padding: '7px 10px', borderRadius: 4, fontSize: 13, fontFamily: "'DM Mono'", boxSizing: 'border-box' }} />
                        <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 8, color: '#333' }}>LBS</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input type="number" value={set.reps} onChange={e => updateSet(ei, si, 'reps', e.target.value)} placeholder="reps"
                          style={{ width: '100%', background: '#0A0A0A', border: `1px solid ${set.done ? day.color : '#222'}`, color: '#E8E4DC', padding: '7px 10px', borderRadius: 4, fontSize: 13, fontFamily: "'DM Mono'", boxSizing: 'border-box' }} />
                        <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', fontSize: 8, color: '#333' }}>REPS</span>
                      </div>
                      <button onClick={() => updateSet(ei, si, 'done', !set.done)} style={{
                        width: 34, height: 34, borderRadius: 4, border: `1px solid ${set.done ? day.color : '#222'}`,
                        background: set.done ? day.color : 'transparent', color: set.done ? '#000' : '#333',
                        cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>✓</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 6, padding: '11px 16px', background: '#111', borderRadius: 8, border: '1px solid #1A1A1A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#444', letterSpacing: 1 }}>SESSION VOLUME</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: day.color, letterSpacing: 2 }}>
                {totalVolume(sessionData).toLocaleString()} LBS
              </div>
            </div>

            <button onClick={saveSession} style={{
              marginTop: 10, width: '100%', padding: '15px',
              background: savedFlash ? '#27AE60' : day.color, color: '#000', border: 'none', borderRadius: 8,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 3, cursor: 'pointer', transition: 'background 0.3s',
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
              <div style={{ fontSize: 10, color: '#555', letterSpacing: 2 }}>POWERED BY CLAUDE</div>
            </div>

            <div style={{ background: '#111', borderRadius: 8, border: '1px solid #1A1A1A', padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 9, color: '#444', letterSpacing: 2, marginBottom: 10 }}>QUICK QUESTIONS</div>
              {[
                'Am I ready to increase weight on any exercises?',
                'Which muscle groups need more attention?',
                'How is my overall progress looking?',
                'Any form cues I should focus on?',
              ].map(q => (
                <button key={q} onClick={() => setCoachQuestion(q)} style={{
                  display: 'block', width: '100%', textAlign: 'left', background: coachQuestion === q ? `${day.color}22` : 'transparent',
                  border: `1px solid ${coachQuestion === q ? day.color : '#1A1A1A'}`, borderRadius: 4, color: coachQuestion === q ? day.color : '#555',
                  padding: '9px 12px', marginBottom: 6, cursor: 'pointer', fontSize: 11, fontFamily: "'DM Mono'",
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
                  width: '100%', background: '#111', border: '1px solid #1A1A1A', color: '#E8E4DC',
                  padding: '12px', borderRadius: 8, fontSize: 12, fontFamily: "'DM Mono'",
                  resize: 'none', boxSizing: 'border-box', outline: 'none',
                }}
              />
            </div>

            <button onClick={askCoach} disabled={coachLoading || !coachQuestion.trim()} style={{
              width: '100%', padding: '15px', background: coachLoading ? '#222' : day.color,
              color: coachLoading ? '#555' : '#000', border: 'none', borderRadius: 8,
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: 3,
              cursor: coachLoading ? 'not-allowed' : 'pointer',
            }}>
              {coachLoading ? 'THINKING...' : 'ASK COACH →'}
            </button>

            {coachResponse && (
              <div style={{ marginTop: 16, background: '#111', borderRadius: 8, border: `1px solid ${day.color}`, padding: '16px' }}>
                <div style={{ fontSize: 9, color: day.color, letterSpacing: 2, marginBottom: 10 }}>COACH RESPONSE</div>
                <div style={{ fontSize: 12, color: '#C8C4BC', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{coachResponse}</div>
              </div>
            )}

            {Object.keys(logs).length === 0 && (
              <div style={{ marginTop: 12, padding: '12px', background: '#0D0D0D', borderRadius: 8, border: '1px solid #1A1A1A' }}>
                <div style={{ fontSize: 10, color: '#444', lineHeight: 1.7 }}>
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
              <div style={{ color: '#333', fontSize: 12, textAlign: 'center', padding: 40 }}>No sessions logged yet.</div>
            ) : historyEntries.map(([key, entry]) => (
              <div key={key} style={{ marginBottom: 10, background: '#111', borderRadius: 8, border: '1px solid #1A1A1A', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#E8E4DC' }}>{entry.day}: {PLAN[entry.day]?.label || entry.label}</div>
                    <div style={{ fontSize: 10, color: '#444', marginTop: 3, letterSpacing: 1 }}>{entry.date}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: PLAN[entry.day]?.color || '#888', letterSpacing: 2, textAlign: 'right' }}>
                      {totalVolume(entry.data).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 8, color: '#333', textAlign: 'right', letterSpacing: 1 }}>LBS VOLUME</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {Object.entries(entry.data).map(([ei, sets]) => {
                    const exName = entry.exercises?.[ei] || PLAN[entry.day]?.exercises[ei]?.name || `Ex ${parseInt(ei)+1}`;
                    const completed = sets.filter(s => s.done).length;
                    const color = PLAN[entry.day]?.color || '#888';
                    return (
                      <div key={ei} style={{
                        fontSize: 8, letterSpacing: 1, padding: '3px 7px', borderRadius: 3,
                        background: completed === sets.length ? `${color}22` : '#0A0A0A',
                        border: `1px solid ${completed === sets.length ? color : '#1A1A1A'}`,
                        color: completed === sets.length ? color : '#333',
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
