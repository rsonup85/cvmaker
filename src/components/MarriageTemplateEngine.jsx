import React from "react";
import "./HinduMarriageExactTemplates.css";

const txt = (v) => String(v ?? "").trim();
const first = (d, keys) => {
  for (const key of keys) {
    const value = txt(d?.[key]);
    if (value) return value;
  }
  return "";
};
const photoUrl = (d) => first(d, ["photo", "profilePhoto", "image"]);
const field = (d, label, keys) => ({ label, value: first(d, keys) });
const visible = (rows) => rows.filter((r) => r.value);

function Rows({ rows, className = "bio-table" }) {
  const list = visible(rows);
  if (!list.length) return null;
  return (
    <table className={`${className} hm-text-shift`}>
      <tbody>
        {list.map((r, i) => (
          <tr key={`${r.label}-${i}`}>
            <td className={`label${r.label && r.label.length > 16 ? " wrap" : ""}`}>{r.label}</td>
            <td className="colon">:</td>
            <td className="val">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Section({ title, rows, variant = "default" }) {
  const list = visible(rows);
  if (!list.length) return null;
  return (
    <div className={`hm-section hm-section-${variant} hm-text-shift`}>
      <div className="hm-section-title">{title}</div>
      <Rows rows={list} className={variant === "center" ? "bio-table center-table" : "bio-table"} />
    </div>
  );
}

function PhotoBox({ src, className = "" }) {
  if (!src) return null;
  return <img src={src} alt="Profile" className={`hm-photo-img ${className}`} />;
}

const personalRows = (d) => [
  field(d, "Name", ["fullName", "name"]),
  field(d, "Date of Birth", ["dob", "dateOfBirth", "birthDate"]),
  field(d, "Time of Birth", ["birthTime", "timeOfBirth"]),
  field(d, "Place of Birth", ["birthPlace", "placeOfBirth"]),
  field(d, "Rashi", ["rashi", "zodiac"]),
  field(d, "Nakshatra", ["nakshatra", "birthStar"]),
  field(d, "Gotra", ["gotra"]),
  field(d, "Manglik", ["manglik"]),
  field(d, "Religion", ["religion"]),
  field(d, "Caste", ["caste"]),
  field(d, "Height", ["height"]),
  field(d, "Weight", ["weight"]),
  field(d, "Color", ["color", "complexion"]),
  field(d, "Blood Group", ["bloodGroup"]),
  field(d, "Qualification", ["gradCourse", "education"]),
  field(d, "Work Details", ["workExperience", "occupation", "jobTitle", "role"]),
  field(d, "Income", ["income", "annualIncome"]),
];
const familyRows = (d) => [
  field(d, "Father's Name", ["fatherName", "father"]),
  field(d, "Father's Occupation", ["fatherOccupation"]),
  field(d, "Mother's Name", ["motherName", "mother"]),
  field(d, "Mother's Occupation", ["motherOccupation"]),
  field(d, "Brother", ["brother"]),
  field(d, "Sister", ["sister"]),
];
const contactRows = (d) => [
  field(d, "Contact Number", ["phone", "mobile", "contactNumber"]),
  field(d, "Email ID", ["email"]),
  field(d, "Address", ["address", "city"]),
];

function Template1({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  const p = visible(personalRows(d));
  const f = visible(familyRows(d));
  const c = visible(contactRows(d));
  return (
    <div className="a4-marriage-template tpl-1-border marriage-card-1 hm-card">
      <div className="tpl1-corner tl" /><div className="tpl1-corner tr" /><div className="tpl1-corner bl" /><div className="tpl1-corner br" />
      <div className="tpl1-header">
        <div className="tpl1-mantra">ॐ श्री गणेशाय नमः</div>
      </div>
      <div className="tpl1-main-row">
        <div className="tpl1-details">
          {p.length > 0 && <Section title="Personal Details" rows={p} />}
          {f.length > 0 && <Section title="Family Details" rows={f} />}
          {c.length > 0 && <Section title="Contact Details" rows={c} />}
        </div>
        {src && <div className="tpl1-photo-wrap hm-text-shift"><div className="tpl1-photo-frame"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template2({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template tpl-2-bg tpl-2-border marriage-card-2 hm-card">
      <div className="tpl2-title">BIODATA</div>
      <div className="tpl2-main-row">
        <div className="tpl2-details">
          <Section title="Personal Details" rows={personalRows(d)} />
          <Section title="Family Details" rows={familyRows(d)} />
          <Section title="Contact Details" rows={contactRows(d)} />
        </div>
        {src && <div className="tpl2-photo-wrap hm-text-shift"><div className="tpl2-photo-box"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template3({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template tpl-3-bg tpl-3-border marriage-card-3 hm-card">
      <div className="tpl3-title">BIO DATA</div>
      <div className="tpl3-main-row">
        <div className="tpl3-details">
          <Section title="Personal Details" rows={personalRows(d)} />
          <Section title="Family Details" rows={familyRows(d)} />
          <Section title="Contact Details" rows={contactRows(d)} />
        </div>
        {src && <div className="tpl3-photo-wrap hm-text-shift"><div className="tpl3-photo-box"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template4({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template tpl-4-border marriage-card-4 hm-card">
      {src && <div className="tpl4-photo-wrap hm-text-shift"><div className="tpl4-photo-circle"><PhotoBox src={src} /></div></div>}
      <Section title="Personal Details" rows={personalRows(d)} variant="tpl4" />
      <Section title="Family Details" rows={familyRows(d)} variant="tpl4" />
      <Section title="Contact Details" rows={contactRows(d)} variant="tpl4" />
    </div>
  );
}

function Template5({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template tpl-5-bg marriage-card-5 hm-card">
      <div className="tpl5-title">श्री गणेशाय नमः</div>
      <div className="tpl5-main-row">
        <div className="tpl5-details">
          <Section title="Personal Details" rows={personalRows(d)} />
          <Section title="Family Details" rows={familyRows(d)} />
          <Section title="Contact Details" rows={contactRows(d)} />
        </div>
        {src && <div className="tpl5-photo-wrap hm-text-shift"><div className="tpl5-photo-box"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template6({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template tpl-6-border marriage-card-6 hm-card">
      <div className="tpl6-title">PERSONAL DETAILS</div>
      <div className="tpl6-main-row">
        <div className="tpl6-details">
          <Rows rows={personalRows(d)} />
        </div>
        {src && <div className="tpl6-photo-wrap hm-text-shift"><div className="tpl6-photo-box"><PhotoBox src={src} /></div></div>}
      </div>
      <Section title="Education & Occupation" rows={[
        field(d, "Qualification", ["gradCourse", "education"]),
        field(d, "Work Details", ["workExperience", "occupation", "jobTitle", "role"]),
      ]} variant="tpl6" />
      <Section title="Family Details" rows={familyRows(d)} variant="tpl6" />
      <Section title="Contact Details" rows={contactRows(d)} variant="tpl6" />
    </div>
  );
}

function Template7({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template tpl-7-bg marriage-card-7 hm-card">
      <div className="tpl7-title">ॐ श्री गणेशाय नमः</div>
      <div className="tpl7-main-row">
        <div className="tpl7-details">
          <Section title="Personal Details" rows={personalRows(d)} />
          <Section title="Family Details" rows={familyRows(d)} />
          <Section title="Contact Details" rows={contactRows(d)} />
        </div>
        {src && <div className="tpl7-photo-wrap hm-text-shift"><div className="tpl7-photo-box"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template8({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template tpl-8-border marriage-card-8 hm-card">
      <div className="tpl8-title">॥ श्री गणेशाय नमः ॥</div>
      <div className="tpl8-main-row">
        <div className="tpl8-details">
          <Section title="व्यक्तिगत जानकारी" rows={personalRows(d).map(r => ({...r, label: r.label}))} />
          <Section title="कुटुंबाची माहिती" rows={familyRows(d)} />
          <Section title="संपर्क माहिती" rows={contactRows(d)} />
        </div>
        {src && <div className="tpl8-photo-wrap hm-text-shift"><div className="tpl8-photo-box"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template9({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template marriage-card-9 hm-card">
      <div className="tpl9-outer">
        <div className="tpl9-corner tl" /><div className="tpl9-corner tr" /><div className="tpl9-corner bl" /><div className="tpl9-corner br" />
        <div className="tpl9-inner">
          <div className="tpl9-header">
            <div className="tpl9-om">🕉</div>
            <div className="tpl9-mantra">|| Shri Ganeshaya Namah ||</div>
            <div className="tpl9-title">Biodata</div>
          </div>
          <div className="tpl9-main">
            <div className="tpl9-details">
              <Section title="Personal Details" rows={personalRows(d)} />
              <Section title="Family Details" rows={familyRows(d)} />
              <Section title="Contact Details" rows={contactRows(d)} />
            </div>
            {src && (
              <div className="tpl9-photo-wrap hm-text-shift">
                <div className="tpl9-photo-frame"><PhotoBox src={src} /></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Template10({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template marriage-card-10 hm-card">
      <div className="tpl10-floral tl" /><div className="tpl10-floral tr" /><div className="tpl10-floral bl" /><div className="tpl10-floral br" />
      <div className="tpl10-content">
        <div className="tpl10-header">
          <div className="tpl10-om">ॐ</div>
          <div className="tpl10-title">BIODATA</div>
          <div className="tpl10-line" />
        </div>
        <div className="tpl10-main">
          <div className="tpl10-details">
            <Section title="Personal Details" rows={personalRows(d)} />
            <Section title="Family Details" rows={familyRows(d)} />
            <Section title="Contact Details" rows={contactRows(d)} />
          </div>
          {src && (
            <div className="tpl10-photo-wrap hm-text-shift">
              <div className="tpl10-photo-frame"><PhotoBox src={src} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Template11({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template marriage-card-11 hm-card">
      <div className="tpl11-header">
        <div className="tpl11-om">🕉</div>
        <div className="tpl11-title">{first(d, ["fullName", "name"]) || "Biodata"}</div>
      </div>
      <div className="tpl11-main">
        <div className="tpl11-details">
          <div className="tpl11-sec">* Personal Details</div>
          <Rows rows={personalRows(d)} />
          <div className="tpl11-sec">* Family Details</div>
          <Rows rows={familyRows(d)} />
          <div className="tpl11-sec">* Contact Details</div>
          <Rows rows={contactRows(d)} />
        </div>
        {src && (
          <div className="tpl11-photo-wrap hm-text-shift">
            <div className="tpl11-circle"><PhotoBox src={src} /></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Template12({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template marriage-card-12 hm-card">
      <div className="tpl12-border">
        <div className="tpl12-corner tl" /><div className="tpl12-corner tr" /><div className="tpl12-corner bl" /><div className="tpl12-corner br" />
        <div className="tpl12-header">
          <div className="tpl12-om">🕉</div>
          <div className="tpl12-mantra">॥ श्री गणेशाय नमः ॥</div>
        </div>
        <div className="tpl12-profile">
          <div className="tpl12-name-box">
            <h1 className="tpl12-name">{first(d, ["fullName", "name"]) || "Name"}</h1>
            <Rows rows={[
              field(d, "Date of Birth", ["dob", "dateOfBirth", "birthDate"]),
              field(d, "Place of Birth", ["birthPlace", "placeOfBirth"]),
              field(d, "Time of Birth", ["birthTime", "timeOfBirth"]),
            ]} />
          </div>
          {src && <div className="tpl12-photo-frame hm-text-shift"><PhotoBox src={src} /></div>}
        </div>
        <div className="tpl12-sec">Personal Details</div>
        <Rows rows={personalRows(d).filter((r) => !["Name", "Date of Birth", "Place of Birth", "Time of Birth"].includes(r.label))} />
        <div className="tpl12-sec">Family Details</div>
        <Rows rows={familyRows(d)} />
        <div className="tpl12-sec">Contact Details</div>
        <Rows rows={contactRows(d)} />
      </div>
    </div>
  );
}

function Template13({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template marriage-card-13 hm-card">
      <div className="tpl13-main">
        <div className="tpl13-left">
          <div className="tpl13-pill">Personal Details</div>
          <Rows rows={personalRows(d)} />
          <div className="tpl13-pill">Family Details</div>
          <Rows rows={familyRows(d)} />
          <div className="tpl13-pill">Contact Details</div>
          <Rows rows={contactRows(d)} />
        </div>
        {src && (
          <div className="tpl13-photo-wrap hm-text-shift">
            <div className="tpl13-photo-frame"><PhotoBox src={src} /></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Template14({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="a4-marriage-template marriage-card-14 hm-card">
      <div className="tpl14-inner">
        <div className="tpl14-header">
          <div>
            <div className="tpl14-tag">BIO DATA</div>
            <div className="tpl14-name">{first(d, ["fullName", "name"]) || "Name"}</div>
          </div>
          {src && <div className="tpl14-circle hm-text-shift"><PhotoBox src={src} /></div>}
        </div>
        <Rows rows={personalRows(d).filter((r) => r.label !== "Name")} />
        <div className="tpl14-sec">Family Details</div>
        <Rows rows={familyRows(d)} />
        <div className="tpl14-sec">Contact Details</div>
        <Rows rows={contactRows(d)} />
      </div>
    </div>
  );
}

function Template15({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-15 tpl15-bg tpl15-border a4-marriage-template">
      <div className="tpl15-header">
        <div className="tpl15-ganesh">ॐ</div>
        <div className="tpl15-mantra">|| Shri Ganeshay Namah ||</div>
        <div className="tpl15-title">Biodata</div>
      </div>
      <div className="tpl15-main">
        <div className="tpl15-left"><Rows rows={personalRows(d)} /></div>
        {src && <div className="tpl15-photo hm-text-shift"><div className="tpl15-frame"><PhotoBox src={src} /></div></div>}
      </div>
      <Section title="Family Details" rows={familyRows(d)} />
      <Section title="Contact Details" rows={contactRows(d)} />
    </div>
  );
}

function Template16({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-16 tpl16-bg a4-marriage-template">
      <div className="tpl16-om">ॐ</div>
      <div className="tpl16-title">BIODATA</div>
      <div className="tpl16-main">
        <div className="tpl16-left">
          <Section title="Personal Details" rows={personalRows(d)} />
          <Section title="Family Details" rows={familyRows(d)} />
          <Section title="Contact Details" rows={contactRows(d)} />
        </div>
        {src && <div className="tpl16-photo hm-text-shift"><div className="tpl16-frame"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template17({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-17 tpl17-border a4-marriage-template">
      <div className="tpl17-top">
        <div className="tpl17-title">BIO DATA</div>
        {src && <div className="tpl17-circle hm-text-shift"><PhotoBox src={src} /></div>}
      </div>
      <Section title="PERSONAL DETAILS" rows={personalRows(d)} />
      <Section title="FAMILY DETAILS" rows={familyRows(d)} />
      <Section title="CONTACT DETAILS" rows={contactRows(d)} />
    </div>
  );
}

function Template18({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-18 tpl18-border a4-marriage-template">
      <div className="tpl18-title">BIODATA</div>
      <div className="tpl18-main">
        <div className="tpl18-left"><Rows rows={personalRows(d)} /></div>
        {src && <div className="tpl18-photo hm-text-shift"><div className="tpl18-frame"><PhotoBox src={src} /></div></div>}
      </div>
      <Section title="FAMILY DETAILS" rows={familyRows(d)} />
      <Section title="CONTACT DETAILS" rows={contactRows(d)} />
    </div>
  );
}

function Template19({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-19 tpl19-bg a4-marriage-template">
      <div className="tpl19-title">Marriage Biodata</div>
      {first(d, ["fullName","name"]) && <div className="tpl19-name">{first(d, ["fullName","name"])}</div>}
      <div className="tpl19-main">
        <div className="tpl19-left">
          <Section title="Personal Details" rows={personalRows(d).filter(r => r.label !== "Name")} />
          <Section title="Family Details" rows={familyRows(d)} />
          <Section title="Contact Details" rows={contactRows(d)} />
        </div>
        {src && <div className="tpl19-photo hm-text-shift"><div className="tpl19-frame"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template20({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-20 tpl20-border a4-marriage-template">
      <div className="tpl20-header">
        <div className="tpl20-ganesh">ॐ</div>
        <div className="tpl20-mantra">श्री गणेशाय नमः</div>
      </div>
      {first(d, ["fullName","name"]) && <div className="tpl20-name">{first(d, ["fullName","name"])}</div>}
      <div className="tpl20-main">
        <div className="tpl20-left"><Rows rows={personalRows(d).filter(r => r.label !== "Name")} /></div>
        {src && <div className="tpl20-photo hm-text-shift"><div className="tpl20-frame"><PhotoBox src={src} /></div></div>}
      </div>
      <Section title="Family Details" rows={familyRows(d)} />
      <Section title="Contact Details" rows={contactRows(d)} />
    </div>
  );
}

function Template21({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-21 tpl21-border a4-marriage-template">
      <div className="tpl21-gods">|| Shree Ganesha Namah ||</div>
      <div className="tpl21-title">Personal Details</div>
      <div className="tpl21-main">
        <div className="tpl21-left"><Rows rows={personalRows(d)} /></div>
        {src && <div className="tpl21-photo hm-text-shift"><div className="tpl21-frame"><PhotoBox src={src} /></div></div>}
      </div>
      <Section title="Family Details" rows={familyRows(d)} />
      <Section title="Contact Details" rows={contactRows(d)} />
    </div>
  );
}

function Template22({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-22 tpl22-bg a4-marriage-template">
      <div className="tpl22-title">Marriage Biodata</div>
      {first(d, ["fullName","name"]) && <div className="tpl22-name">{first(d, ["fullName","name"])}</div>}
      <div className="tpl22-main">
        <div className="tpl22-left">
          <Section title="Personal Details" rows={personalRows(d).filter(r => r.label !== "Name")} />
          <Section title="Family Details" rows={familyRows(d)} />
          <Section title="Contact Details" rows={contactRows(d)} />
        </div>
        {src && <div className="tpl22-photo hm-text-shift"><div className="tpl22-frame"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template23({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-23 tpl23-border a4-marriage-template">
      <div className="tpl23-badge">PERSONAL DETAILS</div>
      <div className="tpl23-main">
        <div className="tpl23-left"><Rows rows={personalRows(d)} /></div>
        {src && <div className="tpl23-photo hm-text-shift"><div className="tpl23-frame"><PhotoBox src={src} /></div></div>}
      </div>
      <div className="tpl23-badge">FAMILY DETAILS</div>
      <Rows rows={familyRows(d)} />
      <div className="tpl23-badge">CONTACT DETAILS</div>
      <Rows rows={contactRows(d)} />
    </div>
  );
}

function Template24({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-24 tpl24-border a4-marriage-template">
      <div className="tpl24-top">
        {src && <div className="tpl24-photo hm-text-shift"><PhotoBox src={src} /></div>}
        <div className="tpl24-head">
          {first(d, ["fullName","name"]) && <div className="tpl24-name">{first(d, ["fullName","name"])}</div>}
          <Rows rows={[
            field(d, "Date of Birth", ["dob","dateOfBirth","birthDate"]),
            field(d, "Place of Birth", ["birthPlace","placeOfBirth"]),
            field(d, "Time of Birth", ["birthTime","timeOfBirth"]),
          ]} />
        </div>
      </div>
      <div className="tpl24-bar">Personal Details</div>
      <Rows rows={personalRows(d).filter(r => !["Name","Date of Birth","Place of Birth","Time of Birth"].includes(r.label))} />
      <Section title="Family Details" rows={familyRows(d)} />
      <Section title="Contact Details" rows={contactRows(d)} />
    </div>
  );
}

function Template25({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-25 tpl25-border a4-marriage-template">
      <div className="tpl25-ganesh">ॐ श्री गणेशाय नमः</div>
      <div className="tpl25-main">
        <div className="tpl25-left">
          <div className="tpl25-sec">* Personal Details</div>
          <Rows rows={personalRows(d)} />
          <div className="tpl25-sec">* Family Details</div>
          <Rows rows={familyRows(d)} />
          <div className="tpl25-sec">* Contact Details</div>
          <Rows rows={contactRows(d)} />
        </div>
        {src && <div className="tpl25-photo hm-text-shift"><div className="tpl25-circle"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template26({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-26 tpl26-border a4-marriage-template">
      <div className="tpl26-title">विवाह बायोडाटा</div>
      {first(d, ["fullName","name"]) && <div className="tpl26-name">{first(d, ["fullName","name"])}</div>}
      <div className="tpl26-main">
        <div className="tpl26-left">
          <Section title="Personal Details" rows={personalRows(d).filter(r => r.label !== "Name")} />
          <Section title="Family Details" rows={familyRows(d)} />
          <Section title="Contact Details" rows={contactRows(d)} />
        </div>
        {src && <div className="tpl26-photo hm-text-shift"><div className="tpl26-frame"><PhotoBox src={src} /></div></div>}
      </div>
    </div>
  );
}

function Template27({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-27 tpl27-border a4-marriage-template">
      <div className="tpl27-badge">PERSONAL DETAILS</div>
      <div className="tpl27-main">
        <div className="tpl27-left"><Rows rows={personalRows(d)} /></div>
        {src && <div className="tpl27-photo hm-text-shift"><div className="tpl27-frame"><PhotoBox src={src} /></div></div>}
      </div>
      <div className="tpl27-badge">FAMILY DETAILS</div>
      <Rows rows={familyRows(d)} />
      <div className="tpl27-badge">CONTACT DETAILS</div>
      <Rows rows={contactRows(d)} />
    </div>
  );
}

function Template28({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-28 tpl28-bg a4-marriage-template">
      <div className="tpl28-title">BIO DATA</div>
      <div className="tpl28-grid">
        <div>
          <div className="tpl28-tag">PERSONAL DETAILS</div>
          <Rows rows={personalRows(d)} />
          <div className="tpl28-tag">EDUCATION / JOB</div>
          <Rows rows={[
            field(d, "Qualification", ["gradCourse","education"]),
            field(d, "Work Details", ["workExperience","occupation","jobTitle"]),
            field(d, "Income", ["income","annualIncome"]),
          ]} />
        </div>
        <div>
          {src && <div className="tpl28-photo hm-text-shift"><PhotoBox src={src} /></div>}
          <div className="tpl28-tag">FAMILY DETAILS</div>
          <Rows rows={familyRows(d)} />
          <div className="tpl28-tag">CONTACT</div>
          <Rows rows={contactRows(d)} />
        </div>
      </div>
    </div>
  );
}

function Template29({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-29 tpl29-bg a4-marriage-template">
      <div className="tpl29-header">
        <div className="tpl29-mantra">ॐ श्री गणेशाय नमः</div>
        {src && <div className="tpl29-circle hm-text-shift"><PhotoBox src={src} /></div>}
      </div>
      <div className="tpl29-title">BIO DATA</div>
      {first(d, ["fullName","name"]) && <div className="tpl29-name">{first(d, ["fullName","name"])}</div>}
      <Rows rows={personalRows(d).filter(r => r.label !== "Name")} />
      <Section title="Family Details" rows={familyRows(d)} />
      <Section title="Contact Details" rows={contactRows(d)} />
    </div>
  );
}

function Template30({ data, showPhoto }) {
  const d = data || {};
  const src = showPhoto === false ? "" : photoUrl(d);
  return (
    <div className="hm-card marriage-card-30 tpl30-border a4-marriage-template">
      <div className="tpl30-top">
        <div>
          {first(d, ["fullName","name"]) && <div className="tpl30-name">{first(d, ["fullName","name"])}</div>}
          <Rows rows={[
            field(d, "Date of Birth", ["dob","dateOfBirth","birthDate"]),
            field(d, "Place of Birth", ["birthPlace","placeOfBirth"]),
            field(d, "Time of Birth", ["birthTime","timeOfBirth"]),
          ]} />
        </div>
        {src && <div className="tpl30-photo hm-text-shift"><div className="tpl30-frame"><PhotoBox src={src} /></div></div>}
      </div>
      <div className="tpl30-bar">Personal Details</div>
      <Rows rows={personalRows(d).filter(r => !["Name","Date of Birth","Place of Birth","Time of Birth"].includes(r.label))} />
      <Section title="Family Details" rows={familyRows(d)} />
      <Section title="Contact Details" rows={contactRows(d)} />
    </div>
  );
}


export const MARRIAGE_TEMPLATE_CONFIGS = [
  { id:"tpl-m-001", name:"Hindu Marriage Biodata – Floral Crimson Red", category:"Hindu Marriage", desc:"Floral crimson red border biodata layout.", layoutType:"marriage-500", marriage:{templateNo:1} },
  { id:"tpl-m-002", name:"Hindu Marriage Biodata – Minimal Light Cream", category:"Hindu Marriage", desc:"Minimal light cream double-line biodata layout.", layoutType:"marriage-500", marriage:{templateNo:2} },
  { id:"tpl-m-003", name:"Hindu Marriage Biodata – Corner Leaf Gold", category:"Hindu Marriage", desc:"Corner leaf gold biodata layout.", layoutType:"marriage-500", marriage:{templateNo:3} },
  { id:"tpl-m-004", name:"Hindu Marriage Biodata – Traditional Maroon", category:"Hindu Marriage", desc:"Traditional red maroon centered-photo biodata layout.", layoutType:"marriage-500", marriage:{templateNo:4} },
  { id:"tpl-m-005", name:"Hindu Marriage Biodata – Deep Maroon", category:"Hindu Marriage", desc:"Deep maroon dark biodata layout.", layoutType:"marriage-500", marriage:{templateNo:5} },
  { id:"tpl-m-006", name:"Hindu Marriage Biodata – Elegant Brown", category:"Hindu Marriage", desc:"Elegant brown ornate biodata layout.", layoutType:"marriage-500", marriage:{templateNo:6} },
  { id:"tpl-m-007", name:"Hindu Marriage Biodata – Cream Gold", category:"Hindu Marriage", desc:"Cream gold patterned biodata layout.", layoutType:"marriage-500", marriage:{templateNo:7} },
  { id:"tpl-m-008", name:"Hindu Marriage Biodata – Devanagari", category:"Hindu Marriage", desc:"Devanagari-inspired biodata layout.", layoutType:"marriage-500", marriage:{templateNo:8} },
  { id:"tpl-m-009", name:"Cream Brown Double Frame", category:"Hindu Marriage", desc:"Cream brown double frame with corner ornaments (classic).", layoutType:"marriage-500", marriage:{templateNo:9} },
  { id:"tpl-m-010", name:"Floral Navy Om", category:"Hindu Marriage", desc:"Floral corner navy Om biodata layout.", layoutType:"marriage-500", marriage:{templateNo:10} },
  { id:"tpl-m-011", name:"Circular Photo Cream", category:"Hindu Marriage", desc:"Circular profile photo cream card layout.", layoutType:"marriage-500", marriage:{templateNo:11} },
  { id:"tpl-m-012", name:"Gold Corner Classic", category:"Hindu Marriage", desc:"Gold corner border classic Ganesh header layout.", layoutType:"marriage-500", marriage:{templateNo:12} },
  { id:"tpl-m-013", name:"Pink Gold Pill", category:"Hindu Marriage", desc:"Pink gold gradient with pill section headers.", layoutType:"marriage-500", marriage:{templateNo:13} },
  { id:"tpl-m-014", name:"Modern Blue Circle", category:"Hindu Marriage", desc:"Modern blue circle photo biodata card.", layoutType:"marriage-500", marriage:{templateNo:14} },
  { id:"tpl-m-015", name:"Ganesha Cream Ornate", category:"Hindu Marriage", desc:"Cream ornate border with Ganesha mantra header.", layoutType:"marriage-500", marriage:{templateNo:15} },
  { id:"tpl-m-016", name:"Floral Blossom Om", category:"Hindu Marriage", desc:"Soft floral blossom biodata with Om header.", layoutType:"marriage-500", marriage:{templateNo:16} },
  { id:"tpl-m-017", name:"Gold Circle Classic", category:"Hindu Marriage", desc:"Gold frame with centered circular photo.", layoutType:"marriage-500", marriage:{templateNo:17} },
  { id:"tpl-m-018", name:"Parchment Gold Corners", category:"Hindu Marriage", desc:"Parchment texture with gold corner ornaments.", layoutType:"marriage-500", marriage:{templateNo:18} },
  { id:"tpl-m-019", name:"Garden Green Frame", category:"Hindu Marriage", desc:"Soft green garden frame marriage biodata.", layoutType:"marriage-500", marriage:{templateNo:19} },
  { id:"tpl-m-020", name:"Brown Ganesha Classic", category:"Hindu Marriage", desc:"Brown ornate corners with Ganesha header.", layoutType:"marriage-500", marriage:{templateNo:20} },
  { id:"tpl-m-021", name:"Red Diamond Border", category:"Hindu Marriage", desc:"Red geometric diamond border biodata.", layoutType:"marriage-500", marriage:{templateNo:21} },
  { id:"tpl-m-022", name:"Maroon Gold Filigree", category:"Hindu Marriage", desc:"Deep maroon with gold filigree frame.", layoutType:"marriage-500", marriage:{templateNo:22} },
  { id:"tpl-m-023", name:"Gold Badge Sections", category:"Hindu Marriage", desc:"Gold ornate border with maroon section badges.", layoutType:"marriage-500", marriage:{templateNo:23} },
  { id:"tpl-m-024", name:"Name Header Photo Left", category:"Hindu Marriage", desc:"Name header with photo left and detail bar.", layoutType:"marriage-500", marriage:{templateNo:24} },
  { id:"tpl-m-025", name:"Colorful Ganesha Sides", category:"Hindu Marriage", desc:"Colorful side ornaments with circular photo.", layoutType:"marriage-500", marriage:{templateNo:25} },
  { id:"tpl-m-026", name:"Hindi Floral Frame", category:"Hindu Marriage", desc:"Hindi title with floral peacock-style frame.", layoutType:"marriage-500", marriage:{templateNo:26} },
  { id:"tpl-m-027", name:"Soft Pink Rose Badge", category:"Hindu Marriage", desc:"Soft pink ornate border with rose badges.", layoutType:"marriage-500", marriage:{templateNo:27} },
  { id:"tpl-m-028", name:"Royal Red Arch", category:"Hindu Marriage", desc:"Royal red arch decorative biodata layout.", layoutType:"marriage-500", marriage:{templateNo:28} },
  { id:"tpl-m-029", name:"Peach Dome Circle", category:"Hindu Marriage", desc:"Peach dome header with circular photo.", layoutType:"marriage-500", marriage:{templateNo:29} },
  { id:"tpl-m-030", name:"Cream Name Card", category:"Hindu Marriage", desc:"Cream gold corners with name-first layout.", layoutType:"marriage-500", marriage:{templateNo:30} },
];

export default function MarriageTemplateEngine({ template, data, showPhoto=true, previewProtectionProps={}, pageW=210, pageH=297, autoFontScale=1, designSettings={}, resumeDocRef=null }) {
  const no = Number(template?.marriage?.templateNo) || 1;
  const props = { data, showPhoto };
  const content = no === 2 ? <Template2 {...props} />
    : no === 3 ? <Template3 {...props} />
    : no === 4 ? <Template4 {...props} />
    : no === 5 ? <Template5 {...props} />
    : no === 6 ? <Template6 {...props} />
    : no === 7 ? <Template7 {...props} />
    : no === 8 ? <Template8 {...props} />
    : no === 9 ? <Template9 {...props} />
    : no === 10 ? <Template10 {...props} />
    : no === 11 ? <Template11 {...props} />
    : no === 12 ? <Template12 {...props} />
    : no === 13 ? <Template13 {...props} />
    : no === 14 ? <Template14 {...props} />
    : no === 15 ? <Template15 {...props} />
    : no === 16 ? <Template16 {...props} />
    : no === 17 ? <Template17 {...props} />
    : no === 18 ? <Template18 {...props} />
    : no === 19 ? <Template19 {...props} />
    : no === 20 ? <Template20 {...props} />
    : no === 21 ? <Template21 {...props} />
    : no === 22 ? <Template22 {...props} />
    : no === 23 ? <Template23 {...props} />
    : no === 24 ? <Template24 {...props} />
    : no === 25 ? <Template25 {...props} />
    : no === 26 ? <Template26 {...props} />
    : no === 27 ? <Template27 {...props} />
    : no === 28 ? <Template28 {...props} />
    : no === 29 ? <Template29 {...props} />
    : no === 30 ? <Template30 {...props} />
    : <Template1 {...props} />;

  const ds = designSettings || {};
  const manualScale = (Number(ds.contentScale) || 100) / 100;
  const fontBase = Number(ds.fontSize) || 10.5;
  const fontFactor = fontBase / 10.5;
  const scale = ds.manualMode ? manualScale : (Number(autoFontScale) || manualScale);
  const lineSpacing = Number(ds.lineSpacing) || 1.15;
  const offsetY = Number(ds.contentOffsetY) || 0;
  const columnWidth = 34;
  const photoSizeBase = Number(ds.photoSize) || 72;
  const spacing = ds.sectionSpacing || "normal";
  const sizeMul = ds.manualMode ? manualScale : scale;
  const combinedFontFactor = Number((fontFactor * sizeMul).toFixed(3));
  const photoSize = Math.round(photoSizeBase);

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
    flexShrink: 0,
    "--hm-scale": String(sizeMul),
    "--resume-font-scale": String(sizeMul),
    "--hm-user-scale": String(sizeMul),
    "--hm-font-factor": String(combinedFontFactor),
    "--hm-line-spacing": String(lineSpacing),
    "--hm-column-width": `34%`,
    "--hm-photo-size": `${photoSize}px`,
    "--hm-offset-y": `${offsetY}mm`,
    "--hm-section-gap": spacing === "compact" ? "0.7" : spacing === "relaxed" ? "1.3" : "1",
    "--resume-photo-fit": ds.photoFit || "cover",
    "--resume-photo-position": ds.photoPosition || "center",
  };

  return (
    <div id="resume-document" ref={resumeDocRef} className="hm-design-page" style={pageStyle} {...previewProtectionProps}>
      <div
        className="hm-design-content"
        data-template-width={ds.templateWidth || "normal"}
      >
        <div className="hm-exact-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}