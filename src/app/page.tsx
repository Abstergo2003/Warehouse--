import Image from "next/image";
import WindowsPageContainer from "@/app/components/WindowsPageContainer";
import { auth } from "@/lib/auth";
import { getDashboardStatsQuery } from "@/lib/actions/queries";

export const dynamic = "force-dynamic";
export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id || "";
  const stats = await getDashboardStatsQuery(userId);

  return (
    <WindowsPageContainer>
      <div style={{ padding: '40px' }} className="mobile-padding-compact">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }} className="mobile-stack-flex">
          <Image
            unoptimized={true}
            src="/icons/icon.png"
            alt="Warehouse Logo"
            width={80}
            height={80}
            style={{ flexShrink: 0 }}
          />
          <div>
            <h1 style={{ fontSize: '32px', margin: 0 }} className="responsive-title-h1">Welcome to Warehouse</h1>
            <p style={{ fontSize: '18px', opacity: 0.7 }}>Hello, {session?.user?.name || 'User'}! Manage your storage and items with ease.</p>
          </div>
        </div>

        {/* Statistics Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: '20px', 
          marginBottom: '45px' 
        }} className="mobile-grid-1">
          
          {/* Card 1: Managed Storages */}
          <div style={{ 
            padding: '22px 25px', 
            backgroundColor: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Glowing Accent */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '4px', 
              height: '100%', 
              backgroundColor: '#a38cf4' 
            }}></div>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(163, 140, 244, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <i className="icons10-map" style={{ fontSize: '24px', color: '#a38cf4' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Managed Storages</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginTop: '4px', lineHeight: '1' }}>{stats.storagesCount}</div>
            </div>
          </div>

          {/* Card 2: Tracked Assets */}
          <div style={{ 
            padding: '22px 25px', 
            backgroundColor: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Glowing Accent */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '4px', 
              height: '100%', 
              backgroundColor: '#4ade80' 
            }}></div>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(74, 222, 128, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <i className="icons10-list" style={{ fontSize: '24px', color: '#4ade80' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Tracked Assets</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginTop: '4px', lineHeight: '1' }}>{stats.itemsCount}</div>
            </div>
          </div>

          {/* Card 3: Currently Borrowed */}
          <div style={{ 
            padding: '22px 25px', 
            backgroundColor: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.06)', 
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Glowing Accent */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '4px', 
              height: '100%', 
              backgroundColor: '#fbbf24' 
            }}></div>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(251, 191, 36, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <i className="icons10-clock" style={{ fontSize: '24px', color: '#fbbf24' }}></i>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Currently Borrowed</div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginTop: '4px', lineHeight: '1' }}>{stats.borrowedCount}</div>
            </div>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          <DashboardCard 
            title="Warehouses" 
            description="View and manage your storage locations." 
            link="/locations" 
            icon="icons10-map"
          />
          <DashboardCard 
            title="Templates" 
            description="Define reusable patterns for your items." 
            link="/templates" 
            icon="icons10-list"
          />
          <DashboardCard 
            title="Search" 
            description="Quickly find items across all locations." 
            link="/search" 
            icon="icons10-search"
          />
          <DashboardCard 
            title="Profile" 
            description="Update your personal information and settings." 
            link="/profile" 
            icon="icons10-user"
          />
        </div>
      </div>
    </WindowsPageContainer>
  );
}

function DashboardCard({ title, description, link, icon }: { title: string, description: string, link: string, icon: string }) {
  return (
    <a href={link} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ 
        padding: '20px', 
        border: '1px solid var(--border)', 
        borderRadius: '8px', 
        backgroundColor: 'rgba(255,255,255,0.05)',
        transition: 'transform 0.2s, background-color 0.2s',
        cursor: 'pointer'
      }}
      className="dashboard-card"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <i className={icon} style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        <p style={{ margin: 0, opacity: 0.8 }}>{description}</p>
      </div>
    </a>
  );
}
