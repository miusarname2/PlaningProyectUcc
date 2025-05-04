import React from 'react';

export default function SvgHeader() {
  return (
    <div className="relative h-24 sm:h-32 md:h-40 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full text-white" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="currentColor"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,181.3C960,181,1056,203,1152,208C1248,213,1344,203,1392,197.3L1440,192V0H0Z"
          />
        </svg>
      </div>
  );
}
