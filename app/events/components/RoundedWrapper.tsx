import { PropsWithChildren } from "react";

export function RoundedWrapper({ className = "", ...props }: PropsWithChildren & { className?: string }) {
  return <div className={`border-gray-500 border rounded-md h-full ${className}`} {...props} />;
}
