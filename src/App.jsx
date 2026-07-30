import { useState, useEffect, useRef } from 'react';
import {
  ChevronRight, ChevronLeft, Check, X, AlertCircle, Award,
  Shield, Eye, Lock, Mail, Smartphone, Bot, Bell, BookOpen,
  Menu, ArrowLeft, Printer, RefreshCw, CheckCircle2, Circle, Dot,
} from 'lucide-react';

// =============================================================
// TQStarling Security & Information Security Awareness 2026
// TRN-SAA-2026 v1.0
// =============================================================

const STORAGE_KEY = 'tqs-saa-2026-progress';
const TRAINING_ID = 'TQS-TRN-SAA-2026';
const TRAINING_VERSION = '2.1.1';
const PASS_THRESHOLD = 0.8; // 80%

const BRAND = {
  dark: '#052821',
  green: '#004739',
  gold: '#B68834',
  goldSoft: '#D9B574',
  cream: '#F6F3EC',
  offWhite: '#F6F6F6',
  paper: '#FBFAF6',
  ink: '#1A1A1A',
  muted: '#6B6B6B',
  rule: '#D9D6CD',
  ruleSoft: '#E8E5DE',
  success: '#1F6F3E',
  successBg: '#E8F3EC',
  warn: '#A33A2A',
  warnBg: '#F6E8E5',
};

// =============================================================
// CONTENT — Modules
// =============================================================

