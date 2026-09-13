import { Modal } from '../../components/Modal';
import { DownloadIcon } from '../../components/icons';
import { useToast } from '../../components/Toast';
import { TIERS } from '../../data/tiers';
import { downloadText, stampedName } from '../../lib/download';
import { int, usdWhole } from '../../lib/format';
import s from '../../components/ModalContent.module.css';

/** The programme rules, generated from the same tier data the ladder renders. */
const termsText = (now: string) => {
  const ladder = TIERS.map(
    (t) =>
      `  Tier 0${t.rank}  ${t.name.padEnd(18)} ${String(int(t.minLots)).padStart(7)} lots  ` +
      `${String(t.minActiveTraders).padStart(4)} traders  uplift ${t.upliftLabel.padStart(5)}` +
      `${t.cashBonus ? `  bonus ${usdWhole(t.cashBonus)}` : ''}${t.inviteOnly ? '  (by invitation)' : ''}`,
  ).join('\n');

  return `PARTNER PROGRAMME TERMS
Generated ${now.slice(0, 10)} from the partner portal.

QUALIFICATION
  Tiers are assessed on the calendar month. Monthly volume resets on the 1st.
  A tier requires BOTH its lot volume and its active-trader count to be met in
  the same calendar month. Meeting one gate alone does not qualify.
  A trader counts as active with at least one closed trade in the last 30 days.
  Your tier updates within an hour of clearing.

GRACE PERIOD
  Miss a threshold once and you keep the tier, and its rates, for 60 days.

TIER LADDER
${ladder}

RATES
  Published rates are per standard lot and are credited when the trade closes.
  Your displayed rate is the base rate multiplied by your tier uplift.
  Raw Spread and Zero accounts pay a thinner rebate: the client already pays a
  separate per-lot commission and the spread is close to zero, so there is less
  broker revenue per lot to share.

EXCLUSIONS
  Rates apply to closed positions held longer than 3 minutes. Scalped and
  arbitrage volume is reviewed before it is credited. Bonus-funded volume is
  excluded from tier assessment.

BONUSES
  Tier bonuses pay once, on first arrival at the tier, within 5 business days.

Trading involves risk. Capital at risk.
`;
};

export const TermsModal = ({
  open,
  now,
  onClose,
}: {
  open: boolean;
  now: string;
  onClose: () => void;
}) => {
  const toast = useToast();

  return (
    <Modal open={open} onClose={onClose} labelledBy="terms-title" darkClose>
      <div className={s.head}>
        <div className={s.eyebrow}>Growth</div>
        <h3 className={s.title} id="terms-title">Programme terms</h3>
        <div className={s.sub}>
          The rules the ladder is assessed against. These are the same numbers the
          tier cards use — there is no second rulebook.
        </div>
      </div>

      <div className={s.body}>
        <div className={s.section}>
          <div className={s.sectionH}>Qualification</div>
          <div className={s.prose}>
            <p>
              Tiers are assessed on the <b>calendar month</b>, and monthly volume resets on
              the 1st. A tier needs <b>both</b> its lot volume and its active-trader count in
              the same month — clearing one gate alone does not qualify.
            </p>
            <p>
              A trader counts as active with at least one closed trade in the last 30 days.
              Your tier updates within an hour of clearing.
            </p>
          </div>
        </div>

        <div className={s.section}>
          <div className={s.sectionH}>The ladder</div>
          {TIERS.map((t) => (
            <div className={s.row} key={t.rank}>
              <div className={s.rowL}>
                {t.name}
                <small>
                  {int(t.minLots)} lots · {t.minActiveTraders} active traders
                  {t.inviteOnly ? ' · by invitation' : ''}
                </small>
              </div>
              <div className={s.rowV}>
                {t.upliftLabel}
                {t.cashBonus && <em>{usdWhole(t.cashBonus)} bonus</em>}
              </div>
            </div>
          ))}
        </div>

        <div className={s.section}>
          <div className={s.sectionH}>Grace period and exclusions</div>
          <div className={s.prose}>
            <p>
              Miss a threshold once and you keep the tier, and its rates, for <b>60 days</b>.
            </p>
            <p>
              Rates apply to closed positions held longer than 3 minutes. Scalped and
              arbitrage volume is reviewed before it is credited, and bonus-funded volume is
              excluded from tier assessment. Bonuses pay once, within 5 business days of
              first arriving at a tier.
            </p>
          </div>
        </div>

        <div className={s.note}>Trading involves risk. Capital at risk.</div>

        <div className={s.foot}>
          <button
            className="btn"
            onClick={() => {
              downloadText(stampedName('ib-programme-terms', now, 'txt'), termsText(now));
              toast('Terms downloaded', 'Generated from the live tier data.');
            }}
          >
            <DownloadIcon /> Download a copy
          </button>
          <button className="btn btn-dark" onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  );
};
