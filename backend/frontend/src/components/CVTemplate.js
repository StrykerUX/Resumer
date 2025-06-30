import React from 'react';
import '../styles/cv.css';

const CVTemplate = ({ data }) => {
  return (
    <div className="cv-container" id="cv-content">
      {/* Header Section */}
      <header className="cv-header">
        <div className="header-main">
          <h1 className="name">{data.personalInfo.name}</h1>
          <h2 className="title">{data.personalInfo.title}</h2>
        </div>
        <div className="contact-info">
          <div className="contact-item">{data.personalInfo.email}</div>
          <div className="contact-item">{data.personalInfo.phone}</div>
          <div className="contact-item">{data.personalInfo.location}</div>
          <div className="contact-item">{data.personalInfo.timezone}</div>
        </div>
      </header>

      {/* Professional Summary */}
      <section className="cv-section">
        <h3 className="section-title">PROFESSIONAL SUMMARY</h3>
        <p className="summary-text">{data.professionalSummary.text}</p>
      </section>

      {/* Core Skills */}
      <section className="cv-section">
        <h3 className="section-title">EXPERTISE</h3>
        
        <div className="skills-category">
          <h4 className="skills-subtitle">Technical Proficiency</h4>
          <div className="skills-list">
            {data.coreSkills.technical.map((skill, index) => (
              <div key={index} className="skill-item">{skill}</div>
            ))}
          </div>
        </div>

        <div className="skills-category">
          <h4 className="skills-subtitle">Tools & Platforms</h4>
          <div className="skills-list">
            {data.coreSkills.tools.map((tool, index) => (
              <div key={index} className="skill-item">{tool}</div>
            ))}
          </div>
        </div>

        <div className="skills-category">
          <h4 className="skills-subtitle">Professional Competencies</h4>
          <div className="skills-list">
            {data.coreSkills.competencies.map((skill, index) => (
              <div key={index} className="skill-item">{skill}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Experience */}
      <section className="cv-section">
        <h3 className="section-title">PROFESSIONAL EXPERIENCE</h3>
        {data.experience.map((job, index) => (
          <div key={index} className="experience-item">
            <div className="job-sidebar">
              <div className="job-period">{job.period}</div>
              <div className="job-location">{job.location}</div>
            </div>
            <div className="job-content">
              <div className="job-header">
                <h4 className="job-title">{job.title}</h4>
                <div className="company">{job.company}</div>
              </div>
              <ul className="achievements">
                {job.achievements.map((achievement, achIndex) => (
                  <li key={achIndex} className="achievement-item">{achievement}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* Languages */}
      <section className="cv-section">
        <h3 className="section-title">LANGUAGES</h3>
        <div className="languages-list">
          {data.languages.map((lang, index) => (
            <div key={index} className="language-item">
              <span className="language">{lang.language}</span>
              <span className="level">{lang.level}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="cv-section">
        <h3 className="section-title">CERTIFICATIONS</h3>
        <ul className="certifications-list">
          {data.certifications.map((cert, index) => (
            <li key={index} className="certification-item">{cert}</li>
          ))}
        </ul>
      </section>

      {/* Key Projects */}
      <section className="cv-section">
        <h3 className="section-title">KEY PROJECTS</h3>
        {data.projects.map((project, index) => (
          <div key={index} className="project-item">
            <div className="project-meta">
              <h4 className="project-name">{project.name}</h4>
              <div className="project-technologies">
                {project.technologies.join(' • ')}
              </div>
            </div>
            <div className="project-content">
              <p className="project-description">{project.description}</p>
            </div>
          </div>
        ))}
      </section>

    </div>
  );
};

export default CVTemplate;