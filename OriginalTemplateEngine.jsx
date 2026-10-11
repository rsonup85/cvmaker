import React from "react";
import { RichText } from "./RichTextEditor";

const text = (v, fallback = "") => String(v || fallback).trim();
const list = (v) => text(v).split(/[,•|\n]+/).map((x) => x.trim()).filter(Boolean);

function paletteFor(index) {
  const palettes = [
    ["#17324d", "#d7e8f5", "#ffffff"], ["#5b2346", "#f1d9e8", "#fffdfd"],
    ["#174b3f", "#d7eee7", "#ffffff"], ["#7a3e16", "#f4dfc9", "#fffdf9"],
    ["#333b52", "#dfe5f2", "#ffffff"], ["#4b3b70", "#e6def5", "#fff"],
    ["#155e75", "#d7eef4", "#fff"], ["#5c4a1f", "#eee3bd", "#fffdf7"],
    ["#2f3e3a", "#dce8e3", "#fff"], ["#7f1d3a", "#f6d7df", "#fff"],
  ];
  return palettes[index % palettes.length];
}

const NAMES = [
  "Aster", "Atlas", "Nova", "Mosaic", "Vertex", "Lumen", "Orbit", "Cedar", "Sage", "Prism",
  "Harbor", "Slate", "Arbor", "Ember", "Vela", "Nexus", "Pioneer", "Canvas", "Cobalt", "Monarch",
  "Meadow", "Summit", "Meridian", "Craft", "Forma", "Crescent", "Pulse", "Elevate", "Contour", "Vantage",
  "Willow", "Studio", "Focus", "North", "Terra", "Axis", "Halo", "Foundry", "Linea", "Verve",
];

const FAMILIES = [
  { shell:"left", head:"stack", photo:"circle", deco:"rail", sections:["experience","education","skills","summary","hobbies"] },
  { shell:"right", head:"stack", photo:"square", deco:"rail", sections:["summary","experience","education","skills","hobbies"] },
  { shell:"top", head:"split", photo:"circle", deco:"band", sections:["summary","experience","education","skills"] },
  { shell:"top", head:"center", photo:"circle", deco:"rule", sections:["summary","experience","education","skills","hobbies"] },
  { shell:"top", head:"left", photo:"none", deco:"corner", sections:["experience","education","skills","summary"] },
  { shell:"left-wide", head:"stack", photo:"circle", deco:"stripe", sections:["summary","experience","skills","education"] },
  { shell:"right-wide", head:"stack", photo:"square", deco:"stripe", sections:["experience","education","summary","skills"] },
  { shell:"asym-left", head:"split", photo:"circle", deco:"block", sections:["summary","experience","education","skills"] },
  { shell:"asym-right", head:"split", photo:"square", deco:"block", sections:["experience","education","summary","skills"] },
  { shell:"timeline", head:"center", photo:"circle", deco:"dotline", sections:["experience","education","skills","summary"] },
  { shell:"cards", head:"split", photo:"circle", deco:"cards", sections:["summary","experience","education","skills"] },
  { shell:"editorial", head:"left", photo:"none", deco:"rule", sections:["experience","education","skills","summary"] },
  { shell:"frame", head:"center", photo:"circle", deco:"frame", sections:["summary","experience","education","skills"] },
  { shell:"vertical", head:"stack", photo:"circle", deco:"vertical", sections:["experience","skills","education","summary"] },
  { shell:"magazine", head:"split", photo:"square", deco:"corner", sections:["summary","experience","skills","education"] },
  { shell:"portfolio", head:"left", photo:"circle", deco:"dots", sections:["experience","projects","skills","education"] },
  { shell:"ats", head:"left", photo:"none", deco:"thin", sections:["summary","experience","education","skills"] },
  { shell:"compact", head:"center", photo:"none", deco:"double", sections:["summary","experience","education","skills","hobbies"] },
  { shell:"header-side", head:"split", photo:"circle", deco:"tab", sections:["summary","experience","education","skills"] },
  { shell:"statement", head:"center", photo:"circle", deco:"underline", sections:["summary","experience","skills","education"] },
  { shell:"diagonal", head:"stack", photo:"circle", deco:"diagonal", sections:["experience","education","summary","skills"] },
  { shell:"notch", head:"left", photo:"square", deco:"notch", sections:["summary","experience","education","skills"] },
  { shell:"soft-grid", head:"split", photo:"circle", deco:"grid", sections:["summary","education","experience","skills"] },
  { shell:"column-rule", head:"center", photo:"none", deco:"rule", sections:["experience","education","skills","summary"] },
  { shell:"contact-first", head:"stack", photo:"circle", deco:"contact", sections:["summary","experience","education","skills"] },
  { shell:"skills-first", head:"split", photo:"square", deco:"skillrail", sections:["skills","experience","education","summary"] },
  { shell:"education-first", head:"left", photo:"circle", deco:"edu", sections:["education","experience","skills","summary"] },
  { shell:"experience-first", head:"center", photo:"circle", deco:"exp", sections:["experience","summary","education","skills"] },
  { shell:"mono", head:"left", photo:"none", deco:"mono", sections:["summary","experience","education","skills"] },
  { shell:"contrast", head:"split", photo:"square", deco:"contrast", sections:["experience","skills","education","summary"] },
  { shell:"badge", head:"stack", photo:"circle", deco:"badge", sections:["summary","experience","skills","education"] },
  { shell:"ring", head:"center", photo:"circle", deco:"ring", sections:["summary","experience","education","skills"] },
  { shell:"micro", head:"left", photo:"none", deco:"micro", sections:["experience","skills","education","summary"] },
  { shell:"splitbar", head:"split", photo:"circle", deco:"splitbar", sections:["summary","experience","education","skills"] },
  { shell:"gallery", head:"center", photo:"square", deco:"gallery", sections:["summary","experience","skills","education"] },
  { shell:"signal", head:"stack", photo:"circle", deco:"signal", sections:["experience","education","skills","summary"] },
  { shell:"quiet", head:"left", photo:"none", deco:"quiet", sections:["summary","experience","education","skills"] },
  { shell:"bold", head:"split", photo:"square", deco:"bold", sections:["experience","summary","skills","education"] },
  { shell:"classic-plus", head:"center", photo:"circle", deco:"classic", sections:["summary","education","experience","skills"] },
  { shell:"modern-plus", head:"stack", photo:"circle", deco:"modern", sections:["experience","skills","summary","education"] },
];

