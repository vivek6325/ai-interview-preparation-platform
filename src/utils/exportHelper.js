/**
 * Helper to export mock interview reports to a beautifully formatted downloadable HTML file.
 * The file includes print-friendly layouts and triggers window.print() naturally for PDF export.
 */
export function downloadInterviewReport(session) {
  if (!session) return;

  const title = session.title || 'Practice Session';
  const role = session.role || 'Software Engineer';
  const difficulty = session.difficulty || 'Medium';
  const score = session.overallScore || 0;
  const grade = session.grade || 'Strong Candidate';
  const verdict = session.verdict || session.overallFeedback || 'Completed';
  
  const metricsHtml = (session.metrics || []).map(m => `
    <div class="metric-row">
      <div class="metric-info">
        <strong>${m.name}</strong>
        <p>${m.description}</p>
      </div>
      <div class="metric-val" style="color: ${m.color || '#6366f1'}">${m.score}%</div>
    </div>
  `).join('');

  const strengthsHtml = (session.strengths || []).map(s => `
    <li>🎯 ${s}</li>
  `).join('');

  const improvementsHtml = (session.improvements || []).map(i => `
    <li>💡 ${i}</li>
  `).join('');

  const questionsHtml = (session.questionsBreakdown || []).map(q => `
    <div class="q-card">
      <div class="q-header">
        <h4>Question ${q.number}: ${q.question}</h4>
        <span class="q-badge">Score: ${q.score}%</span>
      </div>
      <div class="q-point strength">
        <strong>🔥 Key Strength</strong>
        <p>${q.strength}</p>
      </div>
      <div class="q-point improvement">
        <strong>💡 Area for Growth</strong>
        <p>${q.improvement}</p>
      </div>
    </div>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PrepAI Interview Report - ${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #090d16;
      color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(17, 24, 39, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .print-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand {
      font-size: 24px;
      font-weight: 800;
      color: #fff;
    }
    .brand span {
      color: #a855f7;
    }
    .btn-print {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .header-info {
      text-align: left;
      margin-bottom: 40px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 32px;
      background: linear-gradient(135deg, #ffffff 40%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .meta-box {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.04);
      padding: 20px;
      border-radius: 12px;
    }
    .meta-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
    }
    .meta-value {
      font-size: 20px;
      font-weight: 700;
      margin-top: 5px;
    }
    h2 {
      font-size: 20px;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 8px;
      text-align: left;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .metric-info {
      text-align: left;
    }
    .metric-info p {
      margin: 4px 0 0;
      font-size: 13px;
      color: #94a3b8;
    }
    .metric-val {
      font-size: 18px;
      font-weight: 700;
    }
    .split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 40px 0;
    }
    .split-col {
      background: rgba(255,255,255,0.01);
      border: 1px solid rgba(255,255,255,0.04);
      border-radius: 16px;
      padding: 20px;
      text-align: left;
    }
    .split-col ul {
      padding-left: 20px;
      margin: 0;
    }
    .split-col li {
      margin-bottom: 12px;
      font-size: 14px;
      color: #cbd5e1;
    }
    .q-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.04);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      text-align: left;
    }
    .q-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 15px;
      margin-bottom: 15px;
    }
    .q-header h4 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
    }
    .q-badge {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      color: #a5b4fc;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }
    .q-point {
      padding: 10px 15px;
      border-radius: 8px;
      font-size: 13.5px;
      margin-top: 10px;
    }
    .q-point.strength {
      background: rgba(16, 185, 129, 0.04);
      border: 1px solid rgba(16, 185, 129, 0.1);
      color: #a7f3d0;
    }
    .q-point.improvement {
      background: rgba(99, 102, 241, 0.04);
      border: 1px solid rgba(99, 102, 241, 0.1);
      color: #c7d2fe;
    }
    .q-point strong {
      display: block;
      margin-bottom: 4px;
    }
    .q-point p {
      margin: 0;
      color: #94a3b8;
    }
    @media print {
      body {
        background: #fff;
        color: #000;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        background: transparent;
        padding: 0;
      }
      .btn-print {
        display: none;
      }
      h1 {
        background: none;
        -webkit-text-fill-color: initial;
        color: #000;
      }
      .meta-box, .split-col, .q-card {
        border: 1px solid #ddd;
        background: transparent;
      }
      .meta-value, .metric-val {
        color: #000 !important;
      }
      .meta-label, .metric-info p, .q-point p {
        color: #444 !important;
      }
      .q-point {
        border: 1px solid #ccc;
      }
      .q-point.strength {
        background: #f0fdf4 !important;
        color: #14532d !important;
      }
      .q-point.improvement {
        background: #eff6ff !important;
        color: #1e3a8a !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-banner">
      <div class="brand">PrepAI<span>.</span></div>
      <button class="btn-print" onclick="window.print()">Print Official Report</button>
    </div>
    
    <div class="header-info">
      <h1>Mock Interview Evaluation</h1>
      <p style="margin: 0; color: #94a3b8;">Role Focus: ${role} &bull; Practice Domain: ${title}</p>
    </div>
    
    <div class="meta-grid">
      <div class="meta-box">
        <div class="meta-label">Overall Rating</div>
        <div class="meta-value" style="color: var(--primary);">${score} / 10</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Candidate Grade</div>
        <div class="meta-value" style="color: #34d399;">${grade}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Difficulty</div>
        <div class="meta-value">${difficulty}</div>
      </div>
    </div>
    
    <h2>Verdict Summary</h2>
    <p style="text-align: left; font-size: 15px; margin-bottom: 40px; color: #cbd5e1;">${verdict}</p>
    
    <h2>Dimension Breakdown</h2>
    <div style="margin-bottom: 40px;">
      ${metricsHtml}
    </div>
    
    <div class="split-grid">
      <div class="split-col">
        <h3 style="margin-top:0; color: #34d399;">✨ Key Strengths</h3>
        <ul>
          ${strengthsHtml}
        </ul>
      </div>
      <div class="split-col">
        <h3 style="margin-top:0; color: #f59e0b;">💡 Areas for Growth</h3>
        <ul>
          ${improvementsHtml}
        </ul>
      </div>
    </div>
    
    <h2>Question-by-Question Feedback</h2>
    <div>
      ${questionsHtml}
    </div>
  </div>
</body>
</html>
  `;

  // Trigger HTML download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PrepAI_Report_${role.replace(/\s+/g, '_')}_${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
