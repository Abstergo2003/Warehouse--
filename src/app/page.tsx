import Image from "next/image";
import WindowsPageContainer from "@/app/components/WindowsPageContainer";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function Home() {
  const session = await auth();

  return (
    <WindowsPageContainer>
      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <Image
            unoptimized={true}
            src="/icons/icon.png"
            alt="Warehouse Logo"
            width={80}
            height={80}
          />
          <div>
            <h1 style={{ fontSize: '32px', margin: 0 }}>Welcome to Warehouse</h1>
            <p style={{ fontSize: '18px', opacity: 0.7 }}>Hello, {session?.user?.name || 'User'}! Manage your storage and items with ease.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
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
