import { getGuessStatuses } from "../../lib/statuses";
import { normalizeWord, type WordSettings } from "../../lib/words";
import { Cell } from "./Cell";

const SPANISH_LOCALE = "es-ES";

type Props = {
  guess: string;
  isRevealing?: boolean;
  solution: string;
  settings: WordSettings;
};

export const CompletedRow = ({ guess, isRevealing = false, solution, settings }: Props) => {
  const statuses = getGuessStatuses(guess, solution, settings);
  const displayWord = normalizeWord(guess, settings).toLocaleUpperCase(SPANISH_LOCALE);

  return (
    <div className="flex justify-center mb-1">
      {Array.from(displayWord).map((letter, i) => (
        <Cell
          key={i}
          value={letter}
          status={statuses[i]}
          isRevealing={isRevealing}
          animationDelay={i * 100}
        />
      ))}
    </div>
  );
};
