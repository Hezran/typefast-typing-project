import { useState, useEffect, useRef, useCallback } from 'react';
import wordList from '../words.js';

// Personal best helpers
const getPersonalBest = () => {
    try {
        const stored = localStorage.getItem('typefast-personal-best');
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
};

const savePersonalBest = (stats, mode, duration) => {
    const current = getPersonalBest();
    const key = mode === 'quote' ? 'quote' : `time-${duration}`;
    const newBest = {
        ...current,
        [key]: {
            wpm: stats.wpm,
            accuracy: stats.accuracy,
            date: new Date().toISOString(),
        }
    };
    localStorage.setItem('typefast-personal-best', JSON.stringify(newBest));
    return newBest;
};

export const useTypingGame = () => {
    const [text, setText] = useState("");
    const [input, setInput] = useState("");
    const [duration, setDuration] = useState(60);
    const [wordCount, setWordCount] = useState(25);
    const [timeLeft, setTimeLeft] = useState(60);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [mode, setMode] = useState('time');
    const [difficulty, setDifficulty] = useState(() => {
        return localStorage.getItem('typefast-difficulty') || 'medium';
    });
    const [stats, setStats] = useState({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, incorrectChars: 0, totalChars: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(true);
    const [quoteAuthor, setQuoteAuthor] = useState('');
    const [personalBest, setPersonalBest] = useState(getPersonalBest());
    const [isNewBest, setIsNewBest] = useState(false);

    const inputRef = useRef(null);
    const textDisplayRef = useRef(null);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null); // real wall-clock start, for accurate sub-second WPM

    // Refs to avoid stale closures in setInterval
    const inputValRef = useRef(input);
    const textValRef = useRef(text);
    const elapsedTimeValRef = useRef(elapsedTime);
    const timeLeftValRef = useRef(timeLeft);
    const durationValRef = useRef(duration);
    const modeValRef = useRef(mode);
    const isActiveValRef = useRef(isActive);

    useEffect(() => { inputValRef.current = input; }, [input]);
    useEffect(() => { textValRef.current = text; }, [text]);
    useEffect(() => { elapsedTimeValRef.current = elapsedTime; }, [elapsedTime]);
    useEffect(() => { timeLeftValRef.current = timeLeft; }, [timeLeft]);
    useEffect(() => { durationValRef.current = duration; }, [duration]);
    useEffect(() => { modeValRef.current = mode; }, [mode]);
    useEffect(() => { isActiveValRef.current = isActive; }, [isActive]);

    // Per-word locking: track the locked prefix index
    const lockedLengthRef = useRef(0);
    const wordCountValRef = useRef(wordCount);
    const totalMistakesRef = useRef(0); // cumulative wrong keystrokes (never decreases)
    useEffect(() => { wordCountValRef.current = wordCount; }, [wordCount]);

    // Save difficulty preference
    useEffect(() => {
        localStorage.setItem('typefast-difficulty', difficulty);
    }, [difficulty]);

    // Load new text when mode, duration, wordCount, or difficulty changes
    useEffect(() => {
        loadText();
    }, [mode, duration, wordCount, difficulty]);

    // Stable endTest function
    const endTest = useCallback(() => {
        clearInterval(timerRef.current);
        setIsActive(false);
        setIsFinished(true);
        const currentInput = inputValRef.current;
        const currentText = textValRef.current;
        let timeElapsed;
        // Always use real wall-clock time for accuracy (especially for short words/quote runs)
        if (modeValRef.current === 'quote' || modeValRef.current === 'words') {
            timeElapsed = startTimeRef.current
                ? (Date.now() - startTimeRef.current) / 1000
                : elapsedTimeValRef.current;
            if (timeElapsed < 1) timeElapsed = Math.max(timeElapsed, 0.1); // don't clamp to 1 — use real time
        } else {
            timeElapsed = durationValRef.current - timeLeftValRef.current;
            if (timeElapsed <= 0) timeElapsed = 1;
        }
        const minutes = timeElapsed / 60;
        if (minutes > 0) {
            let correctChars = 0;
            const compareLength = Math.min(currentInput.length, currentText.length);
            for (let i = 0; i < compareLength; i++) {
                if (currentInput[i] === currentText[i]) {
                    correctChars++;
                }
            }
            const incorrectChars = currentInput.length - correctChars;
            const rawWpm = Math.round((currentInput.length / 5) / minutes) || 0;
            const wpm = Math.round((correctChars / 5) / minutes) || 0;
            // Accuracy uses cumulative mistakes — fixing a typo doesn’t restore accuracy
            const totalTyped = correctChars + totalMistakesRef.current;
            const accuracy = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);
            const finalStats = { wpm, rawWpm, accuracy, correctChars, incorrectChars, totalChars: currentInput.length };
            setStats(finalStats);
            setHistory(prev => [...prev, { time: timeElapsed, wpm }]);

            // Check personal best
            const bestKey = modeValRef.current === 'quote' ? 'quote' : `time-${durationValRef.current}`;
            const current = getPersonalBest();
            if (!current || !current[bestKey] || wpm > current[bestKey].wpm) {
                setIsNewBest(true);
                const newBests = savePersonalBest(finalStats, modeValRef.current, durationValRef.current);
                setPersonalBest(newBests);
            } else {
                setIsNewBest(false);
            }
        }
    }, []);

    const endTestRef = useRef(endTest);
    useEffect(() => { endTestRef.current = endTest; }, [endTest]);

    // Timer effect
    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                if (modeValRef.current === 'quote' || modeValRef.current === 'words') {
                    setElapsedTime(startTimeRef.current
                        ? Math.round((Date.now() - startTimeRef.current) / 1000)
                        : (prev => prev + 1));
                } else {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            endTestRef.current();
                            return 0;
                        }
                        return prev - 1;
                    });
                }
                calculateStatsFromRefs();
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, mode]);

    const calculateStatsFromRefs = () => {
        const currentInput = inputValRef.current;
        const currentText = textValRef.current;
        let timeElapsed;
        if (modeValRef.current === 'quote' || modeValRef.current === 'words') {
            timeElapsed = startTimeRef.current
                ? (Date.now() - startTimeRef.current) / 1000
                : elapsedTimeValRef.current;
        } else {
            timeElapsed = durationValRef.current - timeLeftValRef.current;
        }
        const minutes = timeElapsed / 60;
        if (minutes <= 0) return;

        let correctChars = 0;
        const compareLength = Math.min(currentInput.length, currentText.length);
        for (let i = 0; i < compareLength; i++) {
            if (currentInput[i] === currentText[i]) {
                correctChars++;
            }
        }
        const incorrectChars = currentInput.length - correctChars;
        const rawWpm = Math.round((currentInput.length / 5) / minutes) || 0;
        const wpm = Math.round((correctChars / 5) / minutes) || 0;
        // Use cumulative mistakes so accuracy never improves just from correcting
        const totalTyped = correctChars + totalMistakesRef.current;
        const accuracy = totalTyped === 0 ? 100 : Math.round((correctChars / totalTyped) * 100);

        setStats({ wpm, rawWpm, accuracy, correctChars, incorrectChars, totalChars: currentInput.length });

        if (isActiveValRef.current) {
            setHistory(prev => [...prev, { time: Math.round(timeElapsed), wpm, rawWpm }]);
        }
    };

    // Check for completion (Quote and Words modes)
    useEffect(() => {
        if ((mode === 'quote' || mode === 'words') && !loading && text && input.length === text.length) {
            endTestRef.current();
        }
    }, [input, text, loading, mode]);

    // Auto-scroll: keep active character on the first visible line
    useEffect(() => {
        if (!textDisplayRef.current) return;
        const activeSpan = textDisplayRef.current.querySelector('.active');
        if (activeSpan) {
            const container = textDisplayRef.current;
            const spanTop = activeSpan.offsetTop;
            const lineHeight = activeSpan.clientHeight;
            // Scroll so the active char is on the first line
            const targetScroll = Math.max(0, spanTop - lineHeight * 0.5);
            if (targetScroll !== container.scrollTop) {
                container.scrollTop = targetScroll;
            }
        } else if (input.length === 0 && textDisplayRef.current) {
            textDisplayRef.current.scrollTop = 0;
        }
    }, [input, text]);

    // Tab to restart
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                restartRef.current();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const loadText = async () => {
        setLoading(true);
        setText("");
        setInput("");
        setIsActive(false);
        setIsFinished(false);
        setTimeLeft(duration);
        setElapsedTime(0);
        setStats({ wpm: 0, rawWpm: 0, accuracy: 100, correctChars: 0, incorrectChars: 0, totalChars: 0 });
        setHistory([]);
        setQuoteAuthor('');
        setIsNewBest(false);
        startTimeRef.current = null;    // reset real clock
        totalMistakesRef.current = 0;   // reset mistake counter
        lockedLengthRef.current = 0;    // reset locked prefix length

        if (mode === 'quote') {
            try {
                // Fetch a batch of quotes to have a better chance of finding one that matches the difficulty criteria
                const response = await fetch('https://dummyjson.com/quotes?limit=30');
                const data = await response.json();
                
                // Filter based on difficulty length
                let suitableQuotes = data.quotes;
                if (difficulty === 'easy') {
                    suitableQuotes = data.quotes.filter(q => q.quote.length < 60);
                } else if (difficulty === 'medium') {
                    suitableQuotes = data.quotes.filter(q => q.quote.length >= 60 && q.quote.length <= 120);
                } else if (difficulty === 'hard') {
                    suitableQuotes = data.quotes.filter(q => q.quote.length > 120);
                }

                // If no quote fits the rigid criteria from this batch, fallback to the full batch
                if (suitableQuotes.length === 0) {
                    suitableQuotes = data.quotes;
                }

                // Pick a random quote from the suitable/fallback array
                const randomQuote = suitableQuotes[Math.floor(Math.random() * suitableQuotes.length)];
                
                setText(randomQuote.quote);
                setQuoteAuthor(randomQuote.author || '');
            } catch (error) {
                console.error("Error fetching quote:", error);
                setText("Practice makes progress and progress builds confidence.");
                setQuoteAuthor('');
            }
        } else {
            // time mode or words mode — generate random words
            const filteredWords = getWordsByDifficulty(difficulty);
            const count = mode === 'words' ? wordCountValRef.current : 300;
            const randomWords = [];
            for (let i = 0; i < count; i++) {
                randomWords.push(filteredWords[Math.floor(Math.random() * filteredWords.length)]);
            }
            setText(randomWords.join(" "));
        }
        setLoading(false);

        setTimeout(() => {
            inputRef.current?.focus();
            if (textDisplayRef.current) textDisplayRef.current.scrollTop = 0;
        }, 100);
    };

    const getWordsByDifficulty = (diff) => {
        switch (diff) {
            case 'easy':
                // Only short, common words (first ~200)
                return wordList.filter(w => w.length <= 5).slice(0, 200);
            case 'hard':
                // Longer and less common words
                return wordList.filter(w => w.length >= 5);
            case 'medium':
            default:
                return wordList;
        }
    };

    const handleInput = (e) => {
        if (!isActive && !isFinished) {
            setIsActive(true);
            startTimeRef.current = Date.now();
        }
        const val = e.target.value;

        if (val.length < input.length) {
            // ── Backspace: enforce 1-word-back limit using monotonic locked length ──
            if (val.length < lockedLengthRef.current) {
                return; // Hard lock: cannot backspace into locked words
            }
        } else {
            // ── Typing forward: track mistakes and locked boundaries ──
            for (let i = input.length; i < val.length; i++) {
                if (i < text.length && val[i] !== text[i]) {
                    totalMistakesRef.current++;
                }
            }

            // Calculate new locked length (we lock everything before the second-to-last typed space)
            const spaces = [];
            for (let i = 0; i < val.length; i++) {
                if (val[i] === ' ') spaces.push(i);
            }
            if (spaces.length >= 2) {
                const newLockedLen = spaces[spaces.length - 2] + 1; // Start of the *previous* word
                if (newLockedLen > lockedLengthRef.current) {
                    lockedLengthRef.current = newLockedLen;
                }
            }
        }

        if (mode === 'time' || val.length <= text.length) {
            setInput(val);
            if (isActive || (!isActive && !isFinished)) {
                setTimeout(() => calculateStatsFromRefs(), 0);
            }
        }
    };

    const restart = useCallback(() => {
        clearInterval(timerRef.current);
        loadText();
    }, [mode, duration, wordCount, difficulty]);

    const restartRef = useRef(restart);
    useEffect(() => { restartRef.current = restart; }, [restart]);

    const handleDurationChange = (newDuration) => {
        setDuration(newDuration);
    };

    const handleWordCountChange = (newCount) => {
        setWordCount(newCount);
    };

    const handleDifficultyChange = (newDifficulty) => {
        setDifficulty(newDifficulty);
    };

    // Get current personal best for display
    const currentBestKey = mode === 'quote' ? 'quote' : `time-${duration}`;
    const currentPersonalBest = personalBest?.[currentBestKey] || null;

    return {
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
        personalBest: currentPersonalBest,
        isNewBest,
        inputRef,
        textDisplayRef,
        handleInput,
        handleDurationChange,
        handleWordCountChange,
        handleDifficultyChange,
        setMode,
        restart,
    };
};
