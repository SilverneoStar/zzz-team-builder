import { useEffect, useRef, useState } from 'react';
import { TEAM_LAYOUTS, canvasToBlob, renderTeamCard } from '../lib/teamCard.js';

// The team image layout is remembered on this device.
const LAYOUT_KEY = 'zzz-team-builder:cardLayout';
const savedLayout = () => {
  try {
    const v = localStorage.getItem(LAYOUT_KEY);
    return TEAM_LAYOUTS.some((l) => l.id === v) ? v : 'columns';
  } catch {
    return 'columns';
  }
};

// Small pictures of each layout for the picker.
const LAYOUT_ICONS = {
  columns: (
    <svg viewBox="0 0 48 27" aria-hidden="true">
      <rect x="3" y="5" width="12" height="18" rx="2" /><rect x="18" y="5" width="12" height="18" rx="2" /><rect x="33" y="5" width="12" height="18" rx="2" />
    </svg>
  ),
  squad: (
    <svg viewBox="0 0 48 27" aria-hidden="true">
      <path d="M6 4h8l-3 19H3Z" /><path d="M18 4h8l-3 19h-8Z" /><path d="M30 4h8l-3 19h-8Z" /><circle cx="42" cy="14" r="4" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 48 27" aria-hidden="true">
      <rect x="13" y="2" width="22" height="6.5" rx="1.5" /><rect x="13" y="10.2" width="22" height="6.5" rx="1.5" /><rect x="13" y="18.4" width="22" height="6.5" rx="1.5" />
    </svg>
  ),
};

const BASE = import.meta.env.BASE_URL;

const slug = (name) => (name || 'team').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'team';

// Shows a rendered card with ways to save, copy or share it. By default it
// renders the team card; pass `render`, `title`, `name` and `suffix` for others.
export default function ExportDialog({ team, onClose, render, title = 'Team image', name, suffix = 'zzz-team', kinds, kind, onKind }) {
  const label = name ?? team?.name;
  const [layout, setLayout] = useState(() => (render ? null : savedLayout()));
  const fileName = () => `${slug(label)}-${kind ? `${suffix}-${kind}` : `${suffix}${layout && layout !== 'columns' ? `-${layout}` : ''}`}.png`;
  const pickLayout = (id) => {
    setLayout(id);
    try {
      localStorage.setItem(LAYOUT_KEY, id);
    } catch {
      /* storage unavailable */
    }
  };
  const [url, setUrl] = useState(null);
  const [blob, setBlob] = useState(null);
  const [status, setStatus] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl;
    setUrl(null);
    (render ? render({ base: BASE, kind }) : renderTeamCard(team, { base: BASE, layout }))
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
  }, [team, layout, kind]);

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

        {kinds && (
          <div className="layout-pick" role="radiogroup" aria-label="Card type">
            {kinds.map((k) => (
              <button
                key={k.id}
                type="button"
                role="radio"
                aria-checked={kind === k.id}
                className={`layout-pick__opt${kind === k.id ? ' is-on' : ''}`}
                onClick={() => onKind(k.id)}
              >
                <b>{k.label}</b>
                <span className="muted">{k.hint}</span>
              </button>
            ))}
          </div>
        )}

        {layout && (
          <div className="layout-pick" role="radiogroup" aria-label="Image layout">
            {TEAM_LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={layout === l.id}
                className={`layout-pick__opt${layout === l.id ? ' is-on' : ''}`}
                onClick={() => pickLayout(l.id)}
              >
                <span className="layout-pick__svg">{LAYOUT_ICONS[l.id]}</span>
                <b>{l.label}</b>
                <span className="muted">{l.hint}</span>
              </button>
            ))}
          </div>
        )}

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
