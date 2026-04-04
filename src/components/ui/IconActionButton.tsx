import React from 'react';
import Link from 'next/link';

type SharedProps = {
  children: React.ReactNode;
  className?: string;
  ariaLabel: string;
};

type LinkVariantProps = SharedProps & {
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

type ButtonVariantProps = SharedProps & {
  href?: never;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
};

type IconActionButtonProps = LinkVariantProps | ButtonVariantProps;

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const baseClassName =
  'inline-flex items-center justify-center p-2 rounded-full transition-colors duration-300 hover:bg-white/5 text-subtle-gray hover:text-off-white';

export default function IconActionButton(props: IconActionButtonProps) {
  const className = joinClassNames(baseClassName, props.className);

  if ('href' in props && typeof props.href === 'string') {
    const href = props.href;

    return (
      <Link href={href} onClick={props.onClick} aria-label={props.ariaLabel} className={className}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      className={className}
    >
      {props.children}
    </button>
  );
}
