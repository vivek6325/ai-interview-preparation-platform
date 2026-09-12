import { useState } from 'react';
import { formatAudioTimer } from '../../../hooks/useAudioRecorder';
import './VoiceAnalyticsDashboard.css';

/**
 * VoiceAnalyticsDashboard Component (Day 18 — Part 7)
 * 
 * Polished, responsive, interactive Voice Analytics Dashboard presenting all Day 18 analytics:
 * Speaking Pace, Filler Words, Voice Delivery Confidence, Communication Tone & Sentiment,
 * and Overall AI Communication Score & Feedback.
 * 
 * @param {Object} props
 * @param {Object} [props.voiceAnalytics] Unified voice analytics payload from speechAnalytics
 * @param {string} [props.transcript] Recorded speech transcript
 * @param {string} [props.audioUrl] Recorded audio playback URL
 * @param {boolean} [props.isTranscribing] Flag indicating active STT transcription
 * @param {boolean} [props.isEvaluatingAi] Flag indicating active AI feedback evaluation
 * @param {string} [props.aiError] Error message for AI feedback
 * @param {Function} [props.onApplyTranscript] Action callback to populate transcript into answer textarea
 * @param {Function} [props.onRecordNew] Action callback to reset and start a new recording
 */
export function VoiceAnalyticsDashboard({
  voiceAnalytics = null,
  transcript = '',
  audioUrl = '',
  isTranscribing = false,
  isEvaluatingAi = false,
  aiError = null,
  onApplyTranscript = null,
  onRecordNew = null
}) {
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);

  // Empty State: No recording or transcript available yet
  if (!transcript && !isTranscribing && (!voiceAnalytics || voiceAnalytics.wordCount === 0)) {
    return (
      <div className="voice-dashboard-empty-state">
        <div className="empty-state-icon" aria-hidden="true">🎙️</div>
        <h5 className="empty-state-title">No Voice Response Analyzed</h5>
        <p className="empty-state-description">
          Record your spoken answer to view real-time Speaking Pace, Filler Control, Voice Delivery Confidence, Communication Tone, and AI Coaching Feedback.
        </p>
        {onRecordNew && (
          <button
            type="button"
            className="btn-dashboard-action btn-record-prompt"
            onClick={onRecordNew}
          >
            <span>🎙️ Record Answer Now</span>
          </button>
        )}
      </div>
    );
  }

  // Loading State: Transcribing audio or analyzing metrics
  if (isTranscribing) {
    return (
      <div className="voice-dashboard-loading-state">
        <div className="loading-spinner-wrapper">
          <span className="dashboard-spinner" aria-hidden="true" />
        </div>
        <h5 className="loading-title">Transcribing Audio Response...</h5>
        <p className="loading-subtext">Converting recorded speech to transcript and computing pace & filler analytics.</p>
      </div>
    );
  }

  const commScore = voiceAnalytics?.communicationScore;
  const pace = voiceAnalytics?.pace;
  const fillers = voiceAnalytics?.fillerAnalysis;
  const confidence = voiceAnalytics?.confidenceAnalysis;
  const tone = voiceAnalytics?.toneAnalysis;

  return (
    <div className="voice-analytics-dashboard-container" aria-label="Interactive Voice Analytics Dashboard">
      {/* 1. Dashboard Action Toolbar & Transcript Toggle */}
      <div className="dashboard-top-toolbar">
        <div className="toolbar-left">
          <span className="dashboard-main-badge">
            <span className="badge-dot pulse" aria-hidden="true" />
            <span>Voice Analytics Complete</span>
          </span>

          {audioUrl && (
            <div className="dashboard-audio-player-wrapper">
              <audio controls src={audioUrl} className="dashboard-audio-player" aria-label="Play recorded audio answer">
                Your browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>

        <div className="toolbar-right">
          {transcript && (
            <button
              type="button"
              className={`btn-dashboard-action btn-toggle-transcript ${isTranscriptExpanded ? 'active' : ''}`}
              onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
              aria-expanded={isTranscriptExpanded}
            >
              <span>💬 {isTranscriptExpanded ? 'Hide Transcript' : 'View Transcript'}</span>
            </button>
          )}

          {transcript && onApplyTranscript && (
            <button
              type="button"
              className="btn-dashboard-action btn-apply-text"
              onClick={() => onApplyTranscript(transcript)}
              title="Populate answer input field with transcript"
            >
              <span>📥 Apply to Answer Box</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Expandable Transcript Drawer */}
      {transcript && isTranscriptExpanded && (
        <div className="dashboard-transcript-drawer">
          <div className="drawer-header">
            <span className="drawer-title">📝 Generated Speech Transcript</span>
            <span className="drawer-word-count">{voiceAnalytics?.wordCount || 0} words spoken</span>
          </div>
          <blockquote className="drawer-transcript-quote">
            <p>{transcript}</p>
          </blockquote>
        </div>
      )}

      {/* 3. Hero Section: Overall AI Communication Score */}
      {commScore && (
        <div className="dashboard-hero-card">
          <div className="hero-header">
            <div className="hero-title-group">
              <span className="hero-icon" aria-hidden="true">🤖</span>
              <div>
                <h4 className="hero-title">Overall AI Communication Score</h4>
                <p className="hero-subtitle">Unified interview communication rating based on actual speech performance.</p>
              </div>
            </div>

            {commScore.isInsufficientData ? (
              <span className="score-badge score-badge-insufficient">Insufficient Data</span>
            ) : (
              <span className={`score-badge ${commScore.ratingCategory?.badgeClass || 'score-badge-good'}`}>
                {commScore.level}
              </span>
            )}
          </div>

          {commScore.isInsufficientData ? (
            <div className="insufficient-warning-box">
              <span aria-hidden="true">⚠️ </span>
              <span>{commScore.insufficientMessage}</span>
            </div>
          ) : (
            <div className="hero-body-grid">
              {/* Radial / Progress Score Display */}
              <div className="hero-score-ring-box">
                <div className="score-gauge-circle">
                  <span className="gauge-score-val">{commScore.score}</span>
                  <span className="gauge-max">/ 100</span>
                </div>
                <div className="gauge-bar-wrapper">
                  <div
                    className={`gauge-bar-fill ${commScore.ratingCategory?.badgeClass || 'score-badge-good'}`}
                    style={{ width: `${commScore.score}%` }}
                  />
                </div>
              </div>

              {/* Narrative Assessment Summary */}
              <div className="hero-assessment-box">
                <h6 className="assessment-heading">💡 Executive Coaching Summary</h6>
                <p className="assessment-text">{commScore.overallAssessment}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Performance Overview Metric Cards Grid */}
      <div className="dashboard-overview-grid">
        {/* Metric Card 1: Speaking Pace */}
        <div className="overview-metric-card">
          <div className="card-top-row">
            <span className="card-icon" aria-hidden="true">⚡</span>
            <span className={`mini-badge ${pace?.badgeClass || ''}`}>{pace?.label || 'Pace'}</span>
          </div>
          <span className="card-val">{voiceAnalytics?.wordsPerMinute > 0 ? `${voiceAnalytics.wordsPerMinute} WPM` : 'N/A'}</span>
          <span className="card-lbl">Speaking Pace</span>
        </div>

        {/* Metric Card 2: Filler Words */}
        <div className="overview-metric-card">
          <div className="card-top-row">
            <span className="card-icon" aria-hidden="true">🔎</span>
            <span className={`mini-badge ${fillers?.rating?.badgeClass || ''}`}>{fillers?.rating?.label || 'Fillers'}</span>
          </div>
          <span className="card-val">{fillers ? `${fillers.fillerPercentage}%` : 'N/A'}</span>
          <span className="card-lbl">Filler Usage ({fillers?.totalFillers ?? 0} total)</span>
        </div>

        {/* Metric Card 3: Voice Confidence */}
        <div className="overview-metric-card">
          <div className="card-top-row">
            <span className="card-icon" aria-hidden="true">🎙️</span>
            <span className={`mini-badge ${confidence?.badgeClass || ''}`}>{confidence?.level || 'Confidence'}</span>
          </div>
          <span className="card-val">{confidence?.score ? `${confidence.score} / 100` : 'N/A'}</span>
          <span className="card-lbl">Voice Delivery Confidence</span>
        </div>

        {/* Metric Card 4: Tone */}
        <div className="overview-metric-card">
          <div className="card-top-row">
            <span className="card-icon" aria-hidden="true">🎭</span>
            <span className={`mini-badge ${tone?.badgeClass || ''}`}>{tone?.tone || 'Tone'}</span>
          </div>
          <span className="card-val">{tone?.tone || 'Neutral'}</span>
          <span className="card-lbl">Communication Tone</span>
        </div>

        {/* Metric Card 5: Sentiment */}
        <div className="overview-metric-card">
          <div className="card-top-row">
            <span className="card-icon" aria-hidden="true">😊</span>
            <span className="mini-badge sentiment-badge">{tone?.sentiment || 'Sentiment'}</span>
          </div>
          <span className="card-val">{tone?.sentiment || 'Neutral'}</span>
          <span className="card-lbl">Language Sentiment</span>
        </div>
      </div>

      {/* 5. Score Breakdown Visualization */}
      {commScore && !commScore.isInsufficientData && commScore.breakdown && (
        <div className="dashboard-section-card score-breakdown-section">
          <div className="section-title-bar">
            <h5 className="section-title">📊 Score Breakdown & Component Weights</h5>
            <span className="section-subtitle">Individual subscores contributing to the 0–100 communication score</span>
          </div>

          <div className="breakdown-bars-container">
            {Object.entries(commScore.breakdown).map(([key, item]) => (
              <div key={key} className="breakdown-bar-item">
                <div className="bar-header-info">
                  <span className="bar-label">{item.label}</span>
                  <span className="bar-weight-tag">Weight {item.weightPercentage}%</span>
                  <span className="bar-score-val">{item.available ? `${item.score} / 100` : 'Unavailable'}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${item.available ? item.score : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Speech & Voice Delivery Deep-Dive Analytics Grid */}
      <div className="dashboard-analytics-grid">
        {/* Card A: Speaking Pace Analysis */}
        {pace && (
          <div className="dashboard-section-card pace-card">
            <div className="card-header-bar">
              <span className="header-title">📊 Speaking Pace Analysis</span>
              <span className={`pace-badge ${pace.badgeClass}`}>{pace.label}</span>
            </div>

            <div className="metrics-subgrid">
              <div className="submetric-box">
                <span className="sub-lbl">⏱️ Duration</span>
                <span className="sub-val">{formatAudioTimer(voiceAnalytics?.durationSeconds || 0)}</span>
              </div>
              <div className="submetric-box">
                <span className="sub-lbl">📝 Words Spoken</span>
                <span className="sub-val">{voiceAnalytics?.wordCount || 0} words</span>
              </div>
              <div className="submetric-box">
                <span className="sub-lbl">⚡ Pace (WPM)</span>
                <span className="sub-val">{voiceAnalytics?.wordsPerMinute || 0} WPM</span>
              </div>
            </div>

            <div className="card-feedback-footer">
              <span className="footer-icon" aria-hidden="true">💡</span>
              <p className="footer-text">{pace.feedback}</p>
            </div>
          </div>
        )}

        {/* Card B: Filler Word Analysis */}
        {fillers && (
          <div className="dashboard-section-card filler-card">
            <div className="card-header-bar">
              <span className="header-title">🔎 Filler Word Analysis</span>
              <span className={`filler-badge ${fillers.rating.badgeClass}`}>{fillers.rating.label}</span>
            </div>

            <div className="metrics-subgrid">
              <div className="submetric-box">
                <span className="sub-lbl">🚫 Total Fillers</span>
                <span className="sub-val">{fillers.totalFillers}</span>
              </div>
              <div className="submetric-box">
                <span className="sub-lbl">📊 Filler Rate</span>
                <span className="sub-val">{fillers.fillerPercentage}%</span>
              </div>
              <div className="submetric-box">
                <span className="sub-lbl">💬 Words Analyzed</span>
                <span className="sub-val">{voiceAnalytics?.wordCount || 0} words</span>
              </div>
            </div>

            {/* Detected Filler Tags / Empty State */}
            <div className="detected-fillers-row">
              <span className="tags-label">Detected Fillers:</span>
              {fillers.detected.length > 0 ? (
                <div className="fillers-tags-wrapper">
                  {fillers.detected.map((item, idx) => (
                    <span key={idx} className="filler-pill">
                      <strong>{item.word}</strong>
                      <span className="pill-count">×{item.count}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="positive-empty-badge">
                  <span aria-hidden="true">🎉</span>
                  <span>No common filler words detected.</span>
                </div>
              )}
            </div>

            <div className="card-feedback-footer">
              <span className="footer-icon" aria-hidden="true">💡</span>
              <p className="footer-text">{fillers.rating.feedback}</p>
            </div>
          </div>
        )}

        {/* Card C: Voice Delivery Confidence */}
        {confidence && (
          <div className="dashboard-section-card confidence-card">
            <div className="card-header-bar">
              <span className="header-title">🎙️ Voice Delivery Confidence</span>
              <span className={`confidence-badge ${confidence.badgeClass}`}>{confidence.level}</span>
            </div>

            <div className="metrics-subgrid four-col">
              <div className="submetric-box highlighted">
                <span className="sub-lbl">🏆 Delivery Score</span>
                <span className="sub-val">{confidence.score} / 100</span>
              </div>
              <div className="submetric-box">
                <span className="sub-lbl">⚡ Vocal Energy</span>
                <span className="sub-val">{confidence.indicators.vocalEnergy}</span>
              </div>
              <div className="submetric-box">
                <span className="sub-lbl">🔊 Volume Consistency</span>
                <span className="sub-val">{confidence.indicators.volumeConsistency}</span>
              </div>
              <div className="submetric-box">
                <span className="sub-lbl">🎯 Speech Stability</span>
                <span className="sub-val">{confidence.indicators.speechStability}</span>
              </div>
            </div>

            <div className="card-feedback-footer">
              <span className="footer-icon" aria-hidden="true">💡</span>
              <p className="footer-text">{confidence.feedback}</p>
            </div>
          </div>
        )}

        {/* Card D: Communication Tone & Sentiment */}
        {tone && (
          <div className="dashboard-section-card tone-card">
            <div className="card-header-bar">
              <span className="header-title">😊 Tone & Sentiment Analysis</span>
              <span className={`tone-badge ${tone.badgeClass}`}>{tone.tone} Tone</span>
            </div>

            <div className="metrics-subgrid">
              <div className="submetric-box">
                <span className="sub-lbl">🎭 Tone</span>
                <span className="sub-val">{tone.tone}</span>
              </div>
              <div className="submetric-box">
                <span className="sub-lbl">💬 Sentiment</span>
                <span className="sub-val">{tone.sentiment}</span>
              </div>
              <div className="submetric-box">
                <span className="sub-lbl">❓ Hedging Phrases</span>
                <span className="sub-val">{tone.uncertaintyIndicators}</span>
              </div>
            </div>

            <div className="card-feedback-footer">
              <span className="footer-icon" aria-hidden="true">💡</span>
              <p className="footer-text">{tone.feedback}</p>
            </div>
          </div>
        )}
      </div>

      {/* 7. AI Personalized Coaching & Feedback Lists */}
      {commScore && !commScore.isInsufficientData && (
        <div className="dashboard-section-card ai-coaching-section">
          <div className="section-title-bar">
            <h5 className="section-title">💬 Personalized AI Interview Coaching</h5>
            <span className="section-subtitle">Actionable feedback based on transcript clarity and vocal delivery</span>
          </div>

          {isEvaluatingAi && (
            <div className="coaching-loading-banner">
              <span className="dashboard-spinner sm" aria-hidden="true" />
              <span>Evaluating communication quality with Gemini AI...</span>
            </div>
          )}

          {aiError && (
            <div className="coaching-error-banner">
              <span aria-hidden="true">⚠️ </span>
              <span>{aiError}</span>
            </div>
          )}

          <div className="coaching-lists-grid">
            {/* Strengths List */}
            <div className="coaching-list-card strengths">
              <h6 className="list-heading text-success">✓ Strengths</h6>
              {commScore.strengths.length > 0 ? (
                <ul>
                  {commScore.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-list-text">Clear attempt at structuring the response.</p>
              )}
            </div>

            {/* Areas to Improve List */}
            <div className="coaching-list-card improve">
              <h6 className="list-heading text-warning">• Areas to Improve</h6>
              {commScore.areasToImprove.length > 0 ? (
                <ul>
                  {commScore.areasToImprove.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-list-text">Elaborate further on key technical decisions.</p>
              )}
            </div>

            {/* Recommendations List */}
            <div className="coaching-list-card recommendations">
              <h6 className="list-heading text-info">💡 Recommendations</h6>
              {commScore.recommendations.length > 0 ? (
                <ul>
                  {commScore.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-list-text">Structure complex answers using the STAR method.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceAnalyticsDashboard;
