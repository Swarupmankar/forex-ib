import { useState } from 'react';
import { PageHead } from '../../components/PageHead';
import { CopyButton } from '../../components/CopyButton';
import { Select } from '../../components/Select';
import { useToast } from '../../components/Toast';
import { useCreativeAssets, usePartner } from '../../api/hooks';
import { linkDestinations, linkSources } from '../../data/fixtures';
import { creativePreview, getAsset } from './assetFactory';
import { BrandMark } from '../../components/Brand';
import { ReferralQrImage, ReferralQrModal } from '../referrals/ReferralQr';
import { trackedReferralLink } from '../../lib/referral';
import s from './Marketing.module.css';

const DESTINATION_OPTIONS = linkDestinations.map((d) => ({ value: d.id, label: d.label }));
const SOURCE_OPTIONS = linkSources.map((x) => ({ value: x, label: x }));

export const MarketingPage = () => {
  const partner = usePartner();
  const assets = useCreativeAssets();
  const toast = useToast();
  const [destination, setDestination] = useState(linkDestinations[0].id);
  const [source, setSource] = useState(linkSources[0]);
  const [busy, setBusy] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const path = linkDestinations.find((d) => d.id === destination)?.path || '/';
  const tracked = trackedReferralLink(partner.referralLink || import.meta.env.VITE_USER_PANEL_URL, path, partner.code || '', source);

  const get = async (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId)!;
    setBusy(assetId);
    try {
      const what = await getAsset(asset, partner, tracked);
      toast(`${asset.name} downloaded`, what);
    } catch {
      toast('Could not build that asset', 'Your browser blocked canvas export. Try another format.', 'warn');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="wrap view">
      <PageHead
        eyebrow="Growth"
        title="Marketing"
        sub="Tracked links and approved creative, ready to publish."
      />

      <div className="stack">
        <div className={s.intro}>
          <div className={s.introCopy}>
            <BrandMark className={s.introMark} />
            <h2>Your referral toolkit.</h2>
            <p>Share your link. Build your network. Make every introduction unmistakably Movement Markets.</p>
            <a className="btn btn-white" href="#link-builder">Create a tracked link</a>
          </div>
          <img src="/art/portal/referral-3d.webp" alt="" width="1024" height="1024" className={s.introArt} />
        </div>
        <div className="card" id="link-builder">
          <div className="card-head">
            <div>
              <div className="card-title">Link builder</div>
              <div className="card-sub">Point traffic at any page with your code attached.</div>
            </div>
          </div>
          <div className={`card-pad ${s.linkBuilder}`}>
            <div>
            <div className="field">
              <span className="field-lab">Destination</span>
              <Select
                ariaLabel="Link destination"
                value={destination}
                options={DESTINATION_OPTIONS}
                onChange={setDestination}
              />
            </div>
            <div className="field">
              <span className="field-lab">Source</span>
              <Select
                ariaLabel="Traffic source"
                value={source}
                options={SOURCE_OPTIONS}
                onChange={setSource}
              />
            </div>
            <div className="field">
              <span className="field-lab">Result</span>
              <div className={s.result}>
                <div className="field-val">{tracked || 'Your referral code is not available yet.'}</div>
                {tracked && <CopyButton value={tracked} label="Copy tracked link" />}
              </div>
            </div>
            </div>
            <div className={s.trackedQr}>
              <div><ReferralQrImage link={tracked} /></div>
              <span>QR code with source tracking</span>
              <button className="btn btn-sm" disabled={!tracked} onClick={() => setQrOpen(true)}>View & download QR</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Approved creative</div>
            <span className="card-sub">Movement Markets · Your referral code included</span>
          </div>
          <div className={s.assets}>
            {assets.map((a) => (
              <div className={s.asset} key={a.id}>
                <div className={s.assetPrev}>
                  <img src={creativePreview(a, partner, tracked)} alt={`${a.kind} preview for ${a.name}`} loading="lazy" />
                  <span>{a.kind}</span>
                </div>
                <div className={s.assetBody}>
                  <div>
                    <div className={s.assetName}>{a.name}</div>
                    <div className={s.assetDim}>{a.dimensions}</div>
                  </div>
                  <button
                    className="btn btn-sm"
                    onClick={() => get(a.id)}
                    disabled={busy === a.id || !tracked}
                  >
                    {busy === a.id ? 'Building…' : 'Download'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {qrOpen && <ReferralQrModal open link={tracked} code={partner.code} onClose={() => setQrOpen(false)} />}
    </section>
  );
};
