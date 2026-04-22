import { ButtonHTMLAttributes } from "react";

export function TextButton(_props: ButtonHTMLAttributes<HTMLButtonElement> & { "data-testid"?: string }) {
  const { children, ...props } = _props;
  return (
    <button type="submit"
            className="hover:underline font-semibold"
            {...props}>
      {children}
    </button>
  );
}

