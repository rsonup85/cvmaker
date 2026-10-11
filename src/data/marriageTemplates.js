// Pure marriage-template configuration.
// IMPORTANT: keep this file free of React/component imports to avoid module-initialization cycles.

const txt=(v,f="")=>String(v??f).trim();
const val=(d,keys,f="")=>{for(const k of keys){if(txt(d?.[k])) return txt(d[k]);}return f;};
const COLORS=[
  ["#7A1F3D","#F7E4EA","#FFFDFC"],["#8A5A00","#F6E9C7","#FFFEFA"],["#1F5A4A","#DDEDE6","#FCFFFD"],
  ["#4B3A69","#E8E0F3","#FFFDFF"],["#174A67","#DCECF5","#FBFEFF"],["#9B3D2F","#F7E0DB","#FFFBF9"],
  ["#4B5563","#EEF0F2","#FFFFFF"],["#5E214F","#F1DCEB","#FFF9FD"],["#7C2D12","#FBE7D5","#FFFCF8"],
  ["#2F4858","#E1EBEF","#FBFDFE"]
];
const FAMILIES=[
"split-sidebar","top-hero","centered-medallion","left-ribbon","right-ribbon","arch-portrait","diagonal-hero","corner-botanical","double-frame","mandala-watermark",
"royal-dark","navy-arch","emerald-heritage","burgundy-editorial","gold-luxury","black-white","pastel-cards","blush-bloom","sage-garden","lavender-silk",
"skyline","peach-paper","magazine","newspaper","timeline","vertical-timeline","mosaic-cards","stacked-cards","three-panel","contact-sidebar",
"family-sidebar","horoscope-sidebar","expectations-sidebar","education-career","photo-grid","polaroid","passport","monogram","seal","temple-arch",
"jaali","geometric","wave","diagonal-blocks","pill-modern","minimal-rule","ultra-compact","full-photo","bottom-photo","signature-editorial","ganesh-header","lotus-frame","kundli-wheel","family-tree","wedding-card","temple-column","sacred-geometry","marigold","silk-banner","portrait-letter"
];
const NAMES=["Vivah","Saanjh","Milan","Saumya","Aarohi","Anant","Suhana","Riwaaz","Bandhan","Saptapadi","Aashirwad","Sajda","Noor","Mehr","Sukoon","Shagun","Mehfil","Riwaayat","Parampara","Utsav","Aarambh","Madhur","Saath","Mannat","Kahaani","Aangan","Rishta","Mangal","Vivaah","Sneh","Anmol","Dastaan","Gul","Sitara","Rang","Prem","Milap","Sanskaar","Satrangi","Jeevan","Saheli","Sajni","Humraahi","Jashn","Kismat","Maitri","Sangam","Sanjog","Aastha"];
const ORDERS=[
 ["personal","family","education","career","horoscope","expectations"],
 ["personal","horoscope","career","education","family","expectations"],
 ["personal","career","family","education","horoscope","expectations"],
 ["personal","education","career","family","horoscope","expectations"],
 ["personal","family","horoscope","career","education","expectations"],
];

function config(i){
 const familyIndex = ((Number(i) % FAMILIES.length) + FAMILIES.length) % FAMILIES.length;
 const family=FAMILIES[familyIndex];
 const v=Math.floor(Number(i)/FAMILIES.length)%10;
 const [primary,soft,paper]=COLORS[(i*7+v)%COLORS.length];
 return {family,variation:v,primary,soft,paper,order:ORDERS[i%ORDERS.length],photoShape:["circle","square","rounded","arch"][i%4],density:[9,10,11,12][v%4],radius:[0,8,16,24][i%4],title:[18,21,24,20,26][v%5],motif:["ॐ","शुभ विवाह","॥ श्री गणेशाय नमः ॥","ॐ मंगलम्","विवाह परिचय","॥ श्री गणेशाय नमः ॥","❈ मंगल परिणय ❈","शुभारम्भ","॥ शुभमस्तु ॥","सप्तपदी"][v%10]};
}
export const MARRIAGE_TEMPLATE_CONFIGS=Array.from({length:600},(_,i)=>({
 id:`tpl-m-${String(i+1).padStart(3,"0")}`,
 name:`Hindu Marriage ${NAMES[i%NAMES.length]} — ${FAMILIES[i%FAMILIES.length].replaceAll("-"," ")} ${String(i+1).padStart(3,"0")}`,
 category:"Hindu Marriage",
 desc:`Original Hindu matrimonial biodata composition — ${FAMILIES[i%FAMILIES.length].replaceAll("-"," ")}.`,layoutType:"marriage-500",marriage:config(i)
}));


export { txt, val, COLORS, FAMILIES, NAMES, ORDERS, config };
