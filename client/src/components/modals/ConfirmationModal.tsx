type ConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bgModalColor backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full border-borderColor">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="standard-button-red">
            Annuler
          </button>
          <button onClick={onConfirm} className="px-4 py-2 standard-button">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
