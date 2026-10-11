import React from 'react';
import { RichText } from "../components/RichTextEditor";

export function SingleColumnLayout({ data, config, isPro }) {
  return (
    <div
      id="resume-document"
      className="bg-white text-slate-900 p-8 font-sans max-w-[210mm] min-h-[297mm] mx-auto box-border border border-gray-300 shadow-md relative leading-normal"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      {/* Top Header Box */}
      <div className="bg-[#b3a382] py-2 text-center mb-6">
        <h1 className="text-xl font-bold tracking-wider text-black uppercase">
          CURRICULUM VITAE
        </h1>
      </div>

      {/* Candidate Personal Details */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-black uppercase">{data.fullName || 'SHAHBAJ AHMAD'}</h2>
        <p className="text-xs text-slate-800 whitespace-pre-line mt-1">
          {data.address || 'Subhash Nagar, Bermo, Bokaro\nDist- Bokaro-829124 (Jharkhand)'}
        </p>
        <p className="text-xs text-slate-800 font-semibold mt-1">
          Mob- {data.phone || '9999999999'}
        </p>
        <p className="text-xs text-slate-800 font-semibold">
          E-mail: {data.email || 'youremail@gmail.com'}
        </p>
      </div>

      <hr className="border-t border-black mb-4" />

      {/* CAREER OBJECTIVES */}
      <div className="mb-4">
        <div className="bg-[#dcdcdc] border border-black px-2 py-1 mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-black">
            CAREER OBJECTIVES:
          </h3>
        </div>
        <p className="text-xs text-justify text-slate-800 px-2 leading-relaxed">
          <RichText value={data.summary ||
            'Aim to be associated with a progressive organization which offers an excellent atmosphere to prove myself by utilizing all technical knowledge into practice and profit myself with experience and valuable knowledge for the development and growth of the organization.'} />
        </p>
      </div>

      {/* ACADEMIC DETAILS */}
      <div className="mb-4">
        <div className="bg-[#dcdcdc] border border-black px-2 py-1 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-black">
            ACADEMIC DETAILS:
          </h3>
        </div>

        <div className="space-y-3 px-2">
          {/* Graduation */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xs text-black">
              <span className="text-blue-600 text-[10px]">❖</span> B.COM (ACCOUNTS HONS)
            </div>
            <table className="text-xs ml-4 mt-1 w-full max-w-lg">
              <tbody>
                <tr>
                  <td className="w-28 font-semibold text-slate-700">COLLEGE</td>
                  <td className="w-4 text-center">:</td>
                  <td className="pl-2 text-slate-900">R.V.S. (B.S.CITY)</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-700">UNIVERSITY</td>
                  <td className="text-center">:</td>
                  <td className="pl-2 text-slate-900">Vinoba Bhave University Hazaribagh</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-700">DIVISION</td>
                  <td className="text-center">:</td>
                  <td className="pl-2 text-slate-900">2<sup>nd</sup></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Intermediate */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xs text-black">
              <span className="text-blue-600 text-[10px]">❖</span> INTERMEDIATE
            </div>
            <table className="text-xs ml-4 mt-1 w-full max-w-lg">
              <tbody>
                <tr>
                  <td className="w-28 font-semibold text-slate-700">SCHOOL</td>
                  <td className="w-4 text-center">:</td>
                  <td className="pl-2 text-slate-900">Ananda College, Hazaribagh (Jharkhand)</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-700">BOARD</td>
                  <td className="text-center">:</td>
                  <td className="pl-2 text-slate-900">J.A.C.</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-700">DIVISION</td>
                  <td className="text-center">:</td>
                  <td className="pl-2 text-slate-900">2<sup>nd</sup></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Secondary School */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xs text-black">
              <span className="text-blue-600 text-[10px]">❖</span> SECONDARY SCHOOL CERTIFICATE (SSC)
            </div>
            <table className="text-xs ml-4 mt-1 w-full max-w-lg">
              <tbody>
                <tr>
                  <td className="w-28 font-semibold text-slate-700">SCHOOL</td>
                  <td className="w-4 text-center">:</td>
                  <td className="pl-2 text-slate-900">Ram Ratan High School (Jharkhand)</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-700">BOARD</td>
                  <td className="text-center">:</td>
                  <td className="pl-2 text-slate-900">J.A.C.</td>
                </tr>
                <tr>
                  <td className="font-semibold text-slate-700">DIVISION</td>
                  <td className="text-center">:</td>
                  <td className="pl-2 text-slate-900">2<sup>nd</sup></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* COMPUTER PROFICIENCY */}
      <div className="mb-4">
        <div className="bg-[#dcdcdc] border border-black px-2 py-1 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-black">
            COMPUTER PROFICIENCY:
          </h3>
        </div>

        <table className="text-xs ml-4 w-full max-w-lg border-separate border-spacing-y-1">
          <tbody>
            <tr>
              <td className="w-44 font-semibold text-slate-700">
                <span className="text-blue-600 mr-2">❖</span> Office Automation
              </td>
              <td className="w-4 text-center">:</td>
              <td className="pl-2 text-slate-900">Microsoft Office 2007, 2003</td>
            </tr>
            <tr>
              <td className="font-semibold text-slate-700">
                <span className="text-blue-600 mr-2">❖</span> Technical Knowledge
              </td>
              <td className="text-center">:</td>
              <td className="pl-2 text-slate-900">Tally, Typing</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* HOBBIES & INTERESTS */}
      <div className="mb-4">
        <div className="bg-[#dcdcdc] border border-black px-2 py-1 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-black">
            HOBBIES & INTERESTS:
          </h3>
        </div>

        <ul className="text-xs space-y-1 ml-6 text-slate-900 list-disc">
          <li>Interact with people</li>
          <li>Travelling</li>
          <li>Listening Hollywood Songs</li>
        </ul>
      </div>

      {!isPro && (
        <div className="absolute bottom-3 right-4 text-[10px] text-gray-400">
          CV Maker Free
        </div>
      )}
    </div>
  );
}
