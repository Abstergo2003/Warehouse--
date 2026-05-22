"use client"

import Image from "next/image";
import MousePointer2Icon from '../icons/Navigate';
import { useRef } from 'react';
import { AnimatedIconHandle } from '../../lib/types';
import EyeIcon from '../icons/Inspect';
import WindowsPageContainer from "@/app/components/WindowsPageContainer";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { listAvailibleStoragesQuery } from '@/lib/actions/queries';
import { LoaderBusy } from 'react-windows-ui';

export default function LocationsPage() {
    const { data: session } = useSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [storages, setStorages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            listAvailibleStoragesQuery(session.user.id).then(data => {
                setStorages(data || []);
                setLoading(false);
            });
        }
    }, [session?.user?.id]);

    if (loading) {
        return (
            <WindowsPageContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LoaderBusy isLoading={true} size="large" />
                </div>
            </WindowsPageContainer>
        );
    }

    return (
        <WindowsPageContainer>
            <div style={{ padding: '20px' }}>
                <h1 style={{ marginBottom: '20px' }}>Warehouses</h1>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '20px' 
                }}>
                    {storages.length > 0 ? storages.map(storage => (
                        <Location key={storage.id} data={{
                            id: storage.id,
                            name: storage.name,
                            img_url: storage.img_url,
                            localization: typeof storage.localization !== 'string' ? JSON.parse(storage.localization) : storage.localization
                        }} />
                    )) : (
                        <p>No warehouses found. Create one using the sidebar!</p>
                    )}
                </div>
            </div>
        </WindowsPageContainer>
    )
}

function Location(props: {
    data: {name: string, id: string, img_url: string, localization: {lat: string, lon: string}}
}) {
    const navigationRef = useRef<AnimatedIconHandle>(null)
    const inspectRef = useRef<AnimatedIconHandle>(null)
    return(
        <div style={{ 
            border: '1px solid var(--border)', 
            borderRadius: '8px', 
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Image 
                unoptimized={true}
                src={props.data.img_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvrQDevxLylxtjB6kG5bRLqoJ8m4ZxjKc7GQ&s"}
                alt='location'
                width={300}
                height={180}
                style={{ width: '100%', objectFit: 'cover' }}
            />
            <div style={{ padding: '15px' }}>
                <h3 style={{ margin: 0 }}>{props.data.name}</h3>
                <br />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <a href={`/locations/${props.data.id}`}>
                        <button
                            onMouseEnter={()=>{inspectRef.current?.startAnimation()}}
                            onMouseLeave={() => inspectRef.current?.stopAnimation()}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid var(--border)', background: 'none' }}
                        >
                            <EyeIcon ref={inspectRef} size={16}></EyeIcon>
                            <span>Inspect</span>
                        </button>
                    </a>
                    <a target='_blank' href={`https://www.google.com/maps/dir//${props.data.localization.lat},${props.data.localization.lon}/`}>
                        <button
                            onMouseEnter={()=>{navigationRef.current?.startAnimation()}}
                            onMouseLeave={() => navigationRef.current?.stopAnimation()}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid var(--border)', background: 'none' }}
                        >
                            <MousePointer2Icon ref={navigationRef} size={16}></MousePointer2Icon>
                            <span>Navigate</span>
                        </button>
                    </a>
                </div>
            </div>
        </div>
    )
}
