export const navList = [
  ['dashboard', 'Dashboard'],
  ['audit', 'Night Audit'],
  ['fraud', 'Fraud Detection'],
  ['leakage', 'Revenue Leakage'],
  ['alerts', 'Alerts Center'],
  ['transactions', 'Transactions'],
  ['employees', 'Employees'],
  ['reports', 'Reports'],
  ['settings', 'Settings'],
];

export const titles = {
  dashboard: ['Executive Overview', 'Real-time intelligence across your portfolio'],
  audit: ['Night Audit', 'Daily reconciliation and property close'],
  fraud: ['Fraud Detection', 'AI-flagged anomalies and open investigations'],
  leakage: ['Revenue Leakage', 'Recover lost, unbilled and mispriced revenue'],
  alerts: ['Alerts Center', 'Prioritized signals requiring attention'],
  transactions: ['Transactions', 'Every posting across your properties'],
  employees: ['Employees', 'Risk scoring and activity monitoring'],
  reports: ['Reports', 'Board-ready financial intelligence'],
  settings: ['Settings', 'Platform, security and preferences'],
};

export const heatData = [
  ['Grand Meridian NYC', [0.2, 0.3, 0.85, 0.9, 0.4, 0.25, 0.7]],
  ['Meridian Bayside', [0.15, 0.2, 0.3, 0.5, 0.35, 0.2, 0.25]],
  ['Meridian Old Town', [0.3, 0.55, 0.4, 0.35, 0.6, 0.45, 0.3]],
  ['Meridian Harbor', [0.1, 0.15, 0.2, 0.25, 0.2, 0.15, 0.3]],
  ['Meridian Summit', [0.4, 0.35, 0.5, 0.7, 0.55, 0.4, 0.45]],
  ['Meridian Riverside', [0.2, 0.25, 0.3, 0.2, 0.4, 0.3, 0.2]],
];

export const fraudRows = [
  { sev: 'Critical', sevColor: '#d1452e', sevBg: 'rgba(229,86,63,.15)', pattern: 'Void → repost, same folio', agent: 'J. Okafor', prop: 'Grand Meridian', conf: '97%', amount: '$8,420' },
  { sev: 'Critical', sevColor: '#d1452e', sevBg: 'rgba(229,86,63,.15)', pattern: 'Duplicate refund issued', agent: 'M. Alvarez', prop: 'Grand Meridian', conf: '95%', amount: '$2,480' },
  { sev: 'High', sevColor: '#b47e12', sevBg: 'rgba(214,158,46,.16)', pattern: 'After-hours rate override', agent: 'J. Okafor', prop: 'Bayside', conf: '88%', amount: '$5,110' },
  { sev: 'High', sevColor: '#b47e12', sevBg: 'rgba(214,158,46,.16)', pattern: 'Comp room, no approval', agent: 'S. Nakamura', prop: 'Old Town', conf: '84%', amount: '$3,900' },
  { sev: 'Medium', sevColor: '#4f8cff', sevBg: 'rgba(79,140,255,.14)', pattern: 'Cash variance at close', agent: 'D. Fischer', prop: 'Summit', conf: '72%', amount: '$610' },
  { sev: 'Medium', sevColor: '#4f8cff', sevBg: 'rgba(79,140,255,.14)', pattern: 'Discount above threshold', agent: 'L. Petrov', prop: 'Riverside', conf: '68%', amount: '$1,240' },
];

export const leakRows = [
  { cat: 'Unbilled minibar & F&B', pct: '38%', amt: '$70,120', w: '100%' },
  { cat: 'Late-checkout fees missed', pct: '24%', amt: '$44,300', w: '63%' },
  { cat: 'Rate parity / underpricing', pct: '18%', amt: '$33,180', w: '47%' },
  { cat: 'Uncaptured resort fees', pct: '12%', amt: '$22,090', w: '31%' },
  { cat: 'No-show not charged', pct: '8%', amt: '$14,720', w: '21%' },
];

export const alertRows = [
  { dot: '#d1452e', tag: 'Critical', tagC: '#d1452e', tagBg: 'rgba(229,86,63,.15)', title: 'Duplicate refund — $2,480', meta: 'Folio #GM-88213 · The Grand Meridian · Fraud', time: '2m ago' },
  { dot: '#d1452e', tag: 'Critical', tagC: '#d1452e', tagBg: 'rgba(229,86,63,.15)', title: 'Void-then-repost pattern detected', meta: 'Agent J. Okafor · The Grand Meridian · Fraud', time: '9m ago' },
  { dot: '#b47e12', tag: 'Warning', tagC: '#b47e12', tagBg: 'rgba(214,158,46,.16)', title: 'Cash variance at close — $610', meta: 'Front Desk · Meridian Bayside · Audit', time: '18m ago' },
  { dot: '#d1452e', tag: 'Critical', tagC: '#d1452e', tagBg: 'rgba(229,86,63,.15)', title: 'After-hours rate override', meta: 'Agent J. Okafor · 03:14 local · Fraud', time: '41m ago' },
  { dot: '#4f8cff', tag: 'Info', tagC: '#4f8cff', tagBg: 'rgba(79,140,255,.14)', title: 'Unbilled minibar batch flagged', meta: '42 folios · Meridian Old Town · Leakage', time: '1h ago' },
  { dot: '#b47e12', tag: 'Warning', tagC: '#b47e12', tagBg: 'rgba(214,158,46,.16)', title: 'Comp room approval missing', meta: 'Agent S. Nakamura · Meridian Old Town · Fraud', time: '2h ago' },
  { dot: '#4f8cff', tag: 'Info', tagC: '#4f8cff', tagBg: 'rgba(79,140,255,.14)', title: 'Late-checkout fees uncaptured', meta: '18 folios · Meridian Summit · Leakage', time: '3h ago' },
];

