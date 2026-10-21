import * as Dialog from "@radix-ui/react-dialog";
import { X, Copy, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { isWordInWordList, stripAccents, type WordSettings } from "../../lib/words";
import { copyToClipboard, generateChallengeUrl as buildChallengeUrl } from "../../lib/share";

const SPANISH_LOCALE = "es-ES";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  settings: WordSettings;
};

export const CreateGameModal = ({ isOpen, handleClose, settings }: Props) => {
  const [inputWord, setInputWord] = useState("");
  const [error, setError] = useState("");
  const [challengeUrl, setChallengeUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const normalizedInput = useMemo(() => inputWord.toLocaleUpperCase(SPANISH_LOCALE), [inputWord]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.toLocaleUpperCase(SPANISH_LOCALE);
    if (!/^[A-ZÀ-Ÿ]*$/.test(rawValue)) {
      return;
    }

    const sanitizedValue = settings.accentMode === "plain" ? stripAccents(rawValue) : rawValue;

    if (Array.from(sanitizedValue).length <= settings.wordLength) {
      setInputWord(sanitizedValue);
      setError("");
      setChallengeUrl("");
    }
  };

  const handleGenerateLink = async () => {
    if (Array.from(normalizedInput).length !== settings.wordLength) {
      setError(`La palabra debe tener exactamente ${settings.wordLength} letras.`);
      return;
    }

    if (!isWordInWordList(normalizedInput, settings)) {
      setError("Esta palabra no existe en nuestro diccionario. Pruebe otra palabra.");
      return;
    }

    const url = buildChallengeUrl(normalizedInput.toLowerCase(), settings);
    setChallengeUrl(url);
    setError("");

    const success = await copyToClipboard(url);
    if (success) {
      setShowCopiedMessage(true);
    }
  };

  const handleCopyLink = async () => {
    if (!challengeUrl) {
      return;
    }
    const success = await copyToClipboard(challengeUrl);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleGenerateLink();
    }
  };

  const handleReset = () => {
    setInputWord("");
    setError("");
    setChallengeUrl("");
    setCopySuccess(false);
    setShowCopiedMessage(false);
  };

  const handleCloseModal = () => {
    handleReset();
    handleClose();
  };

  const accentLabel = settings.accentMode === "accented" ? "con acentos" : "sin acentos";

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleCloseModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Dialog.Description className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={handleCloseModal}
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                  <Dialog.Title className="text-lg leading-6font-medium text-gray-900 mb-4">
                    Crear un desafío
                  </Dialog.Title>

                  <p className="text-sm text-gray-600 mb-2">
                    Desafíe a sus amigos con una palabra de {settings.wordLength} letras ({accentLabel}).
                  </p>

                  <div className="mb-4">
                    <input
                      autoFocus
                      type="text"
                      value={normalizedInput}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                      placeholder="Su palabra..."
                      className="w-full px-3 py-3 text-center text-lg font-bold uppercase border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                      maxLength={settings.wordLength}
                    />
                    <div className="mt-2 text-xs text-gray-500 text-center">
                      {Array.from(normalizedInput).length}/{settings.wordLength} letras
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {showCopiedMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700">¡Enlace copiado al portapapeles!</p>
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    {!challengeUrl ? (
                      <button
                        type="button"
                        onClick={handleGenerateLink}
                        disabled={Array.from(normalizedInput).length !== settings.wordLength}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-green text-base font-medium text-white hover:bg-primary-green/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        CREAR ENLACE
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm"
                      >
                        CREAR OTRO DESAFÍO
                      </button>
                    )}

                    {challengeUrl && (
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full inline-flex justify-center items-center space-x-2 rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green sm:text-sm"
                      >
                        <Copy className="h-4 w-4" />
                        <span>{copySuccess ? "¡Copiado!" : "Copiar enlace"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Dialog.Description>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