const MODULES = [
  {
    id: 'welcome',
    number: '01',
    eyebrow: 'Introduction',
    title: 'Why this matters',
    minutes: 3,
    icon: Shield,
    blocks: [
      { type: 'lead', text: 'Security at TQStarling is not someone else’s job. The strongest tools we deploy and the most carefully drafted policies do not stop a workforce member who clicks the wrong link, shares the wrong file, or skips a step under pressure. The reverse is also true: a careful workforce makes a small company punch well above its weight.' },
      { type: 'p', text: 'TQStarling operates in a high-trust position. We hold Confidential and Restricted information for clients including Cognizant, and we act as a HIPAA Business Associate for clients in healthcare. When a TQStarling workforce member logs into client systems, the client is, in effect, lending us their reputation.' },
      { type: 'p', text: 'This course is the foundation of how we earn that trust. By the end of it you’ll know:' },
      { type: 'list', items: [
        'How TQStarling classifies information, and how to handle each level.',
        'How attackers actually attempt to compromise small firms in 2026.',
        'The few habits — credentials, devices, sharing — that prevent most incidents.',
        'What to do, and how fast, when something looks wrong.',
      ]},
      { type: 'p', text: 'The course takes about thirty to forty-five minutes. Your progress is saved as you go. There is a short knowledge check after most modules, and a fifteen-question final examination. You’ll need twelve correct to receive your completion record.' },
      { type: 'callout', tone: 'gold', title: 'This is your annual security awareness training.', text: 'Required by HR Security Policy TQS-HRS-001 §5. Completion records are retained for six years.' },
    ],
  },
  {
    id: 'classification',
    number: '02',
    eyebrow: 'Foundations',
    title: 'Information classification',
    minutes: 5,
    icon: BookOpen,
    blocks: [
      { type: 'lead', text: 'Everything we touch falls into one of five buckets. Knowing the bucket tells you exactly how to handle the item.' },
      { type: 'p', text: 'TQStarling uses four classification levels for company and client information, with one additional category for healthcare data. The Data Classification and Handling Policy (TQS-DCH-001) is the authoritative reference; this is the abbreviated version.' },
      { type: 'classTable' },
      { type: 'p', text: 'Microsoft Purview sensitivity labels are applied to documents and email. The label drives the encryption, the sharing controls, and the retention. If you create something new without applying a label, the default is Internal — but you should still consciously choose the right one.' },
      { type: 'h3', text: 'Two rules that come up constantly' },
      { type: 'numbered', items: [
        'When in doubt, classify up, not down. The cost of treating a Confidential document as Internal is real; the cost of treating an Internal document as Confidential is friction.',
        'Don’t downgrade a label without explicit business justification. If a document arrives as Confidential, leave it as Confidential.',
      ]},
      { type: 'h3', text: 'A note on Personal Information' },
      { type: 'p', text: 'Personal Information — anything that identifies an individual, from a name and email to PHI — is governed additionally by the Privacy Policy (TQS-PRI-001). The simple rule: use Personal Information only for the work you’ve been assigned. Don’t look up a client’s records out of curiosity. Don’t search for a friend who happens to be in a customer database. Curiosity is not a business need.' },
      { type: 'p', text: 'If a Data Subject Request reaches you — a request from an individual to access, correct, or delete their information — route it to privacy@tqstarling.com without delay.' },
    ],
    check: {
      question: 'You receive a spreadsheet from a healthcare client containing patient names, dates of birth, and treatment summaries. What is the minimum classification?',
      options: [
        'Internal',
        'Confidential',
        'Restricted',
        'PHI — treated as Restricted, with additional HIPAA Business Associate obligations',
      ],
      correct: 3,
      explanation: 'PHI is the correct category. Under HIPAA we have specific Business Associate obligations on top of Restricted handling, including the 60-day breach notification window and the Use & Disclosure limits of the BAA.',
    },
  },
  {
    id: 'authentication',
    number: '03',
    eyebrow: 'Identity',
    title: 'Authentication and access',
    minutes: 5,
    icon: Lock,
    blocks: [
      { type: 'lead', text: 'Every breach begins with the same step: an attacker gets the credentials of someone who has access to something they want. Your work credentials are not yours to spend.' },
      { type: 'h3', text: 'Two principles' },
      { type: 'p', text: 'First, your credentials are uniquely yours. Microsoft Entra ID is the source of truth for who you are. Don’t share your password — not with a colleague who needs a document, not with a manager who asks for a “quick favor,” not with IT. There is always a way to grant access through proper channels.' },
      { type: 'p', text: 'Second, multifactor authentication is the actual lock on the door. Your password alone, if compromised, gets an attacker nothing — provided the second factor is properly used.' },
      { type: 'h3', text: 'Microsoft Authenticator with number matching' },
      { type: 'p', text: 'TQStarling uses the Microsoft Authenticator app for MFA, with number matching enabled. When you sign in, you see a number on the screen; you must type that number into your phone. This stops a class of attack called MFA fatigue, where an attacker who has stolen your password bombs you with prompts hoping you’ll approve one by reflex.' },
      { type: 'callout', tone: 'gold', title: 'The rule', text: 'If you receive an Authenticator prompt you didn’t initiate, deny it and report it. An unprompted MFA notification is somebody trying to walk into your account right now.' },
      { type: 'h3', text: 'FIDO2 for privileged roles' },
      { type: 'p', text: 'Workforce members with privileged access (Global Administrator, Compliance Administrator, similar roles) use FIDO2 hardware keys. These provide phishing-resistant authentication — the key won’t talk to a spoofed sign-in page.' },
      { type: 'h3', text: 'Practical habits' },
      { type: 'list', items: [
        'Use the approved password manager. Don’t reuse passwords across services.',
        'Don’t write passwords down on paper, in notes apps, or in OneNote.',
        'Lock your screen when you step away (Win+L on Windows, Ctrl+Cmd+Q on Mac).',
        'When a sign-in asks you to set up MFA, verify the URL is microsoftonline.com before entering credentials.',
      ]},
    ],
    check: {
      question: 'You’re at lunch and your phone shows an Authenticator prompt. You haven’t tried to sign in to anything. What’s the correct response?',
      options: [
        'Approve — it’s probably a delayed prompt from earlier',
        'Ignore it — it will go away',
        'Deny the prompt, then report to security@tqstarling.com',
        'Approve once, deny any subsequent prompts',
      ],
      correct: 2,
      explanation: 'An unprompted MFA notification means someone has your password and is attempting to sign in right now. Deny the prompt to block the attempt, and report it so the IR team can investigate and rotate your credentials.',
    },
  },
  {
    id: 'phishing',
    number: '04',
    eyebrow: 'Threats',
    title: 'Phishing and social engineering',
    minutes: 6,
    icon: Mail,
    blocks: [
      { type: 'lead', text: 'Modern phishing is not a Nigerian prince. It’s the email from “your CEO” asking for a quick gift card purchase, or the Teams message from “IT” walking you through a “verification.”' },
      { type: 'p', text: 'Phishing has industrialized. The same kits and infrastructure target everyone from Fortune 500 to twenty-five-person consulting firms, and the lures are tuned by AI to be specific to your role, your company, and your active projects.' },
      { type: 'h3', text: 'Patterns to know' },
      { type: 'definitions', items: [
        ['Email phishing', 'A spoofed sender, a plausible business reason, a link that leads to a credential-harvesting page that looks exactly like the Microsoft sign-in. Often arrives at a moment of context: end of quarter, day before a holiday, during a known acquisition.'],
        ['Spear phishing', 'Personalized using public information about you and TQStarling. “Hi, this is Sarah from Cognizant TPRM, following up on the assessment...”'],
        ['Vishing (voice)', 'Phone calls, often spoofing the IT helpdesk or an executive. Deepfake audio is now cheap; trust your authentication training, not the timbre of the caller.'],
        ['Smishing (SMS)', 'Text messages claiming to be from delivery services, banks, or the CEO (“Are you available? I need a favor.”).'],
        ['Quishing (QR)', 'QR codes in emails or printed materials that lead to malicious sign-in pages.'],
        ['Adversary-in-the-middle (AiTM)', 'A phishing site that proxies the real sign-in flow and steals the session token. Defeats password and MFA. The only defense is a phishing-resistant authenticator (FIDO2) or, more practically, not landing on the phishing site in the first place.'],
      ]},
      { type: 'h3', text: 'Signals you can recognize' },
      { type: 'list', items: [
        'Urgency or pressure: “within the next hour,” “before close of business,” “the auditors are waiting.”',
        'A sender domain that’s almost right: tqstarl1ng.com, security@tqstarling-corp.com, microsoftonl1ne.com.',
        'A request for credentials, MFA codes, gift cards, payroll changes, or wire transfers — especially out of normal channel.',
        'Generic salutation when the sender should know you.',
        'Attachments you weren’t expecting, particularly .htm, .iso, .lnk, or password-protected zips.',
        'A link whose visible text doesn’t match the actual URL when you hover.',
      ]},
      { type: 'h3', text: 'What to do' },
      { type: 'p', text: 'If unsure, use the Report Phishing button in Outlook (or forward to security@tqstarling.com). Do not reply, do not click, do not enter credentials. If you’ve already clicked, jump to Module 08.' },
      { type: 'callout', tone: 'neutral', title: 'Quarterly simulations', text: 'TQStarling runs phishing simulations every quarter. These aren’t gotchas — they’re how we calibrate. If you fail a simulation, you’ll be assigned a short remedial module within fourteen days.' },
    ],
    check: {
      question: 'An email from “Tim, CEO” arrives asking you to buy $500 in gift cards for a client thank-you and send the codes back. The signature looks right but the reply-to address is timothy.smith.tqs@protonmail.com. What do you do?',
      options: [
        'Buy the cards and expense them — the CEO is asking',
        'Reply asking for verification before acting',
        'Use the Report Phishing button in Outlook and notify security',
        'Forward to your manager and ask',
      ],
      correct: 2,
      explanation: 'Classic CEO fraud / BEC. The reply-to on a personal Proton address is a confirmed indicator. Replying tips off the attacker that you’re engaged. Forwarding clogs your manager’s inbox. Report it through the proper channel and let the IR team take it from there.',
    },
  },
  {
    id: 'devices',
    number: '05',
    eyebrow: 'Endpoints',
    title: 'Your devices',
    minutes: 5,
    icon: Smartphone,
    blocks: [
      { type: 'lead', text: 'Most security controls live on your endpoint. The endpoint must remain the endpoint we trust.' },
      { type: 'p', text: 'TQStarling-issued laptops are enrolled in Microsoft Intune, encrypted with BitLocker (Windows) or FileVault (macOS), and reporting to Microsoft Defender for Endpoint. Keep them that way.' },
      { type: 'h3', text: 'Endpoint expectations' },
      { type: 'list', items: [
        'Updates install on schedule. Critical security updates have a seven-day deployment SLA; quality updates fourteen days. Don’t disable updates.',
        'Don’t install unauthorized software. Use the Company Portal for approved apps. If you need something not in the catalog, request it through IT.',
        'Don’t disable Defender or BitLocker / FileVault. These are not optional.',
        'Local administrator rights are granted only to specific roles. If you have them, use them for installation only; do not run as administrator day-to-day.',
      ]},
      { type: 'h3', text: 'Working from anywhere' },
      { type: 'p', text: 'TQStarling is fully remote, which means your home is a workplace. Treat it like one.' },
      { type: 'list', items: [
        'Home Wi-Fi: change the default router admin password. WPA2 or WPA3 only.',
        'Public Wi-Fi (coffee shops, airports, hotels): acceptable for Internal-classified work. For Confidential or Restricted, use your phone’s hotspot or wait until you’re on a trusted network.',
        'Lock your screen when you step away — at home, at a client site, anywhere.',
      ]},
      { type: 'callout', tone: 'warn', title: 'Family-device rule', text: 'Don’t let family members use your work laptop. This sounds blunt because it is. Your work device is for workforce members only, including incidental tasks like “just printing something.” A single login by a family member can break compliance commitments to clients.' },
      { type: 'h3', text: 'Phones and mobile' },
      { type: 'p', text: 'If you access Microsoft 365 (email, Teams, SharePoint) from your phone, your phone must be enrolled in Intune Mobile Application Management (MAM). MAM doesn’t take over your phone; it just secures the work apps. You can decline MAM, but then you can’t access M365 from that device.' },
      { type: 'h3', text: 'USB and removable media' },
      { type: 'p', text: 'Don’t plug unknown USB devices into your work laptop, ever. For deliberate use of removable media, request guidance from IT — and in practice, almost no use case at TQStarling requires it; SharePoint and OneDrive cover sharing.' },
    ],
    check: {
      question: 'You’re in an airport lounge. Your laptop connects to “Lounge Free WiFi.” You need to send a Confidential client document. What do you do?',
      options: [
        'Send normally — the document is encrypted in transit anyway',
        'Switch to your phone hotspot for the upload',
        'Use the lounge Wi-Fi but disable Defender for performance',
        'Just send it; airport networks are screened',
      ],
      correct: 1,
      explanation: 'Public Wi-Fi is acceptable for Internal work, but Confidential or Restricted material should go over a network you control — your phone hotspot is the practical answer.',
    },
  },
  {
    id: 'sharing',
    number: '06',
    eyebrow: 'Communication',
    title: 'Email, files, and sharing',
    minutes: 5,
    icon: Eye,
    blocks: [
      { type: 'lead', text: 'How you move information is as important as how you store it.' },
      { type: 'h3', text: 'Email' },
      { type: 'list', items: [
        'Use Outlook for work email. Don’t forward work email to a personal account. The Acceptable Use Policy (TQS-AUP-001) prohibits forwarding for a reason: once mail is in a personal inbox, it’s outside the Company’s data perimeter.',
        'Apply sensitivity labels to outgoing email. The label drives whether the message is encrypted in transit and at rest.',
        'For Restricted information sent by email, use Microsoft 365 Message Encryption. The recipient gets a secured view; the message isn’t sitting in plaintext in some other system.',
        'Pay attention to the recipient line. Autocomplete will happily address Sandy Smith at a competitor when you meant Sandy Smith at the client. Slow down on the To field.',
        'Reply-all is for replying to all. Most of the time, that’s not what you want.',
      ]},
      { type: 'h3', text: 'Files and sharing' },
      { type: 'list', items: [
        'Store work files in OneDrive or SharePoint, not on your local desktop.',
        'Share via secure links with expiration dates and recipient restriction.',
        'Anonymous links to documents containing Personal Information are prohibited — full stop.',
        'For external sharing, prefer “Specific people” links. The link works only for the named recipients, who must sign in.',
        'Don’t share work files through personal cloud (personal Google Drive, personal Dropbox, WeTransfer).',
        'For files someone outside the Company has shared with you, treat their classification as authoritative. If they’ve marked it Confidential, it stays Confidential.',
      ]},
      { type: 'h3', text: 'A note on Teams' },
      { type: 'p', text: 'Teams chat messages are messages. They are governed by the same data classification and retention rules as anything else. Don’t paste credentials, secrets, or Restricted snippets into Teams chats — even with a single colleague. Use the right tool: secrets in the password manager, files in SharePoint.' },
    ],
    check: {
      question: 'A client emergency comes up after hours and you need to send a Restricted document to a partner organization. The fastest acceptable path is:',
      options: [
        'Personal Gmail to their personal Gmail',
        'A WeTransfer link valid for twenty-four hours',
        'A SharePoint “Specific people” link to their work address, with expiration set',
        'Drop a USB drive at their office in the morning',
      ],
      correct: 2,
      explanation: 'SharePoint “Specific people” links keep the document in the TQStarling perimeter and require the recipient to authenticate. WeTransfer, personal email, and USB all move the document outside Company controls.',
    },
  },
  {
    id: 'ai',
    number: '07',
    eyebrow: 'Tooling',
    title: 'AI and generative tools',
    minutes: 4,
    icon: Bot,
    blocks: [
      { type: 'lead', text: 'AI is a force multiplier. It also remembers what you tell it.' },
      { type: 'p', text: 'TQStarling permits the use of generative AI under the Acceptable Use Policy (TQS-AUP-001 §7). The rules are simple and the rules matter.' },
      { type: 'h3', text: 'Use only Company-approved AI services' },
      { type: 'p', text: 'The current approved set is published in the AUP and on SharePoint. Free public-tier consumer AI tools — where prompts may be used for training, where there’s no enterprise data control — are not on the approved list for any work-related task that involves non-public information.' },
      { type: 'callout', tone: 'warn', title: 'Don’t paste Confidential or Restricted into unapproved AI', text: 'This is the single most common AI-related policy violation across the industry. The temptation is real — “I’ll just have ChatGPT summarize this client memo” — and the consequence is real: that memo is now in an external system, possibly used in training, possibly visible to support staff. Once it’s pasted, you can’t take it back.' },
      { type: 'h3', text: 'When you do use an approved tool' },
      { type: 'list', items: [
        'The output is your responsibility. AI hallucinates — confidently. If you put AI-generated content into a client deliverable without verifying it, that’s on you, not the model.',
        'Don’t represent AI-generated work as your own original analysis. If you used AI to draft, edit, or research, the human reviewing the output is what makes it work product.',
        'Treat AI conversations like email: assume someone could review them. Don’t enter credentials, secrets, or sensitive personal information.',
        'If you’re unsure whether a tool is approved or a use case acceptable, ask before pasting. Thirty seconds of asking is far cheaper than reversing a paste.',
      ]},
    ],
    check: {
      question: 'You’re using a Company-approved AI assistant to help draft a status update for an internal team meeting. Which is appropriate?',
      options: [
        'Pasting a section of a client SOW marked Confidential for the AI to summarize',
        'Pasting your own meeting notes (Internal) and asking the AI for a tightened draft',
        'Asking the AI for a list of the client’s competitors and presenting it as TQStarling analysis without review',
        'Pasting a colleague’s credentials so the AI can format them',
      ],
      correct: 1,
      explanation: 'Internal-classified material in an approved tool is fine. Confidential or Restricted client material is not. AI output presented as analysis without your review is on you when it’s wrong. Credentials never go into an AI prompt under any circumstances.',
    },
  },
  {
    id: 'reporting',
    number: '08',
    eyebrow: 'Response',
    title: 'Reporting incidents',
    minutes: 4,
    icon: Bell,
    blocks: [
      { type: 'lead', text: 'Speed matters more than certainty. If something looks wrong, report it.' },
      { type: 'p', text: 'The Incident Response Policy (TQS-IRP-001) sets a one-hour target for reporting suspected security incidents. Not for confirming them, not for diagnosing them — just for reporting. Confirmation comes later, from the incident response team. Your job is the first phone call.' },
      { type: 'h3', text: 'What counts as a suspected incident' },
      { type: 'list', items: [
        'A phishing email you may have clicked.',
        'A laptop you left in a taxi; a phone left in a hotel.',
        'An MFA prompt you didn’t initiate.',
        'A Teams or email message that has you in it but seems wrong (someone replying to a conversation you weren’t part of; a contact’s tone that’s off).',
        'A document you sent to the wrong recipient.',
        'A vendor or sub-processor informing you of a breach.',
        'Anything where you have a feeling, even unconfirmed, that something is off.',
      ]},
      { type: 'callout', tone: 'gold', title: 'When in doubt, report.', text: 'There is no penalty for an unfounded report; there is significant penalty — including to you personally — for sitting on a real incident. Anti-retaliation under the Code of Conduct (TQS-COC-001 §19) protects good-faith reports.' },
      { type: 'h3', text: 'How to report' },
      { type: 'list', items: [
        'Email: security@tqstarling.com — works any time.',
        'Teams: post in #security-incidents.',
        'Phone hotline: published on the SharePoint Security page (24/7).',
        'For suspected phishing email specifically: the Report Phishing button in Outlook is the fastest path.',
      ]},
      { type: 'h3', text: 'What to include' },
      { type: 'list', items: [
        'What happened, in plain language.',
        'When it happened (your local time is fine).',
        'What system or document is involved.',
        'What you’ve done so far (e.g., “I clicked the link before I realized”).',
      ]},
      { type: 'h3', text: 'After reporting' },
      { type: 'p', text: 'Don’t try to investigate. Don’t try to remediate. The IR team needs the system in the state it’s in for evidence preservation. Be available for questions — incident response is fast-moving in the first hour. Don’t discuss the incident on email or external channels other than as directed by the Incident Commander.' },
    ],
    check: {
      question: 'You realize that twenty minutes ago you may have clicked a link in a phishing email and entered your credentials before noticing something was off. What do you do right now?',
      options: [
        'Wait and watch — if nothing happens in a day, you’re probably fine',
        'Close the browser and clear cookies — that should reset things',
        'Report to security@tqstarling.com immediately and follow IR team instructions',
        'Email your manager only',
      ],
      correct: 2,
      explanation: 'Time is the variable that matters here. Within minutes the IR team can revoke your sessions, rotate your password, and check for downstream activity. Closing the browser doesn’t help; waiting hurts.',
    },
  },
];

