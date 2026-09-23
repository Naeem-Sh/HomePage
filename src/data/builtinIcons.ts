export interface BuiltinIcon {
  id: string;
  name: string;
  category: 'infra' | 'monitoring' | 'storage' | 'network' | 'media' | 'dev' | 'smarthome' | 'office' | 'os' | 'general';
  tags: string[];
  color: string;
  svg: string;
}

export const BUILTIN_ICONS: BuiltinIcon[] = [
  // ================= INFRASTRUCTURE & VIRTUALIZATION =================
  {
    id: 'proxmox',
    name: 'Proxmox VE',
    category: 'infra',
    tags: ['proxmox', 'pve', 'virtualization', 'hypervisor', 'qemu', 'lxc'],
    color: '#E57000',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="#E57000" stroke-width="2" stroke-linejoin="round"/>
      <path d="M12 2V12M12 22V12M3 7L12 12M21 7L12 12" stroke="#E57000" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="3" fill="#E57000"/>
    </svg>`
  },
  {
    id: 'portainer',
    name: 'Portainer',
    category: 'infra',
    tags: ['portainer', 'docker', 'containers', 'swarm', 'kubernetes'],
    color: '#13BEF9',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="#13BEF9" stroke-width="2"/>
      <path d="M6 9H10V15H6V9Z" fill="#13BEF9"/>
      <path d="M12 9H14V12H12V9Z" fill="#13BEF9"/>
      <path d="M16 9H18V15H16V9Z" fill="#13BEF9"/>
      <path d="M12 13H14V15H12V13Z" fill="#13BEF9"/>
    </svg>`
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'infra',
    tags: ['docker', 'containers', 'whale', 'engine', 'compose'],
    color: '#2496ED',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 13.5C2 13.5 3.5 12 7 12C10.5 12 12 13.5 14.5 13.5C17.5 13.5 19 12 21 13C22 13.5 22.5 15 22 16.5C21 19.5 17 21 12 21C6 21 2 18 2 13.5Z" fill="#2496ED" opacity="0.9"/>
      <rect x="5" y="9" width="2.5" height="2" rx="0.5" fill="#2496ED"/>
      <rect x="8.5" y="9" width="2.5" height="2" rx="0.5" fill="#2496ED"/>
      <rect x="12" y="9" width="2.5" height="2" rx="0.5" fill="#2496ED"/>
      <rect x="8.5" y="6.5" width="2.5" height="2" rx="0.5" fill="#2496ED"/>
      <rect x="12" y="6.5" width="2.5" height="2" rx="0.5" fill="#2496ED"/>
      <circle cx="18.5" cy="15" r="0.8" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    category: 'infra',
    tags: ['k8s', 'kubernetes', 'cluster', 'orchestration'],
    color: '#326CE5',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#326CE5" stroke-width="2"/>
      <path d="M12 6V18M6.8 9L17.2 15M6.8 15L17.2 9" stroke="#326CE5" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="2.5" fill="#326CE5"/>
    </svg>`
  },
  {
    id: 'nginx',
    name: 'Nginx Proxy Manager',
    category: 'infra',
    tags: ['nginx', 'npm', 'proxy', 'reverse proxy', 'ssl'],
    color: '#009639',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 6.5V17.5L12 22L21 17.5V6.5L12 2Z" stroke="#009639" stroke-width="2"/>
      <path d="M7 16V8L17 16V8" stroke="#009639" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'traefik',
    name: 'Traefik',
    category: 'infra',
    tags: ['traefik', 'proxy', 'edge', 'ingress'],
    color: '#24A1C1',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L2 19H22L12 3Z" stroke="#24A1C1" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="12" cy="13" r="3" fill="#24A1C1"/>
    </svg>`
  },

  // ================= MONITORING & TELEMETRY =================
  {
    id: 'grafana',
    name: 'Grafana',
    category: 'monitoring',
    tags: ['grafana', 'dashboards', 'metrics', 'monitoring', 'charts'],
    color: '#F46800',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#F46800" stroke-width="2"/>
      <path d="M12 6C15.3 6 18 8.7 18 12C18 15.3 15.3 18 12 18" stroke="#F46800" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="3" fill="#F46800"/>
    </svg>`
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    category: 'monitoring',
    tags: ['prometheus', 'metrics', 'alertmanager', 'timeseries'],
    color: '#E6522C',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#E6522C" stroke-width="2"/>
      <path d="M12 5V12L15 15" stroke="#E6522C" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 17C9.2 18.2 10.5 19 12 19C15.9 19 19 15.9 19 12" stroke="#E6522C" stroke-width="1.8"/>
    </svg>`
  },
  {
    id: 'uptime-kuma',
    name: 'Uptime Kuma',
    category: 'monitoring',
    tags: ['uptime kuma', 'kuma', 'status', 'ping', 'health'],
    color: '#5CDD8B',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21C17 21 21 17 21 12C21 7 17 3 12 3Z" stroke="#5CDD8B" stroke-width="2"/>
      <path d="M12 7V12L15 14" stroke="#5CDD8B" stroke-width="2" stroke-linecap="round"/>
      <path d="M8 12C8 9.8 9.8 8 12 8" stroke="#5CDD8B" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'netdata',
    name: 'Netdata',
    category: 'monitoring',
    tags: ['netdata', 'realtime', 'cpu', 'ram', 'metrics'],
    color: '#00AB44',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="#00AB44" stroke-width="2"/>
      <path d="M6 13L9 9L13 14L18 8" stroke="#00AB44" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'zabbix',
    name: 'Zabbix',
    category: 'monitoring',
    tags: ['zabbix', 'enterprise', 'monitoring', 'snmp'],
    color: '#D40000',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#D40000"/>
      <path d="M8 8H16L8 16H16" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },

  // ================= STORAGE & CLOUD =================
  {
    id: 'nextcloud',
    name: 'Nextcloud Hub',
    category: 'storage',
    tags: ['nextcloud', 'cloud', 'files', 'sync', 'drive'],
    color: '#0082C9',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4.5" fill="#0082C9"/>
      <circle cx="5" cy="12" r="3" fill="#0082C9"/>
      <circle cx="19" cy="12" r="3" fill="#0082C9"/>
      <path d="M7.5 12H9.5M14.5 12H16.5" stroke="#FFFFFF" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'truenas',
    name: 'TrueNAS / FreeNAS',
    category: 'storage',
    tags: ['truenas', 'freenas', 'nas', 'zfs', 'storage', 'raid'],
    color: '#0095D5',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#0095D5" stroke-width="2"/>
      <path d="M7 12H17M12 7V17" stroke="#0095D5" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill="#0095D5"/>
    </svg>`
  },
  {
    id: 'synology',
    name: 'Synology DSM',
    category: 'storage',
    tags: ['synology', 'nas', 'dsm', 'diskstation'],
    color: '#1E69B8',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="#1E69B8" stroke-width="2"/>
      <circle cx="7" cy="12" r="1.5" fill="#1E69B8"/>
      <circle cx="12" cy="12" r="1.5" fill="#1E69B8"/>
      <circle cx="17" cy="12" r="1.5" fill="#1E69B8"/>
    </svg>`
  },
  {
    id: 'filebrowser',
    name: 'File Browser',
    category: 'storage',
    tags: ['filebrowser', 'explorer', 'manager', 'storage'],
    color: '#2979FF',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6C3 4.9 3.9 4 5 4H10L12 6H19C20.1 6 21 6.9 21 8V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V6Z" stroke="#2979FF" stroke-width="2"/>
      <path d="M8 13H16M8 16H13" stroke="#2979FF" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'samba',
    name: 'Samba / SMB Share',
    category: 'storage',
    tags: ['samba', 'smb', 'lan', 'share', 'windows network'],
    color: '#00599C',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="7" rx="2" stroke="#00599C" stroke-width="1.8"/>
      <rect x="3" y="13" width="18" height="7" rx="2" stroke="#00599C" stroke-width="1.8"/>
      <circle cx="6" cy="7.5" r="1" fill="#00599C"/>
      <circle cx="6" cy="16.5" r="1" fill="#00599C"/>
    </svg>`
  },

  // ================= MEDIA & STREAMING =================
  {
    id: 'plex',
    name: 'Plex Media Server',
    category: 'media',
    tags: ['plex', 'movies', 'music', 'tv', 'streaming'],
    color: '#E5A00D',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#E5A00D"/>
      <path d="M9 7L16 12L9 17V7Z" fill="#1F2326"/>
    </svg>`
  },
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    category: 'media',
    tags: ['jellyfin', 'open source', 'media', 'streaming'],
    color: '#AA5CC3',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#AA5CC3" stroke-width="2"/>
      <path d="M10 8L16 12L10 16V8Z" fill="#AA5CC3"/>
    </svg>`
  },
  {
    id: 'immich',
    name: 'Immich Photos',
    category: 'media',
    tags: ['immich', 'photos', 'backup', 'gallery', 'google photos alternative'],
    color: '#4255FF',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="#4255FF" stroke-width="2"/>
      <circle cx="8" cy="9" r="2" fill="#4255FF"/>
      <path d="M4 17L9 12L13 16L16 13L20 17" stroke="#4255FF" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'transmission',
    name: 'Transmission',
    category: 'media',
    tags: ['transmission', 'torrent', 'download', 'p2p'],
    color: '#D60000',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#D60000" stroke-width="2"/>
      <path d="M12 7V17M12 17L8 13M12 17L16 13" stroke="#D60000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'qbittorrent',
    name: 'qBittorrent',
    category: 'media',
    tags: ['qbittorrent', 'qbit', 'torrent', 'download'],
    color: '#2F679B',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="#2F679B"/>
      <text x="12" y="16" font-size="11" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="sans-serif">qB</text>
    </svg>`
  },

  // ================= NETWORK & SECURITY =================
  {
    id: 'adguard',
    name: 'AdGuard Home',
    category: 'network',
    tags: ['adguard', 'dns', 'adblock', 'privacy', 'security'],
    color: '#68BC71',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 6V12C4 17 7.5 21 12 22C16.5 21 20 17 20 12V6L12 2Z" fill="#68BC71"/>
      <path d="M9 12L11 14L15 9" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'pihole',
    name: 'Pi-hole',
    category: 'network',
    tags: ['pihole', 'pi-hole', 'dns', 'adblock', 'raspberry pi'],
    color: '#F60D1A',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#F60D1A" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#F60D1A"/>
      <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="#F60D1A" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'wireguard',
    name: 'WireGuard',
    category: 'network',
    tags: ['wireguard', 'vpn', 'tunnel', 'crypto', 'mesh'],
    color: '#88171A',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#88171A" stroke-width="2"/>
      <path d="M8 12C8 9.8 9.8 8 12 8C14.2 8 16 9.8 16 12C16 14.2 14.2 16 12 16" stroke="#88171A" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="#88171A"/>
    </svg>`
  },
  {
    id: 'tailscale',
    name: 'Tailscale',
    category: 'network',
    tags: ['tailscale', 'vpn', 'zero trust', 'mesh', 'wireguard'],
    color: '#2B2B2B',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="12" r="2.5" fill="#2B2B2B"/>
      <circle cx="12" cy="7" r="2.5" fill="#2B2B2B"/>
      <circle cx="12" cy="12" r="2.5" fill="#2B2B2B"/>
      <circle cx="12" cy="17" r="2.5" fill="#2B2B2B"/>
      <circle cx="18" cy="12" r="2.5" fill="#2B2B2B"/>
    </svg>`
  },
  {
    id: 'vaultwarden',
    name: 'Vaultwarden / Bitwarden',
    category: 'network',
    tags: ['vaultwarden', 'bitwarden', 'password', 'vault', 'security'],
    color: '#175DDC',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L4 6V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V6L12 2Z" stroke="#175DDC" stroke-width="2"/>
      <rect x="9" y="10" width="6" height="6" rx="1" fill="#175DDC"/>
      <path d="M10 10V8.5C10 7.4 10.9 6.5 12 6.5C13.1 6.5 14 7.4 14 8.5V10" stroke="#175DDC" stroke-width="1.8"/>
    </svg>`
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: 'network',
    tags: ['cloudflare', 'cdn', 'tunnel', 'waf', 'dns'],
    color: '#F38020',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 18H6C4 18 2.5 16.5 2.5 14.5C2.5 12.8 3.7 11.3 5.4 11.1C5.9 8.2 8.4 6 11.5 6C14.1 6 16.3 7.6 17.2 9.8C17.7 9.5 18.3 9.3 19 9.3C20.7 9.3 22 10.6 22 12.3C22 12.5 22 12.7 21.9 12.9C22.6 13.5 23 14.4 23 15.3C23 16.8 21.8 18 20.3 18H19Z" fill="#F38020"/>
    </svg>`
  },

  // ================= DEVELOPMENT & CODE =================
  {
    id: 'gitea',
    name: 'Gitea / Forgejo',
    category: 'dev',
    tags: ['gitea', 'forgejo', 'git', 'repo', 'vcs', 'code'],
    color: '#609926',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#609926" stroke-width="2"/>
      <path d="M9 10C9 8.9 9.9 8 11 8H13C14.1 8 15 8.9 15 10V14C15 15.1 14.1 16 13 16H11C9.9 16 9 15.1 9 14V10Z" stroke="#609926" stroke-width="1.8"/>
      <circle cx="12" cy="12" r="1.5" fill="#609926"/>
    </svg>`
  },
  {
    id: 'gitlab',
    name: 'GitLab CE',
    category: 'dev',
    tags: ['gitlab', 'git', 'devops', 'ci', 'cd'],
    color: '#FC6D26',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21L2 14L4 4L7 14H17L20 4L22 14L12 21Z" fill="#FC6D26"/>
    </svg>`
  },
  {
    id: 'vscode',
    name: 'VS Code Server',
    category: 'dev',
    tags: ['vscode', 'code', 'ide', 'editor', 'coder'],
    color: '#007ACC',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 2L6 11L2 8L2 16L6 13L17 22L22 19V5L17 2Z" fill="#007ACC"/>
    </svg>`
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL Database',
    category: 'dev',
    tags: ['postgres', 'postgresql', 'sql', 'database', 'rdbms'],
    color: '#336791',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="6" rx="8" ry="3" stroke="#336791" stroke-width="2"/>
      <path d="M4 6V12C4 13.7 7.6 15 12 15C16.4 15 20 13.7 20 12V6" stroke="#336791" stroke-width="2"/>
      <path d="M4 12V18C4 19.7 7.6 21 12 21C16.4 21 20 19.7 20 18V12" stroke="#336791" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'redis',
    name: 'Redis In-Memory Cache',
    category: 'dev',
    tags: ['redis', 'cache', 'key-value', 'nosql', 'fast'],
    color: '#DC382D',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L3 7.5L12 12L21 7.5L12 3Z" fill="#DC382D"/>
      <path d="M3 12L12 16.5L21 12M3 16.5L12 21L21 16.5" stroke="#DC382D" stroke-width="2"/>
    </svg>`
  },

  // ================= SMART HOME & IOT =================
  {
    id: 'home-assistant',
    name: 'Home Assistant',
    category: 'smarthome',
    tags: ['home assistant', 'hass', 'iot', 'automation', 'zigbee', 'zwave'],
    color: '#03A9F4',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L3 11H6V20H18V11H21L12 3Z" stroke="#03A9F4" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="12" cy="14" r="2.5" fill="#03A9F4"/>
      <path d="M12 8V11.5" stroke="#03A9F4" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'zigbee2mqtt',
    name: 'Zigbee2MQTT',
    category: 'smarthome',
    tags: ['zigbee', 'mqtt', 'sensors', 'switches'],
    color: '#EB5C27',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#EB5C27" stroke-width="2"/>
      <path d="M8 8H16L8 16H16" stroke="#EB5C27" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'node-red',
    name: 'Node-RED',
    category: 'smarthome',
    tags: ['nodered', 'flow', 'automation', 'iot'],
    color: '#8F0000',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="6" height="5" rx="1" fill="#8F0000"/>
      <rect x="15" y="6" width="6" height="5" rx="1" fill="#8F0000"/>
      <rect x="9" y="14" width="6" height="5" rx="1" fill="#8F0000"/>
      <path d="M9 8.5H15M6 11V16.5H9" stroke="#8F0000" stroke-width="1.8"/>
    </svg>`
  },

  // ================= OPERATING SYSTEMS =================
  {
    id: 'debian',
    name: 'Debian Linux',
    category: 'os',
    tags: ['debian', 'linux', 'os', 'server'],
    color: '#D70A53',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#D70A53" stroke-width="2"/>
      <path d="M12 6C9 6 7 8 7 11C7 14 9.5 15.5 12 15C13.5 14.7 15 13.5 14.5 12C14 10.5 12.5 10 11.5 10.5" stroke="#D70A53" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'ubuntu',
    name: 'Ubuntu Linux',
    category: 'os',
    tags: ['ubuntu', 'linux', 'canonical', 'server'],
    color: '#E95420',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#E95420" stroke-width="2"/>
      <circle cx="12" cy="5" r="1.5" fill="#E95420"/>
      <circle cx="6" cy="16" r="1.5" fill="#E95420"/>
      <circle cx="18" cy="16" r="1.5" fill="#E95420"/>
    </svg>`
  },
  {
    id: 'alpine',
    name: 'Alpine Linux',
    category: 'os',
    tags: ['alpine', 'linux', 'container', 'lightweight'],
    color: '#0D597F',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 19L12 5L20 19H4Z" stroke="#0D597F" stroke-width="2" stroke-linejoin="round"/>
      <path d="M8 19L12 11L16 19" stroke="#0D597F" stroke-width="1.8"/>
    </svg>`
  },

  // ================= OFFICE & DOCUMENTS =================
  {
    id: 'FileText',
    name: 'اسناد و مستندات (PDF/Doc)',
    category: 'office',
    tags: ['documents', 'manual', 'pdf', 'docs', 'office', 'files'],
    color: '#6366F1',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#6366F1" stroke-width="2"/>
      <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="#6366F1" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'paperless-ngx',
    name: 'Paperless-ngx',
    category: 'office',
    tags: ['paperless', 'archive', 'scan', 'ocr', 'documents'],
    color: '#008766',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="#008766" stroke-width="2"/>
      <path d="M8 7H16M8 11H16M8 15H12" stroke="#008766" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'onlyoffice',
    name: 'ONLYOFFICE Workspace',
    category: 'office',
    tags: ['onlyoffice', 'docs', 'excel', 'powerpoint', 'word'],
    color: '#FF6F3D',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="#FF6F3D" stroke-width="2"/>
      <rect x="6" y="7" width="5" height="5" rx="1" fill="#FF6F3D"/>
      <rect x="13" y="7" width="5" height="5" rx="1" fill="#FF6F3D"/>
      <rect x="6" y="14" width="12" height="3" rx="1" fill="#FF6F3D"/>
    </svg>`
  },
  {
    id: 'roundcube',
    name: 'Roundcube Webmail',
    category: 'office',
    tags: ['roundcube', 'mail', 'email', 'inbox', 'webmail'],
    color: '#3B82F6',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="#3B82F6" stroke-width="2"/>
      <path d="M3 7L12 13L21 7" stroke="#3B82F6" stroke-width="2" stroke-linejoin="round"/>
    </svg>`
  },

  // ================= GENERAL & HARDWARE =================
  {
    id: 'server-generic',
    name: 'سرور اختصاصی (Dedicated Server)',
    category: 'general',
    tags: ['server', 'rack', 'metal', 'baremetal', 'host'],
    color: '#4F46E5',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="7" rx="2" stroke="#4F46E5" stroke-width="2"/>
      <rect x="2" y="14" width="20" height="7" rx="2" stroke="#4F46E5" stroke-width="2"/>
      <circle cx="6" cy="6.5" r="1" fill="#4F46E5"/>
      <circle cx="9" cy="6.5" r="1" fill="#4F46E5"/>
      <circle cx="6" cy="17.5" r="1" fill="#4F46E5"/>
      <circle cx="9" cy="17.5" r="1" fill="#4F46E5"/>
    </svg>`
  },
  {
    id: 'terminal',
    name: 'ترمینال و SSH (SSH Terminal)',
    category: 'general',
    tags: ['terminal', 'ssh', 'bash', 'cli', 'console'],
    color: '#10B981',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="#10B981" stroke-width="2"/>
      <path d="M7 9L11 12L7 15M13 15H17" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'router',
    name: 'مسیریاب و روتر (Router / Gateway)',
    category: 'general',
    tags: ['router', 'gateway', 'firewall', 'wifi'],
    color: '#EC4899',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="12" width="18" height="8" rx="2" stroke="#EC4899" stroke-width="2"/>
      <path d="M7 12V6M12 12V4M17 12V6" stroke="#EC4899" stroke-width="2" stroke-linecap="round"/>
      <circle cx="7" cy="16" r="1" fill="#EC4899"/>
      <circle cx="11" cy="16" r="1" fill="#EC4899"/>
      <circle cx="15" cy="16" r="1" fill="#EC4899"/>
    </svg>`
  },

  // ================= EXPANDED HOMELAB & CLOUD SERVICES =================
  {
    id: 'minio',
    name: 'MinIO Object Storage',
    category: 'storage',
    tags: ['minio', 's3', 'storage', 'bucket', 'cloud'],
    color: '#C72C48',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="#C72C48" stroke-width="2"/>
      <path d="M7 12L12 8L17 12L12 16L7 12Z" fill="#C72C48"/>
    </svg>`
  },
  {
    id: 'n8n',
    name: 'n8n Workflow Automation',
    category: 'dev',
    tags: ['n8n', 'workflow', 'automation', 'webhook', 'lowcode'],
    color: '#FF6D5A',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="12" r="3" stroke="#FF6D5A" stroke-width="2"/>
      <circle cx="17" cy="7" r="3" stroke="#FF6D5A" stroke-width="2"/>
      <circle cx="17" cy="17" r="3" stroke="#FF6D5A" stroke-width="2"/>
      <path d="M10 12H14M14 7V17" stroke="#FF6D5A" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'caddy',
    name: 'Caddy Web Server',
    category: 'infra',
    tags: ['caddy', 'proxy', 'reverse proxy', 'https', 'ssl'],
    color: '#1F88C0',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#1F88C0" stroke-width="2"/>
      <path d="M15 9C14.2 8.4 13.2 8 12 8C9.8 8 8 9.8 8 12C8 14.2 9.8 16 12 16C13.2 16 14.2 15.6 15 15" stroke="#1F88C0" stroke-width="2.2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'rustdesk',
    name: 'RustDesk Remote Desktop',
    category: 'general',
    tags: ['rustdesk', 'remote', 'desktop', 'vnc', 'teamviewer alternative'],
    color: '#0D9488',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="20" height="13" rx="2" stroke="#0D9488" stroke-width="2"/>
      <path d="M8 21H16M12 17V21" stroke="#0D9488" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="10" r="2.5" fill="#0D9488"/>
    </svg>`
  },
  {
    id: 'influxdb',
    name: 'InfluxDB Time Series',
    category: 'monitoring',
    tags: ['influxdb', 'metrics', 'timeseries', 'telegraf', 'iot'],
    color: '#22ADF6',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#22ADF6" stroke-width="2"/>
      <path d="M7 16L10 11L14 14L17 8" stroke="#22ADF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'opnsense',
    name: 'OPNsense / pfSense Firewall',
    category: 'network',
    tags: ['opnsense', 'pfsense', 'firewall', 'router', 'gateway', 'security'],
    color: '#D94300',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L3 6V12C3 17.5 6.8 22.5 12 24C17.2 22.5 21 17.5 21 12V6L12 2Z" stroke="#D94300" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#D94300"/>
    </svg>`
  },
  {
    id: 'authentik',
    name: 'Authentik / Keycloak SSO',
    category: 'network',
    tags: ['authentik', 'keycloak', 'sso', 'oauth', 'saml', 'identity'],
    color: '#FD4B2D',
    svg: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10" width="14" height="11" rx="2" stroke="#FD4B2D" stroke-width="2"/>
      <path d="M8 10V6C8 3.8 9.8 2 12 2C14.2 2 16 3.8 16 6V10" stroke="#FD4B2D" stroke-width="2"/>
      <circle cx="12" cy="15" r="1.5" fill="#FD4B2D"/>
    </svg>`
  }
];

export function getBuiltinIconById(id: string): BuiltinIcon | undefined {
  if (!id) return undefined;
  return BUILTIN_ICONS.find((i) => i.id === id || i.id.toLowerCase() === id.toLowerCase());
}
