"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useLocale } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { submitInquiry, type InquiryFormState } from "@/app/actions/inquiry";

type Labels = {
  company: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  category: string;
  categoryOptions: string[];
  message: string;
  messagePlaceholder: string;
  consent: string;
  privacyTitle: string;
  privacyBody: string;
  submit: string;
  required: string;
  successHeading: string;
  successBody: string;
  errorFallback: string;
};

const INITIAL: InquiryFormState = { status: "idle" };

export function ContactForm({
  labels,
  defaultCategory,
}: {
  labels: Labels;
  defaultCategory?: string;
}) {
  const locale = useLocale();
  const [state, formAction] = useActionState(submitInquiry, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  // Reset on success so user can submit another inquiry if they want
  useEffect(() => {
    if (state.status === "ok") {
      formRef.current?.reset();
    }
  }, [state.status]);

  if (state.status === "ok") {
    return <SuccessPanel labels={labels} />;
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-label="Partnership inquiry form"
      className="bg-structural p-8 md:p-10 lg:p-12 space-y-6"
      noValidate
    >
      {/* Honeypot — visually hidden, real users won't fill */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="sr-only"
      />
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          label={labels.company}
          required
          requiredLabel={labels.required}
          name="company"
          type="text"
          errors={state.fieldErrors?.company}
        />
        <FormField
          label={labels.name}
          required
          requiredLabel={labels.required}
          name="name"
          type="text"
          errors={state.fieldErrors?.name}
        />
        <FormField
          label={labels.email}
          required
          requiredLabel={labels.required}
          name="email"
          type="email"
          errors={state.fieldErrors?.email}
        />
        <FormField
          label={labels.phone}
          name="phone"
          type="tel"
          errors={state.fieldErrors?.phone}
        />
        <FormField
          label={labels.country}
          name="country"
          type="text"
          errors={state.fieldErrors?.country}
        />
        <SelectField
          label={labels.category}
          required
          requiredLabel={labels.required}
          name="category"
          options={labels.categoryOptions}
          initialValue={defaultCategory}
          errors={state.fieldErrors?.category}
        />
      </div>

      <TextareaField
        label={labels.message}
        placeholder={labels.messagePlaceholder}
        required
        requiredLabel={labels.required}
        name="message"
        errors={state.fieldErrors?.message}
      />

      <div className="flex items-start gap-3 pt-2">
        <input
          id="contact-consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 cursor-pointer appearance-none border border-canvas/30 bg-transparent checked:border-primary checked:bg-primary"
        />
        <label
          htmlFor="contact-consent"
          className="text-xs text-canvas/65 cursor-pointer"
        >
          {labels.consent}
          <span className="ml-1 text-primary">*</span>
        </label>
      </div>

      <details className="border-t border-canvas/10 pt-4">
        <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.08em] text-canvas/65 transition-colors hover:text-primary">
          {labels.privacyTitle}
        </summary>
        <p className="mt-3 text-xs leading-[1.6] text-canvas/70">
          {labels.privacyBody}
        </p>
      </details>

      {state.status === "error" && (
        <div
          role="alert"
          className="border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
        >
          {state.message ?? labels.errorFallback}
        </div>
      )}

      <SubmitButton label={labels.submit} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex items-center gap-3 bg-primary px-7 py-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "..." : label}
      {!pending && (
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      )}
    </button>
  );
}

function SuccessPanel({ labels }: { labels: Labels }) {
  return (
    <div className="bg-structural p-8 md:p-10 lg:p-12 flex h-full flex-col items-start justify-center gap-6">
      <span
        aria-hidden
        className="grid h-12 w-12 place-items-center rounded-full bg-primary text-canvas"
      >
        <Check size={20} strokeWidth={3} />
      </span>
      <div className="space-y-3">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-primary">
          INQUIRY RECEIVED
        </p>
        <h3 className="font-sans text-2xl font-bold tracking-tight text-canvas">
          {labels.successHeading}
        </h3>
        <p className="max-w-md text-base leading-[1.6] text-canvas/75">
          {labels.successBody}
        </p>
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  requiredLabel,
  name,
  type,
  errors,
}: {
  label: string;
  required?: boolean;
  requiredLabel?: string;
  name: string;
  type: string;
  errors?: string[];
}) {
  const id = `contact-${name}`;
  const hasError = Boolean(errors?.length);
  return (
    <div className="space-y-2">
      <FieldLabel
        htmlFor={id}
        label={label}
        required={required}
        requiredLabel={requiredLabel}
      />
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`w-full border-0 border-b bg-transparent px-0 py-2.5 font-sans text-sm text-canvas placeholder:text-canvas/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-structural ${
          hasError
            ? "border-rose-400 focus:border-rose-300"
            : "border-canvas/30 focus:border-primary"
        }`}
      />
      <FieldError id={id} errors={errors} />
    </div>
  );
}

function TextareaField({
  label,
  placeholder,
  required,
  requiredLabel,
  name,
  errors,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
  requiredLabel?: string;
  name: string;
  errors?: string[];
}) {
  const id = `contact-${name}`;
  const hasError = Boolean(errors?.length);
  return (
    <div className="space-y-2">
      <FieldLabel
        htmlFor={id}
        label={label}
        required={required}
        requiredLabel={requiredLabel}
      />
      <textarea
        id={id}
        name={name}
        required={required}
        rows={5}
        placeholder={placeholder}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`w-full resize-y border bg-transparent px-4 py-3 font-sans text-sm text-canvas placeholder:text-canvas/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-structural ${
          hasError
            ? "border-rose-400 focus:border-rose-300"
            : "border-canvas/30 focus:border-primary"
        }`}
      />
      <FieldError id={id} errors={errors} />
    </div>
  );
}

function SelectField({
  label,
  required,
  requiredLabel,
  name,
  options,
  initialValue,
  errors,
}: {
  label: string;
  required?: boolean;
  requiredLabel?: string;
  name: string;
  options: string[];
  initialValue?: string;
  errors?: string[];
}) {
  const id = `contact-${name}`;
  const hasError = Boolean(errors?.length);
  return (
    <div className="space-y-2">
      <FieldLabel
        htmlFor={id}
        label={label}
        required={required}
        requiredLabel={requiredLabel}
      />
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={initialValue || ""}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`w-full appearance-none border-0 border-b bg-transparent px-0 py-2.5 font-sans text-sm text-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-structural ${
          hasError
            ? "border-rose-400 focus:border-rose-300"
            : "border-canvas/30 focus:border-primary"
        }`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='%23FAFBF9' opacity='0.4'><path d='M3 4.5l3 3 3-3'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.25rem center",
          backgroundSize: "12px",
          paddingRight: "1.5rem",
        }}
      >
        <option value="" disabled className="bg-structural">
          —
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-structural">
            {opt}
          </option>
        ))}
      </select>
      <FieldError id={id} errors={errors} />
    </div>
  );
}

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={`${id}-error`} role="alert" className="text-xs text-rose-300">
      {errors[0]}
    </p>
  );
}

function FieldLabel({
  htmlFor,
  label,
  required,
  requiredLabel,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
  requiredLabel?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-2">
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-canvas/80">
        {label}
      </span>
      {required && (
        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-primary">
          {requiredLabel}
        </span>
      )}
    </label>
  );
}
