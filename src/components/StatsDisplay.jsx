import React from 'react';

const StatsDisplay = ({ timeLeft, wpm, accuracy, isActive, hasInput }) => {
    const showPlaceholder = !isActive && !hasInput;

    return (
        <div className="stats-container">
            <div className="stat-box">
                <span className="label">Time</span>
                <span className="value" id="time">{timeLeft}s</span>
            </div>
            <div className="stat-box">
                <span className="label">WPM</span>
                <span className={`value ${showPlaceholder ? 'placeholder' : ''}`} id="wpm">
                    {showPlaceholder ? '--' : wpm}
                </span>
            </div>
            <div className="stat-box">
                <span className="label">Accuracy</span>
                <span className={`value ${showPlaceholder ? 'placeholder' : ''}`} id="accuracy">
                    {showPlaceholder ? '--' : `${accuracy}%`}
                </span>
            </div>
        </div>
    );
};

export default StatsDisplay;
