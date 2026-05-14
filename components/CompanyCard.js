"use client";

import { useState } from "react";

export default function CompanyCard({ companyName, description, sector, url, favicon, linkedIn, companySize }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {favicon && !imgError && (
          <img
            src={favicon}
            alt=""
            width={40}
            height={40}
            className="rounded-lg border border-zinc-100 object-contain shrink-0"
            onError={() => setImgError(true)}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">{companyName}</h2>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:underline"
              >
                {url}
              </a>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                {sector}
              </span>
              {companySize && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {companySize}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-zinc-600">{description}</p>

      {linkedIn && (
        <a
          href={linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Voir sur LinkedIn
        </a>
      )}
    </div>
  );
}
