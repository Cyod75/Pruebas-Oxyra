import React from "react";

// --- GENERAL ---
export const IconChevronRight = ({ className = "opacity-40" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" className={className}>
    <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
  </svg>
);

export const IconBackArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
    <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
  </svg>
);

export const IconSettings = ({ className = "w-6 h-6", strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// --- NAVIGATION (FOOTER) ---
export const IconHome = ({ className = "w-6 h-6", strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export const IconTraining = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 65 52" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M60.6052 8.65042L59.3609 9.36884L56.4872 4.39147C54.9023 1.64645 51.3811 0.702947 48.6361 2.28779C47.7253 2.81367 47.0339 3.56456 46.5469 4.41649L46.1474 3.72463C44.5626 0.979609 41.0414 0.0361034 38.2964 1.62094C35.5513 3.20578 34.6078 6.72698 36.1927 9.47201L41.94 19.4267L22.0306 30.9215L16.2832 20.9668C14.6983 18.2217 11.1771 17.2782 8.43212 18.8631C5.6871 20.4479 4.7436 23.9691 6.32843 26.7141L6.72788 27.406C5.74658 27.4018 4.75061 27.6251 3.83975 28.151C1.09473 29.7358 0.151224 33.257 1.73606 36.002L4.60975 40.9794L3.36541 41.6978C2.67853 42.0944 2.44292 42.9737 2.83949 43.6606C3.23605 44.3475 4.11537 44.5831 4.80225 44.1865L6.04659 43.4681L8.92028 48.4455C10.5051 51.1905 14.0263 52.134 16.7713 50.5491C17.6822 50.0233 18.3736 49.2724 18.8606 48.4205L19.26 49.1123C20.8449 51.8573 24.3661 52.8008 27.1111 51.216C29.8561 49.6312 30.7996 46.11 29.2148 43.3649L23.4674 33.4102L43.3769 21.9154L49.1243 31.8702C50.7091 34.6152 54.2303 35.5587 56.9753 33.9739C59.7204 32.389 60.6639 28.8678 59.079 26.1228L58.6796 25.431C59.6609 25.4351 60.6568 25.2118 61.5677 24.686C64.3127 23.1011 65.2562 19.5799 63.6714 16.8349L60.7977 11.8575L62.042 11.1391C62.7289 10.7425 62.9645 9.86322 62.568 9.17634C62.1714 8.48946 61.2921 8.25385 60.6052 8.65042ZM15.3345 48.0605C13.9632 48.8522 12.2021 48.3824 11.409 47.0086L4.22475 34.5652C3.43161 33.1914 3.90532 31.4314 5.27659 30.6397C6.64786 29.848 8.40899 30.3177 9.20212 31.6915L16.3863 44.1349C17.1795 45.5087 16.7058 47.2688 15.3345 48.0605ZM26.7261 44.8018C27.5192 46.1755 27.0455 47.9356 25.6742 48.7273C24.303 49.519 22.5419 49.0492 21.7487 47.6755L8.81712 25.2773C8.02398 23.9035 8.4977 22.1435 9.86896 21.3518C11.2402 20.5601 13.0014 21.0298 13.7945 22.4036L26.7261 44.8018ZM56.5903 27.5597C57.3835 28.9334 56.9098 30.6935 55.5385 31.4852C54.1672 32.2769 52.4061 31.8071 51.613 30.4333L38.6814 8.03516C37.8882 6.66141 38.3619 4.90133 39.7332 4.10963C41.1045 3.31793 42.8656 3.78772 43.6587 5.16147L56.5903 27.5597ZM61.1827 18.2717C61.9758 19.6455 61.5021 21.4056 60.1309 22.1973C58.7596 22.989 56.9985 22.5192 56.2053 21.1454L49.0211 8.702C48.228 7.32825 48.7017 5.56817 50.073 4.77647C51.4442 3.98477 53.2053 4.45456 53.9985 5.82832L61.1827 18.2717Z" fill="currentColor"/>
  </svg>
);

export const IconShop = ({ className = "w-6 h-6", strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export const IconStats = ({ className = "w-6 h-6", strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20V10" />
    <path d="M18 20V4" />
    <path d="M6 20v-4" />
  </svg>
);

export const IconRanks = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 23 26" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M11.4453 0L0 6.45309V19.4343L11.4453 25.8874L22.8906 19.4343V6.45309L11.4453 0ZM11.4461 2.18945L1.55273 7.58308V18.4331L11.4461 23.8267L21.3395 18.4331V7.58308L11.4461 2.18945Z" fill="currentColor"/>
    <path d="M11.0065 8.85192C11.1906 8.49467 11.7014 8.49467 11.8855 8.85192L13.0555 11.1217C13.1026 11.2131 13.177 11.2875 13.2684 11.3347L15.5381 12.5046C15.8955 12.6887 15.8955 13.1995 15.5381 13.3837L13.2684 14.5535C13.177 14.6006 13.1026 14.6751 13.0555 14.7666L11.8855 17.0363C11.7014 17.3935 11.1906 17.3935 11.0065 17.0363L9.83661 14.7666C9.78949 14.6751 9.71505 14.6006 9.62361 14.5535L7.35388 13.3837C6.99662 13.1995 6.99662 12.6887 7.35388 12.5046L9.62361 11.3347C9.71505 11.2875 9.78949 11.2131 9.83661 11.1217L11.0065 8.85192Z" fill="currentColor"/>
  </svg>
);

export const IconProfile = ({ className = "w-6 h-6", strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// --- SETTINGS & UI ---
export const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/></svg>
);

export const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm240-200q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/></svg>
);

export const IconCrown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="m233-120 65-280-165-125 204-6 63-209 63 209 204 6-165 125 65 280-187-140-187 140Z"/></svg>
);

export const IconLogout = () => (
   <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
);

export const IconPalette = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 18-2 35.5t-8 34.5l-68-66q6-31 6-77 0-111-73-191t-185-93v101l-160-56 94-142q-97 29-158.5 109T265-560h103l-149 149q51 98 143.5 164.5T600-166v84q-30 2-60 2Z"/></svg>
);

export const IconWeight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Z"/></svg>
);

export const IconTimer = () => (
   <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm40 320q-74 0-139.5-28.5T226-186q-49-49-77.5-114.5T120-440q0-74 28.5-139.5T226-694q49-49 114.5-77.5T480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80Zm0-80q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-280Z"/></svg>
);

export const IconSound = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" className={className}><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Z"/></svg>
);

export const IconSoundOff = ({ className }) => (
   <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" className={className}>
      <path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v168L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 103T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Z"/>
   </svg>
);

export const IconDiscord = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.46 13.46 0 0 0-.616 1.267 18.32 18.32 0 0 0-5.474 0 13.568 13.568 0 0 0-.619-1.267.077.077 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
);

