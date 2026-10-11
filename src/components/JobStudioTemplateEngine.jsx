import React from "react";
import "./JobStudioTemplates.css";

const txt = (v) => String(v ?? "").trim();
const has = (v) => txt(v).length > 0;
const html = (v) => ({ __html: String(v || "") });

function splitName(full) {
  const p = txt(full).split(/\s+/).filter(Boolean);
  if (!p.length) return { first: "", last: "" };
  if (p.length === 1) return { first: p[0], last: "" };
  return { first: p[0], last: p.slice(1).join(" ") };
}

function Photo({ src, className = "", style }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt="Profile"
      className={`hm-photo-img ${className}`}
      style={style}
    />
  );
}

function HtmlBlock({ value, className = "" }) {
  if (!has(value)) return null;
  return <div className={`hm-text-shift ${className}`} dangerouslySetInnerHTML={html(value)} />;
}

/* 1 — Teal two-column with circular photo header */
function JobTpl1({ data, showPhoto, scale }) {
  const d = data || {};
  const { first, last } = splitName(d.fullName);
  const src = showPhoto === false ? "" : d.photo;
  const fs = (n) => ({ fontSize: `calc(${n}px * var(--resume-font-scale, ${scale}))` });
  return (
    <div className="job-studio-card job-t1" style={{ fontFamily: "Montserrat, Inter, sans-serif" }}>
      <div className="job-t1-header">
        {src && (
          <div className="job-t1-photo-wrap hm-text-shift">
            <Photo src={src} className="job-t1-photo" />
          </div>
        )}
        <div className="job-t1-nameblock hm-text-shift">
          {has(first) && <div className="job-t1-first" style={fs(28)}>{first}</div>}
          {has(last) && <div className="job-t1-last" style={fs(34)}>{last}</div>}
        </div>
      </div>
      {(has(d.role) || has(d.summary)) && (
        <div className="job-t1-bar hm-text-shift">
          <span style={fs(13)}>{txt(d.role) || "Professional"}</span>
        </div>
      )}
      <div className="job-t1-body">
        <div className="job-t1-side">
          {(has(d.email) || has(d.phone) || has(d.address)) && (
            <div className="job-t1-sec hm-text-shift">
              <h3 style={fs(11)}>CONTACT</h3>
              {has(d.email) && <p style={fs(10)}>{d.email}</p>}
              {has(d.phone) && <p style={fs(10)}>{d.phone}</p>}
              {has(d.address) && <p style={fs(10)} className="whitespace-pre-line">{d.address}</p>}
            </div>
          )}
          {has(d.summary) && (
            <div className="job-t1-sec hm-text-shift">
              <h3 style={fs(11)}>PROFILE SUMMARY</h3>
              <HtmlBlock value={d.summary} className="job-rich" style={fs(10)} />
            </div>
          )}
          {(has(d.officeAutomation) || has(d.techKnowledge)) && (
            <div className="job-t1-sec hm-text-shift">
              <h3 style={fs(11)}>SKILLS</h3>
              {has(d.officeAutomation) && <p style={fs(10)}>{d.officeAutomation}</p>}
              {has(d.techKnowledge) && <p style={fs(10)}>{d.techKnowledge}</p>}
            </div>
          )}
          {has(d.hobbies) && (
            <div className="job-t1-sec hm-text-shift">
              <h3 style={fs(11)}>HOBBIES</h3>
              <p style={fs(10)}>{d.hobbies}</p>
            </div>
          )}
        </div>
        <div className="job-t1-main">
          {has(d.workExperience) && (
            <div className="job-t1-sec hm-text-shift">
              <h3 style={fs(11)}>PROFESSIONAL EXPERIENCE</h3>
              <HtmlBlock value={d.workExperience} className="job-rich" />
            </div>
          )}
          {(has(d.gradCourse) || has(d.interSchool) || has(d.sscSchool)) && (
            <div className="job-t1-sec hm-text-shift">
              <h3 style={fs(11)}>EDUCATION</h3>
              {has(d.gradCourse) && (
                <p style={fs(10)}>
                  <strong>{d.gradCourse}</strong>
                  {has(d.gradCollege) ? ` — ${d.gradCollege}` : ""}
                  {has(d.gradUniv) ? `, ${d.gradUniv}` : ""}
                  {has(d.gradDiv) ? ` (${d.gradDiv})` : ""}
                </p>
              )}
              {has(d.interSchool) && (
                <p style={fs(10)}>
                  Intermediate — {d.interSchool}
                  {has(d.interBoard) ? ` (${d.interBoard})` : ""}
                  {has(d.interDiv) ? ` · ${d.interDiv}` : ""}
                </p>
              )}
              {has(d.sscSchool) && (
                <p style={fs(10)}>
                  SSC — {d.sscSchool}
                  {has(d.sscBoard) ? ` (${d.sscBoard})` : ""}
                  {has(d.sscDiv) ? ` · ${d.sscDiv}` : ""}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* 2 — Dusty rose centered header */
function JobTpl2({ data, showPhoto, scale }) {
  const d = data || {};
  const src = showPhoto === false ? "" : d.photo;
  const fs = (n) => ({ fontSize: `calc(${n}px * var(--resume-font-scale, ${scale}))` });
  return (
    <div className="job-studio-card job-t2" style={{ fontFamily: "Poppins, Inter, sans-serif" }}>
      <div className="job-t2-banner">
        {src && <Photo src={src} className="job-t2-photo hm-text-shift" />}
        {has(d.fullName) && <h1 style={fs(22)} className="hm-text-shift">{d.fullName}</h1>}
        {has(d.role) && <p className="job-t2-role hm-text-shift" style={fs(12)}>{d.role}</p>}
        {has(d.summary) && <HtmlBlock value={d.summary} className="job-t2-sum job-rich hm-text-shift" />}
      </div>
      {(has(d.phone) || has(d.email) || has(d.address)) && (
        <div className="job-t2-contact hm-text-shift" style={fs(10)}>
          {[d.phone, d.email, d.address].filter(has).join("  ·  ")}
        </div>
      )}
      {(has(d.officeAutomation) || has(d.techKnowledge)) && (
        <div className="job-t2-block hm-text-shift">
          <div className="job-t2-label" style={fs(11)}>RELEVANT SKILLS</div>
          {has(d.officeAutomation) && <p style={fs(10)}>{d.officeAutomation}</p>}
          {has(d.techKnowledge) && <p style={fs(10)}>{d.techKnowledge}</p>}
        </div>
      )}
      {has(d.workExperience) && (
        <div className="job-t2-block hm-text-shift">
          <div className="job-t2-label" style={fs(11)}>WORK EXPERIENCE</div>
          <HtmlBlock value={d.workExperience} className="job-rich" />
        </div>
      )}
      {(has(d.gradCourse) || has(d.interSchool)) && (
        <div className="job-t2-block hm-text-shift">
          <div className="job-t2-label" style={fs(11)}>EDUCATION</div>
          {has(d.gradCourse) && <p style={fs(10)}><strong>{d.gradCourse}</strong>{has(d.gradCollege) ? ` — ${d.gradCollege}` : ""}</p>}
          {has(d.interSchool) && <p style={fs(10)}>12th — {d.interSchool}</p>}
          {has(d.sscSchool) && <p style={fs(10)}>10th — {d.sscSchool}</p>}
        </div>
      )}
      {has(d.hobbies) && (
        <div className="job-t2-block hm-text-shift">
          <div className="job-t2-label" style={fs(11)}>HOBBIES</div>
          <p style={fs(10)}>{d.hobbies}</p>
        </div>
      )}
    </div>
  );
}

/* 3 — Dark wine sidebar */
function JobTpl3({ data, showPhoto, scale }) {
  const d = data || {};
  const src = showPhoto === false ? "" : d.photo;
  const fs = (n) => ({ fontSize: `calc(${n}px * var(--resume-font-scale, ${scale}))` });
  return (
    <div className="job-studio-card job-t3" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="job-t3-side">
        {src && <Photo src={src} className="job-t3-photo hm-text-shift" />}
        {has(d.fullName) && <h1 style={fs(18)} className="hm-text-shift">{d.fullName}</h1>}
        {has(d.role) && <p className="job-t3-role hm-text-shift" style={fs(11)}>{d.role}</p>}
        {(has(d.phone) || has(d.email) || has(d.address)) && (
          <div className="job-t3-sec hm-text-shift">
            <h3 style={fs(10)}>CONTACT</h3>
            {has(d.phone) && <p style={fs(10)}>{d.phone}</p>}
            {has(d.email) && <p style={fs(10)}>{d.email}</p>}
            {has(d.address) && <p style={fs(10)} className="whitespace-pre-line">{d.address}</p>}
          </div>
        )}
        {(has(d.officeAutomation) || has(d.techKnowledge)) && (
          <div className="job-t3-sec hm-text-shift">
            <h3 style={fs(10)}>SKILLS</h3>
            {has(d.officeAutomation) && <p style={fs(10)}>{d.officeAutomation}</p>}
            {has(d.techKnowledge) && <p style={fs(10)}>{d.techKnowledge}</p>}
          </div>
        )}
      </div>
      <div className="job-t3-main">
        {has(d.summary) && (
          <div className="job-t3-sec hm-text-shift">
            <h3 style={fs(11)}>PROFILE</h3>
            <HtmlBlock value={d.summary} className="job-rich" />
          </div>
        )}
        {has(d.workExperience) && (
          <div className="job-t3-sec hm-text-shift">
            <h3 style={fs(11)}>EXPERIENCE</h3>
            <HtmlBlock value={d.workExperience} className="job-rich" />
          </div>
        )}
        {(has(d.gradCourse) || has(d.interSchool)) && (
          <div className="job-t3-sec hm-text-shift">
            <h3 style={fs(11)}>EDUCATION</h3>
            {has(d.gradCourse) && <p style={fs(10)}><strong>{d.gradCourse}</strong>{has(d.gradCollege) ? ` — ${d.gradCollege}` : ""}</p>}
            {has(d.interSchool) && <p style={fs(10)}>12th — {d.interSchool}</p>}
            {has(d.sscSchool) && <p style={fs(10)}>10th — {d.sscSchool}</p>}
          </div>
        )}
        {has(d.hobbies) && (
          <div className="job-t3-sec hm-text-shift">
            <h3 style={fs(11)}>HOBBIES</h3>
            <p style={fs(10)}>{d.hobbies}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* 4 — Light blue arch photo */
function JobTpl4({ data, showPhoto, scale }) {
  const d = data || {};
  const src = showPhoto === false ? "" : d.photo;
  const fs = (n) => ({ fontSize: `calc(${n}px * var(--resume-font-scale, ${scale}))` });
  return (
    <div className="job-studio-card job-t4" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="job-t4-top">
        {src && <Photo src={src} className="job-t4-photo hm-text-shift" />}
        <div className="hm-text-shift">
          {has(d.fullName) && <h1 style={fs(24)}>{d.fullName}</h1>}
          {has(d.role) && <p style={fs(12)} className="job-t4-role">{d.role}</p>}
          <div className="job-t4-tags">
            {has(d.phone) && <span style={fs(10)}>{d.phone}</span>}
            {has(d.email) && <span style={fs(10)}>{d.email}</span>}
            {has(d.address) && <span style={fs(10)}>{d.address}</span>}
          </div>
        </div>
      </div>
      {has(d.summary) && (
        <div className="job-t4-sec hm-text-shift">
          <h3 style={fs(11)}>ABOUT</h3>
          <HtmlBlock value={d.summary} className="job-rich" />
        </div>
      )}
      {has(d.workExperience) && (
        <div className="job-t4-sec hm-text-shift">
          <h3 style={fs(11)}>EXPERIENCE</h3>
          <HtmlBlock value={d.workExperience} className="job-rich" />
        </div>
      )}
      {(has(d.gradCourse) || has(d.interSchool)) && (
        <div className="job-t4-sec hm-text-shift">
          <h3 style={fs(11)}>EDUCATION</h3>
          {has(d.gradCourse) && <p style={fs(10)}><strong>{d.gradCourse}</strong>{has(d.gradCollege) ? ` — ${d.gradCollege}` : ""}</p>}
          {has(d.interSchool) && <p style={fs(10)}>12th — {d.interSchool}</p>}
          {has(d.sscSchool) && <p style={fs(10)}>10th — {d.sscSchool}</p>}
        </div>
      )}
      {(has(d.officeAutomation) || has(d.techKnowledge) || has(d.hobbies)) && (
        <div className="job-t4-sec hm-text-shift">
          <h3 style={fs(11)}>SKILLS & INTERESTS</h3>
          {has(d.officeAutomation) && <p style={fs(10)}>{d.officeAutomation}</p>}
          {has(d.techKnowledge) && <p style={fs(10)}>{d.techKnowledge}</p>}
          {has(d.hobbies) && <p style={fs(10)}>{d.hobbies}</p>}
        </div>
      )}
    </div>
  );
}

/* 5 — Dark split sidebar gold header */
function JobTpl5({ data, showPhoto, scale }) {
  const d = data || {};
  const src = showPhoto === false ? "" : d.photo;
  const fs = (n) => ({ fontSize: `calc(${n}px * var(--resume-font-scale, ${scale}))` });
  return (
    <div className="job-studio-card job-t5" style={{ fontFamily: "Montserrat, sans-serif" }}>
      <div className="job-t5-side">
        {src && <Photo src={src} className="job-t5-photo hm-text-shift" />}
        {(has(d.phone) || has(d.email) || has(d.address)) && (
          <div className="job-t5-sec hm-text-shift">
            <h3 style={fs(10)}>CONTACT</h3>
            {has(d.phone) && <p style={fs(10)}>{d.phone}</p>}
            {has(d.email) && <p style={fs(10)}>{d.email}</p>}
            {has(d.address) && <p style={fs(10)} className="whitespace-pre-line">{d.address}</p>}
          </div>
        )}
        {(has(d.officeAutomation) || has(d.techKnowledge)) && (
          <div className="job-t5-sec hm-text-shift">
            <h3 style={fs(10)}>SKILLS</h3>
            {has(d.officeAutomation) && <p style={fs(10)}>{d.officeAutomation}</p>}
            {has(d.techKnowledge) && <p style={fs(10)}>{d.techKnowledge}</p>}
          </div>
        )}
        {has(d.hobbies) && (
          <div className="job-t5-sec hm-text-shift">
            <h3 style={fs(10)}>HOBBIES</h3>
            <p style={fs(10)}>{d.hobbies}</p>
          </div>
        )}
      </div>
      <div className="job-t5-main">
        <div className="job-t5-head hm-text-shift">
          {has(d.fullName) && <h1 style={fs(22)}>{d.fullName}</h1>}
          {has(d.role) && <p style={fs(12)}>{d.role}</p>}
        </div>
        {has(d.summary) && (
          <div className="job-t5-sec hm-text-shift">
            <h3 style={fs(11)}>PROFILE</h3>
            <HtmlBlock value={d.summary} className="job-rich" />
          </div>
        )}
        {has(d.workExperience) && (
          <div className="job-t5-sec hm-text-shift">
            <h3 style={fs(11)}>EXPERIENCE</h3>
            <HtmlBlock value={d.workExperience} className="job-rich" />
          </div>
        )}
        {(has(d.gradCourse) || has(d.interSchool)) && (
          <div className="job-t5-sec hm-text-shift">
            <h3 style={fs(11)}>EDUCATION</h3>
            {has(d.gradCourse) && <p style={fs(10)}><strong>{d.gradCourse}</strong>{has(d.gradCollege) ? ` — ${d.gradCollege}` : ""}</p>}
            {has(d.interSchool) && <p style={fs(10)}>12th — {d.interSchool}</p>}
            {has(d.sscSchool) && <p style={fs(10)}>10th — {d.sscSchool}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/* 6 — Pastel pink */
function JobTpl6({ data, showPhoto, scale }) {
  const d = data || {};
  const src = showPhoto === false ? "" : d.photo;
  const fs = (n) => ({ fontSize: `calc(${n}px * var(--resume-font-scale, ${scale}))` });
  return (
    <div className="job-studio-card job-t6" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="job-t6-grid">
        <div className="job-t6-left">
          {src && <Photo src={src} className="job-t6-photo hm-text-shift" />}
          {(has(d.phone) || has(d.email) || has(d.address)) && (
            <div className="job-t6-sec hm-text-shift">
              {has(d.phone) && <p style={fs(10)}>{d.phone}</p>}
              {has(d.email) && <p style={fs(10)}>{d.email}</p>}
              {has(d.address) && <p style={fs(10)} className="whitespace-pre-line">{d.address}</p>}
            </div>
          )}
          {(has(d.officeAutomation) || has(d.techKnowledge)) && (
            <div className="job-t6-sec hm-text-shift">
              <h3 style={fs(10)}>SKILLS</h3>
              {has(d.officeAutomation) && <p style={fs(10)}>{d.officeAutomation}</p>}
              {has(d.techKnowledge) && <p style={fs(10)}>{d.techKnowledge}</p>}
            </div>
          )}
        </div>
        <div className="job-t6-right">
          {has(d.fullName) && <h1 style={fs(22)} className="hm-text-shift">{d.fullName}</h1>}
          {has(d.role) && <p className="job-t6-role hm-text-shift" style={fs(12)}>{d.role}</p>}
          {has(d.summary) && <HtmlBlock value={d.summary} className="job-rich job-t6-sum hm-text-shift" />}
          {has(d.workExperience) && (
            <div className="job-t6-sec hm-text-shift">
              <h3 style={fs(11)}>WORK EXPERIENCE</h3>
              <HtmlBlock value={d.workExperience} className="job-rich" />
            </div>
          )}
          {(has(d.gradCourse) || has(d.interSchool)) && (
            <div className="job-t6-sec hm-text-shift">
              <h3 style={fs(11)}>EDUCATION</h3>
              {has(d.gradCourse) && <p style={fs(10)}><strong>{d.gradCourse}</strong>{has(d.gradCollege) ? ` — ${d.gradCollege}` : ""}</p>}
              {has(d.interSchool) && <p style={fs(10)}>12th — {d.interSchool}</p>}
              {has(d.sscSchool) && <p style={fs(10)}>10th — {d.sscSchool}</p>}
            </div>
          )}
          {has(d.hobbies) && (
            <div className="job-t6-sec hm-text-shift">
              <h3 style={fs(11)}>HOBBIES</h3>
              <p style={fs(10)}>{d.hobbies}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* 7 — Navy circle photo */
function JobTpl7({ data, showPhoto, scale }) {
  const d = data || {};
  const src = showPhoto === false ? "" : d.photo;
  const fs = (n) => ({ fontSize: `calc(${n}px * var(--resume-font-scale, ${scale}))` });
  return (
    <div className="job-studio-card job-t7" style={{ fontFamily: "Open Sans, Inter, sans-serif" }}>
      <div className="job-t7-top">
        {src && (
          <div className="job-t7-ring hm-text-shift">
            <Photo src={src} className="job-t7-photo" />
          </div>
        )}
        <div className="job-t7-titles hm-text-shift">
          {has(d.fullName) && <h1 style={fs(24)}>{d.fullName}</h1>}
          {has(d.role) && <p style={fs(13)}>{d.role}</p>}
        </div>
      </div>
      <div className="job-t7-grid">
        <div className="job-t7-left">
          {has(d.summary) && (
            <div className="job-t7-sec hm-text-shift">
              <h3 style={fs(10)}>ABOUT ME</h3>
              <HtmlBlock value={d.summary} className="job-rich" />
            </div>
          )}
          {(has(d.phone) || has(d.email) || has(d.address)) && (
            <div className="job-t7-sec job-t7-contact hm-text-shift">
              {has(d.phone) && <p style={fs(10)}>{d.phone}</p>}
              {has(d.email) && <p style={fs(10)}>{d.email}</p>}
              {has(d.address) && <p style={fs(10)} className="whitespace-pre-line">{d.address}</p>}
            </div>
          )}
          {(has(d.officeAutomation) || has(d.techKnowledge)) && (
            <div className="job-t7-sec hm-text-shift">
              <h3 className="job-t7-bar" style={fs(10)}>EXPERTISE</h3>
              {has(d.officeAutomation) && <p style={fs(10)}>{d.officeAutomation}</p>}
              {has(d.techKnowledge) && <p style={fs(10)}>{d.techKnowledge}</p>}
            </div>
          )}
        </div>
        <div className="job-t7-right">
          {has(d.workExperience) && (
            <div className="job-t7-sec hm-text-shift">
              <h3 className="job-t7-bar" style={fs(10)}>EXPERIENCE</h3>
              <HtmlBlock value={d.workExperience} className="job-rich" />
            </div>
          )}
          {(has(d.gradCourse) || has(d.interSchool)) && (
            <div className="job-t7-sec hm-text-shift">
              <h3 className="job-t7-bar" style={fs(10)}>EDUCATION</h3>
              {has(d.gradCourse) && <p style={fs(10)}><strong>{d.gradCourse}</strong>{has(d.gradCollege) ? ` — ${d.gradCollege}` : ""}</p>}
              {has(d.interSchool) && <p style={fs(10)}>12th — {d.interSchool}</p>}
              {has(d.sscSchool) && <p style={fs(10)}>10th — {d.sscSchool}</p>}
            </div>
          )}
          {has(d.hobbies) && (
            <div className="job-t7-sec hm-text-shift">
              <h3 className="job-t7-bar" style={fs(10)}>HOBBIES</h3>
              <p style={fs(10)}>{d.hobbies}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* 8 — Teal circle banner */
function JobTpl8({ data, showPhoto, scale }) {
  const d = data || {};
  const { first, last } = splitName(d.fullName);
  const src = showPhoto === false ? "" : d.photo;
  const fs = (n) => ({ fontSize: `calc(${n}px * var(--resume-font-scale, ${scale}))` });
  return (
    <div className="job-studio-card job-t8" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="job-t8-strip">
        {src && (
          <div className="job-t8-photo-wrap hm-text-shift">
            <Photo src={src} className="job-t8-photo" />
          </div>
        )}
      </div>
      <div className="job-t8-name hm-text-shift">
        {has(first) && <h1 style={fs(26)}>{first}</h1>}
        {has(last) && <h1 style={fs(26)}>{last}</h1>}
        {has(d.role) && <p style={fs(12)}>{d.role}</p>}
      </div>
      <div className="job-t8-grid">
        <div className="job-t8-left">
          {(has(d.phone) || has(d.email) || has(d.address)) && (
            <div className="job-t8-sec hm-text-shift">
              <span className="job-t8-pill" style={fs(10)}>Contact</span>
              {has(d.phone) && <p style={fs(10)}>{d.phone}</p>}
              {has(d.email) && <p style={fs(10)}>{d.email}</p>}
              {has(d.address) && <p style={fs(10)} className="whitespace-pre-line">{d.address}</p>}
            </div>
          )}
          {(has(d.officeAutomation) || has(d.techKnowledge) || has(d.hobbies)) && (
            <div className="job-t8-sec hm-text-shift">
              <span className="job-t8-pill" style={fs(10)}>Skills</span>
              {has(d.officeAutomation) && <p style={fs(10)}>{d.officeAutomation}</p>}
              {has(d.techKnowledge) && <p style={fs(10)}>{d.techKnowledge}</p>}
              {has(d.hobbies) && <p style={fs(10)}>{d.hobbies}</p>}
            </div>
          )}
        </div>
        <div className="job-t8-right">
          {has(d.summary) && (
            <div className="job-t8-sec hm-text-shift">
              <span className="job-t8-pill" style={fs(10)}>Profile</span>
              <HtmlBlock value={d.summary} className="job-rich" />
            </div>
          )}
          {has(d.workExperience) && (
            <div className="job-t8-sec hm-text-shift">
              <span className="job-t8-pill" style={fs(10)}>Work Summary</span>
              <HtmlBlock value={d.workExperience} className="job-rich" />
            </div>
          )}
          {(has(d.gradCourse) || has(d.interSchool)) && (
            <div className="job-t8-sec hm-text-shift">
              <span className="job-t8-pill" style={fs(10)}>Education</span>
              {has(d.gradCourse) && <p style={fs(10)}><strong>{d.gradCourse}</strong>{has(d.gradCollege) ? ` — ${d.gradCollege}` : ""}</p>}
              {has(d.interSchool) && <p style={fs(10)}>12th — {d.interSchool}</p>}
              {has(d.sscSchool) && <p style={fs(10)}>10th — {d.sscSchool}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const JOB_STUDIO_CONFIGS = [
  { id: "tpl-b-101", name: "Teal Avatar Split", category: "Professional", desc: "Two-column teal accent with circular photo header.", layoutType: "job-studio", jobStudio: { templateNo: 1 } },
  { id: "tpl-b-102", name: "Dusty Rose Header", category: "Professional", desc: "Centered dusty-rose banner with clean sections.", layoutType: "job-studio", jobStudio: { templateNo: 2 } },
  { id: "tpl-b-103", name: "Dark Wine Sidebar", category: "Professional", desc: "Deep maroon sidebar with structured main column.", layoutType: "job-studio", jobStudio: { templateNo: 3 } },
  { id: "tpl-b-104", name: "Light Blue Arch", category: "Professional", desc: "Soft blue tags with arched profile photo.", layoutType: "job-studio", jobStudio: { templateNo: 4 } },
  { id: "tpl-b-105", name: "Dark Split Gold", category: "Professional", desc: "Dark grey sidebar with gold-tone header.", layoutType: "job-studio", jobStudio: { templateNo: 5 } },
  { id: "tpl-b-106", name: "Pastel Pink", category: "Professional", desc: "Soft pink two-column modern layout.", layoutType: "job-studio", jobStudio: { templateNo: 6 } },
  { id: "tpl-b-107", name: "Navy Circle", category: "Professional", desc: "Navy accents with circular photo frame.", layoutType: "job-studio", jobStudio: { templateNo: 7 } },
  { id: "tpl-b-108", name: "Teal Banner Circle", category: "Professional", desc: "Top teal stripe with circular photo frame.", layoutType: "job-studio", jobStudio: { templateNo: 8 } },
];

export default function JobStudioTemplateEngine({
  template,
  data,
  showPhoto = true,
  pageW = 210,
  pageH = 297,
  autoFontScale = 1,
  designSettings = {},
  previewProtectionProps = {},
  resumeDocRef = null,
}) {
  const no = Number(template?.jobStudio?.templateNo) || 1;
  const ds = designSettings || {};
  const manualScale = (Number(ds.contentScale) || 100) / 100;
  const fontBase = Number(ds.fontSize) || 10.5;
  const fontFactor = fontBase / 10.5;
  const scale = ds.manualMode ? manualScale * fontFactor : (Number(autoFontScale) || 1) * fontFactor;
  const lineSpacing = Number(ds.lineSpacing) || 1.15;
  const offsetY = Number(ds.contentOffsetY) || 0;
  const photoSize = Number(ds.photoSize) || 72;
  const spacing = ds.sectionSpacing || "normal";
  const gap = spacing === "compact" ? 0.75 : spacing === "relaxed" ? 1.25 : 1;

  const props = { data, showPhoto, scale };
  const content =
    no === 2 ? <JobTpl2 {...props} /> :
    no === 3 ? <JobTpl3 {...props} /> :
    no === 4 ? <JobTpl4 {...props} /> :
    no === 5 ? <JobTpl5 {...props} /> :
    no === 6 ? <JobTpl6 {...props} /> :
    no === 7 ? <JobTpl7 {...props} /> :
    no === 8 ? <JobTpl8 {...props} /> :
    <JobTpl1 {...props} />;

  const pageStyle = {
    width: `${pageW}mm`,
    height: `${pageH}mm`,
    minHeight: `${pageH}mm`,
    maxHeight: `${pageH}mm`,
    minWidth: `${pageW}mm`,
    maxWidth: `${pageW}mm`,
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
    background: "#ffffff",
    "--resume-font-scale": String(scale),
    "--job-photo-size": `${Math.round(photoSize * (ds.manualMode ? manualScale : 1))}px`,
    "--job-line": String(lineSpacing),
    "--job-gap": String(gap),
    "--job-offset-y": `${offsetY}mm`,
    "--resume-photo-fit": ds.photoFit || "cover",
    "--resume-photo-position": ds.photoPosition || "center",
  };

  return (
    <div
      id="resume-document"
      ref={resumeDocRef}
      className="job-studio-page"
      style={pageStyle}
      data-template-width={ds.templateWidth || "normal"}
      {...previewProtectionProps}
    >
      <div className="job-studio-inner">
        {content}
      </div>
    </div>
  );
}