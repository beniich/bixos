import {
  PricingPlan,
  ComparisonRow,
  FAQItem,
  Article,
  ChangelogItem,
  Testimonial,
  ArchNode,
} from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'GMAO STARTER',
    monthlyPrice: 49,
    yearlyPrice: 39,
    badge: 'Essentiel',
    description: 'Gestion de parc et ordres de travail pour petites équipes',
    ctaText: "DÉMARRER L'ESSAI",
    features: [
      'Jusqu’à 50 Actifs & Équipements',
      '5 Accès Techniciens PWA Mobile',
      'Ordres de Travail & Maintenance Préventive',
      'Support par Email & Ticket',
      'Rapports d’intervention standard',
      'Application Web & Mobile Hors-Ligne',
    ],
  },
  {
    id: 'pro',
    name: 'GMAO PRO IA',
    monthlyPrice: 99,
    yearlyPrice: 79,
    popular: true,
    badge: 'Meilleure Valeur',
    description: 'Maintenance prédictive IA, Télémétrie IoT & Ordres illimités',
    ctaText: 'PASSER À GMAO PRO',
    features: [
      'Jusqu’à 500 Actifs & Équipements',
      'Techniciens & Intervenants Illimités',
      'Prédictions de Pannes Gemini 2.5 IA',
      'Télémétrie Capteurs IoT MQTT / HTTP',
      'Support Prioritaire 24/7 & SLA 99.9%',
      'Accès API Rest & Intégration Google Workspace',
      'Gestionnaire de Compte Dédié',
    ],
  },
  {
    id: 'enterprise',
    name: 'GMAO ENTERPRISE',
    monthlyPrice: 599,
    yearlyPrice: 479,
    badge: 'Souverain & On-Premise',
    description: 'Solution souveraine sur mesure pour grands groupes & sites sensibles',
    ctaText: 'CONTACTER L’ÉQUIPE',
    features: [
      'Actifs, Usines & Sites Illimités',
      'Infrastructure Dédiée ISO 27001 / Cloud Souverain',
      'Option Déploiement On-Premise ou Air-Gapped',
      'SLA Garanti (99.99% Disponibilité)',
      'Ingénieur Support Dédié 24/7',
      'Audits de Sécurité Annuels sur Site',
      'Connecteurs IoT & ERP sur Mesure (SAP, Maximo)',
    ],
  },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Device Limit', starter: 'Up to 50', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Secure Device Identity', starter: true, pro: true, enterprise: true },
  { feature: 'Real-time Monitoring', starter: true, pro: true, enterprise: true },
  { feature: 'Basic Analytics', starter: true, pro: true, enterprise: true },
  { feature: 'Advanced Predictive Analytics', starter: false, pro: true, enterprise: true },
  { feature: '24/7 Priority Support', starter: false, pro: true, enterprise: true },
  { feature: 'API & Webhook Access', starter: false, pro: true, enterprise: true },
  { feature: 'Dedicated Account Manager', starter: false, pro: true, enterprise: true },
  { feature: 'Custom Systems Integration', starter: false, pro: true, enterprise: true },
  { feature: 'Annual Security Audits', starter: false, pro: false, enterprise: true },
  { feature: 'On-premise Air-gapped Mode', starter: false, pro: false, enterprise: true },
];