export const IconInstagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
);

export const IconHeart = ({ className = "w-6 h-6", strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const IconDoc = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor"><path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520Z"/></svg>
);

export const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
);

// --- THEME ---
export const IconSun = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
  </svg>
);

export const IconMoon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
  </svg>
);

export const IconUserPlus = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" className={className}>
    <path d="M720-400v-120H600v-80h120v-120h80v120h120v80H800v120h-80Zm-360-80q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm80-80h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0-80Zm0 400Z"/>
  </svg>
);

export const IconCamera = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" className={className}>
    <path d="M480-320q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Zm0-80q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0 240q-83 0-156-31.5T197-277q-54-54-85.5-127T80-480q0-83 31.5-156T197-683q54-54 127-85.5T480-800q83 0 156 31.5T763-683q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-160Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
  </svg>
);

export const IconBell = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

// Añadir al final de Icons.jsx o junto a los otros
export const IconEye = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconEyeOff = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export const IconCheckCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

export const IconAlertTriangle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const IconCreditCard = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

export const IconCalendar = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export const IconDumbbell = ({ className }) => (
  <svg 
    viewBox="0 0 34 27" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M31.4527 4.11281L30.7965 4.49169L29.2809 1.86671C28.4451 0.419027 26.5881 -0.0785621 25.1404 0.757257C24.66 1.0346 24.2954 1.43061 24.0386 1.8799L23.8279 1.51503C22.9921 0.0673458 21.1351 -0.430244 19.6874 0.405575C18.2397 1.24139 17.7421 3.09842 18.5779 4.5461L21.609 9.79607L11.1091 15.8582L8.07799 10.6082C7.24217 9.16057 5.38514 8.66298 3.93746 9.4988C2.48978 10.3346 1.99219 12.1916 2.82801 13.6393L3.03867 14.0042C2.52115 14.002 1.99589 14.1197 1.51552 14.3971C0.0678384 15.2329 -0.42975 17.0899 0.406069 18.5376L1.92161 21.1626L1.26536 21.5415C0.90311 21.7506 0.778852 22.2144 0.987996 22.5766C1.19714 22.9389 1.66088 23.0631 2.02313 22.854L2.67937 22.4751L4.19491 25.1001C5.03073 26.5478 6.88776 27.0454 8.33544 26.2095C8.81581 25.9322 9.18042 25.5362 9.43727 25.0869L9.64793 25.4518C10.4837 26.8994 12.3408 27.397 13.7885 26.5612C15.2361 25.7254 15.7337 23.8684 14.8979 22.4207L11.8668 17.1707L22.3668 11.1086L25.3979 16.3585C26.2337 17.8062 28.0907 18.3038 29.5384 17.468C30.9861 16.6322 31.4836 14.7752 30.6478 13.3275L30.4372 12.9626C30.9547 12.9648 31.48 12.847 31.9603 12.5697C33.408 11.7339 33.9056 9.87686 33.0698 8.42918L31.5542 5.80419L32.2105 5.42531C32.5727 5.21616 32.697 4.75242 32.4878 4.39017C32.2787 4.02792 31.815 3.90367 31.4527 4.11281ZM7.57767 24.897C6.85448 25.3146 5.9257 25.0668 5.50741 24.3423L1.71856 17.7798C1.30027 17.0554 1.5501 16.1271 2.27329 15.7096C2.99647 15.2921 3.92526 15.5398 4.34355 16.2643L8.13239 22.8268C8.55068 23.5513 8.30085 24.4795 7.57767 24.897ZM13.5854 23.1785C14.0037 23.903 13.7539 24.8312 13.0307 25.2487C12.3075 25.6663 11.3787 25.4185 10.9604 24.694L4.14051 12.8816C3.72222 12.1571 3.97205 11.2288 4.69523 10.8113C5.41842 10.3938 6.3472 10.6415 6.76549 11.366L13.5854 23.1785ZM29.3353 14.0852C29.7536 14.8097 29.5038 15.738 28.7806 16.1555C28.0574 16.573 27.1286 16.3253 26.7103 15.6008L19.8904 3.78833C19.4721 3.06384 19.722 2.1356 20.4452 1.71807C21.1683 1.30054 22.0971 1.5483 22.5154 2.2728L29.3353 14.0852ZM31.7573 9.18695C32.1756 9.91144 31.9257 10.8397 31.2026 11.2572C30.4794 11.6747 29.5506 11.427 29.1323 10.7025L25.3435 4.14001C24.9252 3.41552 25.175 2.48728 25.8982 2.06975C26.6214 1.65222 27.5502 1.89998 27.9684 2.62448L31.7573 9.18695Z" 
      fill="currentColor"
    />
  </svg>
);

