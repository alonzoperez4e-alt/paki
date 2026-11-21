import React from 'react';

interface PakiLogoProps {
  variant?: 'pill' | 'clean';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PakiLogo: React.FC<PakiLogoProps> = ({
  variant = 'clean',
  size = 'md',
  className = '',
}) => {
  const sizeConfig = {
    sm: {
      wordmark: 'text-xl leading-none',
      tagline: 'text-[8px] mt-0.5 tracking-tight',
      leafClass: 'w-3.5 h-3.5 -top-1.5 -right-1',
      pillPad: 'px-4 pt-2 pb-1.5',
    },
    md: {
      wordmark: 'text-[27px] leading-none',
      tagline: 'text-[9.5px] mt-1 tracking-normal',
      leafClass: 'w-4 h-4 -top-2 -right-1.5',
      pillPad: 'px-6 pt-3 pb-2',
    },
    lg: {
      wordmark: 'text-4xl leading-none',
      tagline: 'text-[11px] mt-1 tracking-normal',
      leafClass: 'w-5 h-5 -top-2.5 -right-1.5',
      pillPad: 'px-7 pt-3.5 pb-2.5',
    },
  }[size];

  const inner = (
    <span className="inline-flex flex-col items-center select-none">
      <span
        className={`font-extrabold tracking-tight text-white inline-flex items-baseline ${sizeConfig.wordmark}`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <span>Pak</span>
        <span className="relative inline-block">
          {/* Stem of dotless i */}
          <span className="inline-block">ı</span>
          {/* Lime-green dual sprout leaves replacing the dot on the "i" */}
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className={`absolute pointer-events-none ${sizeConfig.leafClass}`}
          >
            <path
              d="M11 16C7.5 14.8 5.2 11.4 5.5 7.5C9.2 7.8 12.1 10.6 12.2 14.5L11 16Z"
              fill="#A6E236"
            />
            <path
              d="M12.5 15.2C13 10.4 16.4 6.8 21 6C20.8 11.2 17.5 15 12.5 15.2Z"
              fill="#A6E236"
            />
          </svg>
        </span>
      </span>
      <span className={`font-medium text-[#E5F4EA] whitespace-nowrap ${sizeConfig.tagline}`}>
        Tu bodega, bajo control
      </span>
    </span>
  );

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-[#3E7C4F] shadow-sm ${sizeConfig.pillPad} ${className}`}
      >
        {inner}
      </span>
    );
  }

  return <span className={`inline-flex items-center justify-center ${className}`}>{inner}</span>;
};