export const ARCHITECTURE_NODES: ArchNode[] = [
  {
    id: 'agent',
    title: 'AGENT',
    subtitle: 'Edge Device Layer',
    description:
      'Local processing node deployed directly on connected facility assets and edge hardware.',
    details: [
      'Local Sensor Data Processing & Filtering',
      'AES-256 GCM Hardware-level Data Encryption',
      'TLS 1.3 Secure Packet Transmission',
      'Zero-Trust Identity Handshake',
      'Offline Buffer & Auto-Resyncing',
    ],
    metrics: [
      { label: 'Latency', value: '12ms', status: 'good' },
      { label: 'Buffer Usage', value: '2.4%', status: 'good' },
      { label: 'Crypto Engine', value: 'Hardware HSM', status: 'normal' },
    ],
    color: '#ff8a3d',
  },
  {
    id: 'server',
    title: 'SERVER',
    subtitle: 'Core Intelligence & Hub',
    description:
      'Central sovereign hub providing encrypted storage, AI predictive models, and access control.',
    details: [
      'Secure Immutable Data Storage',
      'AI/ML Predictive Maintenance Engine',
      'Role-Based Granular Access Control (RBAC)',
      'Blockchain Ledger Audit Verification',
      'High-throughput Event Ingestion Engine',
    ],
    metrics: [
      { label: 'CPU Load', value: '18%', status: 'good' },
      { label: 'Throughput', value: '12,450 req/s', status: 'good' },
      { label: 'Uptime', value: '99.998%', status: 'good' },
    ],
    color: '#ff6b00',
  },
  {
    id: 'dashboard',
    title: 'DASHBOARD',
    subtitle: 'Operations & Alert System',
    description:
      'Unified management interface delivering real-time telemetry, automated alerts, and executive reports.',
    details: [
      'Sub-second Real-Time Stream Monitoring',
      'Custom Data Visualizations & BIM Overlays',
      'Instant Multi-channel Alert System',
      'Custom Security & Compliance Reporting',
      'Responsive Glassmorphic UI Controls',
    ],
    metrics: [
      { label: 'Active Sessions', value: '142 Users', status: 'normal' },
      { label: 'Alert Queue', value: '0 Critical', status: 'good' },
      { label: 'Render Latency', value: '16ms', status: 'good' },
    ],
    color: '#ffaa00',
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: {
      FR: "Comment planifier les tâches de maintenance préventive ?",
      EN: "How do I schedule preventive maintenance tasks?",
      DE: "Wie plane ich vorbeugende Wartungsaufgaben?",
      ES: "¿Cómo me programo las tareas de mantenimiento preventivo?",
    },
    answer: {
      FR: "CAFM Pro utilise des algorithmes prédictifs pour analyser le comportement des équipements en temps réel. Vous pouvez définir des règles automatisées déclenchant des ordres de travail dès qu'une anomalie thermique ou de vibration est détectée.",
      EN: "CAFM Pro leverages predictive AI models that continuously monitor device telemetry. Automated work orders can be generated automatically when thermal or vibration anomalies breach baseline safety thresholds.",
      DE: "CAFM Pro nutzt prädiktive KI-Modelle zur Telemetrieüberwachung. Automatische Arbeitsaufträge werden erstellt, wenn Schwellenwerte überschritten werden.",
      ES: "CAFM Pro utiliza inteligencia artificial predictiva. Se pueden generar órdenes de trabajo automáticas cuando las telemetrías superan los límites.",
    },
  },
  {
    id: 'faq-2',
    category: 'technical',
    question: {
      FR: "Puis-je suivre la géolocalisation des équipements en temps réel ?",
      EN: "Can I track asset locations in real-time?",
      DE: "Kann ich den Standort von Anlagen in Echtzeit verfolgen?",
      ES: "¿Puedo rastrear la ubicación de los activos en tiempo real?",
    },
    answer: {
      FR: "Oui, la plateforme prend en charge la géolocalisation d'équipements via IoT, balises BLE et GPS, affichée directement sur des cartes interactives et modèles BIM 3D.",
      EN: "Yes, the platform supports asset tracking via BLE beacons, RFID, and GPS with sub-meter accuracy mapped directly onto interactive floor plans and 3D BIM models.",
      DE: "Ja, die Plattform unterstützt Tracking über BLE, RFID und GPS direkt auf interaktiven 3D-BIM-Modellen.",
      ES: "Sí, la plataforma admite el seguimiento mediante balizas BLE, RFID y GPS integrado en mapas 3D.",
    },
  },
  {
    id: 'faq-3',
    category: 'security',
    question: {
      FR: "Est-ce que CAFM Pro est conforme au RGPD et ISO 27001 ?",
      EN: "Is CAFM Pro compliant with GDPR and ISO 27001?",
      DE: "Ist CAFM Pro DSGVO- und ISO 27001-konform?",
      ES: "¿CAFM Pro cumple con GDPR e ISO 27001?",
    },
    answer: {
      FR: "Absolument. Nous appliquons un chiffrement de bout en bout (AES-256), un hébergement certifié ISO 27001, SOC 2 Type II et respectons scrupuleusement la souveraineté des données européennes.",
      EN: "Yes. All data streams are protected with AES-256 encryption at rest and TLS 1.3 in transit. Our infrastructure is certified ISO 27001, SOC 2 Type II, and fully GDPR compliant.",
      DE: "Ja, alle Datenströme sind mit AES-256 verschlüsselt. Unsere Infrastruktur ist ISO 27001 und SOC 2 Type II zertifiziert.",
      ES: "Sí, todos los datos están cifrados con AES-256. Nuestra infraestructura cuenta con certificación ISO 27001 y SOC 2 Type II.",
    },
  },
  {
    id: 'faq-4',
    category: 'general',
    question: {
      FR: "La solution fonctionne-t-elle à 100% dans le cloud ou en hybride ?",
      EN: "Is CAFM Pro completely cloud-based or hybrid?",
      DE: "Ist CAFM Pro vollständig cloudbasiert oder hybrid?",
      ES: "¿CAFM Pro es 100% basado en la nube o híbrido?",
    },
    answer: {
      FR: "CAFM Pro offre une flexibilité totale : déploiement SaaS Cloud Souverain, Hybride ou 100% On-Premise isolé pour les infrastructures critiques.",
      EN: "CAFM Pro offers complete deployment flexibility: Sovereign Cloud SaaS, Hybrid Edge Sync, or 100% On-Premise Air-Gapped installations for mission-critical facilities.",
      DE: "CAFM Pro bietet volle Flexibilität: Cloud-SaaS, Hybrid Edge oder 100% On-Premise.",
      ES: "CAFM Pro ofrece máxima flexibilidad: SaaS en la nube, Edge híbrido o instalación 100% local.",
    },
  },
  {
    id: 'faq-5',
    category: 'technical',
    question: {
      FR: "Quels protocoles IoT sont pris en charge ?",
      EN: "Which IoT protocols are supported?",
      DE: "Welche IoT-Protokolle werden unterstützt?",
      ES: "¿Qué protocolos IoT son compatibles?",
    },
    answer: {
      FR: "Nous prenons en charge MQTT, Modbus, BACnet, OPC UA, LoRaWAN, HTTP/2 REST APIs et gRPC pour une intégration matérielle transparente.",
      EN: "We support native MQTT, Modbus, BACnet, OPC UA, LoRaWAN, WebSocket API, REST API, and gRPC out-of-the-box for instant hardware integration.",
      DE: "Wir unterstützen MQTT, Modbus, BACnet, OPC UA, LoRaWAN und REST APIs out-of-the-box.",
      ES: "Soportamos MQTT, Modbus, BACnet, OPC UA, LoRaWAN y APIs REST de forma nativa.",
    },
  },
];

