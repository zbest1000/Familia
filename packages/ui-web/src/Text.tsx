import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3;
  children: ReactNode;
};

export function Heading({ level = 1, children, className, ...rest }: HeadingProps) {
  const cls = clsx(
    {
      "text-3xl font-semibold leading-tight": level === 1,
      "text-2xl font-semibold leading-snug": level === 2,
      "text-xl font-semibold leading-snug": level === 3,
    },
    className,
  );
  if (level === 1) return <h1 className={cls} {...rest}>{children}</h1>;
  if (level === 2) return <h2 className={cls} {...rest}>{children}</h2>;
  return <h3 className={cls} {...rest}>{children}</h3>;
}

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  emphasis?: "primary" | "secondary" | "tertiary";
  children: ReactNode;
};

export function Text({ emphasis = "primary", children, className, ...rest }: TextProps) {
  return (
    <p
      className={clsx(
        "leading-relaxed",
        {
          "text-zinc-900 dark:text-zinc-100": emphasis === "primary",
          "text-zinc-600 dark:text-zinc-400": emphasis === "secondary",
          "text-zinc-400 dark:text-zinc-500": emphasis === "tertiary",
        },
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}
