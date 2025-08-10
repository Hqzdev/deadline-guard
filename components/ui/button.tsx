import * as React from "react";
import clsx from "clsx";
type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string; variant?: "primary"|"secondary"; className?: string; children?: React.ReactNode; };
export function Button({ href, variant="primary", className, children, ...props }: ButtonProps) {
  const base="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition active:scale-[.98]";
  const styles=variant==="secondary"?"bg-white border border-slate-200 text-slate-700 hover:bg-slate-50":"bg-[var(--brand)] text-white hover:opacity-90";
  if(href){ return <a href={href} className={clsx(base,styles,className)} {...(props as AnchorProps)}>{children}</a>;}
  return <button className={clsx(base,styles,className)} {...props}>{children}</button>;
}