export const ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Best Practices for Device Onboarding',
    excerpt: 'Key strategies for securely provisioning thousands of IoT hardware nodes across enterprise facilities.',
    content:
      'Device onboarding is the foundation of facility security. Without zero-trust hardware attestation, rogue devices can compromise your network...',
    category: 'Security',
    date: 'Oct 28, 2024',
    readTime: '5 min read',
    author: 'CyberSec Team',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  },
  {
    id: 'art-2',
    title: 'AI-Driven Threat Detection in 2024',
    excerpt: 'How machine learning algorithms detect behavioral anomalies in facility sensor streams before breach escalation.',
    content:
      'Predictive maintenance extends beyond physical mechanical failure—it protects digital firmware integrity...',
    category: 'AI & Intelligence',
    date: 'Oct 28, 2024',
    readTime: '7 min read',
    author: 'AI Research Group',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  },
  {
    id: 'art-3',
    title: 'Managing Compliance for Remote Fleets',
    excerpt: 'Streamlining GDPR, SOC2, and ISO certifications across distributed multi-tenant real estate portfolios.',
    content:
      'Maintaining compliance across international operations requires automated audit logs and encrypted backups...',
    category: 'Compliance',
    date: 'Oct 26, 2024',
    readTime: '4 min read',
    author: 'Compliance Lead',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
  },
  {
    id: 'art-4',
    title: 'Sovereign Nexus Platform Update: Enhanced Encryption',
    excerpt: 'Introducing Quantum-resistant cryptographic handshake protocols for all edge gateway nodes.',
    content:
      'Our latest platform update implements post-quantum lattice cryptography to ensure long-term data security...',
    category: 'Platform',
    date: 'Oct 26, 2024',
    readTime: '6 min read',
    author: 'Engineering Director',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
  },
  {
    id: 'art-5',
    title: 'The Rise of Quantum-Resistant Security',
    excerpt: 'Preparing smart building infrastructure for next-generation quantum decrypt challenges.',
    content:
      'Facility assets deployed today will operate for decades. Ensuring future-proof cryptography is mandatory...',
    category: 'Research',
    date: 'Oct 26, 2024',
    readTime: '8 min read',
    author: 'Quantum Security Lab',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
  },
  {
    id: 'art-6',
    title: 'Top 5 Device Management Tools for Enterprises',
    excerpt: 'Comparing automated CMMS, IoT monitoring, and digital twin facility platforms.',
    content:
      'Choosing the right Computer-Aided Facility Management software transforms operational costs into competitive advantage...',
    category: 'Guide',
    date: 'Oct 26, 2024',
    readTime: '5 min read',
    author: 'Product Strategy',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
  },
];