export const ORIGINAL_TEMPLATE_CONFIGS = Array.from({ length: 200 }, (_, i) => {
  const family = FAMILIES[i % FAMILIES.length];
  const variation = Math.floor(i / FAMILIES.length);
  const [primary, soft, paper] = paletteFor(i + variation * 3);
  const density = ["tight", "balanced", "airy", "compact", "editorial"][variation % 5];
  return {
    id: `tpl-o-${String(i + 1).padStart(3, "0")}`,
    name: `${NAMES[i % NAMES.length]} ${String(i + 1).padStart(3, "0")}`,
    category: i < 40 ? "Professional" : i < 80 ? "Modern" : i < 120 ? "Creative" : i < 160 ? "ATS Friendly" : "Fresher",
    desc: `Original ${family.shell} composition with ${family.head} header, ${family.deco} accents and ${family.sections.join(", ")} hierarchy.`,
    layoutType: "original-200",
    original: {
      family: i % FAMILIES.length,
      variation,
      shell: family.shell,
      head: family.head,
      photo: family.photo,
      deco: family.deco,
      sections: family.sections,
      density,
      primary,
      soft,
      paper,
      titleSize: 22 + ((i * 3) % 9),
      radius: [0, 4, 8, 14, 22][i % 5],
      line: [1, 2, 3][i % 3],
      compactHeader: i % 2 === 0,
      reversed: i % 3 === 0,
    },
    styles: {
      fontFamily: ["Inter, Arial, sans-serif", "Georgia, serif", "Trebuchet MS, Arial, sans-serif", "Verdana, Arial, sans-serif"][i % 4],
      primaryColor: primary,
      accentColor: primary,
      headerBg: paper,
      sectionBg: soft,
      textColor: "#24303a",
      secondaryColor: "#64717c",
      sidebarBg: primary,
      sidebarText: "#ffffff",
      spacing: density,
      showSignature: false,
      educationStyle: "list",
    },
  };
});

