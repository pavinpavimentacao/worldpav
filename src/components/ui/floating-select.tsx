"use client";

import * as React from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TRANSITION = {
  type: "spring",
  bounce: 0.1,
  duration: 0.4,
};

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FloatingSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function FloatingSelect({
  label,
  options,
  value,
  onChange,
  error,
  required,
  placeholder = "Selecione uma opção",
  className,
  disabled = false,
  id,
}: FloatingSelectProps) {
  const uniqueId = React.useId();
  const selectId = id || uniqueId;
  const [isOpen, setIsOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleTriggerClick = () => {
    if (disabled) return;
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
      setIsOpen(true);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  return (
    <MotionConfig transition={TRANSITION}>
      <div className={cn("space-y-1", className)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <motion.button
          ref={triggerRef}
          id={selectId}
          type="button"
          layoutId={`floating-select-trigger-${selectId}`}
          className={cn(
            "flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            error && "border-red-300 focus:ring-red-500 focus:border-red-500",
            disabled && "bg-gray-100 cursor-not-allowed opacity-60",
            !value && "text-gray-500"
          )}
          onClick={handleTriggerClick}
          disabled={disabled}
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </motion.button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ backdropFilter: "blur(0px)" }}
                animate={{ backdropFilter: "blur(4px)" }}
                exit={{ backdropFilter: "blur(0px)" }}
                className="fixed inset-0 z-40 bg-black/5"
              />
              <motion.div
                ref={contentRef}
                layoutId={`floating-select-${selectId}`}
                className="fixed z-50 min-w-[200px] max-h-[300px] overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg outline-none"
                style={{
                  left: triggerRect ? triggerRect.left : "50%",
                  top: triggerRect ? triggerRect.bottom + 8 : "50%",
                  width: triggerRect ? triggerRect.width : "auto",
                  transformOrigin: "top left",
                }}
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
              >
                <div className="p-1">
                  {options.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Nenhuma opção disponível
                    </div>
                  ) : (
                    options.map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors",
                          value === option.value && "bg-blue-50 text-blue-600 font-medium"
                        )}
                        onClick={() => handleOptionClick(option.value)}
                        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </span>
                        {value === option.value && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}



import * as React from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const TRANSITION = {
  type: "spring",
  bounce: 0.1,
  duration: 0.4,
};

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FloatingSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export function FloatingSelect({
  label,
  options,
  value,
  onChange,
  error,
  required,
  placeholder = "Selecione uma opção",
  className,
  disabled = false,
  id,
}: FloatingSelectProps) {
  const uniqueId = React.useId();
  const selectId = id || uniqueId;
  const [isOpen, setIsOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<DOMRect | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleTriggerClick = () => {
    if (disabled) return;
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
      setIsOpen(true);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  return (
    <MotionConfig transition={TRANSITION}>
      <div className={cn("space-y-1", className)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <motion.button
          ref={triggerRef}
          id={selectId}
          type="button"
          layoutId={`floating-select-trigger-${selectId}`}
          className={cn(
            "flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            error && "border-red-300 focus:ring-red-500 focus:border-red-500",
            disabled && "bg-gray-100 cursor-not-allowed opacity-60",
            !value && "text-gray-500"
          )}
          onClick={handleTriggerClick}
          disabled={disabled}
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
        >
          <span className="flex items-center gap-2">
            {selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </motion.button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ backdropFilter: "blur(0px)" }}
                animate={{ backdropFilter: "blur(4px)" }}
                exit={{ backdropFilter: "blur(0px)" }}
                className="fixed inset-0 z-40 bg-black/5"
              />
              <motion.div
                ref={contentRef}
                layoutId={`floating-select-${selectId}`}
                className="fixed z-50 min-w-[200px] max-h-[300px] overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg outline-none"
                style={{
                  left: triggerRect ? triggerRect.left : "50%",
                  top: triggerRect ? triggerRect.bottom + 8 : "50%",
                  width: triggerRect ? triggerRect.width : "auto",
                  transformOrigin: "top left",
                }}
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
              >
                <div className="p-1">
                  {options.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Nenhuma opção disponível
                    </div>
                  ) : (
                    options.map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors",
                          value === option.value && "bg-blue-50 text-blue-600 font-medium"
                        )}
                        onClick={() => handleOptionClick(option.value)}
                        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </span>
                        {value === option.value && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}



































































































