import React from "react";
import { RichText } from "../components/RichTextEditor";

const text = (v, fallback = "") => String(v || fallback);
const lines = (v) => {
  const raw = String(v || "");
  if (/<\/?(b|strong|i|em|u|ul|ol|li|br|p|div)\b/i.test(raw)) return [raw];
  return raw.split(/\n/).map((x) => x.trim()).filter(Boolean);
};
const skills = (d) => [
  ...text(d.officeAutomation).split(/[,•|]/),
  ...text(d.techKnowledge).split(/[,•|]/),
].map((x) => x.trim()).filter(Boolean);
const education = (d) => [
  { title: d.gradCourse, meta: [d.gradCollege, d.gradUniv, d.gradDiv].filter(Boolean).join(" • ") },
  { title: d.interSchool, meta: [d.interBoard, d.interDiv].filter(Boolean).join(" • ") },
  { title: d.sscSchool, meta: [d.sscBoard, d.sscDiv].filter(Boolean).join(" • ") },
].filter((x) => x.title || x.meta);

export function ImportedTemplateRenderer({
  layoutType,
  data = {},
  styles = {},
  a4Style = {},
  fontScale = 1,
  photoSize = 72,
  showPhoto = true,
  resumeDocRef = null,
}) {
  const d = data;
  const scale = `var(--resume-font-scale, ${fontScale})`;
  const photo = d.photo;
  const pageStyle = {
    ...a4Style,
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
    "--resume-font-scale": fontScale,
    fontFamily: styles.fontFamily || "Arial, sans-serif",
  };

  const Photo = ({ size = photoSize, circle = false, border = false, rect = false }) => {
    if (!showPhoto || !photo) return <div style={{ width: size, height: rect ? Math.round(size * 1.2) : size }} />;
    return (
      <img
        src={photo}
        alt="Profile"
        crossOrigin="anonymous"
        style={{
          width: size,
          height: rect ? Math.round(size * 1.2) : size,
          objectFit: "cover",
          display: "block",
          borderRadius: circle ? "50%" : 0,
          border: border ? "4px solid #fff" : undefined,
        }}
      />
    );
  };

  const Section = ({ title, color = "#333", children, line = true }) => (
    <div style={{ marginTop: 16 }}>
      <div style={{
        color,
        fontSize: `calc(14px * ${scale})`,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: 0.7,
        borderBottom: line ? `2px solid ${color}` : undefined,
        paddingBottom: line ? 4 : 0,
        marginBottom: 9,
      }}>{title}</div>
      {children}
    </div>
  );

  const Small = ({ children, color = "#444" }) => (
    <div style={{ fontSize: `calc(10.5px * ${scale})`, lineHeight: 1.48, color }}>{children}</div>
  );

  // 1. Jessica Whitehead — source design: coral 40/60 split, ribbon, round photo.
  if (layoutType === "imported-jessica") return (
    <div id="resume-document" ref={resumeDocRef} style={{ ...pageStyle, background: "#fcf9f5", display: "grid", gridTemplateColumns: "40% 60%", color: "#333" }}>
      <aside style={{ background: "#cf6d5d", color: "#fff", padding: "12mm 7mm", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 8, width: 35, height: 50, background: "#ab4e3f", clipPath: "polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)" }} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><Photo size={photoSize || 125} circle border /></div>
        <Small color="#fff"><div>☎ {text(d.phone)}</div><div>✉ {text(d.email)}</div><div style={{ whiteSpace: "pre-line" }}>⌖ {text(d.address)}</div></Small>
        <div style={{ background: "#5d2820", padding: "6px 10px", margin: "20px -7mm 10px", fontSize: `calc(12px * ${scale})`, fontWeight: 700 }}>EDUCATION</div>
        {education(d).map((e, i) => <Small key={i} color="#fff"><b>{e.title}</b>{e.meta && <><br />{e.meta}</>}</Small>)}
        <div style={{ background: "#5d2820", padding: "6px 10px", margin: "20px -7mm 10px", fontSize: `calc(12px * ${scale})`, fontWeight: 700 }}>PERSONAL SKILLS</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: `calc(10px * ${scale})`, lineHeight: 1.45 }}>{skills(d).map((x, i) => <li key={i}>{x}</li>)}</ul>
      </aside>
      <main style={{ padding: "12mm 9mm", color: "#333" }}>
        <h1 style={{ margin: "5px 0 12px", color: "#5d2820", fontSize: `calc(29px * ${scale})`, lineHeight: 1.05 }}>{text(d.fullName, "YOUR NAME")}</h1>
        <div style={{ background: "#5d2820", color: "#fff", padding: "7px 12px", fontSize: `calc(12px * ${scale})`, fontWeight: 700 }}>PROFESSIONAL</div>
        <Section title="Objective" color="#5d2820"><Small><RichText value={d.summary} /></Small></Section>
        <Section title="Work Experience" color="#5d2820">{lines(d.workExperience).map((x, i) => <div key={i} style={{ marginBottom: 9, fontSize: `calc(10.5px * ${scale})`, lineHeight: 1.45 }}>{x}</div>)}</Section>
        <Section title="Extracurricular Activities" color="#5d2820"><Small>{text(d.hobbies)}</Small></Section>
      </main>
    </div>
  );

  // 2. Jordan Lee — source design: cream left body + coral right column.
  if (layoutType === "imported-jordan") return (
    <div id="resume-document" ref={resumeDocRef} style={{ ...pageStyle, background: "#f7f4e9", display: "grid", gridTemplateColumns: "55% 45%", color: "#333" }}>
      <main style={{ padding: "10mm 8mm 14mm" }}>
        <Section title="Objective" color="#e57363"><Small><RichText value={d.summary} /></Small></Section>
        <Section title="Academic Projects" color="#e57363"><Small><ul style={{ paddingLeft: 17, margin: 0 }}><li>Projects and achievements</li><li>{text(d.techKnowledge)}</li></ul></Small></Section>
        <Section title="Internship Experience" color="#e57363"><Small>{lines(d.workExperience).map((x, i) => <div key={i}>{x}</div>)}</Small></Section>
        <Section title="Volunteer Experience" color="#e57363"><Small>{text(d.hobbies)}</Small></Section>
        <Section title="Hobbies / Interests" color="#e57363"><Small>{text(d.hobbies)}</Small></Section>
        <Section title="References" color="#e57363"><Small>Available upon request.</Small></Section>
      </main>
      <aside style={{ background: "#f2a799", position: "relative", paddingBottom: 15 }}>
        <div style={{ background: "#e57363", color: "#fff", padding: "9mm 5mm", textAlign: "center" }}><div style={{ fontFamily: "Georgia, serif", fontSize: `calc(28px * ${scale})`, letterSpacing: 1 }}>{text(d.fullName, "YOUR NAME")}</div></div>
        <div style={{ height: 50, overflow: "hidden", display: "flex", justifyContent: "center", background: "#f2a799" }}><Photo size={photoSize ? Math.min(photoSize * 1.8, 150) : 130} /></div>
        <div style={{ padding: "6mm 5mm", fontSize: `calc(10px * ${scale})`, lineHeight: 1.55 }}>⌖ {text(d.address)}<br />✉ {text(d.email)}<br />☎ {text(d.phone)}</div>
        <div style={{ padding: "0 5mm" }}><Section title="Education" color="#e57363" line={false}>{education(d).map((e, i) => <Small key={i} color="#222"><b>{e.title}</b><br />{e.meta}</Small>)}</Section><Section title="Skills" color="#e57363" line={false}><Small color="#222">{skills(d).join(" • ")}</Small></Section><Section title="Certifications" color="#e57363" line={false}><Small color="#222">{text(d.techKnowledge)}</Small></Section></div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "#e57363" }} />
      </aside>
    </div>
  );

  // 3. Jonathan Smith — source design: blue top profile card + two colored lower columns.
  if (layoutType === "imported-graphic") return (
    <div id="resume-document" ref={resumeDocRef} style={{ ...pageStyle, background: "#92b4be", color: "#333" }}>
      <div style={{ height: "78mm", position: "relative", background: "#92b4be" }}>
        <div style={{ position: "absolute", top: 0, left: "35%", width: 45, height: 38, background: "#e66a5e", color: "#fff", textAlign: "center", paddingTop: 20, fontWeight: 800, fontSize: `calc(18px * ${scale})` }}>JS</div>
        <div style={{ position: "absolute", top: 10, left: "36%", zIndex: 2 }}><Photo size={photoSize || 120} circle border /></div>
        <div style={{ position: "absolute", top: 20, left: "59%" }}><h1 style={{ margin: 0, fontSize: `calc(28px * ${scale})`, lineHeight: 1.05 }}>{text(d.fullName, "YOUR NAME")}</h1><div style={{ marginTop: 7, letterSpacing: 2, fontSize: `calc(12px * ${scale})` }}>PROFESSIONAL</div></div>
        <div style={{ position: "absolute", top: "46mm", left: "7%", right: "7%", background: "#fff", padding: "6mm", display: "grid", gridTemplateColumns: "65% 35%", boxShadow: "0 4px 10px rgba(0,0,0,.05)" }}>
          <div style={{ paddingRight: 15, borderRight: "1px solid #eee" }}><b style={{ fontSize: `calc(13px * ${scale})` }}>Profile</b><Small><RichText value={d.summary} /></Small></div>
          <div style={{ paddingLeft: 15 }}><b style={{ fontSize: `calc(13px * ${scale})` }}>Contact</b><Small>{text(d.address)}<br />{text(d.phone)}<br />{text(d.email)}</Small></div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "50% 50%", minHeight: "calc(100% - 78mm)" }}>
        <div style={{ background: "#92b4be", color: "#fff", padding: "12mm 9mm" }}><h2 style={{ fontSize: `calc(15px * ${scale})`, borderBottom: "1px solid rgba(255,255,255,.4)", paddingBottom: 5 }}>EDUCATION</h2>{education(d).map((e, i) => <div key={i} style={{ marginBottom: 14 }}><b>{e.title}</b><div style={{ fontSize: `calc(10px * ${scale})` }}>{e.meta}</div></div>)}<h2 style={{ fontSize: `calc(15px * ${scale})`, borderBottom: "1px solid rgba(255,255,255,.4)", paddingBottom: 5 }}>SKILLS</h2><div style={{ textAlign: "center", fontWeight: 700 }}>{skills(d).slice(0, 4).map((x, i) => <span key={i} style={{ display: "inline-block", border: "2px solid #fff", borderRadius: "50%", width: 48, height: 48, lineHeight: "44px", margin: 4, fontSize: 8 }}>{x.slice(0, 6)}</span>)}</div></div>
        <div style={{ background: "#e09b85", color: "#fff", padding: "12mm 9mm" }}><h2 style={{ fontSize: `calc(15px * ${scale})`, borderBottom: "1px solid rgba(255,255,255,.4)", paddingBottom: 5 }}>WORK EXPERIENCE</h2>{lines(d.workExperience).map((x, i) => <div key={i} style={{ marginBottom: 14, fontSize: `calc(10.5px * ${scale})`, lineHeight: 1.4 }}>{x}</div>)}</div>
      </div>
    </div>
  );

  // 4. NAME HERE — source design: geometric red/blue sidebar.
  if (layoutType === "imported-johndoe") return (
    <div id="resume-document" ref={resumeDocRef} style={{ ...pageStyle, background: "#fff", display: "grid", gridTemplateColumns: "38% 62%" }}>
      <aside style={{ background: "#ece8e1", position: "relative", padding: "18mm 7mm" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: -120, height: 45, background: "#1e4d79", clipPath: "polygon(0 0,100% 0,100% 40%,0 100%)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 30, background: "#cf5364", clipPath: "polygon(60% 0,100% 0,100% 100%,0 100%)" }} />
        <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 2, marginBottom: 15 }}><Photo size={photoSize || 110} circle border /></div>
        {["CONTACT", "FOLLOW ME", "HOBBIES"].map((title, idx) => <div key={title}><div style={{ background: "#cf5364", color: "#fff", padding: "5px 10px", margin: "14px 0 8px", fontWeight: 700, fontSize: `calc(11px * ${scale})` }}>{title}</div><Small>{idx === 0 ? <>⌂ {text(d.address)}<br />☎ {text(d.phone)}<br />✉ {text(d.email)}</> : idx === 1 ? <>facebook.com/profile<br />linkedin.com/profile</> : text(d.hobbies)}</Small></div>)}
      </aside>
      <main style={{ padding: "12mm 9mm", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 35, background: "#cf5364", clipPath: "polygon(60% 0,100% 0,100% 100%,0 100%)" }} />
        <div style={{ marginTop: 8, marginBottom: 15 }}><h1 style={{ margin: 0, fontSize: `calc(31px * ${scale})`, letterSpacing: 2 }}>{text(d.fullName, "NAME HERE")}</h1><h3 style={{ marginTop: 5, color: "#666", fontWeight: 400 }}>{text(d.role, "JOB POSITION")}</h3></div>
        <Section title="Education" color="#1e4d79"><Small>{education(d).map((e, i) => <div key={i} style={{ marginBottom: 9 }}><b>{e.title}</b><br />{e.meta}</div>)}</Small></Section>
        <Section title="Work Experience" color="#1e4d79"><Small>{lines(d.workExperience).map((x, i) => <div key={i} style={{ marginBottom: 9 }}>{x}</div>)}</Small></Section>
        <Section title="Skills" color="#1e4d79"><Small>{skills(d).map((x, i) => <div key={i}>{x} <span style={{ letterSpacing: 2 }}>■ ■ ■ ■</span></div>)}</Small></Section>
      </main>
    </div>
  );

  // 5. Job Position / Name Surname — source design: cyan header + red triangle + centered photo.
  if (layoutType === "imported-taya") return (
    <div id="resume-document" ref={resumeDocRef} style={{ ...pageStyle, background: "#fff", color: "#333" }}>
      <div style={{ height: "58mm", background: "#79cbdb", position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", inset: 0, width: "42%", background: "#f14055", clipPath: "polygon(0 0,100% 50%,0 100%)" }} /><div style={{ position: "absolute", top: 7, left: "50%", transform: "translateX(-50%)" }}><Photo size={photoSize || 120} circle border /></div></div>
      <div style={{ background: "#fff", border: "1px solid #ddd", textAlign: "center", padding: "3mm 8mm", width: "43%", margin: "-7mm auto 7mm", position: "relative", zIndex: 2 }}><div style={{ fontSize: `calc(10px * ${scale})`, color: "#666" }}>JOB POSITION</div><div style={{ fontSize: `calc(21px * ${scale})`, color: "#f14055", fontWeight: 800 }}>{text(d.fullName, "NAME SURNAME")}</div></div>
      <div style={{ display: "grid", gridTemplateColumns: "35% 65%", padding: "0 8mm 8mm" }}>
        <div style={{ paddingRight: 12 }}><Section title="Contact" color="#333"><Small>☎ {text(d.phone)}<br />✉ {text(d.email)}<br />⌂ {text(d.address)}</Small></Section><Section title="Skills" color="#333"><Small>{skills(d).map((x, i) => <div key={i} style={{ marginBottom: 8 }}>{x}<div style={{ height: 5, background: i % 2 ? "#79cbdb" : "#f14055", width: `${Math.min(95, 60 + i * 10)}%` }} /></div>)}</Small></Section></div>
        <div style={{ paddingLeft: 12 }}><Section title="Profile" color="#333"><Small><RichText value={d.summary} /></Small></Section><Section title="Education" color="#333"><Small>{education(d).map((e, i) => <div key={i} style={{ marginBottom: 9 }}><b>{e.title}</b><br /><span style={{ color: "#f14055" }}>{e.meta}</span></div>)}</Small></Section><Section title="Work Experience" color="#333"><Small>{lines(d.workExperience).map((x, i) => <div key={i} style={{ marginBottom: 8 }}>{x}</div>)}</Small></Section></div>
      </div>
    </div>
  );

  // 6. Bailey Gennes — source design: coral header card with photo + two-column body.
  if (layoutType === "imported-johnsteve") return (
    <div id="resume-document" ref={resumeDocRef} style={{ ...pageStyle, background: "#eef0f2", padding: "7mm", color: "#333" }}>
      <div style={{ background: "#fff", minHeight: "100%", padding: "5mm" }}>
        <header style={{ background: "#f36b63", color: "#fff", display: "grid", gridTemplateColumns: "30% 70%", padding: "5mm" }}><div><Photo size={photoSize || 105} rect border /></div><div style={{ paddingLeft: 10, alignSelf: "center" }}><h1 style={{ margin: 0, fontSize: `calc(27px * ${scale})` }}>{text(d.fullName, "BAILEY GENNES")}</h1><h3 style={{ margin: "3px 0 12px", fontWeight: 400 }}>DATA ANALYST</h3><Small color="#fff">☎ {text(d.phone)} &nbsp; ⌖ {text(d.address)}<br />✉ {text(d.email)}</Small></div></header>
        <div style={{ display: "grid", gridTemplateColumns: "35% 65%", gap: 15, marginTop: 10 }}><div><div style={{ background: "#f36b63", color: "#fff", padding: 6, fontWeight: 700 }}>EDUCATION</div>{education(d).map((e, i) => <Small key={i}><b>{e.title}</b><br /><span style={{ color: "#f36b63" }}>{e.meta}</span></Small>)}<div style={{ background: "#f36b63", color: "#fff", padding: 6, fontWeight: 700, marginTop: 14 }}>EXPERTISE</div><Small>{skills(d).map((x, i) => <div key={i}>{x}</div>)}</Small></div><div><div style={{ background: "#f36b63", color: "#fff", padding: 6, fontWeight: 700 }}>OBJECTIVE</div><Small><RichText value={d.summary} /></Small><div style={{ background: "#f36b63", color: "#fff", padding: 6, fontWeight: 700, marginTop: 14 }}>EXPERIENCE</div><Small>{lines(d.workExperience).map((x, i) => <div key={i} style={{ marginBottom: 10 }}><b>{x}</b></div>)}</Small><div style={{ background: "#f36b63", color: "#fff", padding: 6, fontWeight: 700, marginTop: 14 }}>INTERPERSONAL SKILLS</div><Small>{text(d.hobbies)}</Small></div></div>
      </div>
    </div>
  );

  // 7. Cody Park — source design: white CV with burgundy borders and 3-column header.
  if (layoutType === "imported-adrian") return (
    <div id="resume-document" ref={resumeDocRef} style={{ ...pageStyle, background: "#fff", borderTop: "5px solid #8b1e21", borderBottom: "5px solid #8b1e21", padding: "9mm", color: "#333" }}>
      <header style={{ display: "grid", gridTemplateColumns: "35% 30% 35%", alignItems: "center", borderBottom: "1px solid #ddd", paddingBottom: 8, marginBottom: 12 }}><div><div style={{ fontSize: `calc(27px * ${scale})`, fontWeight: 900, lineHeight: .95 }}>{text(d.fullName, "CODY PARK")}</div><div style={{ marginTop: 7, fontSize: `calc(10px * ${scale})`, color: "#666", letterSpacing: 1 }}>{text(d.role, "MARKETING SPECIALIST")}</div></div><div style={{ display: "flex", justifyContent: "center" }}><Photo size={photoSize || 90} circle /></div><Small color="#555"><div>☎ {text(d.phone)}</div><div>✉ {text(d.email)}</div><div>⌂ {text(d.address)}</div></Small></header>
      <div style={{ display: "grid", gridTemplateColumns: "55% 45%", gap: 15 }}><div><div style={{ background: "#888", color: "#fff", padding: 6, fontWeight: 700 }}>MARKETING SPECIALIST</div><Small>{lines(d.workExperience).map((x, i) => <div key={i} style={{ margin: "8px 0" }}>{x}</div>)}</Small><div style={{ background: "#888", color: "#fff", padding: 6, fontWeight: 700, marginTop: 12 }}>PAST ACCOMPLISHMENTS</div><Small><RichText value={d.summary} /></Small><div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: 55, borderBottom: "1px solid #ccc", marginTop: 8 }}>{[50,65,70,75].map(x => <div key={x} style={{ background: "#8b1e21", color: "#fff", width: 24, height: `${x}%`, fontSize: 7, textAlign: "center" }}>{x}%</div>)}</div></div><div><div style={{ background: "#888", color: "#fff", padding: 6, fontWeight: 700 }}>ABOUT ME</div><Small><RichText value={d.summary} /></Small><div style={{ background: "#888", color: "#fff", padding: 6, fontWeight: 700, marginTop: 12 }}>SKILLS & EXPERTISE</div><Small>{skills(d).map((x, i) => <div key={i}>{x} <span style={{ float: "right", color: "#8b1e21" }}>★ ★ ★ ★ ☆</span></div>)}</Small><div style={{ background: "#888", color: "#fff", padding: 6, fontWeight: 700, marginTop: 12 }}>SOFTWARE SKILLS</div><div style={{ textAlign: "center", marginTop: 7 }}>{skills(d).slice(0, 3).map((x, i) => <span key={i} style={{ display: "inline-block", background: "#8b1e21", color: "#fff", padding: "6px 9px", margin: 2, fontWeight: 700 }}>{x.slice(0, 3)}</span>)}</div></div></div>
    </div>
  );

  // 8. Jane Huang — source design: peach/orange two-column layout with progress bars.
  if (layoutType === "imported-ananya") return (
    <div id="resume-document" ref={resumeDocRef} style={{ ...pageStyle, background: "#fff0e6", display: "grid", gridTemplateColumns: "38% 62%", color: "#333" }}>
      <aside style={{ background: "#ffb088", padding: "12mm 8mm" }}><div style={{ float: "right", width: 52, height: 52, background: "#ff5500", color: "#fff", fontSize: `calc(20px * ${scale})`, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{text(d.fullName, "JH").split(/\s+/).map(x => x[0]).join("").slice(0, 2).toUpperCase()}</div><div style={{ clear: "both" }} /><div style={{ marginTop: 20, fontSize: `calc(25px * ${scale})`, fontWeight: 800, lineHeight: 1 }}>{text(d.fullName, "JANE HUANG").toUpperCase()}</div><hr style={{ border: 0, borderTop: "2px solid #555", width: 40, margin: "12px 0 20px" }} /><Small>✉ {text(d.email)}<br />☎ {text(d.phone)}<br />⌖ {text(d.address)}</Small><Section title="Education" color="#222" line={false}>{education(d).map((e, i) => <Small key={i}><b>{e.title}</b><br />{e.meta}</Small>)}</Section><Section title="Skills" color="#222" line={false}>{skills(d).slice(0, 4).map((x, i) => <div key={i} style={{ fontSize: `calc(10px * ${scale})`, marginBottom: 8 }}>{x}<div style={{ height: 5, background: "#ddd", marginTop: 3 }}><div style={{ height: "100%", background: "#ff5500", width: `${80 - i * 7}%` }} /></div></div>)}</Section></aside>
      <main style={{ background: "#fff0e6", padding: "12mm 9mm" }}><Section title="Resume Objective" color="#222" line={false}><Small><RichText value={d.summary} /></Small></Section><Section title="Work History" color="#222" line={false}>{lines(d.workExperience).map((x, i) => <div key={i} style={{ marginBottom: 10 }}><Small><b>{x}</b></Small></div>)}</Section><Section title="Accomplishments" color="#222" line={false}><Small>{text(d.hobbies)}</Small></Section></main>
    </div>
  );

  return null;
}
