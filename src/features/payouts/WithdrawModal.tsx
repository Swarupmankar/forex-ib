import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Select } from '../../components/Select';
import { CheckIcon, InfoIcon, WarningIcon } from '../../components/icons';
import { normalizeApiError } from '../../api/errors';
import {
  useIbWalletCurrencies,
  useQuoteWithdraw,
  useRequestWithdrawOtp,
  useSubmitWithdraw,
} from '../../api/wallet.hooks';
import type { WalletNetwork, WithdrawQuote } from '../../api/wallet.api';
import { usd } from '../../lib/format';
import s from './WithdrawModal.module.css';

/**
 * Withdraw from the IB wallet: the user portal's crypto withdrawal, on the IB
 * balance.
 *
 * The IB enters DOLLARS -- that is what they hold -- and the provider's dry
 * run says how much coin that buys, what the network fee is, and whether the
 * fee comes out of the coins (BTC, LTC, SOL...) or is covered by the broker
 * (every token, ETH, TRX...). Nothing here is computed locally: the quote is
 * also the address check, and it is re-run on every input change so a stale
 * cost can never be the one confirmed.
 *
 * On submit the quoted `usdCost` goes back as a ceiling and `receiveAmount` as
 * a floor. The server re-prices; a rate or fee that moved past 2% is refused
 * with a new figure rather than silently charged.
 */

const QUOTE_DEBOUNCE_MS = 450;

/** 8 decimals for coin amounts, 2 minimum, trimmed. */
const coin = (value: number, decimals = 8) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: Math.min(decimals, 8) });

const dollars = (value: number) => usd(Math.round(value * 100));

/**
 * The fee is only the IB's cost when the provider took it out of the payout.
 * Otherwise the broker pays it on top, and the row reads 0.00 so it does not
 * come and go between coins.
 */
const feeLabel = (q: WithdrawQuote) =>
  q.isFeeIncluded && Number(q.feeAmount) > 0
    ? `${coin(Number(q.feeAmount))} ${q.feeCurrencyCode ?? q.coin}${q.feeUsd ? ` (${dollars(q.feeUsd)})` : ''}`
    : '0.00';

