import React, { useEffect, useRef, useState } from 'react';

const TypingArea = ({
    text,
    input,
    inputRef,
    textDisplayRef,
    handleInput,
    restart,
    loading,
    isFocused,
    setIsFocused
}) => {
    const caretRef = useRef(null);
    const [caretStyle, setCaretStyle] = useState({ top: 0, left: 0, opacity: 0 });

    useEffect(() => {
        if (loading || !textDisplayRef.current) return;

        const container = textDisplayRef.current;
        const activeSpan = container.querySelector('span.active');
        const containerRect = container.getBoundingClientRect();

        let top = 0, left = 0;

        if (activeSpan) {
            const spanRect = activeSpan.getBoundingClientRect();
            top = spanRect.top - containerRect.top + container.scrollTop;
            left = spanRect.left - containerRect.left;
        } else if (input.length > 0 && text.length > 0) {
            // Caret at the very end — position after last char
            const lastSpan = container.querySelector(`span:nth-child(${text.length})`);
            if (lastSpan) {
                const spanRect = lastSpan.getBoundingClientRect();
                top = spanRect.top - containerRect.top + container.scrollTop;
                left = spanRect.right - containerRect.left;
            }
        }

        setCaretStyle({ top, left, opacity: isFocused ? 1 : 0 });
    }, [input, text, loading, isFocused]);

    return (
        <>
            <div className="test-area">
                {loading ? (
                    <div className="text-display">
                        <div className="skeleton-container">
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                            <div className="skeleton-line"></div>
                        </div>
                    </div>
                ) : (
                    <div
                        className="text-display"
                        ref={textDisplayRef}
                        onClick={() => {
                            inputRef.current?.focus();
                            setIsFocused(true);
                        }}
                    >
                        {text.split('').map((char, index) => {
                            let className = '';
                            if (index < input.length) {
                                className = input[index] === char ? 'correct' : 'incorrect';
                            } else if (index === input.length) {
                                className = 'active';
                            }
                            return <span key={index} className={className}>{char}</span>;
                        })}

                        {/* Smooth sliding caret */}
                        <div
                            ref={caretRef}
                            className="smooth-caret"
                            style={{
                                top: caretStyle.top + 4,
                                left: caretStyle.left,
                                opacity: caretStyle.opacity,
                            }}
                        />
                    </div>
                )}

                {!isFocused && !loading && (
                    <div
                        className="blur-overlay"
                        onClick={() => {
                            inputRef.current?.focus();
                            setIsFocused(true);
                        }}
                    >
                        <span>Click here to focus</span>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="text"
                    className="input-field"
                    value={input}
                    onChange={handleInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoFocus
                    onPaste={(e) => e.preventDefault()}
                />
            </div>

            <div className="controls">
                <button onClick={restart} id="restart">
                    <span className="restart-icon">↻</span>
                    Restart
                    <span className="tab-hint">Tab</span>
                </button>
            </div>
        </>
    );
};

export default TypingArea;
