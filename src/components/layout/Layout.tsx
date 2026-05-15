import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn?: boolean;
  username?: string;
  hideFooter?: boolean;
  /** Show bottom nav (for logged-in app shell) */
  showBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  isLoggedIn,
  username,
  hideFooter,
  showBottomNav,
}) => {
  return (
    <div className="app-bg min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} username={username} />
      <main className={`flex-1 ${showBottomNav ? 'has-bottom-nav' : ''}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;
