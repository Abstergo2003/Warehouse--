"use client"

import styles from '@/app/locations/page.module.css'
import Image from "next/image";
import MousePointer2Icon from '../icons/Navigate';
import { useRef } from 'react';
import { AnimatedIconHandle } from '../icons/types';
import EyeIcon from '../icons/Inspect';

export default function LocationsPage() {
    const mockData = {
        id: "51653",
        name: "Warehouse 1",
        localization: {
            lat: "25.00",
            lon: "32.00"
        }
    }
    return (
        <div className={styles.locationsPage}>
            <div className={styles.locationsPageWrapper}>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
                <Location data={mockData}></Location>
            </div>
        </div>
    )
}


export function Location(props: {
    data: {name: string, id: string, localization: {lat: string, lon: string}}
}) {
    const navigationRef = useRef<AnimatedIconHandle>(null)
    const inspectRef = useRef<AnimatedIconHandle>(null)
    return(
        <div
        className={styles.location}>
            <Image 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvrQDevxLylxtjB6kG5bRLqoJ8m4ZxjKc7GQ&s"
                alt='location'
                width={300}
                height={200}
                style={{borderRadius: "8px"}}
            />
            <h3 style={{marginLeft: "10px"}}>{props.data.name}</h3>
            <br />
            <a href={`/locations/${props.data.id}`}>
                <button
                onMouseEnter={()=>{inspectRef.current?.startAnimation()}}
                onMouseLeave={() => inspectRef.current?.stopAnimation()}>
                    <EyeIcon ref={inspectRef}></EyeIcon>
                    Inspect
                </button>
            </a>
            <a target='_blank' href={`https://www.google.com/maps/dir//${props.data.localization.lat},${props.data.localization.lon}/`}>
                <button
                onMouseEnter={()=>{navigationRef.current?.startAnimation()}}
                onMouseLeave={() => navigationRef.current?.stopAnimation()}>
                    <MousePointer2Icon ref={navigationRef}></MousePointer2Icon>
                    Navigate
                </button>
            </a>
        </div>
    )
}