export const IconLoader = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const IconSparkles = ({ className }) => (
  <svg 
    viewBox="0 0 22 22" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M8.00001 3.5C8.16297 3.50003 8.32149 3.55315 8.45158 3.6513C8.58167 3.74945 8.67625 3.8873 8.72101 4.044L9.53401 6.89C9.70906 7.50292 10.0375 8.0611 10.4882 8.51183C10.9389 8.96255 11.4971 9.29095 12.11 9.466L14.956 10.279C15.1126 10.3239 15.2503 10.4185 15.3484 10.5486C15.4464 10.6786 15.4995 10.8371 15.4995 11C15.4995 11.1629 15.4464 11.3214 15.3484 11.4514C15.2503 11.5815 15.1126 11.6761 14.956 11.721L12.11 12.534C11.4971 12.709 10.9389 13.0374 10.4882 13.4882C10.0375 13.9389 9.70906 14.4971 9.53401 15.11L8.72101 17.956C8.67615 18.1126 8.58153 18.2503 8.45145 18.3484C8.32137 18.4464 8.1629 18.4995 8.00001 18.4995C7.83711 18.4995 7.67865 18.4464 7.54857 18.3484C7.41849 18.2503 7.32387 18.1126 7.27901 17.956L6.46601 15.11C6.29096 14.4971 5.96256 13.9389 5.51184 13.4882C5.06111 13.0374 4.50293 12.709 3.89001 12.534L1.04401 11.721C0.887414 11.6761 0.74968 11.5815 0.651631 11.4514C0.553583 11.3214 0.500549 11.1629 0.500549 11C0.500549 10.8371 0.553583 10.6786 0.651631 10.5486C0.74968 10.4185 0.887414 10.3239 1.04401 10.279L3.89001 9.466C4.50293 9.29095 5.06111 8.96255 5.51184 8.51183C5.96256 8.0611 6.29096 7.50292 6.46601 6.89L7.27901 4.044C7.32377 3.8873 7.41835 3.74945 7.54844 3.6513C7.67853 3.55315 7.83705 3.50003 8.00001 3.5ZM17 0.5C17.1673 0.499907 17.3299 0.555764 17.4618 0.658686C17.5937 0.761609 17.6874 0.905686 17.728 1.068L17.986 2.104C18.222 3.044 18.956 3.778 19.896 4.014L20.932 4.272C21.0946 4.31228 21.2391 4.40586 21.3423 4.5378C21.4456 4.66974 21.5017 4.83246 21.5017 5C21.5017 5.16754 21.4456 5.33026 21.3423 5.4622C21.2391 5.59414 21.0946 5.68772 20.932 5.728L19.896 5.986C18.956 6.222 18.222 6.956 17.986 7.896L17.728 8.932C17.6877 9.09463 17.5942 9.23908 17.4622 9.34233C17.3303 9.44558 17.1675 9.50168 17 9.50168C16.8325 9.50168 16.6698 9.44558 16.5378 9.34233C16.4059 9.23908 16.3123 9.09463 16.272 8.932L16.014 7.896C15.8986 7.43443 15.66 7.0129 15.3235 6.67648C14.9871 6.34005 14.5656 6.10139 14.104 5.986L13.068 5.728C12.9054 5.68772 12.7609 5.59414 12.6577 5.4622C12.5544 5.33026 12.4983 5.16754 12.4983 5C12.4983 4.83246 12.5544 4.66974 12.6577 4.5378C12.7609 4.40586 12.9054 4.31228 13.068 4.272L14.104 4.014C14.5656 3.89861 14.9871 3.65995 15.3235 3.32352C15.66 2.9871 15.8986 2.56557 16.014 2.104L16.272 1.068C16.3126 0.905686 16.4063 0.761609 16.5382 0.658686C16.6702 0.555764 16.8327 0.499907 17 0.5ZM15.5 14C15.6575 13.9999 15.8111 14.0494 15.9389 14.1415C16.0667 14.2336 16.1622 14.3636 16.212 14.513L16.606 15.696C16.756 16.143 17.106 16.495 17.554 16.644L18.737 17.039C18.886 17.089 19.0155 17.1845 19.1072 17.3121C19.199 17.4397 19.2483 17.5929 19.2483 17.75C19.2483 17.9071 19.199 18.0603 19.1072 18.1879C19.0155 18.3155 18.886 18.411 18.737 18.461L17.554 18.856C17.107 19.006 16.755 19.356 16.606 19.804L16.211 20.987C16.161 21.136 16.0655 21.2655 15.9379 21.3572C15.8103 21.4489 15.6571 21.4983 15.5 21.4983C15.3429 21.4983 15.1897 21.4489 15.0621 21.3572C14.9346 21.2655 14.839 21.136 14.789 20.987L14.394 19.804C14.3203 19.5833 14.1963 19.3827 14.0318 19.2182C13.8673 19.0537 13.6667 18.9297 13.446 18.856L12.263 18.461C12.114 18.411 11.9845 18.3155 11.8928 18.1879C11.8011 18.0603 11.7517 17.9071 11.7517 17.75C11.7517 17.5929 11.8011 17.4397 11.8928 17.3121C11.9845 17.1845 12.114 17.089 12.263 17.039L13.446 16.644C13.893 16.494 14.245 16.144 14.394 15.696L14.789 14.513C14.8387 14.3637 14.9341 14.2339 15.0617 14.1418C15.1893 14.0497 15.3427 14.0001 15.5 14Z" 
      fill="currentColor"
    />
  </svg>
);