// =============================================================
// CONTENT — Final exam (15 questions)
// =============================================================

const EXAM = [
  {
    q: 'You receive a spreadsheet from a healthcare client containing patient names, dates of birth, and treatment summaries. What is the minimum classification?',
    options: ['Internal', 'Confidential', 'Restricted', 'PHI (treated as Restricted with HIPAA obligations)'],
    correct: 3,
    topic: 'Classification',
  },
  {
    q: 'You receive a Microsoft Authenticator push notification you didn’t initiate. What do you do?',
    options: ['Approve — must be a delayed prompt', 'Deny and report to security', 'Ignore — it will time out', 'Approve once, deny if more come'],
    correct: 1,
    topic: 'Authentication',
  },
  {
    q: 'Your manager messages you on Teams asking for your password to grab a file from your OneDrive while you’re on PTO. The right response is:',
    options: ['Share it just this once', 'Share but change it tomorrow', 'Decline and direct them to request access through SharePoint sharing', 'Share with a coworker instead'],
    correct: 2,
    topic: 'Authentication',
  },
  {
    q: 'Which of these is NOT a typical phishing indicator?',
    options: ['Urgent tone demanding action in 24 hours', 'Sender domain slightly different from expected', 'HTTPS in the link URL', 'Unexpected password-protected attachment'],
    correct: 2,
    topic: 'Phishing',
  },
  {
    q: 'The right way to handle a suspicious email is:',
    options: ['Forward it to your manager and wait', 'Delete it and move on', 'Use the Report Phishing button in Outlook (or forward to security@tqstarling.com)', 'Reply asking the sender to confirm'],
    correct: 2,
    topic: 'Phishing',
  },
  {
    q: 'You’re working from a hotel and need to access Restricted client data. What’s the required posture?',
    options: ['Hotel Wi-Fi is fine — traffic is encrypted', 'Use your phone hotspot from a work-issued laptop with MFA', 'Use a coworker’s laptop if yours is down', 'Wait until you’re home before doing anything'],
    correct: 1,
    topic: 'Devices',
  },
  {
    q: 'A family member asks to borrow your work laptop to print a school form. You should:',
    options: ['Allow it — it’s only printing', 'Allow it with supervision', 'Decline — work devices are for workforce members only', 'Let them use it after you log out'],
    correct: 2,
    topic: 'Devices',
  },
  {
    q: 'The fastest acceptable way to share a Restricted document with an external partner is:',
    options: ['Email it as an attachment', 'A personal Dropbox link', 'A SharePoint or OneDrive “Specific people” link with expiration', 'Hand off a USB drive'],
    correct: 2,
    topic: 'Sharing',
  },
  {
    q: 'Anonymous SharePoint share links to documents containing Personal Information are:',
    options: ['Permitted if the link has an expiration', 'Permitted for internal-only audiences', 'Prohibited', 'Permitted for low-sensitivity Personal Information'],
    correct: 2,
    topic: 'Sharing',
  },
  {
    q: 'You’re using a Company-approved AI tool to help with a status report. Which is acceptable?',
    options: ['Pasting raw client data marked Confidential for a quick summary', 'Pasting your own Internal-classified meeting notes for a tightened draft', 'Pasting a sensitive password so the AI can rate its strength', 'Pasting a colleague’s draft without their permission to rewrite it'],
    correct: 1,
    topic: 'AI',
  },
  {
    q: 'Who is responsible for the accuracy of AI-generated content you incorporate into client work?',
    options: ['The AI vendor', 'Your manager', 'You', 'No one — it’s experimental output'],
    correct: 2,
    topic: 'AI',
  },
  {
    q: 'You suspect you clicked a phishing link about thirty minutes ago. You should:',
    options: ['Wait and see if anything bad happens', 'Disconnect from the network and report immediately', 'Close the browser to undo the click', 'Email your direct manager only'],
    correct: 1,
    topic: 'Reporting',
  },
  {
    q: 'TQStarling’s target window for reporting a suspected security incident is:',
    options: ['Within 1 hour', 'Within 24 hours', 'Next business day', 'End of the week'],
    correct: 0,
    topic: 'Reporting',
  },
  {
    q: 'A friend who is a customer of one of your clients asks you to look up their own account record “as a favor.” What do you do?',
    options: ['Help — it’s their own data', 'Help but don’t mention it to anyone', 'Decline — it is outside your authorized purposes and is a privacy violation', 'Ask your manager for permission first'],
    correct: 2,
    topic: 'Privacy',
  },
  {
    q: 'You report a suspected ethics violation through internal channels in good faith. Can the Company retaliate against you?',
    options: ['Yes, if leadership disagrees with the report', 'No — retaliation is itself a violation of the Code of Conduct and is prohibited by law', 'Only if the report was anonymous', 'Only if you didn’t follow the procedure exactly'],
    correct: 1,
    topic: 'Conduct',
  },
];

