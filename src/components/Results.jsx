import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// Deduplicate history by time (keep highest wpm per second)
const dedupeHistory = (history) => {
    const map = new Map();
    for (const entry of history) {
        const t = entry.time;
        if (!map.has(t) || entry.wpm > map.get(t).wpm) {
            map.set(t, entry);
        }
    }
    return Array.from(map.values()).sort((a, b) => a.time - b.time);
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="chart-tooltip-label">{label}s</p>
                {payload.map(p => (
                    <p key={p.dataKey} style={{ color: p.color }}>
                        {p.name}: <strong>{Math.round(p.value)}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Results = ({ stats, history, timeElapsed, restart, quoteAuthor, personalBest, isNewBest }) => {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleSubmitScore = async () => {
        if (!user) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            await api.submitScore({
                wpm: stats.wpm,
                rawWpm: stats.rawWpm,
                accuracy: stats.accuracy,
                mode: quoteAuthor ? 'quote' : 'time',
                duration: quoteAuthor ? null : timeElapsed,
                difficulty: localStorage.getItem('typefast-difficulty') || 'medium'
            });
            setSubmitSuccess(true);
        } catch (err) {
            setSubmitError(err.message || 'Failed to submit score');
        } finally {
            setSubmitting(false);
        }
    };

    const chartData = dedupeHistory(history);

    return (
        <div className="results-container">
            {/* ── MonkeyType-style layout ── */}
            <div className="results-mk-layout">

                {/* Left sidebar */}
                <div className="results-mk-sidebar">
                    <div className="results-mk-main-stat">
                        <span className="results-mk-label">wpm</span>
                        <span className="results-mk-value accent">{stats.wpm}</span>
                    </div>
                    <div className="results-mk-main-stat">
                        <span className="results-mk-label">acc</span>
                        <span className="results-mk-value">{stats.accuracy}%</span>
                    </div>
                    {isNewBest && (
                        <div className="results-mk-badge">🏆 new best</div>
                    )}
                    {quoteAuthor && (
                        <p className="results-mk-meta">— {quoteAuthor}</p>
                    )}
                </div>

                {/* Chart */}
                <div className="results-mk-chart">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="time"
                                stroke="var(--text-dimmer)"
                                tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                yAxisId="wpm"
                                stroke="var(--text-dimmer)"
                                tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                width={36}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                yAxisId="wpm"
                                type="monotone"
                                dataKey="rawWpm"
                                name="Raw"
                                stroke="var(--text-dimmer)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 3, fill: 'var(--text-muted)' }}
                            />
                            <Line
                                yAxisId="wpm"
                                type="monotone"
                                dataKey="wpm"
                                name="WPM"
                                stroke="var(--caret)"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4, fill: 'var(--caret)' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Secondary stats row ── */}
            <div className="results-mk-stats-row">
                <div className="results-mk-stat">
                    <span className="results-mk-stat-label">raw</span>
                    <span className="results-mk-stat-value">{stats.rawWpm}</span>
                </div>
                <div className="results-mk-stat">
                    <span className="results-mk-stat-label">characters</span>
                    <span className="results-mk-stat-value">
                        <span className="char-correct">{stats.correctChars}</span>
                        <span className="char-sep">/</span>
                        <span className="char-incorrect">{stats.incorrectChars}</span>
                    </span>
                </div>
                <div className="results-mk-stat">
                    <span className="results-mk-stat-label">time</span>
                    <span className="results-mk-stat-value">{timeElapsed}s</span>
                </div>
                {personalBest && !isNewBest && (
                    <div className="results-mk-stat">
                        <span className="results-mk-stat-label">best</span>
                        <span className="results-mk-stat-value accent">{personalBest.wpm}</span>
                    </div>
                )}
            </div>

            {/* ── Actions ── */}
            <div className="results-actions">
                <button onClick={restart} className="primary-btn">
                    <span className="restart-icon">↻</span>
                    Try Again
                    <span className="tab-hint">Tab</span>
                </button>

                {user && !submitSuccess && (
                    <button
                        onClick={handleSubmitScore}
                        className="secondary-btn"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit to Leaderboard'}
                    </button>
                )}
            </div>

            {submitSuccess && <p className="success-message">Score submitted to leaderboard!</p>}
            {submitError && <p className="error-message">{submitError}</p>}
        </div>
    );
};

export default Results;