function Photo({ data, show, shape, size = 92, borderColor }) {
  if (!show || shape === "none") return null;
  return (
    <div style={{ width:size, height:size, borderRadius:shape === "circle" ? "50%" : 10, overflow:"hidden", flexShrink:0, background:"#e8edf1", border:`3px solid ${borderColor}`, boxShadow:"0 4px 14px rgba(15,23,42,.10)" }}>
      {data.photo ? <img src={data.photo} alt="Profile" crossOrigin="anonymous" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : null}
    </div>
  );
}

function SectionTitle({ children, cfg, styleType }) {
  const line = styleType === "pill" ? {background:cfg.soft,padding:"5px 8px",borderRadius:8} : styleType === "boxed" ? {border:`1px solid ${cfg.primary}`,padding:"4px 7px",borderRadius:4} : styleType === "bar" ? {background:cfg.primary,color:"white",padding:"5px 8px"} : {borderBottom:`${cfg.line}px solid ${cfg.primary}`,paddingBottom:4};
  return <div style={{fontSize:`calc(10.5px * var(--resume-font-scale, 1))`,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:7,color:cfg.primary,...line}}>{children}</div>;
}

function Body({ children, muted=false, size=9.3, cfg }) {
  return <div className="whitespace-pre-line" style={{fontSize:`calc(${size}px * var(--resume-font-scale, 1))`,lineHeight:1.42,color:muted?"#71808d":"#2f3a43"}}><RichText value={children} /></div>;
}

function Contact({ data, dark=false }) {
  const items = [["PHONE",data.phone],["EMAIL",data.email],["ADDRESS",data.address]].filter(([,v])=>text(v));
  return <div style={{display:"grid",gap:7}}>{items.map(([k,v])=><div key={k}><div style={{fontSize:`calc(7.5px * var(--resume-font-scale, 1))`,fontWeight:800,letterSpacing:1,color:dark?"#cbd5df":"#7a8791"}}>{k}</div><div style={{fontSize:`calc(9.2px * var(--resume-font-scale, 1))`,color:dark?"#fff":"#29343d",wordBreak:"break-word",whiteSpace:"pre-line"}}>{v}</div></div>)}</div>;
}

function Skills({ data, cfg, dark=false, styleType="dots" }) {
  const skills = [...list(data.officeAutomation), ...list(data.techKnowledge)].slice(0,10);
  if (!skills.length) return null;
  return <div style={{display:"grid",gap:6}}>{skills.map((sk,i)=><div key={`${sk}-${i}`}>
    <div style={{display:"flex",justifyContent:"space-between",gap:5,fontSize:`calc(8.8px * var(--resume-font-scale, 1))`,color:dark?"#fff":"#34414b"}}><span>{sk}</span>{styleType === "bar" && <span style={{opacity:.65}}>{Math.max(55,92-i*4)}%</span>}</div>
    {styleType === "bar" && <div style={{height:4,background:dark?"rgba(255,255,255,.22)":"#e8edf1",borderRadius:4,marginTop:2}}><div style={{height:"100%",width:`${Math.max(55,92-i*4)}%`,background:cfg.primary,borderRadius:4}}/></div>}
    {styleType === "dots" && <div style={{display:"flex",gap:3,marginTop:3}}>{[0,1,2,3,4].map(d=><i key={d} style={{width:4,height:4,borderRadius:"50%",background:d<3+(i%3)?cfg.primary:"#d9e0e5"}}/>)}</div>}
  </div>)}</div>;
}

function Experience({ data, cfg, mode="timeline" }) {
  const value = data.workExperience || "Add your work experience here.";
  return <div style={{position:"relative",paddingLeft:mode === "timeline" ? 15 : 0}}>
    {mode === "timeline" && <span style={{position:"absolute",left:0,top:5,width:7,height:7,borderRadius:"50%",background:cfg.primary}}/>}
    <Body cfg={cfg}>{value}</Body>
  </div>;
}

