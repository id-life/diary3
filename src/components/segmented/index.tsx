import clsx from 'clsx';
import { motion } from 'framer-motion';
import React, { useCallback, useState, useEffect, useId } from 'react';
import { twMerge } from 'tailwind-merge';

export type OptionType = {
  label?: string;
  value: string | number;
  disabled?: boolean;
} | null;

type SegmentedProps = {
  options: OptionType[];
  defaultValue?: string | number;
  value?: string | number; // Optional controlled value
  onChange?: (value: string | number) => void;
  id?: string;
  className?: string;
  optionClass?: string;
  selectedClass?: string;
  selectedBgClass?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export const Segmented = ({
  options,
  defaultValue,
  value: controlledValue,
  onChange,
  id,
  className,
  optionClass,
  selectedClass,
  selectedBgClass,
  onClick,
}: SegmentedProps) => {
  const [internalValue, setInternalValue] = useState(() => defaultValue || options[0]?.value || '');
  const generatedId = useId();

  // Effect to update internal state when defaultValue changes
  useEffect(() => {
    if (defaultValue !== undefined) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue]);

  const select = useCallback(
    (newValue: string | number) => {
      if (controlledValue === undefined) {
        // It's uncontrolled
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [controlledValue, onChange],
  );

  const isSelected = useCallback(
    (selectedValue: string | number) => {
      // Use the controlledValue if it's provided, otherwise use the internal state
      const currentValue = controlledValue !== undefined ? controlledValue : internalValue;
      return currentValue === selectedValue;
    },
    [controlledValue, internalValue],
  );

  return (
    <div
      className={twMerge('flex w-fit cursor-pointer items-center rounded bg-[#F1F1F2] p-1 text-xs/3 font-medium', className)}
      onClick={onClick}
    >
      {options.map((option) => {
        if (!option) return null;
        const { label, value: optionValue, disabled } = option;
        const selected = isSelected(optionValue);

        return (
          <div className="relative flex-1" key={optionValue}>
            <div
              className={twMerge(
                clsx(
                  'relative z-10 px-3 py-2.5 text-center text-diary-navy first:rounded-l-md last:rounded-r-md',
                  optionClass,
                  { [selectedClass || '']: selected },
                  { 'text-gray-400': disabled, 'cursor-not-allowed': disabled },
                ),
              )}
              onClick={() => !disabled && select(optionValue)}
            >
              {label ?? optionValue}
            </div>
            {selected && (
              <motion.div
                layoutId={`segmented_selected_${id ?? generatedId}`}
                className={twMerge('absolute inset-0 rounded bg-white', selectedBgClass)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Segmented);
