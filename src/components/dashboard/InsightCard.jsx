import { Lightbulb, Sparkles, Target } from 'lucide-react';

/**
 * InsightCard Component
 * Structured AI Career Coach observation card with priority badge and colored indicator.
 */
export function InsightCard({
  observation,
  index = 0,
  priority = 'Medium'
}) {
  const isHigh = priority === 'High' || index === 0;
  const isGrowth = priority === 'Growth' || index === 2;

  const badgeClass = isHigh ? 'badge-high' : isGrowth ? 'badge-growth' : 'badge-medium';
  const borderClass = isHigh ? 'border-high' : isGrowth ? 'border-growth' : 'border-medium';

  return (
    <div className={`insight-card ${borderClass}`}>
      <div className="insight-card-header">
        <div className="insight-icon-box">
          {isHigh ? (
            <Sparkles size={16} className="text-amber" />
          ) : isGrowth ? (
            <Target size={16} className="text-emerald" />
          ) : (
            <Lightbulb size={16} className="text-sky" />
          )}
        </div>

        <span className={`insight-priority-badge ${badgeClass}`}>
          {isHigh ? '🔥 High Priority' : isGrowth ? '🚀 Growth Area' : '💡 Key Insight'}
        </span>
      </div>

      <p className="insight-text">{observation}</p>
    </div>
  );
}

export default InsightCard;
