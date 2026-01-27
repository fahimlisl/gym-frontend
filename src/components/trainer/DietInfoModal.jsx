export default function DietInfoModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm
                    flex items-center justify-center px-4">

      <div className="w-full max-w-md
                      border border-red-600/30
                      bg-gradient-to-br from-black via-neutral-900 to-black
                      rounded-xl p-6 space-y-6">

        <h2 className="text-xl font-black tracking-widest">
          DIET MODULE
        </h2>

        <p className="text-sm text-gray-400 leading-relaxed">
          Diet planning API credits are currently exhausted.
          <br />
          Please contact admin to upgrade API limits.
        </p>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="border border-red-600
                       px-6 py-2 text-xs font-extrabold tracking-widest
                       hover:bg-red-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
