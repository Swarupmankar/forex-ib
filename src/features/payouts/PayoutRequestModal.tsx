import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { CheckIcon, InfoIcon, WarningIcon } from '../../components/icons';
import { usd, usdWhole } from '../../lib/format';
import type { PayoutMethod, PayoutsData } from '../../types';
import s from './PayoutRequestModal.module.css';

/**
 * Enforces the rules the mockup states in prose but never implements:
 * a minimum, a fee waived above a threshold, manual approval above another,
 * and a hard cap at the available balance.
 *
 * There is no endpoint behind Confirm — submitting moves the dialog to its
 * confirmation state and nothing leaves the browser.
 */
export const PayoutRequestModal = ({
  open,
  data,
  onClose,
  onSuccess,
}: {
  open: boolean;
  data: PayoutsData;
  onClose: () => void;
  onSuccess?: (amount: number, method: PayoutMethod) => void;
}) => {
  const [raw, setRaw] = useState('');
  /**
   * Held as a nullable preference, not as an eagerly-resolved id: destinations
   * are mutable, so the chosen one can be removed while this dialog is mounted
   * and the list can legitimately be empty. Resolving against the live array on
   * every render means the selection degrades to the default instead of
   * dangling.
   */
  const [methodId, setMethodId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const parsed = Number.parseFloat(raw);
  const amount = Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  const method =
    data.methods.find((m) => m.id === methodId) ??
    data.methods.find((m) => m.isDefault) ??
    data.methods[0];

  const tooSmall = raw !== '' && amount < data.minimum;
  const tooLarge = amount > data.balance;
  const needsApproval = amount > data.manualApprovalAbove;
  const fee = amount >= data.feeWaivedAbove ? 0 : data.feeUnderThreshold;
  const valid = amount >= data.minimum && !tooLarge && method !== undefined;

  const close = () => {
    onClose();
    // reset after the dialog is gone, so the fields don't visibly clear
    window.setTimeout(() => {
      setRaw('');
      setSubmitted(false);
    }, 200);
  };

  // no destinations left — asking for an amount would be a dead end
  if (method === undefined) {
    return (
      <Modal open={open} onClose={close} labelledBy="payout-modal-title" darkClose>
        <div className={s.head}>
          <div className={s.eyebrow}>Payouts</div>
          <h3 className={s.title} id="payout-modal-title">Add a destination first</h3>
          <div className={s.avail}>
            You have {usd(data.balance)} available, but no payout method to send it to.
          </div>
        </div>
        <div className={s.body}>
          <button className={`btn btn-dark ${s.submit}`} onClick={close}>Close</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close} labelledBy="payout-modal-title" darkClose>
      {submitted ? (
        <div className={s.done}>
          <div className={s.doneIco}><CheckIcon strokeWidth={2.6} /></div>
          <div className={s.doneT} id="payout-modal-title">Payout requested</div>
          <div className={s.doneS}>
            <b>{usd(amount - fee)}</b> to {method.label} — {method.detail}.<br />
            {needsApproval
              ? `Above ${usdWhole(data.manualApprovalAbove)}, so it goes for manual approval and settles the next business day.`
              : `Expect it ${method.terms.split(' · ')[0]}.`}
          </div>
          <button className={`btn btn-dark ${s.doneBtn}`} onClick={close}>Done</button>
        </div>
      ) : (
        <>
          <div className={s.head}>
            <div className={s.eyebrow}>Payouts</div>
            <h3 className={s.title} id="payout-modal-title">Request a payout</h3>
            <div className={s.avail}>Available to withdraw <b>{usd(data.balance)}</b></div>
          </div>

          <div className={s.body}>
            <div className={`${s.amount}${tooSmall || tooLarge ? ` ${s.invalid}` : ''}`}>
              <span className={s.currency}>$</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={data.minimum / 100}
                max={data.balance / 100}
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder="0.00"
                aria-label="Payout amount in dollars"
                aria-invalid={tooSmall || tooLarge}
              />
              <button className={s.max} onClick={() => setRaw((data.balance / 100).toFixed(2))}>
                Max
              </button>
            </div>

            {tooSmall && (
              <div className={s.error}><WarningIcon /> Minimum payout is {usdWhole(data.minimum)}.</div>
            )}
            {tooLarge && (
              <div className={s.error}><WarningIcon /> You can withdraw up to {usd(data.balance)}.</div>
            )}
            {!tooSmall && !tooLarge && (
              <div className={s.hint}>
                Minimum {usdWhole(data.minimum)} · no fee over {usdWhole(data.feeWaivedAbove)}
              </div>
            )}

            <div className={s.section}>
              <div className={s.sectionH}>Pay to</div>
              <div className={s.choices} role="radiogroup" aria-label="Payout method">
                {data.methods.map((m) => (
                  <button
                    key={m.id}
                    className={s.choice}
                    role="radio"
                    aria-checked={m.id === method.id}
                    onClick={() => setMethodId(m.id)}
                  >
                    <span className={s.radio} />
                    <span>
                      <span className={s.choiceT}>{m.label}</span>
                      <span className={s.choiceS}>{m.detail} · {m.terms}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className={s.summary}>
              <div className={s.srow}><span>Amount</span><b>{usd(Math.max(0, amount))}</b></div>
              <div className={s.srow}>
                <span>Fee</span>
                <b>{fee === 0 ? 'Free' : usd(fee)}</b>
              </div>
              <div className={`${s.srow} ${s.stotal}`}>
                <span>You receive</span>
                <b>{usd(Math.max(0, amount - fee))}</b>
              </div>
            </div>

            {needsApproval && (
              <div className={s.notice}>
                <InfoIcon />
                <div>
                  Payouts above {usdWhole(data.manualApprovalAbove)} need manual approval and settle the
                  next business day. Bank details must match your verified name.
                </div>
              </div>
            )}

            <button
              className={`btn btn-dark ${s.submit}`}
              disabled={!valid}
              onClick={() => {
                onSuccess?.(amount, method);
                setSubmitted(true);
              }}
            >
              Request {valid ? usd(amount) : 'payout'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
