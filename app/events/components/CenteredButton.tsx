import { ButtonHTMLAttributes } from "react";

export function CenteredButton(_props: ButtonHTMLAttributes<HTMLButtonElement> & { "data-testid"?: string }) {
  const {children, ...props} = _props
  return (
    <div className="grid place-items-center h-full" >
      <button type="submit"
              className="p-2 bg-gray-200 border-black border"
              {...props}>
        {children}
      </button>
    </div>
  );
}

