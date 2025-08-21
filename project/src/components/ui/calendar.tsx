import * as React from "react";

interface CalendarProps {
  mode: "single";
  selected: Date | null;
  onSelect: (date: Date) => void;
  fromDate?: Date;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, fromDate, className = "" }) => {
  const [current, setCurrent] = React.useState(() => selected || new Date());

  const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
  const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
  const today = new Date();
  today.setHours(0,0,0,0);

  const days: Date[] = [];
  for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const prevMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const nextMonth = () => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));

  return (
    <div className={`rounded-lg border bg-white p-4 w-full max-w-xs ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100" aria-label="Previous Month">&#8592;</button>
        <span className="font-semibold">{current.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100" aria-label="Next Month">&#8594;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-center mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="font-medium text-muted-foreground">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(startOfMonth.getDay()).fill(null).map((_, i) => <div key={i} />)}
        {days.map((d) => {
          const isDisabled = fromDate && d < fromDate;
          const isSelected = selected && d.toDateString() === selected.toDateString();
          return (
            <button
              key={d.toISOString()}
              className={`rounded-full w-8 h-8 flex items-center justify-center transition-colors
                ${isSelected ? 'bg-primary text-white' : 'hover:bg-accent'}
                ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
              onClick={() => !isDisabled && onSelect(new Date(d))}
              disabled={isDisabled}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};
