import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

/** Keep separators in the editing draft; normalize the saved list separately. */
export function PhotoLabelInput({
  value,
  onChange,
  placeholder,
  label,
  tags = false,
  className,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  label: string;
  tags?: boolean;
  className?: string;
}) {
  const text = value.join(", "),
    [draft, setDraft] = useState(text),
    editing = useRef(false);
  useEffect(() => {
    if (!editing.current) setDraft(text);
  }, [text]);
  const parse = (raw: string) => {
    const parts = raw
      .split(",")
      .map((part) => (tags ? part.trim().toLowerCase() : part.trim()))
      .filter(Boolean);
    return tags ? [...new Set(parts)].slice(0, 20) : parts;
  };
  return (
    <Input
      className={className}
      aria-label={label}
      placeholder={placeholder}
      value={draft}
      onFocus={() => {
        editing.current = true;
      }}
      onChange={(event) => {
        const raw = event.target.value,
          next = parse(raw);
        setDraft(raw);
        if (next.length !== value.length || next.some((part, i) => part !== value[i]))
          onChange(next);
      }}
      onBlur={(event) => {
        editing.current = false;
        setDraft(parse(event.target.value).join(", "));
      }}
    />
  );
}
