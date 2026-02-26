import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { UserMenu } from '../common/UserMenu';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-branding">
            <h1>⬡ DeepProsperity</h1>
            <p className="app-tagline">Gamifica tu vida!</p>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="app-main">
        {children}
      </main>

      <Navigation />
    </div>
  );
}
