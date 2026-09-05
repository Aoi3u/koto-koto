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
        'rounded-full transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        className
      )}
      {...props}
    />
  );
}
