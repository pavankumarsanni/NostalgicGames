import { ChitTheme } from '../../types';

const THEMES: { id: ChitTheme; name: string; emoji: string; preview: string }[] = [
  { id: 'animals',   name: 'Animals',   emoji: '🐾', preview: '🐶🐱🐸🦊' },
  { id: 'flowers',   name: 'Flowers',   emoji: '🌸', preview: '🌹🌻🌷🌺' },
  { id: 'sports',    name: 'Sports',    emoji: '⚽', preview: '⚽🏀🏈🎾' },
  { id: 'fruits',    name: 'Fruits',    emoji: '🍎', preview: '🍎🍊🍋🍇' },
  { id: 'countries', name: 'Countries', emoji: '🌍', preview: '🇮🇳🇺🇸🇬🇧🇦🇺' },
  { id: 'music',     name: 'Music',     emoji: '🎵', preview: '🎸🎹🥁🎺' },
];

type Props = {
  selected: ChitTheme;
  onChange: (theme: ChitTheme) => void;
};

export default function ThemeSelector({ selected, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-400">Choose a card theme</p>
      <div className="grid grid-cols-2 gap-2">
        {THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl border-2 transition-all text-left ${
              selected === theme.id
                ? 'border-purple-500 bg-purple-900/40'
                : 'border-gray-700 bg-gray-800/40 hover:border-gray-500'
            }`}
          >
            <span className="text-2xl">{theme.emoji}</span>
            <div>
              <div className="font-semibold text-sm">{theme.name}</div>
              <div className="text-xs text-gray-500">{theme.preview}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