function Education({ data, cfg, mode="list" }) {
  const rows = [
    data.gradCourse && `${data.gradCourse}${data.gradCollege?` — ${data.gradCollege}`:""}`,
    data.interSchool && `Intermediate (12th) — ${data.interSchool}`,
    data.sscSchool && `SSC (10th) — ${data.sscSchool}`,
  ].filter(Boolean);
  if (!rows.length) return null;
  return <div style={{display:"grid",gap:7}}>{rows.map((r,i)=><div key={i} style={{paddingLeft:mode === "boxed"?7:0,borderLeft:mode === "boxed"?`2px solid ${cfg.primary}`:undefined}}><div style={{fontSize:`calc(9.2px * var(--resume-font-scale, 1))`,fontWeight:800}}>{r}</div></div>)}</div>;
}

function Section({ name, data, cfg, variant }) {
  if (name === "summary") return <section><SectionTitle cfg={cfg} styleType={variant}>{"Profile / Summary"}</SectionTitle><Body cfg={cfg}>{text(data.summary,"Professional profile summary goes here.")}</Body></section>;
  if (name === "experience") return <section><SectionTitle cfg={cfg} styleType={variant}>Experience</SectionTitle><Experience data={data} cfg={cfg} mode={variant === "plain" ? "plain" : "timeline"}/></section>;
  if (name === "education") return <section><SectionTitle cfg={cfg} styleType={variant}>Education</SectionTitle><Education data={data} cfg={cfg} mode={variant === "boxed" ? "boxed" : "list"}/></section>;
  if (name === "skills") return <section><SectionTitle cfg={cfg} styleType={variant}>Skills & Expertise</SectionTitle><Skills data={data} cfg={cfg} styleType={variant === "bar" ? "bar" : "dots"}/></section>;
  if (name === "hobbies") return <section><SectionTitle cfg={cfg} styleType={variant}>Interests</SectionTitle><Body cfg={cfg}>{list(data.hobbies).join("  •  ")}</Body></section>;
  if (name === "projects") return <section><SectionTitle cfg={cfg} styleType={variant}>Projects</SectionTitle><Body cfg={cfg}>{text(data.techKnowledge,"Selected projects and practical work")}</Body></section>;
  return null;
}

