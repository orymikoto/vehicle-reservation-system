import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Input/Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-10 px-3 rounded-lg border border-[#E6E6E2] text-sm bg-white flex items-center justify-between cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'focus:border-[#146C43] hover:border-[#146C43]'
        } ${isOpen ? 'border-[#146C43] ring-1 ring-[#146C43]' : ''}`}
      >
        <span className={`truncate font-medium ${selectedOption ? 'text-[#18181B]' : 'text-[#9CA3AF]'}`}>
          {selectedOption ? (
            <>
              {selectedOption.label}
              {selectedOption.sublabel && (
                <span className="ml-1 text-xs text-[#6B7280]">({selectedOption.sublabel})</span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-[#E6E6E2] rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
          {/* Search Box */}
          <div className="p-2 border-b border-[#ECECE8] relative">
            <Search className="w-4 h-4 absolute left-4 top-4 text-[#6B7280]" />
            <input
              type="text"
              autoFocus
              placeholder="Search vehicle plate, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md border border-[#E6E6E2] bg-[#FAFAF8] focus:outline-none focus:border-[#146C43]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-4 text-[#6B7280] hover:text-[#18181B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-48 divide-y divide-[#ECECE8]">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#6B7280]">No matching vehicles found</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`p-2.5 text-xs cursor-pointer hover:bg-[#F5F5F3] flex items-center justify-between transition-colors ${
                    opt.value === value ? 'bg-emerald-50 text-[#146C43] font-bold' : 'text-[#18181B]'
                  }`}
                >
                  <span className="font-semibold">{opt.label}</span>
                  {opt.sublabel && <span className="text-[#6B7280] text-[11px]">{opt.sublabel}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
