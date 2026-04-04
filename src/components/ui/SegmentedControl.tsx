import React from 'react';

interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  id?: string;
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
}

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function SegmentedControl<T extends string>({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  className,
  itemClassName,
  activeItemClassName,
  inactiveItemClassName,
}: SegmentedControlProps<T>) {
  return (
    <div id={id} role="group" aria-label={ariaLabel} className={className}>
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={joinClassNames(
              itemClassName,
              isActive ? activeItemClassName : inactiveItemClassName
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
