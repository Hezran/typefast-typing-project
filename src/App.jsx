import { useState } from 'react';
import { useTypingGame } from './hooks/useTypingGame';
import StatsDisplay from './components/StatsDisplay';
import SettingsBar from './components/SettingsBar';
import TypingArea from './components/TypingArea';
import Results from './components/Results';
import ThemeSelector from './components/ThemeSelector';
import AuthModal from './components/AuthModal';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import { useAuth } from './context/AuthContext';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const {
    text,
    input,
    duration,
    wordCount,
    timeLeft,
    elapsedTime,
    isActive,
    isFinished,
    mode,
    difficulty,
    stats,
    history,
    loading,
    isFocused,
    setIsFocused,
    quoteAuthor,
    personalBest,
    isNewBest,
    inputRef,
    textDisplayRef,
    handleInput,
    handleDurationChange,
    handleWordCountChange,
    handleDifficultyChange,
    setMode,
    restart
  } = useTypingGame();

  return (
    <div className="container">
      <div className="header">
        <h1>TypeFast</h1>
        <div className="header-controls">
          <button onClick={() => setIsLeaderboardOpen(true)} className="text-btn">
            Leaderboard
          </button>
          {user ? (
            <>
              <span className="divider" />
              <span className="welcome-text">Hi, {user.username}</span>
              <button onClick={() => setIsProfileOpen(true)} className="text-btn">Profile</button>
              <button onClick={logout} className="text-btn">Logout</button>
            </>
          ) : (
            <>
              <span className="divider" />
              <button onClick={() => setIsAuthModalOpen(true)} className="primary-btn sm">
                Login
              </button>
            </>
          )}
          <span className="divider" />
          <ThemeSelector />
        </div>
      </div>

      {!isFinished ? (
        <>
          <StatsDisplay
            timeLeft={mode === 'quote' ? elapsedTime : mode === 'words' ? elapsedTime : timeLeft}
            wpm={stats.wpm}
            accuracy={stats.accuracy}
            isActive={isActive}
            hasInput={input.length > 0}
          />

          <SettingsBar
            mode={mode}
            setMode={setMode}
            duration={duration}
            handleDurationChange={handleDurationChange}
            wordCount={wordCount}
            handleWordCountChange={handleWordCountChange}
            difficulty={difficulty}
            handleDifficultyChange={handleDifficultyChange}
          />

          <TypingArea
            text={text}
            input={input}
            inputRef={inputRef}
            textDisplayRef={textDisplayRef}
            handleInput={handleInput}
            restart={restart}
            loading={loading}
            isFocused={isFocused}
            setIsFocused={setIsFocused}
          />
        </>
      ) : (
        <Results
          stats={stats}
          history={history}
          timeElapsed={mode === 'quote' ? elapsedTime : (duration - timeLeft)}
          restart={restart}
          quoteAuthor={mode === 'quote' ? quoteAuthor : ''}
          personalBest={personalBest}
          isNewBest={isNewBest}
        />
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <Leaderboard isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />
      <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

export default App;