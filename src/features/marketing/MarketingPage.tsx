import { useState } from 'react';
import { PageHead } from '../../components/PageHead';
import { CopyButton } from '../../components/CopyButton';
import { Select } from '../../components/Select';
import { useToast } from '../../components/Toast';
import { useCreativeAssets, usePartner } from '../../api/hooks';
import { linkDestinations, linkSources } from '../../data/fixtures';
import { getAsset } from './assetFactory';
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

  const origin = partner.referralLink ? (partner.referralLink.startsWith('http') ? new URL(partner.referralLink).origin : import.meta.env.VITE_USER_PANEL_URL) : import.meta.env.VITE_USER_PANEL_URL;
  const path = linkDestinations.find((d) => d.id === destination)?.path || '/';
  const tracked = `${origin}${path}?ref=${partner.code || ''}&utm_source=${source}`;

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
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Link builder</div>
              <div className="card-sub">Point traffic at any page with your code attached.</div>
            </div>
          </div>
          <div className="card-pad">
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
                <div className="field-val">{tracked}</div>
                <CopyButton value={tracked} label="Copy tracked link" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Approved creative</div>
            <span className="card-sub">Compliance-cleared · updated 12 Jul 2026</span>
          </div>
          <div className={s.assets}>
            {assets.map((a) => (
              <div className={s.asset} key={a.id}>
                <div className={s.assetPrev}>{a.kind}</div>
                <div className={s.assetBody}>
                  <div>
                    <div className={s.assetName}>{a.name}</div>
                    <div className={s.assetDim}>{a.dimensions}</div>
                  </div>
                  <button
                    className="btn btn-sm"
                    onClick={() => get(a.id)}
                    disabled={busy === a.id}
                  >
                    {busy === a.id ? 'Building…' : 'Get'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
