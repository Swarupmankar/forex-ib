import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { BankIcon, CardPlainIcon, DollarIcon } from '../../components/icons';
import type { PayoutMethod, PayoutMethodKind } from '../../types';
import s from './AddMethodModal.module.css';
import m from '../../components/ModalContent.module.css';

const KINDS: {
  kind: PayoutMethodKind;
  label: string;
  icon: typeof BankIcon;
  field: string;
  placeholder: string;
  hint: string;
  /** minimum characters before the value is plausible */
  min: number;
}[] = [
  {
    kind: 'bank', label: 'Bank transfer', icon: BankIcon,
    field: 'Account number', placeholder: '000123456789',
    hint: '1–3 business days · free. Must match your verified name.', min: 6,
  },
  {
    kind: 'crypto', label: 'USDT (TRC-20)', icon: DollarIcon,
    field: 'Wallet address', placeholder: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    hint: 'Under 1 hour · 1.0 USDT network fee. TRC-20 only.', min: 26,
  },
  {
    kind: 'account', label: 'Trading account', icon: CardPlainIcon,
    field: 'Account number', placeholder: '88200114',
    hint: 'Instant · free. Credited as tradable balance, not withdrawable cash.', min: 6,
  },
];

/** Masks all but the last four characters, the way the seeded methods read. */
const mask = (value: string, kind: PayoutMethodKind) => {
  const clean = value.trim();
  if (kind === 'crypto') return `${clean.slice(0, 4)}•••••${clean.slice(-4)}`;
  return `••${clean.slice(-4)}`;
};

export const AddMethodModal = ({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (method: PayoutMethod) => void;
}) => {
  const toast = useToast();
  const [kind, setKind] = useState<PayoutMethodKind>('bank');
  const [value, setValue] = useState('');
  const [nickname, setNickname] = useState('');

  const spec = KINDS.find((k) => k.kind === kind)!;
  const valid = value.trim().length >= spec.min;

  const reset = () => {
    setValue('');
    setNickname('');
    setKind('bank');
  };

  const close = () => {
    onClose();
    window.setTimeout(reset, 200);
  };

  const submit = () => {
    if (!valid) return;
    const label = nickname.trim() || spec.label;
    onAdd({
      id: `m-${kind}-${value.trim().slice(-4)}-${Date.now()}`,
      kind,
      label,
      detail:
        kind === 'account'
          ? `Credit to #${value.trim()}`
          : `${nickname.trim() || spec.label} ${mask(value, kind)}`,
      terms: spec.hint.split('.')[0],
      etaHours: kind === 'bank' ? 48 : kind === 'crypto' ? 1 : 0,
      railFee: kind === 'crypto' ? 100 : 0,
    });
    toast('Payout method added', `${label} is ready to use.`);
    close();
  };

  return (
    <Modal open={open} onClose={close} labelledBy="add-method-title" darkClose>
      <div className={m.head}>
        <div className={m.eyebrow}>Payouts</div>
        <h3 className={m.title} id="add-method-title">Add a payout method</h3>
        <div className={m.sub}>
          Destinations are verified against your partner name before the first payout
          settles to them.
        </div>
      </div>

      <div className={m.body}>
        <div className={s.kinds} role="radiogroup" aria-label="Method type">
          {KINDS.map((k) => {
            const Icon = k.icon;
            return (
              <button
                key={k.kind}
                className={s.kind}
                role="radio"
                aria-checked={k.kind === kind}
                onClick={() => {
                  setKind(k.kind);
                  setValue('');
                }}
              >
                <Icon />
                {k.label}
              </button>
            );
          })}
        </div>

        <label className={s.field}>
          <span className={s.fieldLab}>{spec.field}</span>
          <input
            className={s.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={spec.placeholder}
            spellCheck={false}
            autoComplete="off"
          />
        </label>

        <label className={s.field}>
          <span className={s.fieldLab}>Nickname <i>optional</i></span>
          <input
            className={s.input}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={spec.label}
            autoComplete="off"
          />
        </label>

        <div className={m.note}>{spec.hint}</div>

        <div className={m.foot}>
          <button className="btn" onClick={close}>Cancel</button>
          <button className="btn btn-dark" disabled={!valid} onClick={submit}>
            Add method
          </button>
        </div>
      </div>
    </Modal>
  );
};
