export interface BuiltinIcon {
  id: string;
  name: string;
  category: 'office' | 'infra' | 'storage' | 'network' | 'monitoring' | 'media' | 'dev' | 'os' | 'smarthome' | 'general';
  tags: string[];
  color: string;
  svg: string;
}

export const BUILTIN_ICONS: BuiltinIcon[] = [
  // ==========================================
  // 0. CORPORATE, OFFICE & DOCUMENTS (Featured)
  // ==========================================
  {
    id: 'phone-directory',
    name: 'راهنمای تلفن و مخاطبین',
    category: 'office',
    tags: ['phone', 'directory', 'contacts', 'call', 'staff', 'office'],
    color: '#0284C7',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z"/><path d="M8 2v20"/><circle cx="14" cy="9" r="2.5"/><path d="M10.5 16a3.5 3.5 0 0 1 7 0"/><path d="M2 7h2"/><path d="M2 12h2"/><path d="M2 17h2"/></svg>`
  },
  {
    id: 'pdf-document',
    name: 'سند PDF و دستورالعمل',
    category: 'office',
    tags: ['pdf', 'document', 'guide', 'file', 'read'],
    color: '#DC2626',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/><path d="M7.5 13h2a1.5 1.5 0 0 1 0 3h-1v2h-1v-5zm1 2h1a.5.5 0 0 0 0-1h-1v1zm3.5-2h1.8a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5H12v-5zm1 4h.8a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5H13v3zm3.5-4h2.5v1h-1.5v1h1.2v1H16.5v2h-1v-5z"/></svg>`
  },
  {
    id: 'network-share-folder',
    name: 'پوشه اشتراک شبکه (SMB/UNC)',
    category: 'storage',
    tags: ['share', 'smb', 'cifs', 'network', 'folder', 'lan', 'storage'],
    color: '#4F46E5',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M12 11v6"/><path d="M9 14h6"/><circle cx="12" cy="14" r="1.5"/></svg>`
  },
  {
    id: 'office-automation',
    name: 'اتوماسیون اداری و نامه‌ها',
    category: 'office',
    tags: ['automation', 'erp', 'letters', 'office', 'workflow'],
    color: '#0D9488',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><circle cx="12" cy="14" r="2"/></svg>`
  },
  {
    id: 'attendance-hrm',
    name: 'حضور و غیاب و پرسنلی',
    category: 'office',
    tags: ['hrm', 'attendance', 'personnel', 'time', 'staff'],
    color: '#2563EB',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17a3.5 3.5 0 0 1 7 0"/><path d="M15 9h3"/><path d="M15 13h3"/><path d="M15 17h2"/></svg>`
  },
  {
    id: 'financial-accounting',
    name: 'سیستم مالی و حسابداری',
    category: 'office',
    tags: ['accounting', 'finance', 'money', 'ledger', 'tax'],
    color: '#16A34A',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/><circle cx="15" cy="15" r="2.5"/><path d="M15 13.5v3"/></svg>`
  },
  {
    id: 'it-helpdesk',
    name: 'پشتیبانی فنی و تیکتینگ',
    category: 'office',
    tags: ['support', 'helpdesk', 'ticket', 'it', 'service'],
    color: '#EA580C',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/><path d="M12 21a3 3 0 0 0 3-3"/></svg>`
  },
  {
    id: 'network-printer',
    name: 'پرینتر و اسکنر سازمانی',
    category: 'office',
    tags: ['printer', 'scanner', 'cups', 'print', 'hardware'],
    color: '#64748B',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/><circle cx="18" cy="12" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'cctv-camera',
    name: 'دوربین مداربسته و حراست',
    category: 'infra',
    tags: ['cctv', 'camera', 'security', 'nvr', 'video'],
    color: '#0891B2',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h12l4 4v5H3V7z"/><circle cx="9" cy="13" r="2.5"/><path d="M19 11l3-2v6l-3-2"/><path d="M7 7V3h4v4"/></svg>`
  },
  {
    id: 'cisco',
    name: 'Cisco Systems',
    category: 'network',
    tags: ['cisco', 'switch', 'router', 'network', 'ios'],
    color: '#1BA0D7',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="10" width="1.5" height="5" rx=".75"/><rect x="6.5" y="6" width="1.5" height="12" rx=".75"/><rect x="10" y="9" width="1.5" height="8" rx=".75"/><rect x="13.5" y="6" width="1.5" height="12" rx=".75"/><rect x="17" y="10" width="1.5" height="6" rx=".75"/><rect x="20.5" y="13" width="1.5" height="3" rx=".75"/></svg>`
  },
  {
    id: 'mikrotik',
    name: 'MikroTik RouterOS',
    category: 'network',
    tags: ['mikrotik', 'routeros', 'router', 'winbox'],
    color: '#000000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v7.5L12 7l4 4.5V4h4v16h-4v-7.5L12 17l-4-4.5V20H4V4z"/></svg>`
  },
  {
    id: 'linux-tux',
    name: 'Linux Tux Penguin',
    category: 'os',
    tags: ['linux', 'tux', 'kernel', 'gnu'],
    color: '#F59E0B',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2.2 0-3.8 1.8-3.8 4 0 .6.1 1.2.3 1.7C7.3 8.3 6 10 6 12c0 2 .8 3.8 2.2 4.9L7 20h10l-1.2-3.1C17.2 15.8 18 14 18 12c0-2-1.3-3.7-2.5-4.3.2-.5.3-1.1.3-1.7 0-2.2-1.6-4-3.8-4zm-1 3.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm2 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 7c.8 0 1.5.4 1.5 1s-.7 1-1.5 1-1.5-.4-1.5-1 .7-1 1.5-1zm0 4c2.2 0 4 2.2 4 5s-1.8 5-4 5-4-2.2-4-5 1.8-5 4-5z"/></svg>`
  },

  // ==========================================
  // 1. LINUX OS & DISTRIBUTIONS (20 icons)
  // ==========================================
  {
    id: 'ubuntu',
    name: 'Ubuntu',
    category: 'os',
    tags: ['linux', 'os', 'canonical', 'server'],
    color: '#E95420',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 1.622c4.62 0 8.378 3.758 8.378 8.378 0 1.944-.666 3.738-1.785 5.163l-2.072-1.196a5.962 5.962 0 0 0 .857-3.967c0-2.316-1.31-4.323-3.235-5.3l1.197-2.072c1.78 1.157 3.064 2.99 3.616 5.158A8.344 8.344 0 0 0 12 3.622zM4.606 6.837a8.343 8.343 0 0 1 5.158-3.616l1.197 2.072a5.98 5.98 0 0 0-3.235 5.3c0 1.488.544 2.85 1.45 3.9l-2.072 1.197A8.328 8.328 0 0 1 4.606 6.837zM4.779 17.163A8.34 8.34 0 0 1 3.622 12c0-1.944.666-3.738 1.785-5.163l2.072 1.196a5.962 5.962 0 0 0-.857 3.967c0 2.316 1.31 4.323 3.235 5.3l-1.197 2.072c-1.78-1.157-3.064-2.99-3.616-5.158a8.344 8.344 0 0 0 1.735 2.949z"/></svg>`
  },
  {
    id: 'debian',
    name: 'Debian',
    category: 'os',
    tags: ['linux', 'os', 'server', 'distro'],
    color: '#D70A53',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1.6 4.3c2.4.3 4.4 2.1 4.8 4.6.4 2.6-.9 5.1-3.2 6.2-2.3 1.1-5.1.5-6.8-1.5-.7-.8-1.2-1.8-1.4-2.8-.2-1.2.1-2.4.8-3.4.6-.9 1.5-1.5 2.6-1.8 1.1-.3 2.3-.1 3.2.7z"/></svg>`
  },
  {
    id: 'arch',
    name: 'Arch Linux',
    category: 'os',
    tags: ['linux', 'rolling', 'pacman'],
    color: '#1793D1',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5L2 21.5h4.2l2.3-4.5c.6.4 1.7.9 3.5.9 1.7 0 2.9-.5 3.5-.9l2.3 4.5H22L12 2.5zm0 5.8l2.9 6.2c-1.1-.4-2-.5-2.9-.5s-1.8.1-2.9.5L12 8.3z"/></svg>`
  },
  {
    id: 'fedora',
    name: 'Fedora',
    category: 'os',
    tags: ['linux', 'redhat', 'rpm'],
    color: '#51A2DA',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 7h-2.5A1.5 1.5 0 0 0 12 10.5V12h3v2h-3v5h-2v-5H8v-2h2v-1.5A3.5 3.5 0 0 1 13.5 7H16z"/></svg>`
  },
  {
    id: 'alpine',
    name: 'Alpine Linux',
    category: 'os',
    tags: ['linux', 'docker', 'lightweight', 'musl'],
    color: '#0D597F',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 4.5l-8 14.5h5.5l5.2-9.5 2.8 5.2-2.5 4.3h5.5l-8.5-14.5z"/></svg>`
  },
  {
    id: 'redhat',
    name: 'Red Hat Enterprise (RHEL)',
    category: 'os',
    tags: ['rhel', 'enterprise', 'linux', 'rpm'],
    color: '#EE0000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 12.5c-.8 1.4-2.7 2.5-5 2.5-3.3 0-6-2.2-6-5 0-1.8 1.2-3.4 3-4.2l1.2 2c-1.3.6-2.2 1.6-2.2 2.8 0 1.9 2.2 3.5 5 3.5 1.5 0 2.8-.5 3.6-1.4l.4-.2z"/></svg>`
  },
  {
    id: 'rocky',
    name: 'Rocky Linux',
    category: 'os',
    tags: ['rocky', 'centos', 'enterprise', 'rhel'],
    color: '#10B981',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-5l4.5 2.5-4.5 2.5z"/></svg>`
  },
  {
    id: 'alma',
    name: 'AlmaLinux',
    category: 'os',
    tags: ['alma', 'centos', 'server', 'linux'],
    color: '#FF6B4A',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>`
  },
  {
    id: 'suse',
    name: 'openSUSE',
    category: 'os',
    tags: ['suse', 'geeko', 'leap', 'tumbleweed'],
    color: '#73BA25',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c2.21 0 4 1.79 4 4 0 1.2-.53 2.27-1.36 3-.73-.55-1.64-.88-2.64-.88s-1.91.33-2.64.88A3.987 3.987 0 0 1 8 10c0-2.21 1.79-4 4-4z"/></svg>`
  },
  {
    id: 'freebsd',
    name: 'FreeBSD',
    category: 'os',
    tags: ['bsd', 'unix', 'daemon', 'zfs'],
    color: '#AB2B28',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 13.5l-2-2.5L12 10.5 8.5 7h3l3.5 5-3.5 5h-3z"/></svg>`
  },
  {
    id: 'windows-server',
    name: 'Windows Server',
    category: 'os',
    tags: ['windows', 'microsoft', 'ad', 'rdp'],
    color: '#0078D4',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 3.5l8-1.1v9.1H2V3.5zm9 8V2.3l11-1.5v10.7H11zm0 1.5h11v10.7l-11-1.5V13zm-9 0h8v9.1l-8-1.1V13z"/></svg>`
  },
  {
    id: 'macos',
    name: 'macOS Server',
    category: 'os',
    tags: ['apple', 'mac', 'darwin'],
    color: '#999999',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.63-2.67 1.38-.56.64-1.05 1.7-0.92 2.74 1.05.08 2.06-.54 2.67-1.25z"/></svg>`
  },
  {
    id: 'raspberry-pi',
    name: 'Raspberry Pi OS',
    category: 'os',
    tags: ['arm', 'sbc', 'iot', 'raspbian'],
    color: '#C51A4A',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a3 3 0 0 0-2.8 2 3 3 0 0 0-3 2.7 3 3 0 0 0-.2 4.3 4 4 0 0 0 1.5 7 4 4 0 0 0 4.5 3.9 4 4 0 0 0 4.5-3.9 4 4 0 0 0 1.5-7 3 3 0 0 0-.2-4.3 3 3 0 0 0-3-2.7A3 3 0 0 0 12 2zm-1 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>`
  },
  {
    id: 'gentoo',
    name: 'Gentoo Linux',
    category: 'os',
    tags: ['gentoo', 'compile', 'portage'],
    color: '#54487A',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 13h-6v-2h6v2zm0-4h-6V9h6v2z"/></svg>`
  },
  {
    id: 'nixos',
    name: 'NixOS',
    category: 'os',
    tags: ['nix', 'declarative', 'reproducible'],
    color: '#5277C3',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l4.5 7.8-4.5 2.6-4.5-2.6L12 2zm0 19.6l-4.5-7.8 4.5-2.6 4.5 2.6L12 21.6zM2 12l7.8 4.5-2.6-4.5-2.6-4.5L2 12zm20 0l-7.8-4.5 2.6 4.5 2.6 4.5L22 12z"/></svg>`
  },
  {
    id: 'manjaro',
    name: 'Manjaro Linux',
    category: 'os',
    tags: ['manjaro', 'arch', 'rolling'],
    color: '#35BF5C',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 2h5.5v20H2V2zm7 0h5.5v9H9V2zm7 0H22v20h-6V2zm-7 11h5.5v9H9v-9z"/></svg>`
  },
  {
    id: 'centos',
    name: 'CentOS Stream',
    category: 'os',
    tags: ['centos', 'redhat', 'rhel'],
    color: '#93227F',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.5L18 8v8l-6 3.5L6 16V8l6-3.5zm-1 4.5v3H8v2h3v3h2v-3h3v-2h-3V9h-2z"/></svg>`
  },
  {
    id: 'kali',
    name: 'Kali Linux',
    category: 'os',
    tags: ['kali', 'security', 'pentest', 'offensive'],
    color: '#557C94',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.5 7.5L12 14.5l-4.5-5 1.5-1.5L12 11.5l3-3.5 1.5 1.5z"/></svg>`
  },
  {
    id: 'tails',
    name: 'Tails OS',
    category: 'os',
    tags: ['privacy', 'tor', 'amnesic', 'anonymous'],
    color: '#563D7C',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v-6h-2v6zm0-8h2V6h-2v2z"/></svg>`
  },
  {
    id: 'void',
    name: 'Void Linux',
    category: 'os',
    tags: ['void', 'xbps', 'runit'],
    color: '#47806D',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a7 7 0 1 1-7 7 7 7 0 0 1 7-7zm0 3a4 4 0 1 0 4 4 4 4 0 0 0-4-4z"/></svg>`
  },

  // ==========================================
  // 2. INFRASTRUCTURE & VIRTUALIZATION (18 icons)
  // ==========================================
  {
    id: 'proxmox',
    name: 'Proxmox VE',
    category: 'infra',
    tags: ['virtualization', 'pve', 'kvm', 'lxc', 'hypervisor'],
    color: '#E57000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.3l6.7 3.7L12 11.7 5.3 8 12 4.3zM4.8 9.5l6.4 3.5v7.2L4.8 16.7V9.5zm14.4 7.2l-6.4 3.5v-7.2l6.4-3.5v7.2z"/></svg>`
  },
  {
    id: 'docker',
    name: 'Docker Engine',
    category: 'infra',
    tags: ['containers', 'compose', 'engine'],
    color: '#2496ED',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.186V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.186V9.006a.185.185 0 00-.184-.186H8.1a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.186V9.006a.185.185 0 00-.185-.186H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.186V9.006a.185.185 0 00-.185-.186H2.208a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185M23.6 11.233c-.352-.257-.96-.407-1.748-.407-.153 0-.315.006-.48.02a4.417 4.417 0 00-2.336-1.576l-.41-.12-.258.344a5.056 5.056 0 00-.814 1.83 5.485 5.485 0 00-3.076-1.127H1.38A1.381 1.381 0 000 11.577c0 .484.12 1.25.38 2.054A11.378 11.378 0 003.54 18.06c2.42 2.378 5.762 3.633 9.41 3.633 7.854 0 10.87-5.467 10.978-5.674l.178-.344a.276.276 0 00-.012-.275.29.29 0 00-.246-.145c-.247-.008-.475-.02-.682-.045.244-.226.47-.468.67-.723l.23-.292-.284-.24a3.86 3.86 0 00-.18-.162"/></svg>`
  },
  {
    id: 'portainer',
    name: 'Portainer',
    category: 'infra',
    tags: ['containers', 'docker', 'stacks', 'ui'],
    color: '#13BEF9',
    svg: `<svg viewBox="1 1 22 22" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 14.5h-7a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5zm-5-6h3v1h-3zm0 2h3v1h-3zm0 2h3v1h-3z"/></svg>`
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes (K8s)',
    category: 'infra',
    tags: ['k8s', 'orchestration', 'cluster'],
    color: '#326CE5',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5L2.8 5.8v10.6L12 21.7l9.2-5.3V5.8L12 .5zm0 2.2l6.9 4v8L12 18.7l-6.9-4V6.7l6.9-4zm-1 3.8v3.1l-2.7-1.6-.9 1.6 2.7 1.6-2.7 1.6.9 1.6 2.7-1.6v3.1h1.9v-3.1l2.7 1.6.9-1.6-2.7-1.6 2.7-1.6-.9-1.6-2.7 1.6V6.5H11z"/></svg>`
  },
  {
    id: 'podman',
    name: 'Podman',
    category: 'infra',
    tags: ['containers', 'rootless', 'oci'],
    color: '#892CA0',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2 15l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z"/></svg>`
  },
  {
    id: 'unraid',
    name: 'Unraid OS',
    category: 'infra',
    tags: ['nas', 'array', 'vms'],
    color: '#F15A24',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 4h3v16h-3zm5.3 0h3v16h-3zm5.4 0h3v16h-3zm5.3 0h3v16h-3z"/></svg>`
  },
  {
    id: 'vmware',
    name: 'VMware ESXi / vSphere',
    category: 'infra',
    tags: ['vmware', 'esxi', 'vsphere', 'virtualization'],
    color: '#607D8B',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'xenserver',
    name: 'XCP-ng / XenServer',
    category: 'infra',
    tags: ['xcp-ng', 'xen', 'vms', 'hypervisor'],
    color: '#00857C',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3z"/></svg>`
  },
  {
    id: 'ansible',
    name: 'Ansible Semaphore',
    category: 'infra',
    tags: ['ansible', 'automation', 'devops', 'playbook'],
    color: '#EE0000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'terraform',
    name: 'Terraform Cloud',
    category: 'infra',
    tags: ['iac', 'hashicorp', 'cloud'],
    color: '#7B42BC',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7.5v9L12 22l9-5.5v-9L12 2zm-4.5 8.2l3.5 2.1v4.3L7.5 14.5v-4.3zm4.5 6.4v-4.3l3.5-2.1v4.3l-3.5 2.1zm0-6.4L8.5 8.1l3.5-2.1 3.5 2.1-3.5 2.1z"/></svg>`
  },
  {
    id: 'rancher',
    name: 'Rancher K8s',
    category: 'infra',
    tags: ['kubernetes', 'cluster', 'management'],
    color: '#0075A8',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14.5h-2v-2h2zm0-4h-2V7h2z"/></svg>`
  },
  {
    id: 'nomad',
    name: 'HashiCorp Nomad',
    category: 'infra',
    tags: ['nomad', 'orchestrator', 'hashicorp'],
    color: '#00CA8E',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 3.3L18 8v8l-6 3-6-3V8l6-2.7z"/></svg>`
  },
  {
    id: 'openstack',
    name: 'OpenStack',
    category: 'infra',
    tags: ['cloud', 'iaas', 'compute'],
    color: '#ED1944',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11H8v-2h8v2z"/></svg>`
  },
  {
    id: 'aws',
    name: 'Amazon Web Services (AWS)',
    category: 'infra',
    tags: ['aws', 'cloud', 'ec2', 's3'],
    color: '#FF9900',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-4 13h8v-2H8v2zm0-4h8V9H8v2z"/></svg>`
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud Platform (GCP)',
    category: 'infra',
    tags: ['gcp', 'google', 'cloud', 'gke'],
    color: '#4285F4',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    category: 'infra',
    tags: ['azure', 'microsoft', 'cloud', 'vm'],
    color: '#0089D6',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 8v8l9 6 9-6V8l-9-6zm-1 14H8l5-10h3l-5 10z"/></svg>`
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: 'infra',
    tags: ['cloudflare', 'cdn', 'dns', 'waf'],
    color: '#F38020',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    category: 'infra',
    tags: ['vps', 'droplet', 'cloud'],
    color: '#0080FF',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-10 10h4a6 6 0 1 1 6 6v4a10 10 0 0 0 0-20z"/></svg>`
  },

  // ==========================================
  // 3. MONITORING & OBSERVABILITY (16 icons)
  // ==========================================
  {
    id: 'grafana',
    name: 'Grafana',
    category: 'monitoring',
    tags: ['dashboards', 'metrics', 'observability'],
    color: '#F46800',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1.8 15.6a6.8 6.8 0 1 1 6.8-6.8 6.8 6.8 0 0 1-6.8 6.8zm2.9-9.7a4.1 4.1 0 0 0-5.8 5.8 4.1 4.1 0 0 0 5.8-5.8z"/></svg>`
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    category: 'monitoring',
    tags: ['metrics', 'alertmanager', 'timeseries'],
    color: '#E6522C',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3.5c1.8 0 3.3 1.5 3.3 3.3S13.8 12 12 12 8.7 10.5 8.7 8.8 10.2 5.5 12 5.5zm4 11.5H8v-2h8v2z"/></svg>`
  },
  {
    id: 'uptime-kuma',
    name: 'Uptime Kuma',
    category: 'monitoring',
    tags: ['uptime', 'status', 'ping', 'monitoring'],
    color: '#5CDD8B',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 15l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z"/></svg>`
  },
  {
    id: 'zabbix',
    name: 'Zabbix Enterprise',
    category: 'monitoring',
    tags: ['zabbix', 'snmp', 'agent', 'network'],
    color: '#D40000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 19.5h20L12 2zm0 4.5l6.5 11h-13L12 6.5zm-1 7h2v2h-2zm0-4h2v3h-2z"/></svg>`
  },
  {
    id: 'netdata',
    name: 'Netdata',
    category: 'monitoring',
    tags: ['realtime', 'telemetry', 'charts'],
    color: '#00AB44',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3z"/></svg>`
  },
  {
    id: 'datadog',
    name: 'Datadog APM',
    category: 'monitoring',
    tags: ['datadog', 'apm', 'logs', 'metrics'],
    color: '#632CA6',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14H8v-2h3v2zm5-4H8v-2h8v2z"/></svg>`
  },
  {
    id: 'elastic',
    name: 'Elasticsearch & Kibana',
    category: 'monitoring',
    tags: ['elk', 'logs', 'search', 'elastic'],
    color: '#005571',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6z"/></svg>`
  },
  {
    id: 'influxdb',
    name: 'InfluxDB',
    category: 'monitoring',
    tags: ['timeseries', 'metrics', 'iot'],
    color: '#22ADF6',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'loki',
    name: 'Grafana Loki',
    category: 'monitoring',
    tags: ['logs', 'promtail', 'aggregation'],
    color: '#F47B20',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'telegraf',
    name: 'Telegraf Collector',
    category: 'monitoring',
    tags: ['agent', 'collector', 'metrics'],
    color: '#00838F',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11H8v-2h8v2z"/></svg>`
  },
  {
    id: 'speedtest',
    name: 'Speedtest Tracker',
    category: 'monitoring',
    tags: ['bandwidth', 'speedtest', 'isp', 'latency'],
    color: '#14B8A6',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 2a6 6 0 0 1 5.66 4H6.34A6 6 0 0 1 12 6zm-1 5h2v4h-2z"/></svg>`
  },
  {
    id: 'glances',
    name: 'Glances System Monitor',
    category: 'monitoring',
    tags: ['cpu', 'ram', 'top', 'htop'],
    color: '#0288D1',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 14h-7v-2h7v2zm0-4h-7v-2h7v2z"/></svg>`
  },
  {
    id: 'cockpit',
    name: 'Cockpit Linux Manager',
    category: 'monitoring',
    tags: ['cockpit', 'redhat', 'web-admin', 'terminal'],
    color: '#005F9E',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'nagios',
    name: 'Nagios Core',
    category: 'monitoring',
    tags: ['nagios', 'snmp', 'alerts'],
    color: '#008000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3v2zm5-4H8v-2h8v2z"/></svg>`
  },
  {
    id: 'jaeger',
    name: 'Jaeger Tracing',
    category: 'monitoring',
    tags: ['opentelemetry', 'tracing', 'apm'],
    color: '#60D0E4',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3z"/></svg>`
  },
  {
    id: 'statuspage',
    name: 'Public Status Page',
    category: 'monitoring',
    tags: ['status', 'incident', 'sla'],
    color: '#10B981',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2 15l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z"/></svg>`
  },

  // ==========================================
  // 4. STORAGE & NETWORK FILES (15 icons)
  // ==========================================
  {
    id: 'nextcloud',
    name: 'Nextcloud Hub',
    category: 'storage',
    tags: ['cloud', 'files', 'sync', 'webdav'],
    color: '#0082C9',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 6a6 6 0 0 0-5.8 4.5A4.5 4.5 0 0 0 2 15a4.5 4.5 0 0 0 4.5 4.5h11A4.5 4.5 0 0 0 22 15a4.5 4.5 0 0 0-4.2-4.5A6 6 0 0 0 12 6zm0 2.5a3.5 3.5 0 0 1 3.4 2.7 3 3 0 0 1 3.1 3 3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3 3 3 0 0 1 3-3 3.5 3.5 0 0 1 3.5-2.7z"/></svg>`
  },
  {
    id: 'truenas',
    name: 'TrueNAS Scale',
    category: 'storage',
    tags: ['nas', 'storage', 'zfs', 'freebsd', 'scale'],
    color: '#0095D5',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8v8l10 6 10-6V8L12 2zm0 2.8l7.5 4.5v6.4L12 20.2l-7.5-4.5V9.3L12 4.8zm-2 4.2v6h4v-6h-4z"/></svg>`
  },
  {
    id: 'synology',
    name: 'Synology DSM',
    category: 'storage',
    tags: ['nas', 'dsm', 'storage'],
    color: '#2C3E50',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3v2zm5-4H8v-2h8v2zm0-4H8V6h8v2z"/></svg>`
  },
  {
    id: 'qnap',
    name: 'QNAP QTS',
    category: 'storage',
    tags: ['nas', 'qnap', 'storage'],
    color: '#00539B',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3z"/></svg>`
  },
  {
    id: 'minio',
    name: 'MinIO S3 Storage',
    category: 'storage',
    tags: ['s3', 'bucket', 'object-storage'],
    color: '#C72C48',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'ceph',
    name: 'Ceph Storage Cluster',
    category: 'storage',
    tags: ['ceph', 'distributed', 'block', 'rbd'],
    color: '#E53E3E',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14H8v-2h3v2zm5-4H8v-2h8v2z"/></svg>`
  },
  {
    id: 'samba',
    name: 'Samba / SMB Network Share',
    category: 'storage',
    tags: ['smb', 'cifs', 'windows', 'shares', 'lan'],
    color: '#8B5CF6',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`
  },
  {
    id: 'paperless',
    name: 'Paperless-ngx (DMS)',
    category: 'storage',
    tags: ['documents', 'ocr', 'scanner', 'pdf', 'archive'],
    color: '#2563EB',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`
  },
  {
    id: 'immich',
    name: 'Immich Photos',
    category: 'storage',
    tags: ['photos', 'backup', 'gallery', 'ai'],
    color: '#4255FF',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 13.5l-2-2.5L12 10.5 8.5 7h3l3.5 5-3.5 5h-3z"/></svg>`
  },
  {
    id: 'photoprism',
    name: 'PhotoPrism',
    category: 'storage',
    tags: ['photos', 'ai', 'faces', 'gallery'],
    color: '#6366F1',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c2.21 0 4 1.79 4 4 0 1.2-.53 2.27-1.36 3-.73-.55-1.64-.88-2.64-.88s-1.91.33-2.64.88A3.987 3.987 0 0 1 8 10c0-2.21 1.79-4 4-4z"/></svg>`
  },
  {
    id: 'seafile',
    name: 'Seafile Sync',
    category: 'storage',
    tags: ['sync', 'cloud', 'drive'],
    color: '#FF6F00',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11H8v-2h8v2z"/></svg>`
  },
  {
    id: 'rclone',
    name: 'Rclone WebUI',
    category: 'storage',
    tags: ['sync', 'cloud', 'backup', 'cli'],
    color: '#0288D1',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'duplicati',
    name: 'Duplicati Backup',
    category: 'storage',
    tags: ['backup', 'encrypted', 's3'],
    color: '#009688',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H8v-2h3v2zm5-4H8v-2h8v2z"/></svg>`
  },
  {
    id: 'borg',
    name: 'Borgmatic Backup',
    category: 'storage',
    tags: ['borg', 'dedup', 'cli'],
    color: '#455A64',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'restic',
    name: 'Restic Snapshot',
    category: 'storage',
    tags: ['restic', 'encrypted', 'snapshots'],
    color: '#37474F',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14.5h-2v-2h2zm0-4h-2V7h2z"/></svg>`
  },

  // ==========================================
  // 5. MEDIA & STREAMING (15 icons)
  // ==========================================
  {
    id: 'jellyfin',
    name: 'Jellyfin Media Server',
    category: 'media',
    tags: ['media', 'streaming', 'movies', 'music', 'tv'],
    color: '#AA5CC3',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2 14.5v-9l7 4.5-7 4.5z"/></svg>`
  },
  {
    id: 'plex',
    name: 'Plex Media Server',
    category: 'media',
    tags: ['plex', 'movies', 'transcode'],
    color: '#E5A00D',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm3.5 10l-5 5V7l5 5z"/></svg>`
  },
  {
    id: 'emby',
    name: 'Emby Server',
    category: 'media',
    tags: ['emby', 'streaming', 'dlna'],
    color: '#52B54B',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>`
  },
  {
    id: 'sonarr',
    name: 'Sonarr (TV Automation)',
    category: 'media',
    tags: ['tv', 'shows', 'automation', 'download'],
    color: '#00C4FF',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-4h2zm0-6h-2V8h2z"/></svg>`
  },
  {
    id: 'radarr',
    name: 'Radarr (Movies Automation)',
    category: 'media',
    tags: ['movies', 'automation', 'download'],
    color: '#FFC230',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3.5a6.5 6.5 0 1 1-6.5 6.5A6.5 6.5 0 0 1 12 5.5z"/></svg>`
  },
  {
    id: 'lidarr',
    name: 'Lidarr (Music Automation)',
    category: 'media',
    tags: ['music', 'flac', 'albums'],
    color: '#00BFA5',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6z"/></svg>`
  },
  {
    id: 'prowlarr',
    name: 'Prowlarr (Indexer Manager)',
    category: 'media',
    tags: ['indexers', 'torznab', 'usenet'],
    color: '#EC407A',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'qbittorrent',
    name: 'qBittorrent',
    category: 'media',
    tags: ['torrent', 'p2p', 'download'],
    color: '#2F6799',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 13.5l-4-4h2.5V8h3v3.5H17l-4 4z"/></svg>`
  },
  {
    id: 'transmission',
    name: 'Transmission BT',
    category: 'media',
    tags: ['torrent', 'bt', 'daemon'],
    color: '#D42428',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3z"/></svg>`
  },
  {
    id: 'navidrome',
    name: 'Navidrome Music',
    category: 'media',
    tags: ['music', 'subsonic', 'audio', 'streaming'],
    color: '#008080',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`
  },
  {
    id: 'audiobookshelf',
    name: 'Audiobookshelf',
    category: 'media',
    tags: ['audiobooks', 'podcasts', 'ebooks'],
    color: '#935323',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>`
  },
  {
    id: 'deluge',
    name: 'Deluge Torrent',
    category: 'media',
    tags: ['torrent', 'p2p', 'deluge'],
    color: '#3498DB',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'sabnzbd',
    name: 'SABnzbd Usenet',
    category: 'media',
    tags: ['usenet', 'nntp', 'nzb'],
    color: '#F39C12',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'bazarr',
    name: 'Bazarr Subtitles',
    category: 'media',
    tags: ['subtitles', 'srt', 'automation'],
    color: '#7D4CDB',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11H8v-2h8v2z"/></svg>`
  },
  {
    id: 'spotify',
    name: 'Spotify Connect / Raspotify',
    category: 'media',
    tags: ['audio', 'music', 'spotify', 'airplay'],
    color: '#1DB954',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.4 2 2 6.4 2 12s4.4 10 10 10 10-4.4 10-10S17.6 2 12 2zm4.5 14.5c-.2.3-.5.4-.8.2-2.3-1.4-5.2-1.7-8.6-.9-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 3.8-.9 7-.5 9.5 1.1.4.2.4.6.2.9zm1.2-2.7c-.2.4-.7.5-1.1.2-2.6-1.6-6.6-2.1-9.7-1.1-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.6-1.1 7.9-.6 11 1.3.4.2.5.7.3 1.1zm.1-2.8C14.7 9.2 9.5 9 6.5 9.9c-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 3.6-1.1 9.3-.9 12.8 1.2.5.3.6.9.3 1.4-.3.5-.9.6-1.2.3z"/></svg>`
  },

  // ==========================================
  // 6. NETWORKING, VPN & SECURITY (18 icons)
  // ==========================================
  {
    id: 'pihole',
    name: 'Pi-hole DNS',
    category: 'network',
    tags: ['dns', 'adblock', 'privacy', 'dhcp'],
    color: '#F60D1A',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>`
  },
  {
    id: 'adguard',
    name: 'AdGuard Home',
    category: 'network',
    tags: ['dns', 'adblock', 'doh', 'dot'],
    color: '#68BC71',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm-2 15l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z"/></svg>`
  },
  {
    id: 'wireguard',
    name: 'WireGuard Gateway',
    category: 'network',
    tags: ['vpn', 'tunnel', 'crypto', 'mesh'],
    color: '#88171A',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'tailscale',
    name: 'Tailscale Mesh VPN',
    category: 'network',
    tags: ['vpn', 'mesh', 'derp', 'zerotier'],
    color: '#111827',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'zerotier',
    name: 'ZeroTier One',
    category: 'network',
    tags: ['sdn', 'vpn', 'p2p'],
    color: '#FFB800',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c2.21 0 4 1.79 4 4 0 1.2-.53 2.27-1.36 3-.73-.55-1.64-.88-2.64-.88s-1.91.33-2.64.88A3.987 3.987 0 0 1 8 10c0-2.21 1.79-4 4-4z"/></svg>`
  },
  {
    id: 'openvpn',
    name: 'OpenVPN Access Server',
    category: 'network',
    tags: ['vpn', 'ssl', 'gateway'],
    color: '#EA7E20',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14H8v-2h3v2zm5-4H8v-2h8v2z"/></svg>`
  },
  {
    id: 'pfsense',
    name: 'pfSense Firewall',
    category: 'network',
    tags: ['firewall', 'router', 'bsd', 'nat', 'dhcp'],
    color: '#005792',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5l7 3.5v7l-7 3.5-7-3.5v-7l7-3.5z"/></svg>`
  },
  {
    id: 'opnsense',
    name: 'OPNsense Firewall',
    category: 'network',
    tags: ['firewall', 'router', 'hardenedbsd', 'ids'],
    color: '#D94326',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14.5v-5l4.5 2.5-4.5 2.5z"/></svg>`
  },
  {
    id: 'nginx-pm',
    name: 'Nginx Proxy Manager',
    category: 'network',
    tags: ['proxy', 'ssl', 'reverse-proxy', 'letsencrypt'],
    color: '#F15A24',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3z"/></svg>`
  },
  {
    id: 'traefik',
    name: 'Traefik Proxy',
    category: 'network',
    tags: ['traefik', 'edge', 'docker', 'proxy'],
    color: '#24A1C1',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'caddy',
    name: 'Caddy Web Server',
    category: 'network',
    tags: ['caddy', 'https', 'tls', 'web'],
    color: '#1F88C0',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'haproxy',
    name: 'HAProxy Load Balancer',
    category: 'network',
    tags: ['loadbalancer', 'ha', 'proxy'],
    color: '#005571',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6z"/></svg>`
  },
  {
    id: 'vaultwarden',
    name: 'Vaultwarden / Bitwarden',
    category: 'network',
    tags: ['passwords', 'security', 'vault', '2fa'],
    color: '#175DDC',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`
  },
  {
    id: 'authelia',
    name: 'Authelia 2FA / SSO',
    category: 'network',
    tags: ['sso', '2fa', 'ldap', 'auth'],
    color: '#2A2F45',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2 15l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z"/></svg>`
  },
  {
    id: 'authentik',
    name: 'Authentik Identity Provider',
    category: 'network',
    tags: ['identity', 'saml', 'oidc', 'oauth2'],
    color: '#FD4B2D',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-5l4.5 2.5-4.5 2.5z"/></svg>`
  },
  {
    id: 'keycloak',
    name: 'Keycloak SSO Server',
    category: 'network',
    tags: ['keycloak', 'iam', 'sso', 'oidc'],
    color: '#0084B4',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'cloudflare-tunnel',
    name: 'Cloudflare Tunnel (cloudflared)',
    category: 'network',
    tags: ['tunnel', 'zerotrust', 'ingress'],
    color: '#F38020',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`
  },
  {
    id: 'crowdsec',
    name: 'CrowdSec IPS / WAF',
    category: 'network',
    tags: ['ips', 'waf', 'firewall', 'fail2ban'],
    color: '#1E1E24',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm-2 15l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z"/></svg>`
  },

  // ==========================================
  // 7. DEVELOPMENT, DATABASES & CICD (16 icons)
  // ==========================================
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'dev',
    tags: ['git', 'cicd', 'devops', 'repo'],
    color: '#FC6D26',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.6 9.8l-1.3-4.1a.9.9 0 0 0-1.6 0l-1.3 4.1H4.6L3.3 5.7a.9.9 0 0 0-1.6 0L.4 9.8a1.2 1.2 0 0 0 .4 1.3L12 22.8 23.2 11a1.2 1.2 0 0 0 .4-1.2z"/></svg>`
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'dev',
    tags: ['git', 'code', 'open-source'],
    color: '#24292E',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>`
  },
  {
    id: 'gitea',
    name: 'Gitea / Forgejo',
    category: 'dev',
    tags: ['git', 'selfhosted', 'lightweight'],
    color: '#609926',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-5l4.5 2.5-4.5 2.5z"/></svg>`
  },
  {
    id: 'vscode',
    name: 'VS Code / Code-Server',
    category: 'dev',
    tags: ['ide', 'editor', 'code-server'],
    color: '#007ACC',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 2.3l-9.8 8.8-4.5-3.4L2 8.7l5.3 4.3L2 17.3l1.3 1 4.5-3.4 9.8 8.8L22 21.7V4.3L17.6 2.3zm.4 16.4l-7-5.7 7-5.7v11.4z"/></svg>`
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL Database',
    category: 'dev',
    tags: ['database', 'sql', 'rdbms'],
    color: '#4169E1',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6z"/></svg>`
  },
  {
    id: 'mysql',
    name: 'MySQL / MariaDB',
    category: 'dev',
    tags: ['database', 'mariadb', 'sql'],
    color: '#00758F',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14H8v-2h3v2zm5-4H8v-2h8v2z"/></svg>`
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'dev',
    tags: ['nosql', 'document', 'database'],
    color: '#47A248',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c2.5 4 4.5 7 4.5 9.5 0 2.5-2 4.5-4.5 4.5s-4.5-2-4.5-4.5C7.5 12 9.5 9 12 5z"/></svg>`
  },
  {
    id: 'redis',
    name: 'Redis Cache & Store',
    category: 'dev',
    tags: ['cache', 'in-memory', 'kv', 'database'],
    color: '#DC382D',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 3.3L18 8v8l-6 3-6-3V8l6-2.7z"/></svg>`
  },
  {
    id: 'sqlite',
    name: 'SQLite Database',
    category: 'dev',
    tags: ['sqlite', 'embedded', 'sql'],
    color: '#003B57',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14H8v-2h3v2zm5-4H8v-2h8v2z"/></svg>`
  },
  {
    id: 'rabbitmq',
    name: 'RabbitMQ Message Broker',
    category: 'dev',
    tags: ['amqp', 'queues', 'messaging'],
    color: '#FF6600',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'kafka',
    name: 'Apache Kafka',
    category: 'dev',
    tags: ['streaming', 'events', 'pubsub'],
    color: '#231F20',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'jenkins',
    name: 'Jenkins CI/CD',
    category: 'dev',
    tags: ['cicd', 'automation', 'pipelines'],
    color: '#D33833',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14.5v-5l4.5 2.5-4.5 2.5z"/></svg>`
  },
  {
    id: 'argocd',
    name: 'ArgoCD GitOps',
    category: 'dev',
    tags: ['gitops', 'kubernetes', 'cd'],
    color: '#EF7B4D',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3z"/></svg>`
  },
  {
    id: 'nodejs',
    name: 'Node.js Runtime',
    category: 'dev',
    tags: ['javascript', 'npm', 'backend'],
    color: '#339933',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8v8l10 6 10-6V8L12 2zm0 2.8l7.5 4.5v6.4L12 20.2l-7.5-4.5V9.3L12 4.8z"/></svg>`
  },
  {
    id: 'python',
    name: 'Python Application',
    category: 'dev',
    tags: ['python', 'django', 'fastapi', 'flask'],
    color: '#3776AB',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6z"/></svg>`
  },
  {
    id: 'golang',
    name: 'Go / Golang Microservice',
    category: 'dev',
    tags: ['go', 'golang', 'microservice'],
    color: '#00ADD8',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },

  // ==========================================
  // 8. SMART HOME & IOT (8 icons)
  // ==========================================
  {
    id: 'home-assistant',
    name: 'Home Assistant',
    category: 'smarthome',
    tags: ['iot', 'smarthome', 'automation', 'zigbee', 'matter'],
    color: '#03A9F4',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 4.5l5 4.5v6h-3v-4h-4v4H7v-6l5-4.5z"/></svg>`
  },
  {
    id: 'node-red',
    name: 'Node-RED Flows',
    category: 'smarthome',
    tags: ['flows', 'iot', 'mqtt', 'automation'],
    color: '#8F0000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3z"/></svg>`
  },
  {
    id: 'zigbee2mqtt',
    name: 'Zigbee2MQTT',
    category: 'smarthome',
    tags: ['zigbee', 'cc2652', 'coordinator'],
    color: '#EBA000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },
  {
    id: 'mosquitto',
    name: 'Mosquitto MQTT Broker',
    category: 'smarthome',
    tags: ['mqtt', 'iot', 'pubsub'],
    color: '#660066',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.3L18 9v6l-6 3.7L6 15V9l6-3.7z"/></svg>`
  },
  {
    id: 'esphome',
    name: 'ESPHome Dashboard',
    category: 'smarthome',
    tags: ['esp8266', 'esp32', 'firmware'],
    color: '#000000',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12h3v8h14v-8h3L12 2z"/></svg>`
  },
  {
    id: 'tasmota',
    name: 'Tasmota Devices',
    category: 'smarthome',
    tags: ['sonoff', 'smartplug', 'firmware'],
    color: '#1E88E5',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 14h-7v-2h7v2zm0-4h-7v-2h7v2z"/></svg>`
  },
  {
    id: 'frigate',
    name: 'Frigate NVR',
    category: 'smarthome',
    tags: ['nvr', 'cctv', 'ai', 'coral', 'rtsp'],
    color: '#10B981',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`
  },
  {
    id: 'wled',
    name: 'WLED Lights Controller',
    category: 'smarthome',
    tags: ['led', 'ws2812b', 'rgb', 'strip'],
    color: '#E91E63',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>`
  },

  // ==========================================
  // 9. GENERAL LINUX, HARDWARE & UTILITIES (15 icons)
  // ==========================================
  {
    id: 'terminal',
    name: 'Linux Shell / SSH Terminal',
    category: 'general',
    tags: ['bash', 'terminal', 'ssh', 'cli'],
    color: '#4ADE80',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM4 18V8h16v10H4zm2-8l4 3-4 3v-2l1.5-1L6 11v-1zm6 5h5v1h-5v-1z"/></svg>`
  },
  {
    id: 'server',
    name: 'Baremetal Rack Server',
    category: 'general',
    tags: ['rack', 'baremetal', 'host'],
    color: '#64748B',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 10H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2zm-14 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-10a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg>`
  },
  {
    id: 'network-share',
    name: 'SMB / UNC Windows Share',
    category: 'general',
    tags: ['smb', 'cifs', 'nfs', 'unc', 'folder', 'share'],
    color: '#8B5CF6',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`
  },
  {
    id: 'router',
    name: 'Gateway / Switch Router',
    category: 'general',
    tags: ['pfsense', 'opnsense', 'openwrt', 'firewall'],
    color: '#0EA5E9',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-2V9h-2v4H9V9H7v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zm-12 5H5v-2h2v2zm4 0H9v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>`
  },
  {
    id: 'ipmi',
    name: 'iDRAC / iLO / IPMI Remote',
    category: 'general',
    tags: ['ipmi', 'idrac', 'ilo', 'kvm', 'dell', 'hp'],
    color: '#FF7043',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-2h2zm0-4h-2V7h2z"/></svg>`
  },
  {
    id: 'printer',
    name: 'Network Printer / CUPS',
    category: 'general',
    tags: ['cups', 'printer', 'spooler'],
    color: '#3F51B5',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>`
  },
  {
    id: 'wifi',
    name: 'UniFi / Omada Controller',
    category: 'general',
    tags: ['unifi', 'omada', 'ap', 'wifi', 'ubiquiti'],
    color: '#006FFF',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0 0 12 4zm0 4.5c3.34 0 6.38 1.36 8.57 3.55L12 20.69 3.43 12.05A12.06 12.06 0 0 1 12 8.5z"/></svg>`
  },
  {
    id: 'nas-storage',
    name: 'Disk Array / RAID Storage',
    category: 'general',
    tags: ['raid', 'disks', 'zfs', 'smart'],
    color: '#607D8B',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V6h12v2z"/></svg>`
  },
  {
    id: 'ups',
    name: 'UPS Power / NUT',
    category: 'general',
    tags: ['ups', 'apc', 'nut', 'battery', 'power'],
    color: '#F59E0B',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.08-.14L13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15L11 21z"/></svg>`
  },
  {
    id: 'ai-gpu',
    name: 'AI / Ollama / GPU Worker',
    category: 'general',
    tags: ['ai', 'llm', 'ollama', 'cuda', 'gpu', 'nvidia'],
    color: '#76B900',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`
  },
  {
    id: 'shield-ssl',
    name: 'SSL / TLS Certificate Gateway',
    category: 'general',
    tags: ['ssl', 'tls', 'https', 'certbot'],
    color: '#10B981',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm-2 15l-4-4 1.4-1.4 2.6 2.6 6.6-6.6 1.4 1.4-8 8z"/></svg>`
  },
  {
    id: 'webhook',
    name: 'Webhook Relay / API Service',
    category: 'general',
    tags: ['webhook', 'api', 'http', 'rest'],
    color: '#6366F1',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4 11h-3v3h-2v-3H8v-2h3V8h2v3h3z"/></svg>`
  },
  {
    id: 'search-service',
    name: 'Search Engine / SearXNG',
    category: 'general',
    tags: ['search', 'searxng', 'privacy'],
    color: '#0EA5E9',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`
  },
  {
    id: 'dashboard-app',
    name: 'Custom Dashboard Web App',
    category: 'general',
    tags: ['dashboard', 'web', 'portal', 'homepage'],
    color: '#6366F1',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`
  },
  {
    id: 'vault-key',
    name: 'Key Vault & Secrets Store',
    category: 'general',
    tags: ['key', 'vault', 'secrets', 'encryption'],
    color: '#F59E0B',
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>`
  }
];

export function getBuiltinIconById(id: string): BuiltinIcon | undefined {
  return BUILTIN_ICONS.find(icon => icon.id === id);
}
