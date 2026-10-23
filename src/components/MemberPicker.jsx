import FactionLogo from './FactionLogo.jsx';
import { memberArt, setMemberIndex, useMemberIndex } from '../lib/memberArt.js';

// For Agents played as several people (Sunbringer): show them all as a
// collage, or pick one member's art for every card and portrait.
export default function MemberPicker({ agent: a }) {
  const cur = useMemberIndex(a);
  return (
    <div className="member-pick" role="group" aria-label="Show member">
      <button className="member-pick__btn member-pick__btn--all" aria-pressed={cur < 0} onClick={() => setMemberIndex(a.id, -1)}>
        <span className="member-pick__trio" aria-hidden="true">
          {a.members.map((m, i) => (
            <img key={m.key} src={memberArt(a, i)} alt="" width={16} height={16} loading="lazy" />
          ))}
        </span>
        <span>
          <b>All three</b>
          <small>Collage</small>
        </span>
      </button>
      {a.members.map((m, i) => (
        <button key={m.key} className="member-pick__btn" aria-pressed={i === cur} onClick={() => setMemberIndex(a.id, i)}>
          <img src={memberArt(a, i)} alt="" width={28} height={28} loading="lazy" />
          <span>
            <b>{m.name.split(' ')[0]}</b>
            <small className="member-pick__dept" title={m.deptName}>
              <FactionLogo faction={m.faction} size={13} />
              {m.dept}
            </small>
          </span>
        </button>
      ))}
    </div>
  );
}
