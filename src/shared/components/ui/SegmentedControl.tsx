import { cn } from '@/shared/lib';

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
  <div className="inline-flex rounded-2xl border border-white/10 bg-slate-950/70 p-1">
    {options.map((option) => (
      <button
        className={cn(
          'rounded-2xl px-3 py-2 text-sm font-medium transition',
          option.value === value
            ? 'bg-white text-slate-950 shadow-sm'
            : 'text-slate-400 hover:text-white',
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
