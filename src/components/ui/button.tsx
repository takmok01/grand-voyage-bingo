import * as React from "react";

type Variant = "default" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

const variants: Record<Variant, string> = {
  default: "bg-white text-black hover:bg-white/90",
  outline: "border bg-transparent hover:bg-white/10",
};

export function Button({ variant = "default", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
