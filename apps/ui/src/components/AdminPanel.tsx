"use client";

import { useState } from "react";

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${
        isOpen ? "w-96" : "w-12"
      } transition-all duration-300`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-r from-[var(--color-m1-gold)] to-[var(--color-m1-crimson)] rounded-lg shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
          )}
        </svg>
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="bg-gradient-to-b from-[var(--color-m1-midnight)] to-[var(--color-m1-charcoal)] rounded-xl p-6 shadow-2xl border border-[var(--color-m1-gold)]/30 mt-14">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-m1-gold)] to-[var(--color-m1-champagne)] bg-clip-text text-transparent mb-6">
            Admin Panel
          </h2>

          {/* Stats Section */}
          <div className="mb-6">
            <h3 className="text-[var(--color-m1-silver)] font-semibold mb-3">
              Live Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--color-m1-midnight-light)]/50 rounded-lg p-3 border border-[var(--color-m1-royal-blue)]/20">
                <p className="text-[var(--color-m1-silver-dark)] text-sm">
                  Viewers
                </p>
                <p className="text-[var(--color-m1-gold)] text-2xl font-bold">
                  {0}
                </p>
              </div>
              <div className="bg-[var(--color-m1-midnight-light)]/50 rounded-lg p-3 border border-[var(--color-m1-royal-blue)]/20">
                <p className="text-[var(--color-m1-silver-dark)] text-sm">
                  Messages
                </p>
                <p className="text-[var(--color-m1-champagne)] text-2xl font-bold">
                  0
                </p>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="mb-6">
            <h3 className="text-[var(--color-m1-silver)] font-semibold mb-3">
              Stream Controls
            </h3>
            <div className="space-y-3"></div>
          </div>

          {/* Chat Moderation */}
          <div className="mb-6">
            <h3 className="text-[var(--color-m1-silver)] font-semibold mb-3">
              Chat Moderation
            </h3>
            <div className="space-y-2"></div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-[var(--color-m1-silver)] font-semibold mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2"></div>
          </div>
        </div>
      )}
    </div>
  );
}
