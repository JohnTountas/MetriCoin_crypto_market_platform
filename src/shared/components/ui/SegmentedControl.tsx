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

export const SegmentedControl = <T extends string>({
  value,
  onChange,
  options,
}: SegmentedControlProps<T>) => (
  <div className="control-group inline-flex rounded-2xl p-1">
    {options.map((option) => (
      <button
        className={classNames(
          'control-option rounded-2xl px-3 py-2 text-sm font-medium',
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

