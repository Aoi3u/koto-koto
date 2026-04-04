import React from 'react';

type ChipButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function ChipButton({ className, type = 'button', ...props }: ChipButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(
        'inline-flex items-center rounded-full border uppercase font-inter transition-colors duration-300',
        className
      )}
      {...props}
    />
  );
}