export const WithdrawModal = ({
  open,
  balance,
  onClose,
}: {
  open: boolean;
  /** USD. */
  balance: number;
  onClose: () => void;
}) => {
  const { data: coins = [], isLoading: coinsLoading } = useIbWalletCurrencies();
  const quoteMut = useQuoteWithdraw();
  const otpMut = useRequestWithdrawOtp();
  const submitMut = useSubmitWithdraw();

  const [raw, setRaw] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [to, setTo] = useState('');
  const [tag, setTag] = useState('');
  const [otp, setOtp] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [quote, setQuote] = useState<WithdrawQuote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [receipt, setReceipt] = useState<WithdrawQuote | null>(null);

  // One flat list: "USDT-TRC20 · Tron", "BTC · Bitcoin". The id is the chain,
  // which is the one thing that must not be guessed.
  const networks = useMemo(() => {
    const flat: (WalletNetwork & { coin: string })[] = [];
    coins.forEach((c) => c.networks.forEach((n) => flat.push({ ...n, coin: c.coin })));
    return flat;
  }, [coins]);
  const network = networks.find((n) => n.currencyId === currencyId);

  useEffect(() => {
    if (!currencyId && networks.length > 0) setCurrencyId(networks[0].currencyId);
  }, [currencyId, networks]);

  const amount = Number.parseFloat(raw);
  const amountOk = Number.isFinite(amount) && amount > 0;
  const tooLarge = amountOk && amount > balance;
  const addressOk = to.trim().length >= 20 && to.trim().length <= 120;
  const tagMissing = Boolean(network?.needsTag) && !tag.trim();
  const readyToQuote = amountOk && !tooLarge && addressOk && !tagMissing && Boolean(network);

  // Re-quoted whenever any input to the price changes. The previous quote is
  // cleared first so a stale cost is never the one on screen.
  useEffect(() => {
    setQuote(null);
    setQuoteError('');
    if (!open || !readyToQuote || !network) return undefined;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const result = await quoteMut.mutateAsync({
          currencyId: network.currencyId,
          to: to.trim(),
          tag: tag.trim() || undefined,
          amount,
        });
        if (!cancelled) setQuote(result);
      } catch (err) {
        if (!cancelled) setQuoteError(normalizeApiError(err).message);
      }
    }, QUOTE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // quoteMut is stable; listing it would re-fire the quote on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, readyToQuote, network?.currencyId, to, tag, amount]);

  const sendCode = async () => {
    setSubmitError('');
    try {
      await otpMut.mutateAsync();
      setCodeSent(true);
    } catch (err) {
      setSubmitError(normalizeApiError(err).message);
    }
  };

  const confirm = async () => {
    if (!quote || !network || otp.length !== 6) return;
    setSubmitError('');
    try {
      await submitMut.mutateAsync({
        currencyId: network.currencyId,
        otp,
        to: to.trim(),
        tag: tag.trim() || undefined,
        amount,
        maxUsd: quote.usdCost,
        minCoinAmount: quote.receiveAmount,
      });
      setReceipt(quote);
    } catch (err) {
      setSubmitError(normalizeApiError(err).message);
    }
  };

  const close = () => {
    onClose();
    // reset after the dialog is gone, so the fields don't visibly clear
    window.setTimeout(() => {
      setRaw(''); setTo(''); setTag(''); setOtp('');
      setCodeSent(false); setQuote(null); setQuoteError(''); setSubmitError(''); setReceipt(null);
    }, 200);
  };

  const canConfirm = Boolean(quote && !quoteError && codeSent && otp.length === 6 && !submitMut.isPending);

  if (receipt) {
    return (
      <Modal open={open} onClose={close} labelledBy="withdraw-modal-title" darkClose>
        <div className={s.done}>
          <div className={s.doneIco}><CheckIcon strokeWidth={2.6} /></div>
          <div className={s.doneT} id="withdraw-modal-title">Withdrawal submitted</div>
          <div className={s.doneS}>
            <b>{coin(receipt.receiveAmount, receipt.decimals)} {receipt.coin}</b> on {receipt.network} to<br />
            <b>{receipt.to}</b><br />
            {dollars(receipt.usdCost)} has left your IB wallet. It shows as Processing until the network confirms it.
          </div>
          <button className={`btn btn-dark ${s.doneBtn}`} onClick={close}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close} labelledBy="withdraw-modal-title" darkClose>
      <div className={s.head}>
        <div className={s.eyebrow}>IB wallet</div>
        <h3 className={s.title} id="withdraw-modal-title">Withdraw</h3>
        <div className={s.avail}>Available <b>{dollars(balance)}</b></div>
      </div>

      <div className={s.body}>
        <div className={`${s.amount}${tooLarge ? ` ${s.invalid}` : ''}`}>
          <span className={s.currency}>$</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            max={balance}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="0.00"
            aria-label="Amount to withdraw, in dollars"
            aria-invalid={tooLarge}
            disabled={codeSent}
          />
          <button className={s.max} onClick={() => setRaw(balance.toFixed(2))} disabled={codeSent}>Max</button>
        </div>
        {tooLarge
          ? <div className={s.error}><WarningIcon /> You can withdraw up to {dollars(balance)}.</div>
          : <div className={s.hint}>You enter dollars; the quote shows how much coin that sends.</div>}

        <div className={s.section}>
          <div className={s.sectionH}>Receive as</div>
          {coinsLoading ? (
            <div className={s.hint}>Loading networks…</div>
          ) : networks.length === 0 ? (
            <div className={s.error}><WarningIcon /> IB payouts are not set up for your broker yet.</div>
          ) : (
            <Select
              value={currencyId}
              options={networks.map((n) => ({ value: n.currencyId, label: `${n.label} · ${n.network}` }))}
              onChange={(v) => setCurrencyId(v)}
              ariaLabel="Coin and network"
            />
          )}
        </div>

        <div className={s.section}>
          <div className={s.sectionH}>To address</div>
          <input
            className={`${s.field}${to && !addressOk ? ` ${s.invalid}` : ''}`}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={network ? `${network.coin} address on ${network.network}` : 'Wallet address'}
            spellCheck={false}
            autoComplete="off"
            aria-label="Destination address"
            disabled={codeSent}
          />
          {to && !addressOk && <div className={s.error}><WarningIcon /> That does not look like a wallet address.</div>}
          {network?.needsTag && (
            <>
              <input
                className={`${s.field}${tagMissing ? ` ${s.invalid}` : ''}`}
                style={{ marginTop: 10 }}
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Destination tag / memo"
                aria-label="Destination tag"
                disabled={codeSent}
              />
              <div className={s.hint}>Your receiving wallet gives you this. Sending without it can lose the funds.</div>
            </>
          )}
        </div>

        {readyToQuote && !quote && !quoteError && (
          <div className={s.pending}><span className={s.spin} /> Checking the rate and the address…</div>
        )}
        {quoteError && <div className={s.error}><WarningIcon /> {quoteError}</div>}
        {quote && !quoteError && (
          <div className={s.summary}>
            <div className={s.srow}><span>You pay</span><b>{dollars(quote.usdCost)}</b></div>
            {quote.serviceFee > 0 && <div className={s.srow}><span>Service fee</span><b>{dollars(quote.serviceFee)}</b></div>}
            <div className={s.srow}>
              <span>Network fee{!quote.isFeeIncluded && <small>covered by your broker</small>}</span>
              <b>{feeLabel(quote)}</b>
            </div>
            <div className={s.srow}><span>Rate</span><b>1 {quote.coin} = {dollars(quote.usdPerUnit)}</b></div>
            <div className={`${s.srow} ${s.stotal}`}>
              <span>You receive</span>
              <b>{coin(quote.receiveAmount, quote.decimals)} {quote.coin}</b>
            </div>
          </div>
        )}

        {quote && !quoteError && (
          codeSent ? (
            <div className={s.section}>
              <div className={s.sectionH}>Verification code</div>
              <input
                className={`${s.field} ${s.code}`}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                aria-label="Six-digit verification code"
                autoFocus
              />
              <div className={s.resend}>
                Sent to your email.{' '}
                <button type="button" onClick={sendCode} disabled={otpMut.isPending}>
                  {otpMut.isPending ? 'Sending…' : 'Resend'}
                </button>
              </div>
            </div>
          ) : (
            <div className={s.notice}>
              <InfoIcon />
              <div>Rates move. The cost above is sent back as a limit; if it moves past that, you'll see the new figure instead of being charged it.</div>
            </div>
          )
        )}

        {submitError && <div className={s.error}><WarningIcon /> {submitError}</div>}

        {codeSent ? (
          <button className={`btn btn-dark ${s.submit}`} disabled={!canConfirm} onClick={confirm}>
            {submitMut.isPending ? 'Submitting…' : quote ? `Withdraw ${dollars(quote.usdCost)}` : 'Withdraw'}
          </button>
        ) : (
          <button
            className={`btn btn-dark ${s.submit}`}
            disabled={!quote || Boolean(quoteError) || otpMut.isPending}
            onClick={sendCode}
          >
            {otpMut.isPending ? 'Sending code…' : 'Continue'}
          </button>
        )}
      </div>
    </Modal>
  );
};
