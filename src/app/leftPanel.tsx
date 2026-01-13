'use client'

import styles from "@/app/leftPanel.module.css"
import Image from "next/image";
import HomeIcon from "./icons/Home";
import SatelliteDishIcon from "./icons/Location";
import MagnifierIcon from "./icons/Search";
import PlugConnectedIcon from "./icons/Maintenance";
import UsersIcon from "./icons/Profile";
import CpuIcon from "./icons/Tools";
import {AnimatedIconHandle} from "@/app/icons/types"
import { useRef } from "react";
import { useSession } from "next-auth/react";


export default function LeftPanel() {
    const homeRef = useRef<AnimatedIconHandle>(null);
    const locationRef = useRef<AnimatedIconHandle>(null);
    const searchRef = useRef<AnimatedIconHandle>(null);
    const maintenanceRef = useRef<AnimatedIconHandle>(null);
    const profileRef = useRef<AnimatedIconHandle>(null);
    const toolsRef = useRef<AnimatedIconHandle>(null);
    const { data: session, status } = useSession();

    return(
        <div className={styles.leftPanel}>
            <div className={styles.helloBox}>
                <span> Hello, {session?.user?.name} </span>

                <br />
                <Image 
                    src={"/icons/icon.png"}
                    alt="icon"
                    width={100}
                    height={100}
                    className={styles.Icon}
                />
                <br />
                <br />

                <Dropdown></Dropdown>
                
            </div>
            

            {/* eslint-disable-next-line @next/next/no-html-link-for-pages*/}
            <a href="/" className={styles.a}>
                <span
                    onMouseEnter={()=>{homeRef.current?.startAnimation()}}
                    onMouseLeave={() => homeRef.current?.stopAnimation()}
                    className={styles.locations}>
                    <div className={styles.icons}>
                        <HomeIcon ref={homeRef} size={40}/>
                    </div>
                    Home
                </span>
            </a>
            <a href="/locations" className={styles.a}>
                <span
                    onMouseEnter={()=>{locationRef.current?.startAnimation()}}
                    onMouseLeave={() => locationRef.current?.stopAnimation()}
                    className={styles.locations}>
                    <div className={styles.icons}>
                        <SatelliteDishIcon ref={locationRef} size={40}/>
                    </div>
                    Location
                </span>
            </a>
            <a href="/search" className={styles.a}>
                <span
                    onMouseEnter={()=>{searchRef.current?.startAnimation()}}
                    onMouseLeave={() => searchRef.current?.stopAnimation()}
                    className={styles.locations}>
                    <div className={styles.icons}>
                        <MagnifierIcon ref={searchRef} size={40}/>
                    </div>
                    Search
                </span>
            </a>
            <a href="/maintenance" className={styles.a}>
                <span
                    onMouseEnter={()=>{maintenanceRef.current?.startAnimation()}}
                    onMouseLeave={() => maintenanceRef.current?.stopAnimation()}
                    className={styles.locations}>
                    <div className={styles.icons}>
                        <PlugConnectedIcon ref={maintenanceRef} size={40}/>
                    </div>
                    Maintenance
                </span>
            </a>
            <a href="/profile" className={styles.a}>
                <span
                    onMouseEnter={()=>{profileRef.current?.startAnimation()}}
                    onMouseLeave={() => profileRef.current?.stopAnimation()}
                    className={styles.locations}>
                    <div className={styles.icons}>
                        <UsersIcon ref={profileRef} size={40}/>
                    </div>
                    Profile
                </span>
            </a>
            <a href="/tool" className={styles.a}>
                <span
                    onMouseEnter={()=>{toolsRef.current?.startAnimation()}}
                    onMouseLeave={() => toolsRef.current?.stopAnimation()}
                    className={styles.locations}>
                    <div className={styles.icons}>
                        <CpuIcon ref={toolsRef} size={40}/>
                    </div>
                    Tools
                </span>
            </a>
        </div>
    )
}



export function Dropdown() {
  // W React musimy użyć unikalnego ID, żeby label wiedział co klikać
  const inputId = "dropdown-toggle-1"; 

  return (
    <div className={styles.selectBox}>
      {/* 1. INPUT musi być PIERWSZY (lub przed menu) */}
      <input type="checkbox" id={inputId} className={styles.toggleInput} />

      {/* 2. LABEL steruje inputem */}
      <label htmlFor={inputId} className={styles.triggerLabel}>
        <p>+ Create</p>
      </label>

      {/* 3. MENU musi być "bratem" inputa (ten sam poziom w drzewie DOM) */}
      <div className={styles.optionBox}>
        <div>Item</div>
        <div>Warehouse</div>
      </div>
    </div>
  );
}