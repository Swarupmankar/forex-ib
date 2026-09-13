import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { MedalSprite } from './components/MedalSprite';
import { AuthProvider } from './auth/useAuth';
import { RequireAnon, RequireAuth } from './auth/guards';
import { SignInPage } from './auth/SignInPage';
import { SignUpPage } from './auth/SignUpPage';
import { ForgotPasswordPage } from './auth/ForgotPasswordPage';
import { OverviewPage } from './features/overview/OverviewPage';
import { ReferralsPage } from './features/referrals/ReferralsPage';
import { CommissionsPage } from './features/commissions/CommissionsPage';
import { RewardsPage } from './features/rewards/RewardsPage';
import { MarketingPage } from './features/marketing/MarketingPage';
import { PayoutsPage } from './features/payouts/PayoutsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { MedalsScratchPage } from './features/scratch/MedalsScratchPage';

export default function App() {
  return (
    <>
      {/* Outside the router on purpose: mounted inside a route it would unmount
          on navigation and every <use href="#medalN"> would render blank. */}
      <MedalSprite />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* signed out only — a signed-in user is bounced to the portal */}
            <Route element={<RequireAnon />}>
              <Route path="signin" element={<SignInPage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* everything else needs a session; the guard remembers where you
                were headed so sign-in can return you there */}
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route index element={<OverviewPage />} />
                <Route path="referrals" element={<ReferralsPage />} />
                <Route path="commissions" element={<CommissionsPage />} />
                <Route path="rewards" element={<RewardsPage />} />
                <Route path="marketing" element={<MarketingPage />} />
                <Route path="payouts" element={<PayoutsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                {/* not in the nav — a bench for eyeballing all six medallions */}
                <Route path="medals" element={<MedalsScratchPage />} />
                <Route path="*" element={<OverviewPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}
