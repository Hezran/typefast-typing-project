import React from 'react';

const SettingsBar = ({ mode, setMode, duration, handleDurationChange, wordCount, handleWordCountChange, difficulty, handleDifficultyChange }) => {
    return (
        <div className="settings-container">
            <div className="mode-container">
                <button
                    className={mode === 'quote' ? 'active-mode' : ''}
                    onClick={() => setMode('quote')}
                >
                    Quote
                </button>
                <button
                    className={mode === 'time' ? 'active-mode' : ''}
                    onClick={() => setMode('time')}
                >
                    Time
                </button>
                <button
                    className={mode === 'words' ? 'active-mode' : ''}
                    onClick={() => setMode('words')}
                >
                    Words
                </button>
            </div>

            {mode === 'time' && (
                <div className="duration-container">
                    {[15, 30, 60].map(d => (
                        <button
                            key={d}
                            className={duration === d ? 'active-mode' : ''}
                            onClick={() => handleDurationChange(d)}
                        >
                            {d}s
                        </button>
                    ))}
                </div>
            )}

            {mode === 'words' && (
                <div className="duration-container">
                    {[10, 25, 50].map(w => (
                        <button
                            key={w}
                            className={wordCount === w ? 'active-mode' : ''}
                            onClick={() => handleWordCountChange(w)}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            )}

            <div className="difficulty-container">
                {['easy', 'medium', 'hard'].map(d => (
                    <button
                        key={d}
                        className={difficulty === d ? 'active-mode' : ''}
                        onClick={() => handleDifficultyChange(d)}
                    >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SettingsBar;