function Decorative({ cfg }) {
  const common = {position:"absolute",pointerEvents:"none",zIndex:0};
  if (cfg.deco === "rail") return <div style={{...common,left:0,top:0,bottom:0,width:7,background:cfg.primary}}/>;
  if (cfg.deco === "band") return <div style={{...common,left:0,right:0,top:0,height:9,background:cfg.primary}}/>;
  if (cfg.deco === "stripe") return <><div style={{...common,left:0,top:0,bottom:0,width:18,background:cfg.soft}}/><div style={{...common,left:18,top:0,bottom:0,width:5,background:cfg.primary}}/></>;
  if (cfg.deco === "corner") return <><div style={{...common,right:0,top:0,width:125,height:8,background:cfg.primary}}/><div style={{...common,right:0,top:0,width:8,height:125,background:cfg.primary}}/></>;
  if (cfg.deco === "block") return <div style={{...common,right:0,top:0,width:70,height:70,background:cfg.soft,borderBottomLeftRadius:50}}/>;
  if (cfg.deco === "dotline") return <div style={{...common,left:"50%",top:150,bottom:25,width:2,background:`repeating-linear-gradient(to bottom, ${cfg.primary} 0 5px, transparent 5px 11px)`}}/>;
  if (cfg.deco === "frame") return <div style={{...common,inset:9,border:`${cfg.line}px solid ${cfg.primary}`,borderRadius:cfg.radius}}/>;
  if (cfg.deco === "vertical") return <div style={{...common,left:78,top:0,bottom:0,width:1,background:cfg.primary}}/>;
  if (cfg.deco === "dots") return <div style={{...common,right:20,top:20,width:45,height:45,backgroundImage:`radial-gradient(${cfg.primary} 1.5px, transparent 1.5px)`,backgroundSize:"9px 9px"}}/>;
  if (cfg.deco === "diagonal") return <div style={{...common,right:-65,top:-55,width:230,height:110,background:cfg.soft,transform:"rotate(-16deg)"}}/>;
  if (cfg.deco === "notch") return <div style={{...common,left:0,top:0,width:95,height:95,background:cfg.primary,clipPath:"polygon(0 0,100% 0,0 100%)"}}/>;
  if (cfg.deco === "grid") return <div style={{...common,right:0,bottom:0,width:150,height:150,opacity:.4,backgroundImage:`linear-gradient(${cfg.soft} 1px,transparent 1px),linear-gradient(90deg,${cfg.soft} 1px,transparent 1px)`,backgroundSize:"12px 12px"}}/>;
  if (cfg.deco === "double") return <div style={{...common,left:20,right:20,top:20,bottom:20,border:`1px solid ${cfg.soft}`,boxShadow:`inset 0 0 0 5px ${cfg.paper}`}}/>;
  if (cfg.deco === "tab") return <div style={{...common,left:0,top:0,width:105,height:35,background:cfg.primary,borderBottomRightRadius:18}}/>;
  if (cfg.deco === "underline") return <div style={{...common,left:"35%",right:"35%",top:112,height:4,background:cfg.primary,borderRadius:4}}/>;
  if (cfg.deco === "contact") return <div style={{...common,right:0,top:0,width:85,height:170,background:cfg.soft,borderBottomLeftRadius:55}}/>;
  if (cfg.deco === "skillrail") return <div style={{...common,right:0,top:0,bottom:0,width:6,background:cfg.primary}}/>;
  if (cfg.deco === "edu") return <div style={{...common,left:0,top:0,width:150,height:8,background:cfg.primary}}/>;
  if (cfg.deco === "exp") return <div style={{...common,left:20,right:20,top:126,height:1,background:cfg.primary}}/>;
  if (cfg.deco === "mono") return <div style={{...common,left:0,top:0,bottom:0,width:3,background:"#111827"}}/>;
  if (cfg.deco === "contrast") return <div style={{...common,left:0,top:0,width:210,height:130,background:cfg.primary,borderBottomRightRadius:60}}/>;
  if (cfg.deco === "badge") return <div style={{...common,left:20,top:20,width:58,height:22,background:cfg.primary,borderRadius:20}}/>;
  if (cfg.deco === "ring") return <div style={{...common,left:"50%",transform:"translateX(-50%)",top:18,width:130,height:130,border:`8px solid ${cfg.soft}`,borderRadius:"50%"}}/>;
  if (cfg.deco === "micro") return <div style={{...common,left:20,right:20,top:104,height:2,background:cfg.primary}}/>;
  if (cfg.deco === "splitbar") return <><div style={{...common,left:0,top:0,width:"42%",height:9,background:cfg.primary}}/><div style={{...common,right:0,top:0,width:"42%",height:9,background:cfg.soft}}/></>;
  if (cfg.deco === "gallery") return <div style={{...common,left:18,right:18,top:18,height:72,borderRadius:cfg.radius,border:`1px solid ${cfg.soft}`}}/>;
  if (cfg.deco === "signal") return <div style={{...common,right:20,top:20,width:55,height:55,borderRadius:"50%",border:`5px solid ${cfg.soft}`,boxShadow:`0 0 0 8px ${cfg.paper}`}}/>;
  if (cfg.deco === "bold") return <div style={{...common,left:0,right:0,top:0,height:22,background:cfg.primary}}/>;
  if (cfg.deco === "classic") return <div style={{...common,left:30,right:30,top:25,height:1,background:cfg.primary}}/>;
  if (cfg.deco === "modern") return <div style={{...common,left:0,top:0,width:12,height:90,background:cfg.primary,borderBottomRightRadius:18}}/>;
  return null;
}

