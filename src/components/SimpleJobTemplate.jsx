import React from "react";

const txt = (v) => String(v ?? "").trim();
const has = (v) => txt(v).length > 0;
const html = (v) => ({ __html: String(v || "") });

function HtmlBlock({ value }) {
  if (!has(value)) return null;
  return <div className="job-simple-rich" dangerouslySetInnerHTML={html(value)} />;
}

export function SimpleJobTemplate({ data = {}, isPro = false, resumeDocRef = null, autoFontScale = 1, designSettings = {} }) {
  const d = data || {};

  const name = txt(d.fullName) || "YOUR NAME";
  const role = txt(d.role);
  const contact = [
    txt(d.phone),
    txt(d.email),
    txt(d.address),
  ].filter(Boolean);

  // Auto-fit is always authoritative. Older saved settings may contain
  // manualMode:true, but that flag must not disable automatic one-page fitting.
  const scale = Math.max(0.62, Math.min(2.80, Number(autoFontScale) || 1));

  return (
    <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
      <div
        id="resume-document"
        ref={resumeDocRef}
        className="job-simple-page"
        style={{ "--resume-font-scale": scale }}
      >
        {/* Header */}
        <div className="job-simple-header">
          <h1 className="job-simple-title">RESUME</h1>
          <div className="job-simple-name-row">
            <div className="job-simple-name">{name}</div>
            {role && <div className="job-simple-role">{role}</div>}
          </div>
          {contact.length > 0 && (
            <div className="job-simple-contact">
              {contact.map((c, i) => (
                <span key={i}>{c}{i < contact.length - 1 ? "  •  " : ""}</span>
              ))}
            </div>
          )}
        </div>

        <div className="job-simple-divider" />

        {/* Sections */}
        {has(d.summary) && (
          <section className="job-simple-section">
            <h2 className="job-simple-section-title">Career Objective</h2>
            <HtmlBlock value={d.summary} />
          </section>
        )}

        {has(d.workExperience) && (
          <section className="job-simple-section">
            <h2 className="job-simple-section-title">Work Experience</h2>
            <HtmlBlock value={d.workExperience} />
          </section>
        )}

        {(has(d.gradCourse) || has(d.gradCollege) || has(d.gradUniv) || has(d.gradDiv) ||
          has(d.interSchool) || has(d.interBoard) || has(d.interDiv) ||
          has(d.sscSchool) || has(d.sscBoard) || has(d.sscDiv)) && (
          <section className="job-simple-section">
            <h2 className="job-simple-section-title">Education</h2>
            <table className="job-simple-table">
              <tbody>
                {(has(d.gradCourse) || has(d.gradCollege) || has(d.gradUniv) || has(d.gradDiv)) && (
                  <tr>
                    <td className="job-simple-label">Graduation</td>
                    <td className="job-simple-colon">:</td>
                    <td className="job-simple-value">
                      {[d.gradCourse, d.gradCollege, d.gradUniv, d.gradDiv].filter(has).join(" — ")}
                    </td>
                  </tr>
                )}
                {(has(d.interSchool) || has(d.interBoard) || has(d.interDiv)) && (
                  <tr>
                    <td className="job-simple-label">Intermediate (12th)</td>
                    <td className="job-simple-colon">:</td>
                    <td className="job-simple-value">
                      {[d.interSchool, d.interBoard, d.interDiv].filter(has).join(" — ")}
                    </td>
                  </tr>
                )}
                {(has(d.sscSchool) || has(d.sscBoard) || has(d.sscDiv)) && (
                  <tr>
                    <td className="job-simple-label">SSC (10th)</td>
                    <td className="job-simple-colon">:</td>
                    <td className="job-simple-value">
                      {[d.sscSchool, d.sscBoard, d.sscDiv].filter(has).join(" — ")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {(has(d.officeAutomation) || has(d.techKnowledge)) && (
          <section className="job-simple-section">
            <h2 className="job-simple-section-title">Skills</h2>
            <table className="job-simple-table">
              <tbody>
                {has(d.officeAutomation) && (
                  <tr>
                    <td className="job-simple-label">Office Automation</td>
                    <td className="job-simple-colon">:</td>
                    <td className="job-simple-value">{d.officeAutomation}</td>
                  </tr>
                )}
                {has(d.techKnowledge) && (
                  <tr>
                    <td className="job-simple-label">Technical Knowledge</td>
                    <td className="job-simple-colon">:</td>
                    <td className="job-simple-value">{d.techKnowledge}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {has(d.hobbies) && (
          <section className="job-simple-section">
            <h2 className="job-simple-section-title">Hobbies & Interests</h2>
            <div className="job-simple-text">{d.hobbies}</div>
          </section>
        )}

        {/* Footer signature line */}
        <div className="job-simple-footer">
          <div className="job-simple-sign-line">
            <span>Signature</span>
          </div>
        </div>

        {!isPro && (
          <div className="job-simple-watermark" aria-hidden="true">
            CV MAKER AI · PREVIEW
          </div>
        )}
      </div>
    </div>
  );
}

export const SIMPLE_JOB_TEMPLATE = {
  id: "tpl-b-001",
  name: "Simple White Resume",
  category: "Basic",
  desc: "Clean simple white A4 resume — all details in Title : Value format.",
  layoutType: "job-simple",
  styles: {
    fontFamily: "Inter, Arial, sans-serif",
    primaryColor: "#111111",
    secondaryColor: "#666666",
    accentColor: "#111111",
    headerBg: "#ffffff",
    sectionBg: "#ffffff",
    textColor: "#111111",
    headerStyle: "underline",
    spacing: "normal",
    showSignature: false,
    educationStyle: "list",
  },
};

/** Extra simple job biodata templates (same engine, different style tokens). */
export const SIMPLE_JOB_TEMPLATES = [
  SIMPLE_JOB_TEMPLATE,
  {
    id: "tpl-b-002",
    name: "Classic Job Biodata",
    category: "Basic",
    desc: "Classic job biodata — name, contact, education & experience in clean rows.",
    layoutType: "job-simple",
    styles: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      primaryColor: "#1e3a5f",
      secondaryColor: "#64748b",
      accentColor: "#1e3a5f",
      headerBg: "#ffffff",
      sectionBg: "#ffffff",
      textColor: "#1e293b",
      headerStyle: "underline",
      spacing: "normal",
      showSignature: true,
      educationStyle: "list",
    },
  },
  {
    id: "tpl-b-003",
    name: "Professional Navy Resume",
    category: "Professional",
    desc: "Professional navy accent job resume for careers & applications.",
    layoutType: "job-simple",
    styles: {
      fontFamily: "Inter, Arial, sans-serif",
      primaryColor: "#1e3a5f",
      secondaryColor: "#475569",
      accentColor: "#2563eb",
      headerBg: "#1e3a5f",
      sectionBg: "#f8fafc",
      textColor: "#0f172a",
      headerStyle: "bar",
      spacing: "normal",
      showSignature: false,
      educationStyle: "list",
    },
  },
];
