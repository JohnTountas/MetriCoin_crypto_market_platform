// SegmentedControl is the compact selector for mutually exclusive view modes and timeframes.
// It keeps the interaction lightweight while still reading clearly on dense dashboards.
import { classNames } from '@/shared/utils';

type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
};

/**
 * SegmentedControl keeps short option sets easy to tap and compare.
 * The buttons wrap on small screens so timeframe controls stay readable without horizontal scrolling.
 */
export const SegmentedControl = <T extends string>({
  value,
  onChange,
  options,
}: SegmentedControlProps<T>) => (
  <div className="control-group inline-flex w-full flex-wrap rounded-2xl p-1 sm:w-auto">
    {options.map((option) => (
      <button
        className={classNames(
          'control-option flex-1 rounded-2xl px-3 py-2 text-center text-sm font-medium sm:flex-none',
          option.value === value && 'control-option-active',
        )}
        key={option.value}
        onClick={() => onChange(option.value)}
        type="button"
      >
        {option.label}
      </button>
    ))}
  </div>
);
