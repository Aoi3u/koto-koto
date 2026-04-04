import React from 'react';

type PillActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function PillActionButton({
  className,
  type = 'button',
  ...props
}: PillActionButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(
        'rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
}
