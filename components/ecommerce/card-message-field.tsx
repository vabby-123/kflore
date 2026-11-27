"use client";

import * as React from "react";

const MAX = 300;

/** Ready-made wording for customers who are not sure what to write. */
const SUGGESTIONS = [
  { label: "Birthday", text: "Happy birthday! Wishing you a day as lovely as you are." },
  { label: "Anniversary", text: "Happy anniversary. I'd choose you all over again." },
  { label: "Congratulations", text: "Congratulations! So proud of you and all you've achieved." },
  { label: "Get well", text: "Thinking of you and wishing you a gentle, speedy recovery." },
  { label: "Sympathy", text: "With heartfelt sympathy. We are thinking of you." },
];

export function CardMessageField({ value, onChange, name }: { value: string; onChange: (value: string) => void; name?: string }) {
  const id = React.useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs text-soft-black">
        Message card (optional): write your message below
      </label>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onChange(s.text)}
            className="focus-ring border border-taupe/40 bg-white px-2.5 py-1 text-[11px] text-taupe transition-colors hover:border-burgundy hover:text-burgundy"
          >
            {s.label}
          </button>
        ))}
      </div>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={MAX}
        placeholder="What should the card say? Add your name if you want them to know it's from you."
        className="focus-ring border border-taupe/40 bg-white px-3 py-2 text-sm text-soft-black"
      />
      <span className="self-end text-[11px] text-taupe">
        {value.length}/{MAX}
      </span>
    </div>
  );
}
