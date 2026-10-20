import { localeOptions } from '@/config/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type LocaleOption = (typeof localeOptions)[number]['value'];

type LanguageSelectProps = {
  locale: string;
  label: string;
  options: { value: LocaleOption; label: string; flag: string }[];
  onValueChange: (value: string | null) => void;
  className?: string;
};

function LanguageSelect({
  locale,
  label,
  options,
  onValueChange,
  className,
}: LanguageSelectProps) {
  return (
    <Select value={locale} onValueChange={onValueChange}>
      <SelectTrigger aria-label={label} className={className}>
        <SelectValue>
          {(value: string | null) => {
            const selectedOption = options.find((o) => o.value === value);
            return selectedOption ? (
              <>
                <span aria-hidden="true">{selectedOption.flag}</span>
                <span className="sr-only">{selectedOption.label}</span>
              </>
            ) : null;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
            title={option.label}
          >
            <span aria-hidden="true">{option.flag}</span>
            <span className="sr-only">{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default LanguageSelect;
