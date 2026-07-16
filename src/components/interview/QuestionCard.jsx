import './QuestionCard.css';

/**
 * Reusable Question Card Component
 * Displays question text, difficulty metadata, user answer textareas, and navigation action hooks.
 */
function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  difficulty = 'Medium',
  value = '',
  onChange,
  onPrevious,
  onNext,
  isFirst = false,
  isLast = false
}) {
  return (
    <div className="question-card-container">
      <div className="question-card-header">
        <span className="question-number-badge">Question {questionNumber} / {totalQuestions}</span>
        <span className={`difficulty-badge ${difficulty.toLowerCase()}`}>
          {difficulty}
        </span>
      </div>
      
      <div className="question-body">
        <h3 className="question-text">{questionText}</h3>
      </div>
      
      <div className="answer-section">
        <label htmlFor="answer-textarea" className="answer-label">Your Response</label>
        <textarea
          id="answer-textarea"
          className="answer-textarea"
          placeholder="Type your response here... Try using the STAR methodology (Situation, Task, Action, Result) to write a detailed, high-scoring answer."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="character-count-label">{value.length} characters</span>
      </div>
      
      <div className="question-card-actions">
        <button 
          className="btn-question-action prev" 
          onClick={onPrevious}
          disabled={isFirst}
        >
          ← Previous
        </button>
        <button 
          className={`btn-question-action next ${isLast ? 'finish' : ''}`}
          onClick={onNext}
        >
          {isLast ? 'Finish Interview' : 'Next Question →'}
        </button>
      </div>
    </div>
  );
}

export default QuestionCard;
