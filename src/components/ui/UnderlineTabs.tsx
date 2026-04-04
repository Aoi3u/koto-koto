import React from 'react';
import { motion } from 'framer-motion';

interface UnderlineTabOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

interface UnderlineTabsProps<T extends string> {
  value: T;
  options: ReadonlyArray<UnderlineTabOption<T>>;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
  indicatorClassName?: string;
  indicatorColor?: string;
  layoutId?: string;
}

function joinClassNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function UnderlineTabs<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  itemClassName,
  activeItemClassName,
  inactiveItemClassName,
  indicatorClassName,
  indicatorColor,
  layoutId = 'underline-tabs-indicator',
}: UnderlineTabsProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={className}>
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={joinClassNames(
              itemClassName,
              isActive ? activeItemClassName : inactiveItemClassName
            )}
          >
            {option.label}
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={indicatorClassName}
                style={indicatorColor ? { backgroundColor: indicatorColor } : undefined}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
