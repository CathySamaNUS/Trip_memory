export default function DialogBox({ kind = 'narration', text, onContinue, continueLabel = '继续' }) {
  if (!text) return null
  const isDialogue = kind === 'dialogue'
  return (
    <div className="card animate-fadeIn relative max-w-2xl mx-auto">
      <div className="absolute -top-3 left-6 px-2 py-0.5 rounded-md bg-beige-100 border border-beige-200 text-xs text-ink/70">
        {isDialogue ? '💬 对话' : '📖 旁白'}
      </div>
      <p className="font-serif text-base sm:text-lg leading-relaxed text-ink/90 whitespace-pre-line">
        {isDialogue ? `「${text}」` : text}
      </p>
      {onContinue && (
        <div className="flex justify-end mt-3">
          <button className="btn-primary" onClick={onContinue}>
            {continueLabel} →
          </button>
        </div>
      )}
    </div>
  )
}
