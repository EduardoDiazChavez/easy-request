import { type InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={`mt-0.5 size-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-400 focus:ring-offset-0 dark:border-zinc-600 dark:bg-zinc-900 dark:focus:ring-zinc-500 ${className}`}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className="cursor-pointer text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {label}
          </label>
        )}
        {error && (
          <p className="mt-1 w-full text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
