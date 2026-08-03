import { clsx } from "clsx";
import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import type { UseFormRegister, FieldValues, Path } from "react-hook-form";

const baseFieldClass =
  "w-full rounded-2xl border border-beige-dark/60 bg-white px-4 py-3 text-charcoal placeholder:text-charcoal-light/50 transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20";

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-red-700">
      {message}
    </p>
  );
}

function FieldWrapper({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-forest">
        {label}
        {required && <span className="ml-1 text-gold-dark">*</span>}
      </label>
      {hint && <p className="mt-1 text-sm text-charcoal-light/80">{hint}</p>}
      <div className="mt-2">{children}</div>
      <ErrorText message={error} />
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
};

export function TextField({
  id,
  label,
  required,
  error,
  hint,
  className,
  ...rest
}: TextFieldProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error} hint={hint}>
      <input
        id={id}
        className={clsx(baseFieldClass, className)}
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
      />
    </FieldWrapper>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
};

export function TextareaField({
  id,
  label,
  required,
  error,
  hint,
  className,
  rows = 4,
  ...rest
}: TextareaFieldProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error} hint={hint}>
      <textarea
        id={id}
        rows={rows}
        className={clsx(baseFieldClass, "resize-y", className)}
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
      />
    </FieldWrapper>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function SelectField({
  id,
  label,
  required,
  error,
  hint,
  className,
  options,
  placeholder = "Select an option",
  ...rest
}: SelectFieldProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error} hint={hint}>
      <select
        id={id}
        className={clsx(baseFieldClass, className)}
        aria-invalid={!!error}
        aria-required={required}
        defaultValue=""
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

type RadioGroupFieldProps<T extends FieldValues> = {
  legend: string;
  name: Path<T>;
  options: { value: string; label: string }[];
  register: UseFormRegister<T>;
  required?: boolean;
  error?: string;
};

export function RadioGroupField<T extends FieldValues>({
  legend,
  name,
  options,
  register,
  required,
  error,
}: RadioGroupFieldProps<T>) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-forest">
        {legend}
        {required && <span className="ml-1 text-gold-dark">*</span>}
      </legend>
      <div className="mt-2 flex flex-wrap gap-4">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-beige-dark/60 bg-white px-4 py-2 text-sm text-charcoal transition-colors has-[:checked]:border-forest has-[:checked]:bg-forest/5"
          >
            <input
              type="radio"
              value={opt.value}
              className="h-4 w-4 accent-forest"
              {...register(name)}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <ErrorText message={error} />
    </fieldset>
  );
}

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: React.ReactNode;
  error?: string;
};

export function CheckboxField({
  id,
  label,
  error,
  className,
  ...rest
}: CheckboxFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className={clsx(
            "mt-1 h-5 w-5 flex-shrink-0 rounded border-beige-dark/60 text-forest accent-forest focus:ring-2 focus:ring-forest/30",
            className
          )}
          aria-invalid={!!error}
          {...rest}
        />
        <span className="text-sm leading-relaxed text-charcoal-light">
          {label}
        </span>
      </label>
      <ErrorText message={error} />
    </div>
  );
}

export function FormNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl bg-beige/50 px-5 py-4 text-sm leading-relaxed text-charcoal-light">
      {children}
    </p>
  );
}

export function FormAlert({
  variant,
  children,
}: {
  variant: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={clsx(
        "rounded-2xl border px-5 py-4 text-sm leading-relaxed",
        variant === "success" &&
          "border-forest/30 bg-forest/5 text-forest-dark",
        variant === "error" && "border-red-300 bg-red-50 text-red-800"
      )}
    >
      {children}
    </div>
  );
}
