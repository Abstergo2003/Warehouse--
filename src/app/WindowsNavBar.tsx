'use client'

import { NavBar, NavBarLink } from 'react-windows-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function WindowsNavBar() {
  const pathname = usePathname();

  return (
    <NavBar
      title="Warehouse"
      shadowOnScroll={true}
      titleBarMobile={
        <div style={{display: "flex", justifyContent: "space-between", width: "calc(100% - 60px)"}}>
          <span className="app-navbar-name">Warehouse</span>
        </div>
      }>
      
      <Link href="/" passHref legacyBehavior>
        <NavBarLink
          text="Home"
          active={pathname === '/'}
          icon={<i className="icons10-home"></i>}
        />
      </Link>
      <Link href="/locations" passHref legacyBehavior>
        <NavBarLink
          text="Location"
          active={pathname === '/locations'}
          icon={<i className="icons10-map"></i>}
        />
      </Link>
      <Link href="/search" passHref legacyBehavior>
        <NavBarLink
          text="Search"
          active={pathname === '/search'}
          icon={<i className="icons10-search"></i>}
        />
      </Link>
      <Link href="/maintenance" passHref legacyBehavior>
        <NavBarLink
          text="Maintenance"
          active={pathname === '/maintenance'}
          icon={<i className="icons10-settings"></i>}
        />
      </Link>
      <Link href="/templates" passHref legacyBehavior>
        <NavBarLink
          text="Templates"
          active={pathname === '/templates'}
          icon={<i className="icons10-list"></i>}
        />
      </Link>
      <Link href="/profile" passHref legacyBehavior>
        <NavBarLink
          text="Profile"
          active={pathname === '/profile'}
          icon={<i className="icons10-user"></i>}
        />
      </Link>
      <Link href="?modal=add-item" passHref legacyBehavior>
        <NavBarLink
          text="Add Item"
          icon={<i className="icons10-plus"></i>}
        />
      </Link>
      <Link href="?modal=add-warehouse" passHref legacyBehavior>
        <NavBarLink
          text="Add Warehouse"
          icon={<i className="icons10-plus"></i>}
        />
      </Link>
      <Link href="?modal=add-template" passHref legacyBehavior>
        <NavBarLink
          text="Add Template"
          icon={<i className="icons10-plus"></i>}
        />
      </Link>
    </NavBar>
  );
}
