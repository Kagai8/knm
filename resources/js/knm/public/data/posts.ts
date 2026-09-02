export type BlogBlock =
    | { type: 'paragraph'; text: string }
    | { type: 'heading'; text: string }
    | { type: 'quote'; text: string }
    | { type: 'list'; items: string[] };

export interface Post {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    authorRole: string;
    date: string;
    readTime: string;
    image: string;
    content: BlogBlock[];
}

export const posts: Post[] = [
    {
        slug: 'conveyancing-kenya-buyers-guide',
        title: "Understanding Conveyancing in Kenya: A Buyer's Guide",
        excerpt: 'From offer to title deed, conveyancing involves more steps than most buyers expect. Here is a clear, practical guide to how property transfers work in Kenya.',
        category: 'Conveyancing & Land Law',
        author: 'Member Two',
        authorRole: 'Senior Partner',
        date: '04 August 2026',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
        content: [
            { type: 'paragraph', text: 'Buying property is often the largest single investment a person or business will make. Yet many buyers in Kenya discover too late that conveyancing involves far more than signing an agreement and handing over money. Understanding the process protects you from avoidable risk.' },
            { type: 'heading', text: '1. The Offer and Acceptance' },
            { type: 'paragraph', text: 'Every transaction begins with an offer. Once accepted, the parties move to a formal sale agreement. At this stage, the terms of payment, completion timeline, and conditions precedent must be carefully negotiated — because what is poorly drafted here follows you to completion.' },
            { type: 'heading', text: '2. Due Diligence Searches' },
            { type: 'paragraph', text: 'Before committing funds, your advocate conducts searches to verify that the seller can legally sell and that the property is free of encumbrances. This is the single most important stage of the transaction.' },
            { type: 'list', items: ['Official search at the relevant lands registry', 'Confirmation of the seller\'s capacity and identity', 'Verification of land rates and rent receipts', 'Physical survey to confirm beacons and boundaries'] },
            { type: 'heading', text: '3. Completion and Registration' },
            { type: 'paragraph', text: 'On completion, the balance is paid against transfer documents, and the transaction is presented for registration. Only upon registration does ownership legally pass to the buyer.' },
            { type: 'quote', text: 'A property is only truly yours when your name appears on the register — not when you sign the agreement.' },
            { type: 'paragraph', text: 'At K&A Advocates, our conveyancing team handles property development, leasing, financing and cross-border transactions. If you are planning a purchase, involve your advocate before you sign — not after.' },
        ],
    },
    {
        slug: 'employment-contract-clauses-smes',
        title: '5 Employment Contract Clauses Every SME Should Get Right',
        excerpt: 'Most employment disputes we see trace back to five poorly drafted clauses. Here is what every SME, nonprofit and startup should fix before a problem arises.',
        category: 'Employment Law',
        author: 'Member Four',
        authorRole: 'Senior Associate',
        date: '28 July 2026',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1200',
        content: [
            { type: 'paragraph', text: 'The Employment Act sets the floor, but your contract sets the rules. Most disputes that reach our desks were entirely preventable with clearer drafting. These are the five clauses we review most often.' },
            { type: 'heading', text: '1. Probation Periods' },
            { type: 'paragraph', text: 'A probation clause is only useful if it is properly structured. Kenyan law caps probation at six months (extendable to twelve with agreement), and requires fair evaluation before confirmation or termination.' },
            { type: 'heading', text: '2. Leave Entitlements' },
            { type: 'paragraph', text: 'Annual, sick, and maternity leave must at minimum match statutory entitlements. Ambiguity here is one of the most common sources of grievance.' },
            { type: 'heading', text: '3. Termination and Notice' },
            { type: 'paragraph', text: 'Notice periods must comply with the Act, and any termination process must be both substantively and procedurally fair. A contract that shortcuts this exposes the employer to unfair termination claims.' },
            { type: 'heading', text: '4. Confidentiality and Data Protection' },
            { type: 'paragraph', text: 'With the Data Protection Act in force, confidentiality clauses must be precise about what information is protected, how it is handled, and for how long.' },
            { type: 'heading', text: '5. Disciplinary Procedure' },
            { type: 'paragraph', text: 'Referencing a clear disciplinary policy in the contract gives you a defensible framework for grievance and misconduct matters.' },
            { type: 'quote', text: 'A good employment contract is not about distrust — it is about clarity that protects both parties.' },
            { type: 'paragraph', text: 'Our employment team advises SMEs, nonprofits and individuals on compliance, contracts, and termination procedures. A one-hour review today can save years of litigation.' },
        ],
    },
    {
        slug: 'civil-litigation-client-roadmap',
        title: 'What to Expect in Civil Litigation: A Client\'s Roadmap',
        excerpt: 'Litigation can feel opaque to clients. This roadmap walks through the life of a civil suit in Kenya — from pleadings to judgment — so you always know where your matter stands.',
        category: 'Civil & Criminal Litigation',
        author: 'Member Three',
        authorRole: 'Partner',
        date: '21 July 2026',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200',
        content: [
            { type: 'paragraph', text: 'Clients often ask us the same question: "what happens next?" Litigation follows a defined procedural path, and understanding it reduces anxiety and helps you make better decisions at every stage.' },
            { type: 'heading', text: 'Stage 1: Pleadings' },
            { type: 'paragraph', text: 'The suit begins with the plaint, followed by the defence and any reply. These documents define the issues the court will determine — nothing outside them is in dispute.' },
            { type: 'heading', text: 'Stage 2: Pre-Trial and Scheduling' },
            { type: 'paragraph', text: 'Once pleadings close, the matter is scheduled for directions: discovery of documents, witness statements, and bundling. Preparation here wins hearings.' },
            { type: 'heading', text: 'Stage 3: Hearing' },
            { type: 'paragraph', text: 'Witnesses give evidence and face cross-examination. The length of a hearing depends entirely on the complexity of the evidence and the number of witnesses.' },
            { type: 'heading', text: 'Stage 4: Judgment and Beyond' },
            { type: 'paragraph', text: 'The court delivers judgment, followed by orders on costs and any remedies. From there, a party may appeal, or the successful party may move to enforce.' },
            { type: 'quote', text: 'Litigation is a marathon of procedure — but every stage has a purpose, and every purpose serves your outcome.' },
            { type: 'list', items: ['We always assess alternative dispute resolution first', 'Costs and timelines are discussed openly at instruction', 'You receive updates at every procedural milestone'] },
            { type: 'paragraph', text: 'Our litigation practice covers civil, commercial, employment, probate and appellate matters. Where a dispute can be resolved faster through arbitration or mediation, we will tell you plainly.' },
        ],
    },
    {
        slug: 'protecting-your-brand-trademarks-kenya',
        title: 'Protecting Your Brand: Trademark Registration in Kenya',
        excerpt: 'Your brand is an asset. Yet many businesses trade for years on unregistered marks. Here is how trademark protection works and why timing matters.',
        category: 'Intellectual Property Law',
        author: 'Member Five',
        authorRole: 'Associate',
        date: '14 July 2026',
        readTime: '4 min read',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200',
        content: [
            { type: 'paragraph', text: 'A trademark is often the most valuable intangible asset a business owns — its name, logo, and identity in the market. In Kenya, protection is secured through registration at the Kenya Industrial Property Institute (KIPI).' },
            { type: 'heading', text: 'The Registration Process' },
            { type: 'list', items: ['Availability search to confirm the mark is free', 'Filing of the application with prescribed details', 'Examination by the Registrar', 'Publication in the Trademarks Journal', 'Registration and issuance of certificate'] },
            { type: 'heading', text: 'Why Timing Matters' },
            { type: 'paragraph', text: 'Kenya follows a first-to-file system. A competitor who registers your mark before you do can legally block you from using your own brand. We have seen businesses forced to rebrand — or buy back their own name.' },
            { type: 'heading', text: 'Duration and Renewal' },
            { type: 'paragraph', text: 'A registered trademark lasts ten years and is renewable indefinitely. It can also be licensed or assigned, turning your brand into a revenue stream.' },
            { type: 'quote', text: 'Register your brand before the market teaches you why you should have.' },
            { type: 'paragraph', text: 'Our IP team handles trademarks, copyrights, patents and licensing — including copyright matters for artists and musicians. If your brand is unregistered, start the search today.' },
        ],
    },
    {
        slug: 'public-procurement-compliance-mistakes',
        title: 'Public Procurement Compliance: Avoiding Costly Mistakes',
        excerpt: 'Procurement disputes can stall projects and damage reputations. These are the compliance traps we see most often — and how to avoid them.',
        category: 'Procurement Law',
        author: 'Member Six',
        authorRole: 'Associate',
        date: '07 July 2026',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1450101499163-c68f865f3a3c?auto=format&fit=crop&q=80&w=1200',
        content: [
            { type: 'paragraph', text: 'Public procurement in Kenya is governed by a detailed statutory framework. For bidders and procuring entities alike, small procedural errors can have outsized consequences — cancelled tenders, stalled projects, and administrative reviews.' },
            { type: 'heading', text: 'Common Traps We See' },
            { type: 'list', items: ['Incomplete tender documentation at submission', 'Misreading evaluation and qualification criteria', 'Poorly drafted public-private agreements', 'Ignoring debrief and review timelines'] },
            { type: 'heading', text: 'For Bidders' },
            { type: 'paragraph', text: 'Treat the tender document as a binding rulebook. Every requirement is examinable. Where a requirement is ambiguous, seek clarification in writing before the deadline — not after the award.' },
            { type: 'heading', text: 'For Procuring Entities' },
            { type: 'paragraph', text: 'Consistency and documentation are your defence. A well-documented evaluation record is the difference withstanding a review and having an award set aside.' },
            { type: 'quote', text: 'In procurement, procedure is not bureaucracy — it is the substance of fairness.' },
            { type: 'paragraph', text: 'K&A Advocates advises on procurement processes, regulatory compliance, and public-private agreements, including drafting and negotiating complex contracts. Involve counsel early in any high-value tender.' },
        ],
    },
    {
        slug: 'digital-operating-system-modern-law-firm',
        title: 'Why a Modern Law Firm Needs a Digital Operating System',
        excerpt: 'Manual case notes and scattered documents served an earlier era. Here is why we are building a single, secure digital foundation for our practice — and what it means for our clients.',
        category: 'Firm News',
        author: 'Member One',
        authorRole: 'Managing Partner',
        date: '30 June 2026',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
        content: [
            { type: 'paragraph', text: 'For years, our firm ran on a model that served us well: manual case notes, scattered documents, informal reminders, and word-of-mouth referrals. It was built on personal dedication and deep legal knowledge.' },
            { type: 'paragraph', text: 'But a reputation like ours deserves an operational foundation to match it. Information scattered across notebooks and individual memory is no longer enough for the modern complexities our clients face.' },
            { type: 'heading', text: 'What Changes for Our Clients' },
            { type: 'list', items: ['Every enquiry receives a timely, professional response', 'Court dates and deadlines are tracked with automated reminders', 'Documents are stored securely and retrieved in seconds', 'Partners have real-time visibility into every active matter'] },
            { type: 'heading', text: 'A Foundation, Not a Finished Product' },
            { type: 'paragraph', text: 'The system we are building is designed to grow: client portals, automated reporting, and secure document access will layer on top of the same foundation without replacing it.' },
            { type: 'quote', text: 'We are not simply implementing software. We are building the digital operating system that will support K&A Advocates for many years.' },
            { type: 'paragraph', text: 'This is part of our broader commitment to modernizing how legal services are delivered in Kenya — combining traditional legal rigor with a digital-first client experience.' },
        ],
    },
];