// =============================================================
// Storage helpers
// =============================================================

// Progress is keyed per signed-in user so a shared machine never
// shows one person's progress to another.
function storageKeyFor(email) {
  return email ? `${STORAGE_KEY}:${email.toLowerCase()}` : STORAGE_KEY;
}
async function loadState(email) {
  try {
    const val = localStorage.getItem(storageKeyFor(email));
    if (val) return JSON.parse(val);
  } catch (e) { /* no state or corrupted */ }
  return null;
}
async function saveState(email, s) {
  try {
    localStorage.setItem(storageKeyFor(email), JSON.stringify(s));
  } catch (e) { /* quota exceeded or private-mode */ }
}

// =============================================================
// Auth + results API
// =============================================================

// Returns { name, email, priorResult } or null when not signed in.
async function fetchMe() {
  try {
    const res = await fetch('/api/me', { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// Records an exam submission (pass or fail). Identity comes from the
// server-side session; we only send the attempt data.
async function postResult(payload) {
  const res = await fetch('/api/results', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`save failed (${res.status})`);
  return res.json();
}

// =============================================================
// Block renderer (module content)
// =============================================================

function ClassificationTable() {
  const rows = [
    ['Public', 'Marketing materials, the website, published research.', 'Anyone can see it.'],
    ['Internal', 'General company communications, drafts, internal documents.', 'Workforce only.'],
    ['Confidential', 'Most client work product, employee information, financial data.', 'Need-to-know.'],
    ['Restricted', 'Sensitive client data, secrets, regulated information, IP under NDA.', 'Strict access controls.'],
    ['PHI', 'Protected Health Information under HIPAA.', 'Treated as Restricted, plus HIPAA Business Associate obligations.'],
  ];
  return (
    <div className="my-6 overflow-hidden" style={{ border: `1px solid ${BRAND.rule}` }}>
      <div className="grid grid-cols-12 px-4 py-3" style={{ background: BRAND.dark, color: BRAND.cream }}>
        <div className="col-span-2 text-xs uppercase tracking-widest font-semibold">Class</div>
        <div className="col-span-6 text-xs uppercase tracking-widest font-semibold">Examples</div>
        <div className="col-span-4 text-xs uppercase tracking-widest font-semibold">Who can access</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-12 px-4 py-3 text-sm" style={{
          background: i % 2 ? BRAND.paper : 'white',
          borderTop: i ? `1px solid ${BRAND.ruleSoft}` : 'none',
        }}>
          <div className="col-span-2 font-semibold" style={{ color: BRAND.dark, fontFamily: 'var(--fnt-display)' }}>{r[0]}</div>
          <div className="col-span-6" style={{ color: BRAND.ink }}>{r[1]}</div>
          <div className="col-span-4" style={{ color: BRAND.muted }}>{r[2]}</div>
        </div>
      ))}
    </div>
  );
}

function Block({ block }) {
  if (block.type === 'lead') {
    return <p className="text-xl leading-relaxed mb-6" style={{ color: BRAND.dark, fontFamily: 'var(--fnt-display)', fontWeight: 400, letterSpacing: '-0.005em' }}>{block.text}</p>;
  }
  if (block.type === 'p') {
    return <p className="text-base leading-relaxed mb-5" style={{ color: BRAND.ink }}>{block.text}</p>;
  }
  if (block.type === 'h3') {
    return <h3 className="text-lg mt-8 mb-3 font-semibold" style={{ color: BRAND.green, fontFamily: 'var(--fnt-display)' }}>{block.text}</h3>;
  }
  if (block.type === 'list') {
    return (
      <ul className="space-y-2 mb-5 ml-1">
        {block.items.map((it, i) => (
          <li key={i} className="flex gap-3 text-base leading-relaxed" style={{ color: BRAND.ink }}>
            <span className="mt-2 flex-shrink-0" style={{ width: 6, height: 6, borderRadius: '50%', background: BRAND.gold }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === 'numbered') {
    return (
      <ol className="space-y-3 mb-5">
        {block.items.map((it, i) => (
          <li key={i} className="flex gap-4 text-base leading-relaxed" style={{ color: BRAND.ink }}>
            <span className="flex-shrink-0 font-semibold text-sm pt-0.5" style={{ color: BRAND.gold, fontFamily: 'var(--fnt-display)' }}>{i + 1}.</span>
            <span>{it}</span>
          </li>
        ))}
      </ol>
    );
  }
  if (block.type === 'definitions') {
    return (
      <dl className="space-y-4 mb-6">
        {block.items.map(([term, def], i) => (
          <div key={i} className="grid sm:grid-cols-12 gap-2 sm:gap-4 pb-4" style={{ borderBottom: i < block.items.length - 1 ? `1px solid ${BRAND.ruleSoft}` : 'none' }}>
            <dt className="sm:col-span-3 font-semibold text-sm pt-0.5" style={{ color: BRAND.dark, fontFamily: 'var(--fnt-display)' }}>{term}</dt>
            <dd className="sm:col-span-9 text-base leading-relaxed" style={{ color: BRAND.ink }}>{def}</dd>
          </div>
        ))}
      </dl>
    );
  }
  if (block.type === 'callout') {
    const tones = {
      gold: { bg: BRAND.cream, border: BRAND.gold, accent: BRAND.gold, label: BRAND.dark },
      neutral: { bg: BRAND.offWhite, border: BRAND.rule, accent: BRAND.green, label: BRAND.dark },
      warn: { bg: BRAND.warnBg, border: BRAND.warn, accent: BRAND.warn, label: BRAND.warn },
    };
    const t = tones[block.tone] || tones.neutral;
    return (
      <div className="my-6 p-5" style={{ background: t.bg, borderLeft: `3px solid ${t.accent}` }}>
        {block.title && (
          <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: t.label }}>{block.title}</div>
        )}
        <p className="text-base leading-relaxed" style={{ color: BRAND.ink }}>{block.text}</p>
      </div>
    );
  }
  if (block.type === 'classTable') {
    return <ClassificationTable />;
  }
  return null;
}

// =============================================================
// Knowledge check
// =============================================================

function KnowledgeCheck({ check, answered, onAnswer }) {
  const [selected, setSelected] = useState(answered?.idx ?? null);
  const [submitted, setSubmitted] = useState(answered != null);

  function submit() {
    if (selected == null) return;
    const correct = selected === check.correct;
    setSubmitted(true);
    onAnswer({ idx: selected, correct });
  }
  function reset() {
    setSelected(null);
    setSubmitted(false);
    onAnswer(null);
  }

  return (
    <div className="mt-10 p-6 sm:p-8" style={{ background: 'white', border: `1px solid ${BRAND.rule}` }}>
      <div className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: BRAND.gold }}>Knowledge check</div>
      <h4 className="text-lg leading-snug mb-5" style={{ color: BRAND.dark, fontFamily: 'var(--fnt-display)', fontWeight: 500 }}>{check.question}</h4>
      <div className="space-y-2">
        {check.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = submitted && i === check.correct;
          const isWrongPick = submitted && isSelected && i !== check.correct;
          const cursor = submitted ? 'default' : 'pointer';
          let bg = 'white', border = BRAND.rule, color = BRAND.ink;
          if (isCorrect) { bg = BRAND.successBg; border = BRAND.success; color = BRAND.success; }
          else if (isWrongPick) { bg = BRAND.warnBg; border = BRAND.warn; color = BRAND.warn; }
          else if (isSelected) { bg = BRAND.cream; border = BRAND.gold; }
          return (
            <button
              key={i}
              type="button"
              disabled={submitted}
              onClick={() => setSelected(i)}
              className="w-full text-left p-3.5 text-sm leading-relaxed flex items-start gap-3 transition-colors"
              style={{ background: bg, border: `1px solid ${border}`, color, cursor }}
            >
              <span className="mt-0.5 flex-shrink-0" style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `1.5px solid ${isCorrect || isWrongPick || isSelected ? border : BRAND.rule}`,
                background: isCorrect || isWrongPick ? border : 'white',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isCorrect && <Check size={11} color="white" strokeWidth={3} />}
                {isWrongPick && <X size={11} color="white" strokeWidth={3} />}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {!submitted && (
        <button
          type="button"
          onClick={submit}
          disabled={selected == null}
          className="mt-5 px-5 py-2.5 text-sm font-semibold transition-opacity"
          style={{
            background: selected == null ? BRAND.rule : BRAND.dark,
            color: selected == null ? BRAND.muted : 'white',
            opacity: selected == null ? 0.7 : 1,
            cursor: selected == null ? 'not-allowed' : 'pointer',
          }}
        >
          Check answer
        </button>
      )}
      {submitted && (
        <div className="mt-5 p-4 text-sm leading-relaxed" style={{ background: BRAND.offWhite, borderLeft: `2px solid ${selected === check.correct ? BRAND.success : BRAND.gold}`, color: BRAND.ink }}>
          <div className="font-semibold mb-1" style={{ color: selected === check.correct ? BRAND.success : BRAND.warn }}>
            {selected === check.correct ? 'Correct.' : 'Not quite.'}
          </div>
          {check.explanation}
          <button onClick={reset} type="button" className="ml-3 text-xs underline" style={{ color: BRAND.muted }}>Try again</button>
        </div>
      )}
    </div>
  );
}

// =============================================================
// Sidebar
// =============================================================

function Sidebar({ modules, currentIdx, completedMap, atExam, examState, onNavigate, name, email, isAdmin, onAdmin }) {
  return (
    <nav className="h-full" style={{ background: BRAND.dark, color: BRAND.cream, minHeight: '100vh' }}>
      <div className="p-6 sm:p-7" style={{ borderBottom: `1px solid rgba(255,255,255,0.1)` }}>
        <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: BRAND.goldSoft }}>TQStarling</div>
        <div className="mt-1 text-base leading-tight" style={{ fontFamily: 'var(--fnt-display)' }}>Security &amp; Information<br />Security Awareness</div>
        <div className="mt-3 text-xs" style={{ color: 'rgba(246,243,236,0.6)' }}>2026 Edition · v{TRAINING_VERSION}</div>
      </div>
      <div className="p-6 sm:p-7 space-y-1">
        {modules.map((m, i) => {
          const isCurrent = !atExam && i === currentIdx;
          const isDone = completedMap[m.id];
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onNavigate(i, false)}
              className="w-full text-left flex items-start gap-3 py-2 group transition-opacity"
              style={{ opacity: isCurrent ? 1 : 0.85 }}
            >
              <span className="flex-shrink-0 text-xs pt-1" style={{
                fontFamily: 'var(--fnt-display)',
                color: isCurrent ? BRAND.gold : isDone ? BRAND.goldSoft : 'rgba(246,243,236,0.5)',
                fontWeight: 600,
              }}>{m.number}</span>
              <span className="text-sm leading-snug flex-1" style={{
                color: isCurrent ? 'white' : isDone ? BRAND.cream : 'rgba(246,243,236,0.7)',
                fontWeight: isCurrent ? 600 : 400,
              }}>
                {m.title}
              </span>
              <span className="flex-shrink-0 mt-1">
                {isDone ? <CheckCircle2 size={14} style={{ color: BRAND.gold }} /> :
                  isCurrent ? <Dot size={20} style={{ color: BRAND.gold }} /> :
                  <Circle size={12} style={{ color: 'rgba(246,243,236,0.3)' }} />}
              </span>
            </button>
          );
        })}
        <div className="my-3" style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
        <button
          type="button"
          onClick={() => onNavigate(modules.length, true)}
          className="w-full text-left flex items-start gap-3 py-2 group"
          style={{ opacity: atExam ? 1 : 0.85 }}
        >
          <span className="flex-shrink-0 text-xs pt-1" style={{
            fontFamily: 'var(--fnt-display)',
            color: atExam ? BRAND.gold : examState?.passed ? BRAND.goldSoft : 'rgba(246,243,236,0.5)',
            fontWeight: 600,
          }}>09</span>
          <span className="text-sm leading-snug flex-1" style={{
            color: atExam ? 'white' : 'rgba(246,243,236,0.7)',
            fontWeight: atExam ? 600 : 400,
          }}>
            Final examination
          </span>
          <span className="flex-shrink-0 mt-1">
            {examState?.passed ? <CheckCircle2 size={14} style={{ color: BRAND.gold }} /> :
              atExam ? <Dot size={20} style={{ color: BRAND.gold }} /> :
              <Circle size={12} style={{ color: 'rgba(246,243,236,0.3)' }} />}
          </span>
        </button>
      </div>
      {name && (
        <div className="px-6 sm:px-7 pb-6 mt-4" style={{ borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          <div className="pt-4 text-xs uppercase tracking-widest font-semibold" style={{ color: BRAND.goldSoft }}>Workforce member</div>
          <div className="mt-1 text-sm" style={{ color: 'white' }}>{name}</div>
          {email && <div className="text-xs mt-0.5" style={{ color: 'rgba(246,243,236,0.6)' }}>{email}</div>}
          {isAdmin && (
            <button type="button" onClick={onAdmin} className="mt-3 w-full text-left px-3 py-2 text-xs font-semibold inline-flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.08)', color: BRAND.goldSoft, border: `1px solid rgba(217,181,116,0.35)` }}>
              <Shield size={13} /> Admin dashboard
            </button>
          )}
          <a href="/auth/logout" className="inline-block mt-2 text-xs underline" style={{ color: 'rgba(246,243,236,0.5)' }}>Sign out</a>
        </div>
      )}
    </nav>
  );
}

