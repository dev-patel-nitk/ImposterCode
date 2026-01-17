// FILE: client/src/QuestionPanel.js
import React from 'react';

const QuestionPanel = ({ question, onNext }) => {
  if (!question) return <div style={{ padding: 20, color: '#888' }}>Loading Question...</div>;

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return '#00b8a3'; // Green
      case 'medium': return '#ffc01e'; // Yellow
      case 'hard': return '#ff375f'; // Red
      default: return '#fff';
    }
  };

  // --- 1. FORMAT JSON INPUTS ---
  const formatData = (data) => {
    if (Array.isArray(data)) return JSON.stringify(data);
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data)
        .map(([key, value]) => {
           const valStr = Array.isArray(value) || typeof value === 'string' 
             ? JSON.stringify(value) 
             : value;
           return `${key} = ${valStr}`;
        })
        .join(",\n");
    }
    return JSON.stringify(data);
  };

  // --- 2. PARSE DESCRIPTION (ROBUST FIX) ---
  const renderDescription = (text) => {
    if (!text) return null;

    // FIX: Split by EITHER a literal "\n" sequence OR a real newline character.
    // This catches both double-escaped strings from DBs and standard strings.
    const lines = text.split(/\\n|\n/); 
    
    let inCodeBlock = false;

    return lines.map((line, index) => {
      // Handle Code Blocks (```)
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        return null; // Don't render the backticks themselves
      }

      if (inCodeBlock) {
        return (
          <div key={index} className="qp-code-block">
            {line}
          </div>
        );
      }

      // Handle Bold Text (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g); // Split by bold markers
      return (
        <div key={index} style={{ minHeight: '1.2em', marginBottom: '4px' }}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              // Remove the ** markers and render bold
              return <strong key={i} style={{ color: '#fff' }}>{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="question-panel">
      {/* HEADER */}
      <div className="qp-header">
        <h3 className="qp-title">{question.title}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="qp-difficulty" style={{ color: getDifficultyColor(question.difficulty) }}>
            {question.difficulty?.toUpperCase()}
          </span>
          <button className="qp-next-btn" onClick={onNext}>
            Next Question ➔
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="qp-content">
        
        {/* Render Parsed Description */}
        <div className="qp-description">
          {renderDescription(question.description)}
        </div>

        {/* TAGS */}
        <div className="qp-tags">
          {question.tags?.map((tag, i) => (
            <span key={i} className="qp-tag">{tag}</span>
          ))}
        </div>

        {/* EXAMPLES */}
        {question.sampleInput && question.sampleOutput && (
          <div>
            {(Array.isArray(question.sampleInput) ? question.sampleInput : [question.sampleInput]).map((input, idx) => {
              const output = Array.isArray(question.sampleOutput) 
                ? question.sampleOutput[idx] 
                : question.sampleOutput;

              return (
                <div key={idx} className="qp-example-box">
                  <div className="qp-example-header">Example {idx + 1}</div>
                  
                  <div className="qp-io-line">
                    <span className="qp-label">Input:</span>
                    <span className="qp-value">{formatData(input)}</span>
                  </div>
                  
                  <div className="qp-io-line">
                    <span className="qp-label">Output:</span>
                    <span className="qp-value">{formatData(output)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;