"use client";

import { useState, useEffect } from "react";

export const subAccounts = [
  { id: 1, name: "FullTimer", icon: "👔" },
  { id: 2, name: "HR", icon: "👥" },
  { id: 3, name: "Intern", icon: "🎓" },
];

const STORAGE_KEY = "selectedAccount";

interface SubAccountSwitcherProps {
  onAccountChange?: (account: typeof subAccounts[0]) => void;
}

export default function SubAccountSwitcher({ onAccountChange }: SubAccountSwitcherProps) {
  const [selectedAccount, setSelectedAccount] = useState(subAccounts[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    const savedAccount = localStorage.getItem(STORAGE_KEY);
    if (savedAccount) {
      const account = subAccounts.find((acc) => acc.name === savedAccount);
      if (account) {
        setSelectedAccount(account);
        onAccountChange?.(account);
      }
    }
  }, [onAccountChange]);

  const handleAccountChange = (account: typeof subAccounts[0]) => {
    setSelectedAccount(account);
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, account.name);
    onAccountChange?.(account);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
      >
        <span className="text-lg">{selectedAccount.icon}</span>
        <span className="text-sm font-medium text-gray-700">
          {selectedAccount.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {subAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => handleAccountChange(account)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedAccount.id === account.id
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-lg">{account.icon}</span>
                <span className="text-sm font-medium">{account.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}