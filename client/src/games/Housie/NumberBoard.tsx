import clsx from 'clsx';

interface Props {
  calledNumbers: number[];
  lastCalled: number | null;
}

export default function NumberBoard({ calledNumbers, lastCalled }: Props) {
  const called = new Set(calledNumbers);

  return (
    <div className="grid grid-cols-9 gap-0.5">
      {Array.from({ length: 90 }, (_, i) => i + 1).map(n => (
        <div
          key={n}
          className={clsx(
            'aspect-square flex items-center justify-center rounded text-xs font-bold transition-all duration-300',
            n === lastCalled
              ? 'bg-amber-400 text-black scale-110 shadow-lg shadow-amber-400/50'
              : called.has(n)
              ? 'bg-purple-700/80 text-white'
              : 'bg-gray-800/60 text-gray-600'
          )}
        >
          {n}
        </div>
      ))}
    </div>
  );
}