export const CHANGELOG_ITEMS: ChangelogItem[] = [
  {
    id: 'v2.0',
    version: 'v2.0',
    title: 'IA Module 2.0 & Predictive Engine',
    date: 'November 15, 2023',
    tag: 'RELEASE',
    description:
      'Enhanced intelligence for facility analysis, new predictive maintenance features, and automated reporting.',
    details: [
      'Neural network thermal baseline detection',
      'Instant automated ticket routing to field technicians',
      'Interactive 3D BIM viewer integration',
      'Exportable executive summary reports (PDF/Excel)',
    ],
  },
  {
    id: 'v4.1',
    version: 'v4.1',
    title: 'Core System Security Patch v4.1',
    date: 'October 28, 2023',
    tag: 'PATCH',
    description: 'Security updates, post-quantum crypto handshake, and system performance optimization.',
    details: [
      'Upgraded TLS 1.3 handshake cipher suites',
      'Reduced edge gateway memory footprint by 22%',
      'Added automated SOC 2 audit logs generator',
    ],
  },
  {
    id: 'v1.8',
    version: 'v1.8',
    title: 'Mobile App Refresh & Offline Sync',
    date: 'September 10, 2023',
    tag: 'FEATURE',
    description: 'New glassmorphic UI/UX for on-site technicians with offline mode support.',
    details: [
      'Full offline work order editing with auto-resync',
      'Barcode & QR code scanner for hardware assets',
      'Push notification alerts for high-priority incidents',
    ],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    quote:
      'CAFM Pro transformed our facility management operations, saving significant costs and improving efficiency across 140 commercial buildings.',
    author: 'Sarah Jenkins',
    role: 'COO',
    company: 'Apex Corp',
    rating: 5,
    industry: 'Enterprise Real Estate',
  },
  {
    id: 'test-2',
    quote:
      'The real-time data and intuitive glassmorphic interface are game-changers. Our maintenance teams are now proactive, not reactive.',
    author: 'David Lee',
    role: 'Facility Director',
    company: 'Global Tech',
    rating: 5,
    industry: 'Smart Data Centers',
  },
  {
    id: 'test-3',
    quote:
      'Implementing CAFM Pro was seamless. Their support is outstanding, and the sovereign security platform scales perfectly with our security requirements.',
    author: 'Maria Garcia',
    role: 'Head of Operations',
    company: 'Metro Facilities',
    rating: 5,
    industry: 'Municipal Infrastructure',
  },
];