export const txnRows = [
  { id: 'GM-88213', time: '03:41', type: 'Refund', prop: 'Grand Meridian', agent: 'M. Alvarez', amt: '−$2,480', amtC: '#d1452e', flag: 'Flagged', flagC: '#d1452e', flagBg: 'rgba(229,86,63,.15)' },
  { id: 'GM-88201', time: '03:38', type: 'Room posting', prop: 'Grand Meridian', agent: 'System', amt: '$1,240', amtC: '#26241f', flag: 'Cleared', flagC: '#1f9268', flagBg: 'rgba(80,180,150,.16)' },
  { id: 'BS-40119', time: '03:34', type: 'Rate override', prop: 'Bayside', agent: 'J. Okafor', amt: '$5,110', amtC: '#26241f', flag: 'Review', flagC: '#b47e12', flagBg: 'rgba(214,158,46,.16)' },
  { id: 'OT-22876', time: '03:29', type: 'Minibar', prop: 'Old Town', agent: 'System', amt: '$86', amtC: '#26241f', flag: 'Cleared', flagC: '#1f9268', flagBg: 'rgba(80,180,150,.16)' },
  { id: 'SM-15540', time: '03:22', type: 'Cash close', prop: 'Summit', agent: 'D. Fischer', amt: '−$610', amtC: '#d1452e', flag: 'Flagged', flagC: '#d1452e', flagBg: 'rgba(229,86,63,.15)' },
  { id: 'GM-88190', time: '03:18', type: 'City ledger', prop: 'Grand Meridian', agent: 'System', amt: '$3,900', amtC: '#26241f', flag: 'Cleared', flagC: '#1f9268', flagBg: 'rgba(80,180,150,.16)' },
  { id: 'RV-09921', time: '03:11', type: 'Discount', prop: 'Riverside', agent: 'L. Petrov', amt: '−$1,240', amtC: '#d1452e', flag: 'Review', flagC: '#b47e12', flagBg: 'rgba(214,158,46,.16)' },
  { id: 'HB-33410', time: '03:04', type: 'Deposit', prop: 'Harbor', agent: 'System', amt: '$2,000', amtC: '#26241f', flag: 'Cleared', flagC: '#1f9268', flagBg: 'rgba(80,180,150,.16)' },
];

export const empRows = [
  { init: 'JO', name: 'James Okafor', role: 'Front Desk Agent', prop: 'Grand Meridian', last: '03:14 today', score: 87, band: 'High', bandC: '#d1452e', bandBg: 'rgba(229,86,63,.15)' },
  { init: 'SN', name: 'Sana Nakamura', role: 'Front Desk Agent', prop: 'Old Town', last: '02:47 today', score: 74, band: 'High', bandC: '#d1452e', bandBg: 'rgba(229,86,63,.15)' },
  { init: 'LP', name: 'Lev Petrov', role: 'Night Manager', prop: 'Riverside', last: 'Yesterday', score: 61, band: 'Medium', bandC: '#b47e12', bandBg: 'rgba(214,158,46,.16)' },
  { init: 'MA', name: 'Maria Alvarez', role: 'Front Desk Agent', prop: 'Grand Meridian', last: '01:20 today', score: 52, band: 'Medium', bandC: '#b47e12', bandBg: 'rgba(214,158,46,.16)' },
  { init: 'DF', name: 'Dana Fischer', role: 'Cashier', prop: 'Summit', last: '00:58 today', score: 34, band: 'Low', bandC: '#1f9268', bandBg: 'rgba(80,180,150,.16)' },
  { init: 'RC', name: 'Ravi Chandra', role: 'Guest Services', prop: 'Bayside', last: 'Yesterday', score: 21, band: 'Low', bandC: '#1f9268', bandBg: 'rgba(80,180,150,.16)' },
];

export const reportCards = [
  { title: 'Executive Board Pack', desc: 'Portfolio P&L, risk & recovery summary', freq: 'Monthly', updated: 'Jul 1' },
  { title: 'Fraud Investigation Log', desc: 'All cases, dispositions and outcomes', freq: 'Weekly', updated: 'Jul 20' },
  { title: 'Revenue Leakage Recovery', desc: 'Identified vs. recovered by category', freq: 'Weekly', updated: 'Jul 21' },
  { title: 'Night Audit Close Report', desc: 'Per-property reconciliation & exceptions', freq: 'Daily', updated: 'Today' },
  { title: 'Employee Risk Register', desc: 'Behavioral risk scoring across staff', freq: 'Monthly', updated: 'Jul 1' },
  { title: 'Compliance & Controls', desc: 'SOX-aligned control attestation', freq: 'Quarterly', updated: 'Jun 30' },
];
