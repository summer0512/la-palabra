"use client";

import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, X, RotateCcw } from "lucide-react";

interface MultiSelectDropdownProps {
  selectedLetters: string[];
  availableLetters: string[];
  disabledLetters: string[];
  onSelect: (letter: string) => void;
  onRemove: (letter: string) => void;
  onClearAll?: () => void;
  placeholder?: string;
  className?: string;
  variant?: "include" | "exclude";
  allowClear?: boolean;
}

export default function MultiSelectDropdown({
  selectedLetters,
  availableLetters,
  disabledLetters,
  onSelect,
  onRemove,
  onClearAll,
  placeholder = "Selecciona letras",
  className,
  variant = "include",
  allowClear = false,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLetterClick = (letter: string) => {
    if (selectedLetters.includes(letter)) {
      onRemove(letter);
    } else {
      onSelect(letter);
    }
  };

  const displayText = selectedLetters.length > 0 ? selectedLetters.join(", ") : placeholder;

  const variantColors = variant === "include"
    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
    : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100";

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between text-left font-normal h-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayText}</span>
        <div className="flex items-center gap-1">
          {allowClear && selectedLetters.length > 0 && onClearAll && (
            <button
              type="button"
              className="p-1 hover:bg-muted rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClearAll();
              }}
              title="Limpiar selección"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
          <div className="p-2">
            <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
              {availableLetters.map((letter) => {
                const isSelected = selectedLetters.includes(letter);
                const isDisabled = disabledLetters.includes(letter);

                return (
                  <Button
                    key={letter}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    disabled={isDisabled}
                    className={cn(
                      "h-8 w-8 p-0 text-sm font-semibold",
                      isSelected
                        ? variant === "include"
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-rose-600 hover:bg-rose-500"
                        : "",
                      isDisabled ? "opacity-40 cursor-not-allowed" : ""
                    )}
                    onClick={() => handleLetterClick(letter)}
                  >
                    {letter}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedLetters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedLetters.map((letter) => (
            <Badge
              key={letter}
              variant="outline"
              className={cn("gap-1 px-3 py-1 text-sm", variantColors)}
            >
              <span>{letter}</span>
              <button
                type="button"
                className="ml-1 text-xs transition-colors hover:text-foreground"
                onClick={() => onRemove(letter)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
