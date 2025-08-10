import * as React from "react"; import clsx from "clsx";
export function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) { return <div className={clsx("rounded-2xl border bg-white/90 shadow-sm", className)}>{children}</div>; }
export function CardHeader({ className, children }: React.PropsWithChildren<{ className?: string }>) { return <div className={clsx("p-5 pb-2", className)}>{children}</div>; }
export function CardTitle({ className, children }: React.PropsWithChildren<{ className?: string }>) { return <h3 className={clsx("text-lg font-semibold", className)}>{children}</h3>; }
export function CardContent({ className, children }: React.PropsWithChildren<{ className?: string }>) { return <div className={clsx("p-5 pt-2 text-slate-700", className)}>{children}</div>; }
