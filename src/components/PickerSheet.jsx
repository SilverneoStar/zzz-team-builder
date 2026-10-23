import { useEffect, useRef } from 'react';

// A sheet that slides up over the page on phones, so an Agent can be chosen
// for an empty slot without scrolling down to the Agents list.
export default function PickerSheet({ onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    // Keep the page behind from scrolling while the sheet is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector('input[type="search"]')?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet__panel" role="dialog" aria-modal="true" aria-label="Choose an Agent" ref={ref}>
        <div className="sheet__bar">
          <span className="sheet__grip" aria-hidden="true" />
          <button className="btn btn--quiet sheet__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
