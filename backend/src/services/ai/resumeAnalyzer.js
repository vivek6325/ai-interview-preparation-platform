/**
 * Mock AI Resume Analyzer Service
 * Extracts skills, projects, education, technologies, and experience details from uploaded resume documents.
 */

export const analyzeResume = (filename = '') => {
  return {
    skills: [
      "JavaScript (ES6+)",
      "TypeScript",
      "React.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "RESTful API Design",
      "Git & GitHub",
      "Docker"
    ],
    projects: [
      "AI Mock Interview Platform: A multi-tier web application built with React, Node, and Tailwind.",
      "Real-Time Chat Engine: Secure messaging portal implementing WebSockets and JWT validations."
    ],
    education: [
      "Bachelor of Science in Computer Science - State University (GPA: 3.9/4.0)"
    ],
    technologies: [
      "React",
      "Vite",
      "Redux Toolkit",
      "HTML5",
      "CSS3",
      "Mongoose",
      "Jest",
      "Supertest"
    ],
    experience: "2+ Years of professional Software Development experience building clean UI pages and scalable backend APIs."
  };
};
