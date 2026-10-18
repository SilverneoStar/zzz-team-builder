import { useEffect, useRef, useState } from 'react';
import { canvasToBlob, renderTeamCard } from '../lib/teamCard.js';

const BASE = import.meta.env.BASE_URL;

const slug = (name) => (name || 'team').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'team';

// Shows a rendered card with ways to save, copy or share it. By default it
// renders the team card; pass `render`, `title`, `name` and `suffix` for others.
export default function ExportDialog({ team, onClose, render, title = 'Team image', name, suffix = 'zzz-team' }) {
  const label = name ?? team?.name;
  const fileName = () => `${slug(label)}-${suffix}.png`;
  const [url, setUrl] = useState(null);
  const [blob, setBlob] = useState(null);
  const [status, setStatus] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl;
    setUrl(null);
    (render ? render({ base: BASE }) : renderTeamCard(team, { base: BASE }))
      .then(canvasToBlob)
      .then((b) => {
        if (cancelled || !b) return;
        objectUrl = URL.createObjectURL(b);
        setBlob(b);
        setUrl(objectUrl);
      })
      .catch((err) => {
        console.error('Image failed', err);
        setStatus('Couldn’t create the image. Try again.');
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canCopy = typeof window.ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;
  const file = blob && new File([blob], fileName(), { type: 'image/png' });
  const canShare = !!(file && navigator.canShare?.({ files: [file] }));

  async function copy() {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setStatus('Image copied. Paste it into a chat or post.');
    } catch {
      setStatus('Your browser blocked copying. Use Save image instead.');
    }
  }

  async function share() {
    try {
      await navigator.share({ files: [file], title: label });
    } catch {
      /* share sheet closed */
    }
  }

  return (
    <div className="dialog-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
        <header className="dialog__head">
          <h2 id="export-title" className="section-title">{title}</h2>
          <button ref={closeRef} className="btn btn--quiet" onClick={onClose}>Close</button>
        </header>

        <div className="dialog__preview">
          {url ? (
            <img src={url} alt={`${title} for ${label}`} />
          ) : (
            <p className="muted">{status || 'Creating image…'}</p>
          )}
        </div>

        <div className="dialog__actions">
          {url && (
            <a className="btn btn--primary" href={url} download={fileName()}>
              Save image
            </a>
          )}
          {url && canCopy && (
            <button className="btn" onClick={copy}>Copy image</button>
          )}
          {url && canShare && (
            <button className="btn" onClick={share}>Share…</button>
          )}
          <p className="dialog__status" role="status" aria-live="polite">{url ? status : ''}</p>
        </div>
      </div>
    </div>
  );
}