export default function OriginalTemplateEngine({ template, data, showPhoto, pageW = 210, pageH = 297, autoFontScale = 1, designSettings = {}, previewProtectionProps = {} }) {
  const cfg = template.original || {};
  const family = cfg.shell || "top";
  const manual = !!designSettings.manualMode;
  const contentScale = Math.max(0.6, Math.min(1.6, (Number(designSettings.contentScale) || 100) / 100));
  const fontBase = Math.max(7, Math.min(18, Number(designSettings.fontSize) || 10.5));
  const designFontScale = manual ? autoFontScale : contentScale * (fontBase / 10.5);
  const lineHeight = Math.max(0.8, Math.min(2.2, Number(designSettings.lineSpacing) || 1.15));
  const photoSize = Math.max(36, Math.min(160, Number(designSettings.photoSize) || 72));
  const columnPct = Math.max(22, Math.min(70, Number(designSettings.columnWidth) || 34));
  const offsetY = Number(designSettings.contentOffsetY) || 0;
  const spacingMap = { compact: 8, normal: 14, relaxed: 20 };
  const sectionGap = spacingMap[designSettings.sectionSpacing] || 14;
  const marginTop = Math.max(0, Number(designSettings.marginTop) || 0);
  const marginBottom = Math.max(0, Number(designSettings.marginBottom) || 0);
  const marginLeft = Math.max(0, Number(designSettings.marginLeft) || 0);
  const marginRight = Math.max(0, Number(designSettings.marginRight) || 0);
  const name = text(data.fullName,"YOUR NAME");
  const role = text(data.role,"PROFESSIONAL");
  const sections = cfg.sections || ["summary","experience","education","skills"];
  const titleVariant = ["plain","bar","pill","boxed","bar"][cfg.variation % 5];
  const dark = ["left","right","left-wide","right-wide"].includes(family);
  // The header itself sits on the white/main canvas for sidebar layouts.
  // Do not inherit the sidebar text color here, otherwise the name becomes white-on-white.
  const headerDark = !!cfg.headerDark;
  const sidebarWidth = family.includes("wide") ? "37%" : "30%";
  const header = (
    <div style={{display:"flex",alignItems:"center",justifyContent:cfg.head === "center" ? "center" : "space-between",gap:16,position:"relative",zIndex:2,textAlign:cfg.head === "center" ? "center" : "left"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,flexDirection:cfg.reversed?"row-reverse":"row",minWidth:0}}>
        {cfg.photo !== "none" && <Photo data={data} show={showPhoto} shape={cfg.photo} size={cfg.compactHeader ? Math.min(photoSize, 72) : photoSize} borderColor={cfg.primary}/>} 
        <div style={{minWidth:0}}>
          <div style={{fontSize:`calc(${cfg.titleSize}px * var(--resume-font-scale, 1))`,fontWeight:850,lineHeight:1.05,letterSpacing:cfg.variation%3===0?1.2:0.2,color:headerDark?"#fff":cfg.primary,textTransform:cfg.variation%2?"none":"uppercase",wordBreak:"break-word"}}>{name}</div>
          <div style={{fontSize:`calc(9.5px * var(--resume-font-scale, 1))`,marginTop:5,letterSpacing:1.1,color:headerDark?"#d9e2e8":"#66747e",fontWeight:700}}>{role}</div>
        </div>
      </div>
      {cfg.head === "split" && <div style={{minWidth:145,maxWidth:190}}><Contact data={data} dark={dark}/></div>}
    </div>
  );

  const sectionStack = <div style={{display:"grid",gap:sectionGap,position:"relative",zIndex:2,lineHeight}}>{sections.map((n,idx)=><Section key={`${n}-${idx}`} name={n} data={data} cfg={cfg} variant={n === "skills" ? "bar" : titleVariant}/>)}</div>;

  let body;
  if (family === "left" || family === "left-wide" || family === "vertical" || family === "contact-first" || family === "skills-first" || family === "education-first") {
    body = <div style={{display:"grid",gridTemplateColumns:`${columnPct}% 1fr`,minHeight:"100%",position:"relative",zIndex:1}}>
      <aside style={{background:cfg.primary,color:"white",padding:"22px 17px",paddingTop:family === "education-first"?32:22}}>
        <div style={{marginBottom:18}}>{cfg.head !== "split" && <Contact data={data} dark/>}</div>
        <SectionTitle cfg={cfg} styleType="plain">{family === "skills-first"?"Core Skills":"Profile"}</SectionTitle>
        <Body cfg={cfg} muted>{text(data.summary,"Professional profile")}</Body>
        <div style={{marginTop:18}}><SectionTitle cfg={cfg} styleType="plain">Skills</SectionTitle><Skills data={data} cfg={cfg} dark styleType={cfg.variation%2?"bar":"dots"}/></div>
        <div style={{marginTop:18}}><SectionTitle cfg={cfg} styleType="plain">Education</SectionTitle><Education data={data} cfg={cfg}/></div>
      </aside>
      <main style={{padding:"25px 23px 20px",display:"grid",alignContent:"start",gap:sectionGap,lineHeight}}>{header}{sectionStack}</main>
    </div>;
  } else if (family === "right" || family === "right-wide" || family === "header-side" || family === "skills-first") {
    body = <div style={{display:"grid",gridTemplateColumns:`${100-columnPct}% ${columnPct}%`,minHeight:"100%",position:"relative",zIndex:1}}>
      <main style={{padding:"25px 23px 20px",display:"grid",alignContent:"start",gap:sectionGap,lineHeight}}>{header}{sectionStack}</main>
      <aside style={{background:cfg.primary,color:"white",padding:"22px 17px"}}><div style={{marginBottom:18}}><Contact data={data} dark/></div><SectionTitle cfg={cfg} styleType="plain">Skills</SectionTitle><Skills data={data} cfg={cfg} dark styleType="bar"/><div style={{marginTop:18}}><SectionTitle cfg={cfg} styleType="plain">Education</SectionTitle><Education data={data} cfg={cfg}/></div></aside>
    </div>;
  } else if (family === "timeline" || family === "column-rule") {
    body = <div style={{padding:"22px 25px",position:"relative",zIndex:1}}>{header}<div style={{marginTop:18,display:"grid",gridTemplateColumns:"1fr 1fr",gap:sectionGap}}>{sections.map((n,idx)=><Section key={`${n}-${idx}`} name={n} data={data} cfg={cfg} variant={idx%2?"boxed":titleVariant}/>)}</div></div>;
  } else if (family === "cards" || family === "soft-grid" || family === "portfolio" || family === "gallery") {
    body = <div style={{padding:"22px 24px",position:"relative",zIndex:1}}>{header}<div style={{marginTop:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:sectionGap}}>{sections.map((n,idx)=><div key={`${n}-${idx}`} style={{background:idx%2?cfg.paper:cfg.soft,border:`${cfg.line}px solid ${cfg.soft}`,borderRadius:cfg.radius,padding:12}}><Section name={n} data={data} cfg={cfg} variant={idx%3===0?"pill":"plain"}/></div>)}</div></div>;
  } else if (family === "frame" || family === "statement" || family === "compact" || family === "quiet" || family === "classic-plus") {
    body = <div style={{padding:"26px 30px",position:"relative",zIndex:1}}>{header}<div style={{marginTop:24,display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:sectionGap}}><div style={{display:"grid",gap:sectionGap}}>{sections.slice(0,3).map((n,idx)=><Section key={`${n}-${idx}`} name={n} data={data} cfg={cfg} variant={idx===0?"boxed":"plain"}/>)}</div><div style={{display:"grid",gap:sectionGap,alignContent:"start"}}><Section name={sections[3]||"skills"} data={data} cfg={cfg} variant="bar"/><Section name={sections[4]||"hobbies"} data={data} cfg={cfg} variant="pill"/></div></div></div>;
  } else {
    body = <div style={{padding:"22px 25px",position:"relative",zIndex:1}}>{header}<div style={{marginTop:18}}>{sectionStack}</div></div>;
  }

  return <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
    <div className="origin-top" style={{transform:"scale(1)"}}>
      <div id="resume-document" {...previewProtectionProps} className="bg-white relative overflow-hidden" style={{width:`${pageW}mm`,height:`${pageH}mm`,minHeight:`${pageH}mm`,maxHeight:`${pageH}mm`,boxSizing:"border-box",fontFamily:template.styles?.fontFamily || "Arial, sans-serif", "--resume-font-scale":designFontScale, "--resume-font-base":`${fontBase}px`, paddingTop:`${marginTop}mm`, paddingBottom:`${marginBottom}mm`, paddingLeft:`${marginLeft}mm`, paddingRight:`${marginRight}mm`, transform:`translateY(${offsetY}mm)`, transformOrigin:"top center", lineHeight, color:"#24303a"}}>
        <Decorative cfg={cfg}/>
        {body}
      </div>
    </div>
  </div>;
}