// =============================================================
// Welcome screen
// =============================================================

function WelcomeScreen({ onStart, user, resuming, onAdmin }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-10" style={{ background: BRAND.paper }}>
      <div className="max-w-2xl w-full">
        <div className="text-xs uppercase tracking-[0.2em] font-semibold mb-3" style={{ color: BRAND.gold }}>
          TQStarling · {TRAINING_ID}
        </div>
        <h1 className="text-5xl sm:text-6xl leading-[1.05] mb-2" style={{ color: BRAND.dark, fontFamily: 'var(--fnt-display)', fontWeight: 500, letterSpacing: '-0.02em' }}>
          Security &amp;<br />Information Security<br />Awareness
        </h1>
        <div className="my-6" style={{ width: 80, height: 2, background: BRAND.gold }} />
        <p className="text-lg leading-relaxed mb-2" style={{ color: BRAND.dark, fontFamily: 'var(--fnt-display)' }}>
          2026 Edition — Version {TRAINING_VERSION}
        </p>
        <p className="text-base leading-relaxed mb-8" style={{ color: BRAND.ink, maxWidth: '36rem' }}>
          A required course for the TQStarling Workforce. Eight short modules and a fifteen-question examination. Approximately thirty to forty-five minutes. Your progress is saved as you go, so you can complete it across multiple sittings.
        </p>

        {!user ? (
          <>
            <p className="text-sm leading-relaxed mb-6" style={{ color: BRAND.muted, maxWidth: '32rem' }}>
              Sign in with your TQStarling work account to begin. Your completion record is filed under your verified directory identity.
            </p>
            <a
              href="/auth/login"
              className="px-7 py-3.5 text-sm font-semibold inline-flex items-center gap-3 no-underline"
              style={{ background: BRAND.dark, color: 'white' }}
            >
              {/* Microsoft logo */}
              <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true">
                <rect x="0" y="0" width="10" height="10" fill="#F25022" />
                <rect x="11" y="0" width="10" height="10" fill="#7FBA00" />
                <rect x="0" y="11" width="10" height="10" fill="#00A4EF" />
                <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
              </svg>
              Sign in with Microsoft
            </a>
          </>
        ) : (
          <>
            <div className="mb-6 p-4 flex items-center gap-3" style={{ background: 'white', border: `1px solid ${BRAND.rule}`, maxWidth: '32rem' }}>
              <span className="flex-shrink-0 inline-flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: '50%', background: BRAND.cream, color: BRAND.dark, fontFamily: 'var(--fnt-display)', fontWeight: 600 }}>
                {user.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: BRAND.dark }}>{user.name}</div>
                <div className="text-xs truncate" style={{ color: BRAND.muted }}>{user.email}</div>
              </div>
              <a href="/auth/logout" className="ml-auto text-xs underline flex-shrink-0" style={{ color: BRAND.muted }}>
                Not you?
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStart}
                className="px-7 py-3.5 text-sm font-semibold inline-flex items-center gap-2"
                style={{ background: BRAND.dark, color: 'white', cursor: 'pointer' }}
              >
                {resuming ? 'Resume training' : 'Begin training'}
                <ChevronRight size={16} />
              </button>
              {user.isAdmin && (
                <button
                  type="button"
                  onClick={onAdmin}
                  className="px-7 py-3.5 text-sm font-semibold inline-flex items-center gap-2"
                  style={{ background: 'white', color: BRAND.dark, border: `1px solid ${BRAND.rule}`, cursor: 'pointer' }}
                >
                  <Shield size={15} style={{ color: BRAND.gold }} />
                  Admin
                </button>
              )}
            </div>
          </>
        )}

        <div className="mt-12 pt-6 text-xs leading-relaxed" style={{ borderTop: `1px solid ${BRAND.rule}`, color: BRAND.muted, maxWidth: '32rem' }}>
          Your examination results are recorded automatically under your TQStarling account in the training results database per TQS-HRS-001 §5 and retained for six years. By proceeding you acknowledge that the answers you provide reflect your own work.
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Module view
// =============================================================

