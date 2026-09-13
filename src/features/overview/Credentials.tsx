import { CopyButton } from '../../components/CopyButton';
import { Skeleton } from '../../components/Skeleton';
import s from './Credentials.module.css';

export const Credentials = ({ link, code, loading = false }: { link: string; code: string; loading?: boolean }) => {
  if (loading) {
    return (
      <div className={s.creds}>
        <div className={s.crLab}>Your link</div>
        <div className="field-val"><Skeleton width="280px" height="20px" /></div>
        <div className={s.crDiv} />
        <div className={s.crLab}>Code</div>
        <div className={`field-val ${s.code}`}><Skeleton width="90px" height="20px" /></div>
      </div>
    );
  }

  return (
    <div className={s.creds}>
      <div className={s.crLab}>Your link</div>
      <div className="field-val">{link}</div>
      <CopyButton value={link} label="Copy link" />

      <div className={s.crDiv} />

      <div className={s.crLab}>Code</div>
      <div className={`field-val ${s.code}`}>{code}</div>
      <CopyButton value={code} label="Copy code" />
    </div>
  );
};
