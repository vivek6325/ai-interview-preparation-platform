
/**
 * QuestionBreakdown Component
 * Displays scoring cards detailing per-question results and feedback.
 */
export function QuestionBreakdown({ questionsBreakdown }) {
  return (
    <section className="detailed-feedback-section">
      <h2>Question-by-Question Feedback</h2>
      <div className="feedback-cards-grid">
        {questionsBreakdown.map((item) => (
          <div key={item.number} className="feedback-card">
            <div className="feedback-card-header">
              <h4>Q{item.number}: {item.question}</h4>
              <span className="question-score-badge">Score: {item.score}%</span>
            </div>
            
            <div className="feedback-point strength">
              <span className="point-icon">🔥</span>
              <div>
                <strong>Key Strength:</strong>
                <p>{item.strength}</p>
              </div>
            </div>

            <div className="feedback-point improvement">
              <span className="point-icon">💡</span>
              <div>
                <strong>Area for Growth:</strong>
                <p>{item.improvement}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default QuestionBreakdown;
