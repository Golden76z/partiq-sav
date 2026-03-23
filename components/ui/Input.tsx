import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-delabie-text">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`px-3 py-2 rounded-lg border text-sm transition-colors outline-none
          focus:ring-2 focus:ring-delabie-blue focus:border-delabie-blue
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
