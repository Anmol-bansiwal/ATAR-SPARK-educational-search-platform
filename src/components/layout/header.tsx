'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import logoImg from '../../assets/image 10.svg';
import { BackendStatusBadge } from './backend-status-badge';

export interface HeaderProps {
  onAboutClick?: () => void;
  onPricingClick?: () => void;
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAboutClick,
  onPricingClick,
  onLoginClick,
  onSignUpClick,
}) => {
  return (
    <nav className="w-full flex items-center justify-between py-0">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center shrink-0 cursor-pointer">
        <img
          src={typeof logoImg === 'string' ? logoImg : logoImg.src}
          alt="ATAR SPARK Logo"
          className="h-7 w-auto sm:h-8 md:h-10 lg:h-12 object-contain scale-110 origin-left transition-transform"
          style={{ transform: 'scale(1.10)', transformOrigin: 'left center' }}
        />
      </Link>

      {/* Navigation Links & Action Button */}
      <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-5 shrink-0">
        <BackendStatusBadge />
        <button
          onClick={onAboutClick}
          className="hidden sm:inline-block text-xs font-medium text-[#0D0D0D] hover:text-black transition-colors cursor-pointer"
        >
          About Us
        </button>
        <button
          onClick={onPricingClick}
          className="hidden sm:inline-block text-xs font-medium text-[#0D0D0D] hover:text-black transition-colors cursor-pointer"
        >
          Pricing
        </button>
        <button
          onClick={onLoginClick}
          className="text-xs font-medium text-[#0D0D0D] hover:text-black transition-colors cursor-pointer px-1 py-1"
        >
          Login
        </button>

        {/* Sign in for free CTA */}
        <button
          onClick={onSignUpClick}
          className="group flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-4 rounded-full bg-[#E6E6E6] hover:bg-[#DCDCDC] border-2 border-[#2665D9] text-[#0D0D0D] text-xs font-medium transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          <span>Sign in for free</span>
          <ArrowRight size={13} className="hidden sm:block transition-transform group-hover:translate-x-0.5 shrink-0" />
        </button>
      </div>
    </nav>
  );
};

export default Header;
