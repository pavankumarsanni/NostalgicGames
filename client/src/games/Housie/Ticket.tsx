import clsx from 'clsx';
import { HousieTicket } from '../../types';

interface Props {
  ticket: HousieTicket;
  calledNumbers: number[];
  compact?: boolean;
}

export default function Ticket({ ticket, calledNumbers, compact = false }: Props) {
  const called = new Set(calledNumbers);

  return (
    <div className={clsx(
      'rounded-xl overflow-hidden border border-gray-700 bg-gray-900',
      compact ? 'text-xs' : 'text-sm'
    )}>
      {ticket.grid.map((row, ri) => (
        <div key={ri} className={clsx('grid grid-cols-9', ri < 2 && 'border-b border-gray-700')}>
          {row.map((num, ci) => {
            const isMarked = num !== null && called.has(num);
            return (
              <div
                key={ci}
                className={clsx(
                  'aspect-square flex items-center justify-center font-bold transition-all duration-300 border-r border-gray-800 last:border-r-0',
                  compact ? 'text-[10px]' : 'text-xs md:text-sm',
                  num === null
                    ? 'bg-gray-800/40 text-transparent'
                    : isMarked
                    ? 'bg-purple-600 text-white scale-95 rounded-sm'
                    : 'bg-gray-800/80 text-gray-200'
                )}
              >
                {num ?? ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