export const IconPlus = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export const IconCheck = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconX = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const IconEdit = ({ className, strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

export const IconTarget = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const IconSearch = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const IconFilter = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const IconSearchNav = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// Icono de Seguir (Usuario +)
export const IconUserAdd = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" x2="20" y1="8" y2="14" />
    <line x1="23" x2="17" y1="11" y2="11" />
  </svg>
);

export const IconChevronUp = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

export const IconChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export const IconPlay = ({ className, fill = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export const IconDotsHorizontal = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

export const IconGrip = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 10h8" />
    <path d="M8 14h8" />
  </svg>
);



export const IconRotate = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
);

export const IconTrophy = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
    <path d="M17 4v5a3 3 0 0 0 3-3 3 3 0 0 0-3-2" />
    <path d="M7 4v5a3 3 0 0 1-3-3 3 3 0 0 1 3-2" />
  </svg>
);

export const IconAlertCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const IconUsers = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6" />
    <path d="M23 11h-6" />
  </svg>
);

export const IconInfo = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const IconMail = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    <rect width="20" height="16" x="2" y="4" rx="2" />
  </svg>
);


export const IconGlobe = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const IconNutrition = ({ className = "w-6 h-6", strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/>
    <path d="M10 2c1 .5 2 2 2 5"/>
  </svg>
);

export const IconScanBody = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 44 44" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M1.83301 29.833C2.56886 29.833 3.16699 30.4311 3.16699 31.167V34.833C3.16699 38.1415 5.85852 40.833 9.16699 40.833H12.833C13.5689 40.833 14.167 41.4311 14.167 42.167C14.1668 42.9027 13.5688 43.5 12.833 43.5H9.16699C4.38864 43.5 0.5 39.6114 0.5 34.833V31.167C0.5 30.4312 1.0973 29.8332 1.83301 29.833ZM42.167 29.833C42.9027 29.8332 43.5 30.4312 43.5 31.167V34.833C43.5 39.6114 39.6114 43.5 34.833 43.5H31.167C30.4312 43.5 29.8332 42.9027 29.833 42.167C29.833 41.4311 30.4311 40.833 31.167 40.833H34.833C38.1415 40.833 40.833 38.1415 40.833 34.833V31.167C40.833 30.4311 41.4311 29.833 42.167 29.833ZM9.16699 0.5H12.833C13.5688 0.5 14.1668 1.0973 14.167 1.83301C14.167 2.56887 13.5689 3.16699 12.833 3.16699H9.16699C5.85852 3.16699 3.16699 5.85852 3.16699 9.16699V12.833C3.16699 13.5689 2.56887 14.167 1.83301 14.167C1.0973 14.1668 0.5 13.5688 0.5 12.833V9.16699C0.5 4.38863 4.38863 0.5 9.16699 0.5ZM31.167 0.5H34.833C39.6114 0.5 43.5 4.38864 43.5 9.16699V12.833C43.5 13.5688 42.9027 14.1668 42.167 14.167C41.4311 14.167 40.833 13.5689 40.833 12.833V9.16699C40.833 5.85852 38.1415 3.16699 34.833 3.16699H31.167C30.4311 3.16699 29.833 2.56886 29.833 1.83301C29.8332 1.0973 30.4312 0.5 31.167 0.5Z" 
      fill="currentColor"
    />
    <path 
      d="M18.334 17.4167C18.334 18.3891 18.7203 19.3218 19.4079 20.0094C20.0956 20.697 21.0282 21.0833 22.0007 21.0833C22.9731 21.0833 23.9057 20.697 24.5934 20.0094C25.281 19.3218 25.6673 18.3891 25.6673 17.4167C25.6673 16.4442 25.281 15.5116 24.5934 14.8239C23.9057 14.1363 22.9731 13.75 22.0007 13.75C21.0282 13.75 20.0956 14.1363 19.4079 14.8239C18.7203 15.5116 18.334 16.4442 18.334 17.4167Z" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="1.5"
    />
    <path 
      d="M16.5 30.25V28.4167C16.5 27.4442 16.8863 26.5116 17.5739 25.8239C18.2616 25.1363 19.1942 24.75 20.1667 24.75H23.8333C24.8058 24.75 25.7384 25.1363 26.4261 25.8239C27.1137 26.5116 27.5 27.4442 27.5 28.4167V30.25" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="1.5"
    />
  </svg>
);