function ModuleView({ module, idx, total, onPrev, onNext, kcAnswer, onKcAnswer, atFirst }) {
  const contentRef = useRef(null);
  useEffect(() => { if (contentRef.current) contentRef.current.scrollTop = 0; }, [module.id]);

  return (
    <div ref={contentRef} className="overflow-y-auto" style={{ height: '100vh', background: BRAND.paper }}>
      <div className="px-6 sm:px-12 lg:px-20 py-10 sm:py-14 max-w-3xl mx-auto">
        {/* Eyebrow */}
        <div className="text-xs uppercase tracking-[0.2em] font-semibold mb-6" style={{ color: BRAND.gold }}>
          {module.eyebrow}
        </div>

        {/* Big module number + title (signature element) */}
        <div className="flex items-start gap-6 sm:gap-8 mb-10">
          <div
            className="leading-none flex-shrink-0"
            style={{
              fontFamily: 'var(--fnt-display)',
              fontSize: 'clamp(64px, 12vw, 112px)',
              color: BRAND.gold,
              fontWeight: 300,
              letterSpacing: '-0.03em',
            }}
          >
            {module.number}
          </div>
          <div className="pt-2">
            <h1
              className="leading-[1.05]"
              style={{
                fontFamily: 'var(--fnt-display)',
                color: BRAND.dark,
                fontWeight: 500,
                letterSpacing: '-0.015em',
                fontSize: 'clamp(28px, 4.5vw, 44px)',
              }}
            >
              {module.title}
            </h1>
            <div className="mt-3 text-xs uppercase tracking-widest" style={{ color: BRAND.muted }}>
              Module {idx + 1} of {total} · about {module.minutes} min
            </div>
          </div>
        </div>

        <div className="mb-10" style={{ height: 1, background: BRAND.rule }} />

        {/* Content blocks */}
        <div>
          {module.blocks.map((b, i) => <Block key={i} block={b} />)}
        </div>

        {/* Knowledge check */}
        {module.check && (
          <KnowledgeCheck check={module.check} answered={kcAnswer} onAnswer={onKcAnswer} />
        )}

        {/* Navigation */}
        <div className="mt-14 pt-6 flex items-center justify-between" style={{ borderTop: `1px solid ${BRAND.rule}` }}>
          <button
            type="button"
            onClick={onPrev}
            disabled={atFirst}
            className="text-sm font-semibold inline-flex items-center gap-2 px-2 py-2"
            style={{
              color: atFirst ? BRAND.rule : BRAND.dark,
              cursor: atFirst ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
            style={{ background: BRAND.dark, color: 'white', cursor: 'pointer' }}
          >
            {idx === total - 1 ? 'Begin final exam' : 'Continue'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Final exam
// =============================================================

function ExamView({ exam, answers, onAnswer, onSubmit, onBack, submitted, score, saveStatus }) {
  const allAnswered = exam.every((_, i) => answers[i] != null);
  const passed = score != null && score / exam.length >= PASS_THRESHOLD;
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [submitted]);

  return (
    <div ref={ref} className="overflow-y-auto" style={{ height: '100vh', background: BRAND.paper }}>
      <div className="px-6 sm:px-12 lg:px-20 py-10 sm:py-14 max-w-3xl mx-auto">
        <div className="text-xs uppercase tracking-[0.2em] font-semibold mb-6" style={{ color: BRAND.gold }}>
          Final examination
        </div>
        <div className="flex items-start gap-6 sm:gap-8 mb-10">
          <div className="leading-none flex-shrink-0" style={{
            fontFamily: 'var(--fnt-display)',
            fontSize: 'clamp(64px, 12vw, 112px)',
            color: BRAND.gold, fontWeight: 300, letterSpacing: '-0.03em',
          }}>09</div>
          <div className="pt-2">
            <h1 className="leading-[1.05]" style={{
              fontFamily: 'var(--fnt-display)', color: BRAND.dark, fontWeight: 500,
              letterSpacing: '-0.015em', fontSize: 'clamp(28px, 4.5vw, 44px)',
            }}>What you’ve learned</h1>
            <div className="mt-3 text-xs uppercase tracking-widest" style={{ color: BRAND.muted }}>
              {exam.length} questions · pass at {Math.ceil(exam.length * PASS_THRESHOLD)} of {exam.length}
            </div>
          </div>
        </div>
        <div className="mb-10" style={{ height: 1, background: BRAND.rule }} />

        {!submitted && (
          <p className="text-base leading-relaxed mb-10" style={{ color: BRAND.ink }}>
            Answer all fifteen questions, then submit. Your score is calculated immediately. You can revisit any module before submitting; your answers here are saved as you go.
          </p>
        )}

        {submitted && (
          <div className="mb-10 p-6" style={{
            background: passed ? BRAND.successBg : BRAND.warnBg,
            borderLeft: `3px solid ${passed ? BRAND.success : BRAND.warn}`,
          }}>
            <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: passed ? BRAND.success : BRAND.warn }}>
              {passed ? 'Passed' : 'Not yet'}
            </div>
            <div className="text-2xl mb-1" style={{ fontFamily: 'var(--fnt-display)', color: BRAND.dark }}>
              {score} of {exam.length} correct · {Math.round((score / exam.length) * 100)}%
            </div>
            <p className="text-sm leading-relaxed mt-2" style={{ color: BRAND.ink }}>
              {passed
                ? 'Your result has been recorded in the training results database and your completion record is generated below.'
                : `You need at least ${Math.ceil(exam.length * PASS_THRESHOLD)} correct to pass. Review the highlighted questions, revisit the relevant modules, then retake the examination. This attempt has been recorded.`
              }
            </p>
            {saveStatus === 'error' && (
              <p className="text-xs leading-relaxed mt-2 font-semibold" style={{ color: BRAND.warn }}>
                This attempt could not be saved to the results database — check your connection. Your score is shown above; resubmitting after reconnecting will record it.
              </p>
            )}
          </div>
        )}

        <div className="space-y-8">
          {exam.map((item, qi) => {
            const sel = answers[qi];
            const isCorrect = submitted && sel === item.correct;
            const isWrong = submitted && sel != null && sel !== item.correct;
            return (
              <div key={qi}>
                <div className="flex items-start gap-4 mb-3">
                  <span className="flex-shrink-0 text-sm font-semibold pt-1" style={{ fontFamily: 'var(--fnt-display)', color: BRAND.gold }}>
                    {String(qi + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: BRAND.muted }}>
                      {item.topic}
                    </div>
                    <h3 className="text-base leading-snug" style={{ color: BRAND.dark, fontFamily: 'var(--fnt-display)', fontWeight: 500, fontSize: '1.1rem' }}>
                      {item.q}
                    </h3>
                  </div>
                  {submitted && (
                    isCorrect
                      ? <CheckCircle2 size={20} style={{ color: BRAND.success, flexShrink: 0 }} />
                      : isWrong
                        ? <X size={20} style={{ color: BRAND.warn, flexShrink: 0 }} />
                        : null
                  )}
                </div>
                <div className="space-y-1.5 ml-8">
                  {item.options.map((opt, oi) => {
                    const isSel = sel === oi;
                    const showCorrect = submitted && oi === item.correct;
                    const showWrong = submitted && isSel && oi !== item.correct;
                    let bg = 'white', border = BRAND.rule, color = BRAND.ink;
                    if (showCorrect) { bg = BRAND.successBg; border = BRAND.success; color = BRAND.success; }
                    else if (showWrong) { bg = BRAND.warnBg; border = BRAND.warn; color = BRAND.warn; }
                    else if (isSel) { bg = BRAND.cream; border = BRAND.gold; }
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={submitted}
                        onClick={() => onAnswer(qi, oi)}
                        className="w-full text-left p-3 text-sm leading-relaxed flex items-start gap-3"
                        style={{
                          background: bg, border: `1px solid ${border}`, color,
                          cursor: submitted ? 'default' : 'pointer',
                        }}
                      >
                        <span className="mt-0.5 flex-shrink-0" style={{
                          width: 16, height: 16, borderRadius: '50%',
                          border: `1.5px solid ${showCorrect || showWrong || isSel ? border : BRAND.rule}`,
                          background: showCorrect || showWrong ? border : 'white',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {showCorrect && <Check size={9} color="white" strokeWidth={3} />}
                          {showWrong && <X size={9} color="white" strokeWidth={3} />}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 pt-6 flex items-center justify-between" style={{ borderTop: `1px solid ${BRAND.rule}` }}>
          <button type="button" onClick={onBack} className="text-sm font-semibold inline-flex items-center gap-2 px-2 py-2" style={{ color: BRAND.dark }}>
            <ChevronLeft size={16} />
            Review modules
          </button>
          {!submitted && (
            <button
              type="button"
              disabled={!allAnswered}
              onClick={onSubmit}
              className="px-7 py-3 text-sm font-semibold inline-flex items-center gap-2"
              style={{
                background: allAnswered ? BRAND.dark : BRAND.rule,
                color: allAnswered ? 'white' : BRAND.muted,
                cursor: allAnswered ? 'pointer' : 'not-allowed',
              }}
            >
              Submit examination
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Certificate
// =============================================================

function Certificate({ name, email, score, total, date, onRetake, onPrint, saveStatus, onBack, onAdmin }) {
  return (
    <div className="overflow-y-auto" style={{ height: '100vh', background: BRAND.paper }}>
      <div className="px-6 sm:px-12 py-10 sm:py-14 max-w-3xl mx-auto">
        <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
          {onBack && (
            <button type="button" onClick={onBack} className="px-4 py-2 text-xs font-semibold inline-flex items-center gap-2" style={{ border: `1px solid ${BRAND.rule}`, color: BRAND.dark, background: 'white' }}>
              <ArrowLeft size={14} /> Back to results
            </button>
          )}
          <button type="button" onClick={onPrint} className="px-4 py-2 text-xs font-semibold inline-flex items-center gap-2" style={{ background: BRAND.dark, color: 'white' }}>
            <Printer size={14} /> Print / Save as PDF
          </button>
          {onRetake && (
            <button type="button" onClick={onRetake} className="px-4 py-2 text-xs font-semibold inline-flex items-center gap-2" style={{ border: `1px solid ${BRAND.rule}`, color: BRAND.dark, background: 'white' }}>
              <RefreshCw size={14} /> Retake examination
            </button>
          )}
          {onAdmin && (
            <button type="button" onClick={onAdmin} className="px-4 py-2 text-xs font-semibold inline-flex items-center gap-2" style={{ border: `1px solid ${BRAND.rule}`, color: BRAND.dark, background: 'white' }}>
              <Shield size={14} style={{ color: BRAND.gold }} /> Admin dashboard
            </button>
          )}
        </div>

        <div className="p-8 sm:p-14" style={{ background: 'white', border: `1px solid ${BRAND.rule}`, position: 'relative' }}>
          {/* Decorative corner rules */}
          <div style={{ position: 'absolute', top: 16, left: 16, width: 40, height: 40, borderTop: `2px solid ${BRAND.gold}`, borderLeft: `2px solid ${BRAND.gold}` }} />
          <div style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderTop: `2px solid ${BRAND.gold}`, borderRight: `2px solid ${BRAND.gold}` }} />
          <div style={{ position: 'absolute', bottom: 16, left: 16, width: 40, height: 40, borderBottom: `2px solid ${BRAND.gold}`, borderLeft: `2px solid ${BRAND.gold}` }} />
          <div style={{ position: 'absolute', bottom: 16, right: 16, width: 40, height: 40, borderBottom: `2px solid ${BRAND.gold}`, borderRight: `2px solid ${BRAND.gold}` }} />

          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: BRAND.gold }}>TQStarling LLC</div>
            <div className="text-xs uppercase tracking-widest mb-8" style={{ color: BRAND.muted }}>Professional Services · Information Technology</div>
            <div className="text-sm mb-2" style={{ color: BRAND.dark, fontFamily: 'var(--fnt-display)', fontStyle: 'italic' }}>
              Record of Completion
            </div>
            <h1 className="text-3xl sm:text-4xl leading-tight mb-2" style={{ fontFamily: 'var(--fnt-display)', color: BRAND.dark, fontWeight: 500 }}>
              Security &amp; Information<br />Security Awareness
            </h1>
            <div className="text-xs uppercase tracking-widest mb-10" style={{ color: BRAND.muted }}>2026 Edition · Version {TRAINING_VERSION}</div>

            <div style={{ height: 1, background: BRAND.ruleSoft, width: '70%', margin: '0 auto 32px' }} />

            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: BRAND.muted }}>This certifies that</div>
            <div className="text-3xl sm:text-4xl mb-1" style={{ fontFamily: 'var(--fnt-display)', color: BRAND.dark, fontWeight: 500, letterSpacing: '-0.01em' }}>
              {name}
            </div>
            {email && <div className="text-sm mb-8" style={{ color: BRAND.muted }}>{email}</div>}
            {!email && <div className="mb-8" />}

            <p className="text-base leading-relaxed mb-8" style={{ color: BRAND.ink, maxWidth: '32rem', margin: '0 auto' }}>
              has successfully completed the annual security and information security awareness training, including all required modules and a final examination, on
            </p>

            <div className="text-xl mb-2" style={{ fontFamily: 'var(--fnt-display)', color: BRAND.dark }}>{date}</div>

            <div style={{ height: 1, background: BRAND.ruleSoft, width: '40%', margin: '32px auto' }} />

            <div className="grid grid-cols-3 gap-6 text-left mt-6" style={{ maxWidth: '32rem', margin: '0 auto' }}>
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: BRAND.gold }}>Score</div>
                <div className="text-xl" style={{ fontFamily: 'var(--fnt-display)', color: BRAND.dark }}>{score} / {total}</div>
                <div className="text-xs" style={{ color: BRAND.muted }}>{Math.round((score / total) * 100)}%</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: BRAND.gold }}>Modules</div>
                <div className="text-xl" style={{ fontFamily: 'var(--fnt-display)', color: BRAND.dark }}>{MODULES.length}</div>
                <div className="text-xs" style={{ color: BRAND.muted }}>Completed</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: BRAND.gold }}>Training ID</div>
                <div className="text-sm font-mono" style={{ color: BRAND.dark }}>{TRAINING_ID}</div>
                <div className="text-xs" style={{ color: BRAND.muted }}>v{TRAINING_VERSION}</div>
              </div>
            </div>
          </div>
        </div>

        {onBack ? null : (
        <div className="mt-8 p-5 text-sm leading-relaxed" style={{ background: BRAND.cream, borderLeft: `3px solid ${saveStatus === 'error' ? BRAND.warn : BRAND.gold}`, color: BRAND.ink }}>
          <div className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: BRAND.dark }}>
            {saveStatus === 'error' ? 'Record not yet saved' : 'Record filed'}
          </div>
          {saveStatus === 'saving' && 'Recording your result in the training results database…'}
          {(saveStatus === 'saved' || saveStatus == null) && 'Your result has been recorded automatically in the training results database under your TQStarling account, per TQS-HRS-001 §5. Records are retained for six years. No further action is required — you may print a copy for your own records.'}
          {saveStatus === 'error' && 'Your result could not be saved to the training results database. Check your connection and retake or resubmit the examination; if the problem persists, contact security@tqstarling.com with a printed or PDF copy of this record.'}
        </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// Admin dashboard — results of all workforce members
// Access is enforced server-side (ADMIN_EMAILS); this UI only
// renders for users the server flagged as isAdmin.
// =============================================================

function AdminView({ user, onClose }) {
  const [rows, setRows] = useState(null);      // null = loading
  const [error, setError] = useState(null);
  const [reprint, setReprint] = useState(null); // result row being reprinted
  const [filter, setFilter] = useState('');

  async function load() {
    setError(null);
    try {
      const res = await fetch('/api/admin/results', { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRows((await res.json()).results);
    } catch (e) {
      setError('Could not load results. Refresh to retry; contact security@tqstarling.com if it persists.');
      setRows([]);
    }
  }
  useEffect(() => { load(); }, []);

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Reprint mode — render the standard Record of Completion with the
  // stored result data.
  if (reprint) {
    return (
      <Certificate
        name={reprint.user_name}
        email={reprint.user_email}
        score={reprint.score}
        total={reprint.total}
        date={fmtDate(reprint.completed_at)}
        onPrint={() => window.print()}
        onBack={() => setReprint(null)}
      />
    );
  }

  const filtered = (rows || []).filter((r) =>
    !filter.trim() ||
    r.user_name.toLowerCase().includes(filter.trim().toLowerCase()) ||
    r.user_email.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <div className="overflow-y-auto" style={{ height: '100vh', background: BRAND.paper }}>
      <div className="px-6 sm:px-12 py-10 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: BRAND.gold }}>
              TQStarling · {TRAINING_ID} · Administration
            </div>
            <h1 className="text-3xl sm:text-4xl leading-tight" style={{ color: BRAND.dark, fontFamily: 'var(--fnt-display)', fontWeight: 500 }}>
              Training results
            </h1>
          </div>
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold inline-flex items-center gap-2" style={{ border: `1px solid ${BRAND.rule}`, color: BRAND.dark, background: 'white' }}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
        <p className="text-sm mb-6" style={{ color: BRAND.muted }}>
          Every examination submission, newest first. Signed in as {user.email}. Records retained six years per TQS-HRS-001 §5.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by name or email…"
            className="px-4 py-2.5 text-sm outline-none"
            style={{ background: 'white', border: `1px solid ${BRAND.rule}`, color: BRAND.ink, minWidth: '16rem' }}
          />
          <a
            href="/api/admin/results.xlsx"
            className="px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2 no-underline"
            style={{ background: BRAND.dark, color: 'white' }}
          >
            Export to Excel
          </a>
          <button type="button" onClick={() => { setRows(null); load(); }} className="px-4 py-2.5 text-xs font-semibold inline-flex items-center gap-2" style={{ border: `1px solid ${BRAND.rule}`, color: BRAND.dark, background: 'white' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 mb-5 text-sm" style={{ background: BRAND.warnBg, borderLeft: `3px solid ${BRAND.warn}`, color: BRAND.warn }}>{error}</div>
        )}
        {rows === null && !error && (
          <div className="text-sm" style={{ color: BRAND.muted }}>Loading results…</div>
        )}
        {rows !== null && !error && filtered.length === 0 && (
          <div className="text-sm" style={{ color: BRAND.muted }}>{rows.length === 0 ? 'No examination submissions recorded yet.' : 'No results match the filter.'}</div>
        )}

        {filtered.length > 0 && (
          <div style={{ background: 'white', border: `1px solid ${BRAND.rule}`, overflowX: 'auto' }}>
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse', minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${BRAND.rule}` }}>
                  {['Name', 'Email', 'Score', 'Result', 'Version', 'Completed', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-widest font-semibold" style={{ color: BRAND.dark }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${BRAND.ruleSoft}` }}>
                    <td className="px-4 py-3" style={{ color: BRAND.ink }}>{r.user_name}</td>
                    <td className="px-4 py-3" style={{ color: BRAND.muted }}>{r.user_email}</td>
                    <td className="px-4 py-3" style={{ color: BRAND.ink }}>{r.score}/{r.total} · {Math.round((r.score / r.total) * 100)}%</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs font-semibold" style={r.passed
                        ? { background: BRAND.successBg, color: BRAND.success }
                        : { background: BRAND.warnBg, color: BRAND.warn }}>
                        {r.passed ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: BRAND.muted }}>v{r.training_version}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: BRAND.muted }}>{fmtDate(r.completed_at)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {r.passed && (
                        <button type="button" onClick={() => setReprint(r)} className="text-xs font-semibold inline-flex items-center gap-1.5 underline" style={{ color: BRAND.dark }}>
                          <Printer size={12} /> Reprint record
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// Main App
// =============================================================

export default function App() {
  // Inject fonts once
  useEffect(() => {
    if (!document.querySelector('link[data-tqs-fonts]')) {
      const link = document.createElement('link');
      link.dataset.tqsFonts = '1';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    if (!document.querySelector('style[data-tqs-style]')) {
      const s = document.createElement('style');
      s.dataset.tqsStyle = '1';
      s.textContent = `
        :root {
          --fnt-display: 'Fraunces', 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
          --fnt-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }
        body, .saa-root { font-family: var(--fnt-body); color: ${BRAND.ink}; }
        .saa-root * { -webkit-font-smoothing: antialiased; }
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
        }
      `;
      document.head.appendChild(s);
    }
  }, []);

  // State
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(null); // { name, email, priorResult } from /api/me — null until signed in
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [started, setStarted] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const [adminOpen, setAdminOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [atExam, setAtExam] = useState(false);
  const [completed, setCompleted] = useState({}); // moduleId -> bool
  const [kcResults, setKcResults] = useState({}); // moduleId -> { idx, correct }
  const [examAnswers, setExamAnswers] = useState({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState(null);
  const [examPassed, setExamPassed] = useState(false);
  const [completionDate, setCompletionDate] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load on mount: check the Entra session first, then restore this
  // user's local progress. Identity always comes from the session —
  // never from stored or typed values.
  useEffect(() => {
    (async () => {
      const me = await fetchMe();
      if (me) {
        setUser(me);
        setName(me.name);
        setEmail(me.email);
        const s = await loadState(me.email);
        if (s) {
          if (s.started) setStarted(s.started);
          if (s.currentIdx != null) setCurrentIdx(s.currentIdx);
          if (s.atExam) setAtExam(s.atExam);
          if (s.completed) setCompleted(s.completed);
          if (s.kcResults) setKcResults(s.kcResults);
          if (s.examAnswers) setExamAnswers(s.examAnswers);
          if (s.examSubmitted) setExamSubmitted(s.examSubmitted);
          if (s.examScore != null) setExamScore(s.examScore);
          if (s.examPassed) setExamPassed(s.examPassed);
          if (s.completionDate) setCompletionDate(s.completionDate);
        }
      }
      setLoaded(true);
    })();
  }, []);

  // Persist progress locally (results themselves go to the database
  // on exam submission).
  useEffect(() => {
    if (!loaded || !user) return;
    saveState(user.email, { started, currentIdx, atExam, completed, kcResults, examAnswers, examSubmitted, examScore, examPassed, completionDate });
  }, [loaded, user, started, currentIdx, atExam, completed, kcResults, examAnswers, examSubmitted, examScore, examPassed, completionDate]);

  function onStart() {
    setStarted(true);
    if (currentIdx === 0 && !atExam) setCurrentIdx(0);
  }

  function onNavigate(idx, toExam) {
    if (toExam) {
      setAtExam(true);
    } else {
      setAtExam(false);
      setCurrentIdx(idx);
    }
    setSidebarOpen(false);
  }

  function onNext() {
    const mod = MODULES[currentIdx];
    setCompleted({ ...completed, [mod.id]: true });
    if (currentIdx < MODULES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setAtExam(true);
    }
  }
  function onPrev() {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  }

  function onKcAnswer(moduleId, result) {
    setKcResults({ ...kcResults, [moduleId]: result });
  }

  function onExamAnswer(qi, oi) {
    setExamAnswers({ ...examAnswers, [qi]: oi });
  }

  function onExamSubmit() {
    let s = 0;
    EXAM.forEach((q, i) => { if (examAnswers[i] === q.correct) s += 1; });
    const passed = s / EXAM.length >= PASS_THRESHOLD;
    setExamScore(s);
    setExamPassed(passed);
    setExamSubmitted(true);
    if (passed) {
      setCompletionDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }
    // Record the attempt — pass or fail — in the results database.
    // The server stamps identity and timestamp from the session.
    setSaveStatus('saving');
    postResult({
      score: s,
      total: EXAM.length,
      passed,
      trainingVersion: TRAINING_VERSION,
      examAnswers,
      kcResults,
    })
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('error'));
  }

  function onRetake() {
    setExamAnswers({});
    setExamSubmitted(false);
    setExamScore(null);
    setExamPassed(false);
    setCompletionDate(null);
    setSaveStatus(null);
  }

  function onPrint() {
    window.print();
  }

  if (!loaded) {
    return <div style={{ minHeight: '100vh', background: BRAND.paper }} />;
  }

  // Admin dashboard — reachable from the welcome screen without
  // starting the training. Server enforces access; this is just UI.
  if (adminOpen && user?.isAdmin) {
    return (
      <div className="saa-root">
        <AdminView user={user} onClose={() => setAdminOpen(false)} />
      </div>
    );
  }

  if (!user || !started) {
    return (
      <div className="saa-root">
        <WelcomeScreen onStart={onStart} user={user} resuming={started || Object.keys(completed).length > 0} onAdmin={() => setAdminOpen(true)} />
      </div>
    );
  }

  // Certificate state
  if (atExam && examSubmitted && examPassed) {
    return (
      <div className="saa-root">
        <Certificate
          name={name}
          email={email}
          score={examScore}
          total={EXAM.length}
          date={completionDate}
          onRetake={onRetake}
          onPrint={onPrint}
          saveStatus={saveStatus}
          onAdmin={user?.isAdmin ? () => setAdminOpen(true) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="saa-root" style={{ minHeight: '100vh', background: BRAND.paper }}>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between p-4" style={{ background: BRAND.dark, color: 'white' }}>
        <div>
          <div className="text-xs uppercase tracking-widest font-semibold" style={{ color: BRAND.goldSoft }}>TQStarling</div>
          <div className="text-sm" style={{ fontFamily: 'var(--fnt-display)' }}>Security Awareness 2026</div>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} type="button" className="p-2" aria-label="Menu">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex" style={{ minHeight: 'calc(100vh - 0px)' }}>
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block flex-shrink-0" style={{ width: 320 }}>
          <Sidebar
            modules={MODULES}
            currentIdx={currentIdx}
            completedMap={completed}
            atExam={atExam}
            examState={{ passed: examPassed }}
            onNavigate={onNavigate}
            name={name}
            email={email}
            isAdmin={user?.isAdmin}
            onAdmin={() => { setSidebarOpen(false); setAdminOpen(true); }}
          />
        </aside>
        {/* Sidebar - mobile drawer */}
        {sidebarOpen && (
          <>
            <div onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }} />
            <aside className="lg:hidden" style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 300, zIndex: 40, overflowY: 'auto' }}>
              <Sidebar
                modules={MODULES}
                currentIdx={currentIdx}
                completedMap={completed}
                atExam={atExam}
                examState={{ passed: examPassed }}
                onNavigate={onNavigate}
                name={name}
                email={email}
                isAdmin={user?.isAdmin}
                onAdmin={() => { setSidebarOpen(false); setAdminOpen(true); }}
              />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {atExam ? (
            <ExamView
              exam={EXAM}
              answers={examAnswers}
              onAnswer={onExamAnswer}
              onSubmit={onExamSubmit}
              onBack={() => { setAtExam(false); setCurrentIdx(MODULES.length - 1); }}
              submitted={examSubmitted}
              saveStatus={saveStatus}
              score={examScore}
            />
          ) : (
            <ModuleView
              key={MODULES[currentIdx].id}
              module={MODULES[currentIdx]}
              idx={currentIdx}
              total={MODULES.length}
              onPrev={onPrev}
              onNext={onNext}
              kcAnswer={kcResults[MODULES[currentIdx].id]}
              onKcAnswer={(r) => onKcAnswer(MODULES[currentIdx].id, r)}
              atFirst={currentIdx === 0}
            />
          )}
        </main>
      </div>
    </div>
  );
}
