import Link from "next/link";
import { clsx } from "clsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "primary-inverse"
  | "secondary-inverse";

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  "primary-inverse": "btn-primary-inverse",
  "secondary-inverse": "btn-secondary-inverse",
};

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
};

export default function Button({
  href,
  children,
  variant = "primary",
  className,
}: ButtonProps) {
  return (
    <Link href={href} className={clsx(variantClass[variant], className)}>
      {children}
    </Link>
  );
}
