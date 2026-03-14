import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

interface SourceUniversity {
  name: string;
  country: string;
  "state-province": string | null;
  alpha_two_code: string;
  web_pages: string[];
  domains: string[];
}

interface FacultyTemplate {
  name: string;
  programs: string[];
}

const FACULTY_CATALOG: FacultyTemplate[] = [
  {
    name: "Faculty of Engineering",
    programs: ["Computer Science", "Mechanical Engineering", "Civil Engineering"]
  },
  {
    name: "Faculty of Business",
    programs: ["Business Administration", "Finance", "Marketing"]
  },
  {
    name: "Faculty of Natural Sciences",
    programs: ["Mathematics", "Physics", "Chemistry"]
  },
  {
    name: "Faculty of Health Sciences",
    programs: ["Medicine", "Nursing", "Pharmacy"]
  },
  {
    name: "Faculty of Social Sciences",
    programs: ["Psychology", "Sociology", "Political Science"]
  },
  {
    name: "Faculty of Arts and Humanities",
    programs: ["History", "Linguistics", "Philosophy"]
  },
  {
    name: "Faculty of Law",
    programs: ["Law", "International Law", "Public Law"]
  },
  {
    name: "Faculty of Education",
    programs: ["Primary Education", "Educational Leadership", "Special Education"]
  },
  {
    name: "Faculty of Design and Architecture",
    programs: ["Graphic Design", "Interior Design", "Architecture"]
  }
];

const COUNTRY_CODE_OVERRIDES: Record<string, string> = {
  "bolivia, plurinational state of": "BO",
  "brunei darussalam": "BN",
  "congo, the democratic republic of the": "CD",
  "cote d'ivoire": "CI",
  "iran, islamic republic of": "IR",
  "korea, republic of": "KR",
  "moldova, republic of": "MD",
  "palestine, state of": "PS",
  "russian federation": "RU",
  "syrian arab republic": "SY",
  "tanzania, united republic of": "TZ",
  "venezuela, bolivarian republic of": "VE",
  "viet nam": "VN"
};

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeKey(value: string): string {
  return normalizeText(value).toLowerCase();
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function resolveCountryCode(countryName: string, alpha2?: string): string {
  if (alpha2 && alpha2.length === 2) {
    return alpha2.toUpperCase();
  }

  const normalizedCountry = normalizeKey(countryName);
  const overrideCode = COUNTRY_CODE_OVERRIDES[normalizedCountry];
  if (overrideCode) {
    return overrideCode;
  }

  const fallbackSlug = slugify(countryName, {
    lower: false,
    strict: true,
    trim: true
  });
  return `X-${fallbackSlug}`.slice(0, 20);
}

function selectFaculties(universityName: string): FacultyTemplate[] {
  const length = FACULTY_CATALOG.length;
  const seed = hashString(universityName);
  const firstIndex = seed % length;
  let secondIndex = (firstIndex + 3 + (seed % 2)) % length;
  if (secondIndex === firstIndex) {
    secondIndex = (secondIndex + 1) % length;
  }
  return [FACULTY_CATALOG[firstIndex], FACULTY_CATALOG[secondIndex]];
}

function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─────────────────────────────────────────────────────────────
// Student review pool
// ─────────────────────────────────────────────────────────────

interface ReviewTemplate {
  authorName: string;
  rating: number;
  text: string;
  daysAgo: number;
}

const REVIEW_POOL: ReviewTemplate[] = [
  // 5-star
  { authorName: "Aiden Clarke", rating: 5, text: "Studying here completely changed my perspective. The professors are world-class researchers who genuinely care about students. The campus vibe is electric — you're surrounded by people who are ambitious and curious. Best decision of my life.", daysAgo: 12 },
  { authorName: "Sofia Rossi", rating: 5, text: "Incredible experience from day one. The international student community is massive and welcoming. I've made friends from 30+ countries. The research facilities are top-tier and you get access to them from year one. Absolutely worth every penny.", daysAgo: 25 },
  { authorName: "Marcus Johnson", rating: 5, text: "The quality of education here is genuinely unmatched. My professors published papers I studied in high school. The career services team helped me land a dream internship at a top firm. Couldn't recommend this place more highly.", daysAgo: 8 },
  { authorName: "Yuki Tanaka", rating: 5, text: "As an international student I was nervous, but the university support system is amazing. Language resources, cultural events, buddy programs — everything is there. Academic rigor is high but so is the reward. I'm proud to study here.", daysAgo: 45 },
  { authorName: "Emma Larsson", rating: 5, text: "The student clubs and societies here are insane — over 400 of them. I joined three and each one enriched my university experience massively. The mix of academic excellence and social life is exactly what I was looking for.", daysAgo: 33 },
  { authorName: "Omar Khalid", rating: 5, text: "The professors don't just teach — they mentor. My dissertation supervisor checked in on me every week and pushed me to publish my research. That kind of dedication from faculty is rare. This university delivers on its promises.", daysAgo: 60 },
  { authorName: "Priya Sharma", rating: 5, text: "The library never closes, the Wi-Fi is everywhere, the labs are modern, and the canteen has actually good food. Sounds basic but these things matter at 2am before an exam. The infrastructure here supports student success genuinely well.", daysAgo: 17 },
  { authorName: "Luca Ferrari", rating: 5, text: "I came for a master's and ended up staying for a PhD. That says everything. The research environment here is addictive — every corridor conversation turns into an idea worth exploring. World-leading in my field without a doubt.", daysAgo: 90 },
  { authorName: "Hannah Schmidt", rating: 5, text: "Exchange semester here was the highlight of my entire degree back home. The academic quality, the city, the events, the people — all perfect. Now I'm applying for the full master's program. Can't imagine studying anywhere else.", daysAgo: 22 },
  { authorName: "James Okafor", rating: 5, text: "Alumni network is insane — I literally landed my job because a graduate two years above me saw my LinkedIn and reached out. The brand of this university opens doors globally. Worth the hard work to get in.", daysAgo: 55 },
  { authorName: "Mei Lin Chen", rating: 5, text: "The curriculum is constantly updated to reflect industry needs — none of that outdated textbook stuff. Guest speakers are CEOs and researchers. The university bridges academia and real world better than anywhere I've seen.", daysAgo: 38 },
  { authorName: "Carlos Mendez", rating: 5, text: "Coming from South America I was scared about adapting. Within a month I felt completely at home. The diversity of the student body makes it easy. My professors respect different academic traditions which I deeply appreciate.", daysAgo: 71 },
  // 4-star
  { authorName: "Natasha Ivanova", rating: 4, text: "Very strong academic program and great professors overall. The campus is beautiful. My only critique is that bureaucratic processes can be slow — registration, housing, visa support. Once you're past the admin stuff, the experience is excellent.", daysAgo: 19 },
  { authorName: "Tom Bergmann", rating: 4, text: "Excellent quality of teaching and research output. The university has a great reputation internationally which already helped me in job interviews. Could improve the student mental health services — they get overwhelmed quickly. Otherwise highly recommend.", daysAgo: 41 },
  { authorName: "Amara Diallo", rating: 4, text: "Great university with strong academic standards. The diversity on campus is something I truly value — you hear ten languages walking across the quad. Tuition fees are high but the scholarship options partially offset that. Overall very positive.", daysAgo: 29 },
  { authorName: "Felix Müller", rating: 4, text: "I've grown enormously here both academically and personally. The professors in my department are exceptional. Social life can feel competitive at times but that also pushes you to be better. Would recommend to anyone serious about their field.", daysAgo: 14 },
  { authorName: "Isabella Wang", rating: 4, text: "The research opportunities here even at undergrad level are genuinely impressive. Got to work in a real lab in my second year. Housing costs in the city are brutal but that's not the university's fault. Academic experience: 5/5.", daysAgo: 50 },
  { authorName: "Daniel Osei", rating: 4, text: "Solid program, excellent faculty, amazing campus. The sports facilities are world-class. Workload is intense — be prepared to sacrifice sleep regularly. But you come out the other end much stronger. Worth the grind.", daysAgo: 35 },
  { authorName: "Julia Novak", rating: 4, text: "The interdisciplinary approach here is a major strength. I'm studying biology but have taken electives in computer science and philosophy — all credibly taught. The academic flexibility is rare and valuable. Admin processes could be smoother though.", daysAgo: 67 },
  { authorName: "Arjun Patel", rating: 4, text: "Fantastic place to develop professionally. The career fair alone is worth the tuition — I had five interview invitations in one day. The workload is demanding but manageable if you stay organised. Professors are mostly responsive and helpful.", daysAgo: 23 },
  { authorName: "Sophie Dubois", rating: 4, text: "My year abroad here was transformative. The course content was rigorous, the campus was stunning, and the city offered incredible cultural experiences. I'd encourage any student to consider studying here — you won't regret the leap.", daysAgo: 88 },
  { authorName: "Wei Zhang", rating: 4, text: "Top-tier research university with genuinely brilliant people everywhere you look. The collaborative culture among students surprised me — people share notes and study together rather than competing destructively. That made all the difference.", daysAgo: 43 },
  { authorName: "Nina Johansson", rating: 4, text: "Excellent university with world-famous faculty. The guest lecture series brought in two Nobel laureates this year alone. The dorms are a bit dated but the academic experience more than compensates. Very proud to be a student here.", daysAgo: 58 },
  // 4.5-star (stored as 4)
  { authorName: "Kevin Okonkwo", rating: 4, text: "Transferred here in second year and the jump in quality was immediately obvious. The professors actually know your name, the seminars are discussion-based, and the library resources are unreal. Best academic decision I've made.", daysAgo: 31 },
  { authorName: "Layla Hassan", rating: 4, text: "Studying medicine here has been demanding beyond words but also incredibly rewarding. The clinical exposure we get in year three is exceptional. The faculty are practicing doctors who bring real cases to the classroom. Truly world-class.", daysAgo: 76 },
  // 3-star
  { authorName: "Ren Suzuki", rating: 3, text: "Mixed experience. The academic quality in my department is high but the administration is genuinely chaotic. Emails go unanswered, deadlines are communicated poorly, and student support is underfunded. The degree is respected though, so I stayed.", daysAgo: 48 },
  { authorName: "Ben Kowalski", rating: 3, text: "Good university overall but not without problems. Class sizes are too large for some modules — you feel anonymous. The professors are brilliant but hard to reach outside lectures. The peer community and the degree quality keep me here.", daysAgo: 82 },
  { authorName: "Aisha Bangura", rating: 3, text: "The reputation of this university is well-deserved in some departments and less so in others. Mine sits somewhere in the middle. The city is fantastic, the campus is beautiful, the academics are decent. Just not the transcendent experience I hoped for.", daysAgo: 105 },
  // More 5-star
  { authorName: "Victor Hernandez", rating: 5, text: "The entrepreneurship ecosystem here is phenomenal. Three companies my classmates founded are now funded startups. The university's innovation hub, mentorship network, and pitch competitions create an environment where ideas actually become reality.", daysAgo: 27 },
  { authorName: "Zara Ahmed", rating: 5, text: "I chose this university for its sustainability programs and it delivered beyond expectations. Cutting-edge research, passionate professors, a campus running on 100% renewable energy. If you care about the planet and your career, this is the place.", daysAgo: 16 },
  { authorName: "Patrick Nguyen", rating: 5, text: "The language of instruction is not my first language but the university's language support centre is exceptional. Within one semester I was writing essays confidently. The academic community here is patient, inclusive, and genuinely supportive.", daysAgo: 53 },
  { authorName: "Elena Petrov", rating: 5, text: "PhD student here for three years and I can honestly say I've never been more intellectually stimulated in my life. My supervisor pushes me to think bigger and the department seminar series exposes me to ideas I'd never encounter elsewhere.", daysAgo: 42 },
  { authorName: "Kwame Mensah", rating: 5, text: "The campus culture here is unlike any other university I visited during my application process. Collaborative, diverse, intellectually alive. Everyone is working on something interesting. You will absolutely be inspired if you come here.", daysAgo: 9 },
  { authorName: "Hana Yamamoto", rating: 5, text: "The student wellbeing team here is the best I've heard of at any university. Counselling, financial support, accommodation help — it's all there and it actually works. Universities talk about student welfare; this one delivers it.", daysAgo: 36 },
  { authorName: "Rodrigo Costa", rating: 5, text: "Engineering program here is genuinely elite. The project-based learning approach means by graduation you've built actual systems, not just passed exams. My employer told me I was more prepared than graduates from universities they usually hire from.", daysAgo: 64 },
  { authorName: "Chiara Bianchi", rating: 5, text: "The library and digital resource access here is staggering — every journal, every database, every book you could possibly need. For a research-focused student this matters enormously. The university genuinely invests in student resources.", daysAgo: 20 },
  // More 4-star
  { authorName: "Tariq Al-Farsi", rating: 4, text: "Strong technical program with industry connections that are tangible and useful. The internship placement rate is genuinely high. Some professors are more engaged than others but the overall quality is consistently above average.", daysAgo: 77 },
  { authorName: "Maria Gonzalez", rating: 4, text: "The multicultural campus made transitioning from my home country much easier. The student associations organise cultural festivals, language exchanges, food events. You simultaneously feel at home and exposed to the whole world.", daysAgo: 44 },
  { authorName: "Finn Andersen", rating: 4, text: "What impressed me most was the university's commitment to open research — most outputs are freely published. That signals an institution that cares about knowledge, not just ranking. The academic quality matches that ethos. Impressive place.", daysAgo: 59 },
  { authorName: "Adaeze Eze", rating: 4, text: "Law school here is demanding but the bar exam pass rates speak for themselves. Moot court competitions, law review, clinic programs — all real and well run. Some admin processes are frustratingly slow. Academics more than compensate.", daysAgo: 33 },
  { authorName: "Leon Schreiber", rating: 4, text: "The economics department here punches well above its weight. Seminars with visiting scholars are a regular occurrence and students are welcome. The professors treat you as an intellectual peer from day one which motivates you enormously.", daysAgo: 18 },
];

function pickReviews(uniName: string, uniId: number): ReviewTemplate[] {
  const seed = hashString(uniName + uniId);
  const count = 3 + (seed % 3); // 3, 4, or 5 reviews per university
  const pool = [...REVIEW_POOL];
  // Deterministic shuffle using the seed
  for (let i = pool.length - 1; i > 0; i--) {
    const j = hashString(`${seed}:${i}`) % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function generateReviews(
  uniName: string,
  uniId: number
): Array<{ authorName: string; rating: number; text: string; publishedAt: string | null }> {
  return pickReviews(uniName, uniId).map((r) => ({
    authorName: r.authorName,
    rating: r.rating,
    text: r.text,
    publishedAt: new Date(
      Date.now() - r.daysAgo * 24 * 60 * 60 * 1000
    ).toISOString()
  }));
}

// ─────────────────────────────────────────────────────────────
// Country tourist attractions
// ─────────────────────────────────────────────────────────────

interface SeedPlace {
  name: string;
  address: string;
  rating: number;
  wikiTitle: string;
}

const COUNTRY_PLACES: Record<string, SeedPlace[]> = {
  US: [
    { name: "Grand Canyon National Park", address: "Arizona, USA", rating: 4.9, wikiTitle: "Grand_Canyon" },
    { name: "Statue of Liberty", address: "New York Harbor, USA", rating: 4.8, wikiTitle: "Statue_of_Liberty" },
    { name: "Yellowstone National Park", address: "Wyoming, USA", rating: 4.9, wikiTitle: "Yellowstone_National_Park" },
    { name: "Golden Gate Bridge", address: "San Francisco, California, USA", rating: 4.8, wikiTitle: "Golden_Gate_Bridge" },
    { name: "Times Square", address: "Midtown Manhattan, New York, USA", rating: 4.6, wikiTitle: "Times_Square" },
    { name: "The White House", address: "Washington, D.C., USA", rating: 4.7, wikiTitle: "White_House" }
  ],
  GB: [
    { name: "Big Ben & Houses of Parliament", address: "Westminster, London, UK", rating: 4.8, wikiTitle: "Big_Ben" },
    { name: "Stonehenge", address: "Wiltshire, England, UK", rating: 4.7, wikiTitle: "Stonehenge" },
    { name: "Buckingham Palace", address: "Westminster, London, UK", rating: 4.7, wikiTitle: "Buckingham_Palace" },
    { name: "Edinburgh Castle", address: "Castlehill, Edinburgh, Scotland", rating: 4.8, wikiTitle: "Edinburgh_Castle" },
    { name: "Tower of London", address: "Tower Hill, London, UK", rating: 4.7, wikiTitle: "Tower_of_London" }
  ],
  DE: [
    { name: "Neuschwanstein Castle", address: "Schwangau, Bavaria, Germany", rating: 4.9, wikiTitle: "Neuschwanstein_Castle" },
    { name: "Brandenburg Gate", address: "Pariser Platz, Berlin, Germany", rating: 4.8, wikiTitle: "Brandenburg_Gate" },
    { name: "Cologne Cathedral", address: "Domkloster 4, Cologne, Germany", rating: 4.8, wikiTitle: "Cologne_Cathedral" },
    { name: "Heidelberg Castle", address: "Schlosshof 1, Heidelberg, Germany", rating: 4.7, wikiTitle: "Heidelberg_Castle" },
    { name: "The Reichstag Building", address: "Platz der Republik 1, Berlin, Germany", rating: 4.7, wikiTitle: "Reichstag_building" }
  ],
  FR: [
    { name: "Eiffel Tower", address: "Champ de Mars, Paris, France", rating: 4.8, wikiTitle: "Eiffel_Tower" },
    { name: "Palace of Versailles", address: "Place d'Armes, Versailles, France", rating: 4.8, wikiTitle: "Palace_of_Versailles" },
    { name: "Louvre Museum", address: "Rue de Rivoli, Paris, France", rating: 4.8, wikiTitle: "Louvre" },
    { name: "Mont Saint-Michel", address: "Normandy, France", rating: 4.9, wikiTitle: "Mont_Saint-Michel" },
    { name: "Notre-Dame de Paris", address: "Île de la Cité, Paris, France", rating: 4.8, wikiTitle: "Notre-Dame_de_Paris" }
  ],
  RU: [
    { name: "Red Square", address: "Красная площадь, Moscow, Russia", rating: 4.9, wikiTitle: "Red_Square" },
    { name: "The Hermitage Museum", address: "Palace Square 2, Saint Petersburg, Russia", rating: 4.9, wikiTitle: "Hermitage_Museum" },
    { name: "Kremlin", address: "Kremlin, Moscow, Russia", rating: 4.8, wikiTitle: "Moscow_Kremlin" },
    { name: "Lake Baikal", address: "Siberia, Russia", rating: 4.9, wikiTitle: "Lake_Baikal" },
    { name: "Saint Basil's Cathedral", address: "Red Square, Moscow, Russia", rating: 4.9, wikiTitle: "Saint_Basil%27s_Cathedral" }
  ],
  CN: [
    { name: "Great Wall of China", address: "Mutianyu, Huairou District, Beijing, China", rating: 4.9, wikiTitle: "Great_Wall_of_China" },
    { name: "Forbidden City", address: "4 Jingshan Front St, Dongcheng, Beijing, China", rating: 4.9, wikiTitle: "Forbidden_City" },
    { name: "Terracotta Army", address: "Lintong District, Xi'an, Shaanxi, China", rating: 4.9, wikiTitle: "Terracotta_Army" },
    { name: "Li River", address: "Guilin, Guangxi, China", rating: 4.9, wikiTitle: "Li_River_(Guangxi)" },
    { name: "Zhangjiajie National Forest Park", address: "Zhangjiajie, Hunan, China", rating: 4.9, wikiTitle: "Zhangjiajie_National_Forest_Park" }
  ],
  JP: [
    { name: "Mount Fuji", address: "Fujinomiya, Shizuoka Prefecture, Japan", rating: 4.9, wikiTitle: "Mount_Fuji" },
    { name: "Fushimi Inari Shrine", address: "Fukakusa Yabunouchicho, Fushimi, Kyoto, Japan", rating: 4.9, wikiTitle: "Fushimi_Inari-taisha" },
    { name: "Senso-ji Temple", address: "2 Chome-3-1 Asakusa, Taito City, Tokyo, Japan", rating: 4.8, wikiTitle: "Senso-ji" },
    { name: "Hiroshima Peace Memorial", address: "1-2 Nakajimacho, Naka Ward, Hiroshima, Japan", rating: 4.9, wikiTitle: "Hiroshima_Peace_Memorial" },
    { name: "Arashiyama Bamboo Grove", address: "Sagaogurayama, Ukyo Ward, Kyoto, Japan", rating: 4.8, wikiTitle: "Arashiyama" }
  ],
  KR: [
    { name: "Gyeongbokgung Palace", address: "Sajik-ro, Jongno-gu, Seoul, South Korea", rating: 4.8, wikiTitle: "Gyeongbokgung" },
    { name: "Jeju Island", address: "Jeju-si, Jeju-do, South Korea", rating: 4.9, wikiTitle: "Jeju_Island" },
    { name: "N Seoul Tower", address: "Namsangongwon-gil 105, Yongsan-gu, Seoul", rating: 4.6, wikiTitle: "N_Seoul_Tower" },
    { name: "Bukchon Hanok Village", address: "Gyedong-gil, Jongno-gu, Seoul, South Korea", rating: 4.7, wikiTitle: "Bukchon_Hanok_Village" }
  ],
  AU: [
    { name: "Sydney Opera House", address: "Bennelong Point, Sydney NSW 2000, Australia", rating: 4.8, wikiTitle: "Sydney_Opera_House" },
    { name: "Great Barrier Reef", address: "Coral Sea, Queensland, Australia", rating: 4.9, wikiTitle: "Great_Barrier_Reef" },
    { name: "Uluru (Ayers Rock)", address: "Uluru-Kata Tjuta National Park, NT, Australia", rating: 4.9, wikiTitle: "Uluru" },
    { name: "Great Ocean Road", address: "Victoria, Australia", rating: 4.8, wikiTitle: "Great_Ocean_Road" },
    { name: "Bondi Beach", address: "Bondi Beach NSW 2026, Sydney, Australia", rating: 4.7, wikiTitle: "Bondi_Beach" }
  ],
  CA: [
    { name: "Niagara Falls", address: "Niagara Falls, Ontario, Canada", rating: 4.8, wikiTitle: "Niagara_Falls" },
    { name: "Banff National Park", address: "Banff, Alberta, Canada", rating: 4.9, wikiTitle: "Banff_National_Park" },
    { name: "CN Tower", address: "290 Bremner Blvd, Toronto, Ontario, Canada", rating: 4.7, wikiTitle: "CN_Tower" },
    { name: "Old Quebec City", address: "Old Quebec, Quebec City, QC, Canada", rating: 4.8, wikiTitle: "Old_Quebec" },
    { name: "Whistler", address: "Whistler, British Columbia, Canada", rating: 4.8, wikiTitle: "Whistler,_British_Columbia" }
  ],
  IN: [
    { name: "Taj Mahal", address: "Dharmapuri, Forest Colony, Tajganj, Agra, India", rating: 4.9, wikiTitle: "Taj_Mahal" },
    { name: "Jaipur City Palace", address: "Tulsi Marg, Gangori Bazaar, J.D.A. Market, Jaipur", rating: 4.8, wikiTitle: "City_Palace,_Jaipur" },
    { name: "Golden Temple (Harmandir Sahib)", address: "Golden Temple Rd, Atta Mandi, Katra Ahluwalia, Amritsar", rating: 4.9, wikiTitle: "Harmandir_Sahib" },
    { name: "Kerala Backwaters", address: "Alleppey, Kerala, India", rating: 4.8, wikiTitle: "Kerala_backwaters" },
    { name: "Goa Beaches", address: "Goa, India", rating: 4.7, wikiTitle: "Goa" }
  ],
  CH: [
    { name: "Matterhorn", address: "Zermatt, Switzerland", rating: 4.9, wikiTitle: "Matterhorn" },
    { name: "Lake Geneva", address: "Lausanne / Geneva, Switzerland", rating: 4.8, wikiTitle: "Lake_Geneva" },
    { name: "Jungfraujoch", address: "Grindelwald, Berne, Switzerland", rating: 4.9, wikiTitle: "Jungfraujoch" },
    { name: "Lucerne Old Town", address: "Altstadt, Lucerne, Switzerland", rating: 4.8, wikiTitle: "Lucerne" },
    { name: "Rhine Falls", address: "Schloss Laufen am Rheinfall, Neuhausen am Rheinfall", rating: 4.7, wikiTitle: "Rhine_Falls" }
  ],
  NL: [
    { name: "Keukenhof Gardens", address: "Stationsweg 166A, 2161 AM Lisse, Netherlands", rating: 4.8, wikiTitle: "Keukenhof" },
    { name: "Amsterdam Canals", address: "Amsterdam, Netherlands", rating: 4.8, wikiTitle: "Canals_of_Amsterdam" },
    { name: "Rijksmuseum", address: "Museumstraat 1, 1071 XX Amsterdam, Netherlands", rating: 4.8, wikiTitle: "Rijksmuseum" },
    { name: "Kinderdijk Windmills", address: "Molenkade 2, 2961 AS Kinderdijk, Netherlands", rating: 4.7, wikiTitle: "Kinderdijk" }
  ],
  IT: [
    { name: "Colosseum", address: "Piazza del Colosseo, 1, 00184 Rome, Italy", rating: 4.8, wikiTitle: "Colosseum" },
    { name: "Venice Canals & St. Mark's Square", address: "Piazza San Marco, Venice, Italy", rating: 4.8, wikiTitle: "St_Mark%27s_Square" },
    { name: "Amalfi Coast", address: "Amalfi, Province of Salerno, Italy", rating: 4.9, wikiTitle: "Amalfi_Coast" },
    { name: "Leaning Tower of Pisa", address: "Piazza del Duomo, 56126 Pisa PI, Italy", rating: 4.7, wikiTitle: "Leaning_Tower_of_Pisa" },
    { name: "Tuscany Countryside", address: "Tuscany, Italy", rating: 4.9, wikiTitle: "Tuscany" }
  ],
  ES: [
    { name: "Sagrada Família", address: "C/ de Mallorca, 401, Barcelona, Spain", rating: 4.8, wikiTitle: "Sagrada_Fam%C3%ADlia" },
    { name: "Alhambra", address: "Calle Real de la Alhambra, Granada, Spain", rating: 4.9, wikiTitle: "Alhambra" },
    { name: "Park Güell", address: "08024 Barcelona, Spain", rating: 4.7, wikiTitle: "Park_G%C3%BCell" },
    { name: "Prado Museum", address: "Calle de Ruiz de Alarcón 23, Madrid, Spain", rating: 4.8, wikiTitle: "Museo_del_Prado" }
  ],
  SE: [
    { name: "Stockholm Old Town (Gamla Stan)", address: "Gamla stan, Stockholm, Sweden", rating: 4.8, wikiTitle: "Gamla_stan" },
    { name: "Vasa Museum", address: "Galärvarvsvägen 14, 115 21 Stockholm, Sweden", rating: 4.8, wikiTitle: "Vasa_Museum" },
    { name: "Aurora Borealis in Abisko", address: "Abisko, Norrbotten County, Sweden", rating: 4.9, wikiTitle: "Abisko_National_Park" }
  ],
  NO: [
    { name: "Geirangerfjord", address: "6216 Geiranger, Norway", rating: 4.9, wikiTitle: "Geirangerfjord" },
    { name: "Bryggen Wharf", address: "Bryggen, 5003 Bergen, Norway", rating: 4.8, wikiTitle: "Bryggen" },
    { name: "Northern Lights (Tromsø)", address: "Tromsø, Troms og Finnmark, Norway", rating: 4.9, wikiTitle: "Aurora_borealis" }
  ],
  DK: [
    { name: "Tivoli Gardens", address: "Vesterbrogade 3, 1630 Copenhagen, Denmark", rating: 4.7, wikiTitle: "Tivoli_Gardens" },
    { name: "Nyhavn", address: "Nyhavn, 1051 Copenhagen, Denmark", rating: 4.8, wikiTitle: "Nyhavn" },
    { name: "The Little Mermaid Statue", address: "Langelinie, 2100 Copenhagen, Denmark", rating: 4.4, wikiTitle: "The_Little_Mermaid_(statue)" }
  ],
  FI: [
    { name: "Santa Claus Village, Rovaniemi", address: "Tähtikuja 1, 96930 Arctic Circle, Rovaniemi", rating: 4.7, wikiTitle: "Santa_Claus_Village" },
    { name: "Helsinki Cathedral", address: "Unioninkatu 29, 00170 Helsinki, Finland", rating: 4.7, wikiTitle: "Helsinki_Cathedral" },
    { name: "Finnish Lapland", address: "Lapland, Finland", rating: 4.9, wikiTitle: "Finnish_Lapland" }
  ],
  BE: [
    { name: "Grand Place Brussels", address: "Grand-Place, 1000 Brussels, Belgium", rating: 4.8, wikiTitle: "Grand_Place" },
    { name: "Bruges Historic Centre", address: "Bruges, Belgium", rating: 4.9, wikiTitle: "Bruges" },
    { name: "Atomium", address: "Atomiumsquare 1, 1020 Brussels, Belgium", rating: 4.6, wikiTitle: "Atomium" }
  ],
  AT: [
    { name: "Schönbrunn Palace", address: "Schönbrunner Schloßstraße 47, 1130 Vienna, Austria", rating: 4.8, wikiTitle: "Sch%C3%B6nbrunn_Palace" },
    { name: "Hallstatt Village", address: "Hallstatt, 4830 Hallstatt, Austria", rating: 4.9, wikiTitle: "Hallstatt" },
    { name: "Salzburg Old Town", address: "Altstadt, 5020 Salzburg, Austria", rating: 4.8, wikiTitle: "Salzburg" }
  ],
  SG: [
    { name: "Gardens by the Bay", address: "18 Marina Gardens Dr, Singapore 018953", rating: 4.8, wikiTitle: "Gardens_by_the_Bay" },
    { name: "Marina Bay Sands", address: "10 Bayfront Ave, Singapore 018956", rating: 4.7, wikiTitle: "Marina_Bay_Sands" },
    { name: "Sentosa Island", address: "Sentosa Island, Singapore", rating: 4.6, wikiTitle: "Sentosa" }
  ],
  MY: [
    { name: "Petronas Twin Towers", address: "Kuala Lumpur City Centre, 50088 Kuala Lumpur", rating: 4.7, wikiTitle: "Petronas_Towers" },
    { name: "Batu Caves", address: "Batu Caves, 68100 Batu Caves, Selangor, Malaysia", rating: 4.7, wikiTitle: "Batu_Caves" },
    { name: "Langkawi Island", address: "Langkawi, Kedah, Malaysia", rating: 4.8, wikiTitle: "Langkawi" }
  ],
  TH: [
    { name: "Grand Palace", address: "Na Phra Lan Rd, Khwaeng Phra Borom Maha Ratchawang, Bangkok", rating: 4.7, wikiTitle: "Grand_Palace" },
    { name: "Phi Phi Islands", address: "Ko Phi Phi, Krabi, Thailand", rating: 4.8, wikiTitle: "Phi_Phi_Islands" },
    { name: "Chiang Mai Old City", address: "Chiang Mai, Thailand", rating: 4.7, wikiTitle: "Chiang_Mai" }
  ],
  ID: [
    { name: "Bali Temples & Rice Terraces", address: "Bali, Indonesia", rating: 4.8, wikiTitle: "Bali" },
    { name: "Borobudur Temple", address: "Borobudur, Magelang Regency, Central Java, Indonesia", rating: 4.9, wikiTitle: "Borobudur" },
    { name: "Komodo National Park", address: "East Nusa Tenggara, Indonesia", rating: 4.8, wikiTitle: "Komodo_National_Park" }
  ],
  PH: [
    { name: "Palawan — Puerto Princesa", address: "Puerto Princesa, Palawan, Philippines", rating: 4.9, wikiTitle: "Palawan" },
    { name: "Chocolate Hills", address: "Bohol Province, Philippines", rating: 4.7, wikiTitle: "Chocolate_Hills" },
    { name: "Intramuros", address: "Intramuros, Manila, Philippines", rating: 4.6, wikiTitle: "Intramuros" }
  ],
  VN: [
    { name: "Ha Long Bay", address: "Ha Long City, Quảng Ninh Province, Vietnam", rating: 4.9, wikiTitle: "Ha_Long_Bay" },
    { name: "Hoi An Ancient Town", address: "Hoi An, Quảng Nam Province, Vietnam", rating: 4.8, wikiTitle: "Hoi_An" },
    { name: "Phong Nha-Ke Bang National Park", address: "Quảng Bình Province, Vietnam", rating: 4.8, wikiTitle: "Phong_Nha-K%E1%BA%BB_B%C3%A0ng_National_Park" }
  ],
  IL: [
    { name: "Old City of Jerusalem", address: "Old City, Jerusalem, Israel", rating: 4.9, wikiTitle: "Old_City_(Jerusalem)" },
    { name: "Masada National Park", address: "Dead Sea, Israel", rating: 4.8, wikiTitle: "Masada" },
    { name: "Tel Aviv Beachfront", address: "Gordon Beach, Tel Aviv, Israel", rating: 4.6, wikiTitle: "Tel_Aviv" }
  ],
  SA: [
    { name: "AlUla Ancient City", address: "AlUla, Medina Province, Saudi Arabia", rating: 4.9, wikiTitle: "Al-Ula" },
    { name: "Diriyah Historic District", address: "Diriyah, Riyadh Province, Saudi Arabia", rating: 4.7, wikiTitle: "Diriyah" },
    { name: "Edge of the World (Jebel Fihrayn)", address: "Riyadh Province, Saudi Arabia", rating: 4.8, wikiTitle: "Tuwaiq_Escarpment" }
  ],
  TR: [
    { name: "Cappadocia Hot Air Balloons", address: "Göreme, Nevşehir Province, Turkey", rating: 4.9, wikiTitle: "Cappadocia" },
    { name: "Hagia Sophia", address: "Sultan Ahmet, Ayasofya Meydanı No:1, Istanbul, Turkey", rating: 4.8, wikiTitle: "Hagia_Sophia" },
    { name: "Pamukkale Thermal Pools", address: "Pamukkale, Denizli, Turkey", rating: 4.8, wikiTitle: "Pamukkale" }
  ],
  IR: [
    { name: "Naqsh-e Jahan Square, Isfahan", address: "Isfahan Province, Iran", rating: 4.9, wikiTitle: "Naqsh-e_Jahan_Square" },
    { name: "Persepolis", address: "Shiraz, Fars Province, Iran", rating: 4.9, wikiTitle: "Persepolis" },
    { name: "Sheikh Lotfollah Mosque", address: "Isfahan, Isfahan Province, Iran", rating: 4.9, wikiTitle: "Sheikh_Lotfollah_Mosque" }
  ],
  ZA: [
    { name: "Cape of Good Hope", address: "Cape Peninsula, Cape Town, South Africa", rating: 4.8, wikiTitle: "Cape_of_Good_Hope" },
    { name: "Kruger National Park", address: "Limpopo Province, South Africa", rating: 4.9, wikiTitle: "Kruger_National_Park" },
    { name: "Table Mountain", address: "Cape Town, South Africa", rating: 4.9, wikiTitle: "Table_Mountain" }
  ],
  EG: [
    { name: "Pyramids of Giza", address: "Al Haram, Giza Governorate, Egypt", rating: 4.9, wikiTitle: "Giza_pyramid_complex" },
    { name: "Luxor Temple", address: "Luxor City, Luxor Governorate, Egypt", rating: 4.8, wikiTitle: "Luxor_Temple" },
    { name: "Valley of the Kings", address: "Luxor, Luxor Governorate, Egypt", rating: 4.9, wikiTitle: "Valley_of_the_Kings" }
  ],
  NG: [
    { name: "Olumo Rock", address: "Abeokuta, Ogun State, Nigeria", rating: 4.5, wikiTitle: "Olumo_Rock" },
    { name: "Yankari National Park", address: "Bauchi State, Nigeria", rating: 4.6, wikiTitle: "Yankari_National_Park" },
    { name: "Lekki Conservation Centre", address: "1 Lekki-Epe Expressway, Lekki, Lagos", rating: 4.5, wikiTitle: "Lekki_Conservation_Centre" }
  ],
  KE: [
    { name: "Maasai Mara National Reserve", address: "Narok County, Kenya", rating: 4.9, wikiTitle: "Maasai_Mara" },
    { name: "Amboseli National Park", address: "Kajiado County, Kenya", rating: 4.8, wikiTitle: "Amboseli_National_Park" },
    { name: "Mount Kenya", address: "Mount Kenya National Park, Kenya", rating: 4.8, wikiTitle: "Mount_Kenya" }
  ],
  ET: [
    { name: "Rock-Hewn Churches of Lalibela", address: "Lalibela, Amhara Region, Ethiopia", rating: 4.9, wikiTitle: "Rock-Hewn_Churches%2C_Lalibela" },
    { name: "Simien Mountains National Park", address: "Amhara Region, Ethiopia", rating: 4.8, wikiTitle: "Simien_Mountains_National_Park" },
    { name: "Danakil Depression", address: "Afar Region, Ethiopia", rating: 4.7, wikiTitle: "Danakil_Depression" }
  ],
  MA: [
    { name: "Marrakech Medina", address: "Medina, Marrakech, Morocco", rating: 4.7, wikiTitle: "Marrakesh" },
    { name: "Sahara Desert — Merzouga Dunes", address: "Erg Chebbi, Merzouga, Morocco", rating: 4.9, wikiTitle: "Erg_Chebbi" },
    { name: "Fes el-Bali Medina", address: "Fez, Morocco", rating: 4.8, wikiTitle: "Fes_el-Bali" }
  ],
  GH: [
    { name: "Cape Coast Castle", address: "Victoria Rd, Cape Coast, Ghana", rating: 4.7, wikiTitle: "Cape_Coast_Castle" },
    { name: "Kakum National Park", address: "Central Region, Ghana", rating: 4.6, wikiTitle: "Kakum_National_Park" },
    { name: "Lake Volta", address: "Akosombo, Eastern Region, Ghana", rating: 4.5, wikiTitle: "Lake_Volta" }
  ],
  BR: [
    { name: "Iguazu Falls", address: "Foz do Iguaçu, Paraná State, Brazil", rating: 4.9, wikiTitle: "Iguazu_Falls" },
    { name: "Christ the Redeemer", address: "Parque Nacional da Tijuca, Rio de Janeiro, Brazil", rating: 4.9, wikiTitle: "Christ_the_Redeemer_(statue)" },
    { name: "Amazon Rainforest", address: "Amazonas, Brazil", rating: 4.9, wikiTitle: "Amazon_rainforest" },
    { name: "Copacabana Beach", address: "Copacabana, Rio de Janeiro, Brazil", rating: 4.7, wikiTitle: "Copacabana,_Rio_de_Janeiro" }
  ],
  MX: [
    { name: "Chichen Itza", address: "Yucatán, Mexico", rating: 4.9, wikiTitle: "Chichen_Itza" },
    { name: "Teotihuacan Pyramids", address: "San Juan Teotihuacán, State of Mexico", rating: 4.8, wikiTitle: "Teotihuacan" },
    { name: "Tulum Ruins", address: "Tulum, Quintana Roo, Mexico", rating: 4.8, wikiTitle: "Tulum" },
    { name: "Cenotes of Yucatán", address: "Yucatán Peninsula, Mexico", rating: 4.9, wikiTitle: "Cenote" }
  ],
  AR: [
    { name: "Buenos Aires — La Boca", address: "La Boca, Buenos Aires, Argentina", rating: 4.7, wikiTitle: "La_Boca" },
    { name: "Iguazu Falls (Argentina side)", address: "Puerto Iguazú, Misiones Province, Argentina", rating: 4.9, wikiTitle: "Iguazu_Falls" },
    { name: "Patagonia — Torres del Paine", address: "Patagonia, Argentina / Chile", rating: 4.9, wikiTitle: "Patagonia" }
  ],
  CL: [
    { name: "Torres del Paine National Park", address: "Magallanes Region, Chile", rating: 4.9, wikiTitle: "Torres_del_Paine_National_Park" },
    { name: "Easter Island (Rapa Nui)", address: "Valparaíso Region, Chile", rating: 4.9, wikiTitle: "Easter_Island" },
    { name: "Atacama Desert", address: "Antofagasta Region, Chile", rating: 4.8, wikiTitle: "Atacama_Desert" }
  ],
  CO: [
    { name: "Cartagena Old Town", address: "Cartagena de Indias, Bolívar, Colombia", rating: 4.8, wikiTitle: "Cartagena,_Colombia" },
    { name: "Coffee Cultural Landscape", address: "Quindío, Risaralda, Colombia", rating: 4.8, wikiTitle: "Coffee_Cultural_Landscape_of_Colombia" },
    { name: "Ciudad Perdida (Lost City)", address: "Santa Marta, Magdalena, Colombia", rating: 4.9, wikiTitle: "Ciudad_Perdida" }
  ],
  PE: [
    { name: "Machu Picchu", address: "Machu Picchu, Cusco Region, Peru", rating: 4.9, wikiTitle: "Machu_Picchu" },
    { name: "Nazca Lines", address: "Nazca, Ica Region, Peru", rating: 4.8, wikiTitle: "Nazca_Lines" },
    { name: "Lake Titicaca", address: "Puno Region, Peru / Bolivia", rating: 4.8, wikiTitle: "Lake_Titicaca" }
  ],
  PL: [
    { name: "Wawel Royal Castle", address: "Wawel 5, 31-001 Kraków, Poland", rating: 4.8, wikiTitle: "Wawel_Castle" },
    { name: "Auschwitz-Birkenau Memorial", address: "Więźniów Oświęcimia 20, 32-603 Oświęcim, Poland", rating: 4.9, wikiTitle: "Auschwitz_concentration_camp" },
    { name: "Wieliczka Salt Mine", address: "Park Kingi 1, 32-020 Wieliczka, Poland", rating: 4.8, wikiTitle: "Wieliczka_salt_mine" }
  ],
  CZ: [
    { name: "Prague Old Town Square", address: "Old Town Square, 110 00 Prague, Czech Republic", rating: 4.8, wikiTitle: "Old_Town_Square,_Prague" },
    { name: "Charles Bridge", address: "Karlův most, 110 00 Malá Strana, Prague", rating: 4.8, wikiTitle: "Charles_Bridge" },
    { name: "Český Krumlov Castle", address: "Zámek 59, 381 01 Český Krumlov, Czech Republic", rating: 4.8, wikiTitle: "%C4%8Cesk%C3%BD_Krumlov" }
  ],
  HU: [
    { name: "Hungarian Parliament Building", address: "Kossuth Lajos tér 1-3, Budapest, Hungary", rating: 4.8, wikiTitle: "Hungarian_Parliament_Building" },
    { name: "Buda Castle", address: "Szent György tér 2, 1014 Budapest, Hungary", rating: 4.8, wikiTitle: "Buda_Castle" },
    { name: "Széchenyi Thermal Bath", address: "Állatkerti krt. 9-11, Budapest, Hungary", rating: 4.7, wikiTitle: "Sz%C3%A9chenyi_thermal_bath" }
  ],
  RO: [
    { name: "Bran Castle (Dracula's Castle)", address: "Str. General Traian Moșoiu 24, Bran, Romania", rating: 4.6, wikiTitle: "Bran_Castle" },
    { name: "Danube Delta", address: "Tulcea County, Romania", rating: 4.8, wikiTitle: "Danube_Delta" },
    { name: "Peles Castle", address: "Aleea Pelesului 2, Sinaia, Romania", rating: 4.8, wikiTitle: "Peles_Castle" }
  ],
  UA: [
    { name: "Kyiv Pechersk Lavra", address: "Lavrska St, 15, Kyiv, Ukraine", rating: 4.9, wikiTitle: "Kiev_Pechersk_Lavra" },
    { name: "Lviv Old Town", address: "Old Town, Lviv, Ukraine", rating: 4.8, wikiTitle: "Lviv" },
    { name: "St. Sophia Cathedral, Kyiv", address: "Volodymyrska St, 24, Kyiv, Ukraine", rating: 4.8, wikiTitle: "Saint_Sophia_Cathedral,_Kyiv" }
  ],
  PT: [
    { name: "Belém Tower", address: "Av. Brasília, 1400-038 Lisbon, Portugal", rating: 4.7, wikiTitle: "Bel%C3%A9m_Tower" },
    { name: "Sintra Palace & Pena Palace", address: "Rua Barbosa do Bocage 5, 2710-517 Sintra", rating: 4.9, wikiTitle: "Pena_Palace" },
    { name: "Douro Valley Vineyards", address: "Douro Valley, Porto District, Portugal", rating: 4.9, wikiTitle: "Douro_wine_region" }
  ],
  GR: [
    { name: "Acropolis of Athens", address: "Dionysiou Areopagitou, Athens, Greece", rating: 4.9, wikiTitle: "Acropolis_of_Athens" },
    { name: "Santorini Island", address: "Santorini, South Aegean, Greece", rating: 4.9, wikiTitle: "Santorini" },
    { name: "Meteora Monasteries", address: "Kalampaka, Thessaly, Greece", rating: 4.9, wikiTitle: "Meteora" }
  ],
  TW: [
    { name: "Taipei 101", address: "No. 7, Section 5, Xinyi Road, Taipei, Taiwan", rating: 4.7, wikiTitle: "Taipei_101" },
    { name: "Sun Moon Lake", address: "Nantou County, Taiwan", rating: 4.8, wikiTitle: "Sun_Moon_Lake" },
    { name: "Taroko National Park", address: "Xiulin, Hualien County, Taiwan", rating: 4.9, wikiTitle: "Taroko_National_Park" }
  ],
  HK: [
    { name: "Victoria Peak", address: "Victoria Peak, Hong Kong", rating: 4.7, wikiTitle: "Victoria_Peak" },
    { name: "Tian Tan Buddha", address: "Ngong Ping, Lantau Island, Hong Kong", rating: 4.7, wikiTitle: "Tian_Tan_Buddha" },
    { name: "Victoria Harbour", address: "Victoria Harbour, Hong Kong", rating: 4.8, wikiTitle: "Victoria_Harbour,_Hong_Kong" }
  ],
  NZ: [
    { name: "Milford Sound (Fiordland)", address: "Milford Sound, Southland, New Zealand", rating: 4.9, wikiTitle: "Milford_Sound" },
    { name: "Hobbiton Movie Set", address: "501 Buckland Rd, Hinuera, Matamata, New Zealand", rating: 4.8, wikiTitle: "Hobbiton_Movie_Set" },
    { name: "Rotorua Geothermal", address: "Rotorua, Bay of Plenty, New Zealand", rating: 4.7, wikiTitle: "Rotorua" }
  ],
  PK: [
    { name: "Badshahi Mosque", address: "Hazuri Bagh Rd, Lahore, Punjab, Pakistan", rating: 4.8, wikiTitle: "Badshahi_Mosque" },
    { name: "Lahore Fort", address: "Fort Rd, Lahore, Punjab, Pakistan", rating: 4.7, wikiTitle: "Lahore_Fort" },
    { name: "Karakorum Highway & Hunza Valley", address: "Gilgit-Baltistan, Pakistan", rating: 4.9, wikiTitle: "Karakoram_Highway" }
  ]
};

// Patterns for images that are logos/symbols (not real photos)
const LOGO_RE =
  /logo|seal|coat[_.\s-]?of[_.\s-]?arms|emblem|shield|crest|badge|arms|flag|blazon|insignia|icon|\.svg$/i;

// Patterns indicating a real campus/building photo
const CAMPUS_RE =
  /campus|building|aerial|aerial_view|university|college|main|library|hall|tower|gate|quad|facade|front|view|panorama|overview|exterior|grounds|courtyard|administration/i;

async function fetchPlaceImages(
  wikiTitles: string[]
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  for (const batch of chunkArray(wikiTitles, 50)) {
    const titles = batch.join("|");
    const url =
      `https://en.wikipedia.org/w/api.php?action=query` +
      `&titles=${encodeURIComponent(titles)}` +
      `&prop=pageimages&format=json&pithumbsize=900&redirects=1&origin=*`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "WorldUniversitiesApp/1.0" }
      });
      if (!res.ok) { await sleep(800); continue; }
      const data = (await res.json()) as {
        query?: {
          pages?: Record<string, { title: string; thumbnail?: { source: string } }>;
          normalized?: Array<{ from: string; to: string }>;
          redirects?: Array<{ from: string; to: string }>;
        };
      };
      const pages = data?.query?.pages ?? {};
      const normalized = data?.query?.normalized ?? [];
      const redirects = data?.query?.redirects ?? [];

      const resolvedToOriginal = new Map<string, string>();
      for (const t of batch) resolvedToOriginal.set(t, t);
      for (const n of normalized) resolvedToOriginal.set(n.to, resolvedToOriginal.get(n.from) ?? n.from);
      for (const r of redirects) resolvedToOriginal.set(r.to, resolvedToOriginal.get(r.from) ?? r.from);

      for (const page of Object.values(pages)) {
        const src = page.thumbnail?.source;
        if (src && !LOGO_RE.test(src)) {
          const original = resolvedToOriginal.get(page.title) ?? page.title;
          imageMap.set(original, src);
        }
      }
    } catch { /* silently skip */ }
    await sleep(300);
  }
  return imageMap;
}

function buildReverseMap(
  batch: string[],
  normalized: Array<{ from: string; to: string }>,
  redirects: Array<{ from: string; to: string }>
): Map<string, string> {
  const map = new Map<string, string>();
  for (const n of batch) map.set(n.replace(/ /g, "_"), n);
  for (const norm of normalized) {
    const orig = map.get(norm.from.replace(/ /g, "_")) ?? norm.from;
    map.set(norm.to.replace(/ /g, "_"), orig);
  }
  for (const redir of redirects) {
    const orig = map.get(redir.from.replace(/ /g, "_")) ?? redir.from;
    map.set(redir.to.replace(/ /g, "_"), orig);
  }
  return map;
}

async function fetchWikipediaImages(
  names: string[]
): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();
  const UA = "WorldUniversitiesApp/1.0 (educational project)";

  // ── PASS 1: pageimages — fast main-article thumbnail ──────────────────────
  console.log(`  Pass 1: pageimages for ${names.length} universities…`);
  for (const batch of chunkArray(names, 50)) {
    const titles = batch.map((n) => n.replace(/ /g, "_")).join("|");
    const url =
      `https://en.wikipedia.org/w/api.php?action=query` +
      `&titles=${encodeURIComponent(titles)}` +
      `&prop=pageimages&format=json&pithumbsize=900&redirects=1&origin=*`;

    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) { await sleep(1000); continue; }
      const data = (await res.json()) as {
        query?: {
          pages?: Record<string, { title: string; thumbnail?: { source: string } }>;
          redirects?: Array<{ from: string; to: string }>;
          normalized?: Array<{ from: string; to: string }>;
        };
      };
      const pages = data?.query?.pages ?? {};
      const revMap = buildReverseMap(
        batch,
        data?.query?.normalized ?? [],
        data?.query?.redirects ?? []
      );
      for (const page of Object.values(pages)) {
        const src = page.thumbnail?.source;
        if (src && !LOGO_RE.test(src)) {
          const key = revMap.get(page.title.replace(/ /g, "_"));
          if (key) imageMap.set(key, src);
        }
      }
    } catch (err) {
      console.warn("Pass 1 batch failed:", (err as Error).message);
    }
    await sleep(300);
  }
  console.log(`  Pass 1 done: ${imageMap.size} images found`);

  // ── PASS 2: prop=images — collect all article image filenames ──────────────
  const missing = names.filter((n) => !imageMap.has(n));
  if (missing.length === 0) return imageMap;

  console.log(`  Pass 2: article image lists for ${missing.length} universities…`);
  // uniName → best candidate filenames (sorted by relevance)
  const candidateFiles = new Map<string, string[]>();

  for (const batch of chunkArray(missing, 50)) {
    const titles = batch.map((n) => n.replace(/ /g, "_")).join("|");
    const url =
      `https://en.wikipedia.org/w/api.php?action=query` +
      `&titles=${encodeURIComponent(titles)}` +
      `&prop=images&format=json&imlimit=30&redirects=1&origin=*`;

    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) { await sleep(1000); continue; }
      const data = (await res.json()) as {
        query?: {
          pages?: Record<string, { title: string; images?: Array<{ title: string }> }>;
          redirects?: Array<{ from: string; to: string }>;
          normalized?: Array<{ from: string; to: string }>;
        };
      };
      const pages = data?.query?.pages ?? {};
      const revMap = buildReverseMap(
        batch,
        data?.query?.normalized ?? [],
        data?.query?.redirects ?? []
      );

      for (const page of Object.values(pages)) {
        const original = revMap.get(page.title.replace(/ /g, "_"));
        if (!original || !page.images) continue;

        const sorted = (page.images as Array<{ title: string }>)
          .map((img) => img.title)
          .filter((t) => !LOGO_RE.test(t) && !t.endsWith(".svg"))
          .sort((a, b) => {
            // Prefer campus-keyword filenames
            const aS = CAMPUS_RE.test(a) ? 2 : 0;
            const bS = CAMPUS_RE.test(b) ? 2 : 0;
            // Penalise portrait/headshot filenames
            const aP = /portrait|headshot|president|rector|professor|faculty|staff|person|people/i.test(a) ? -1 : 0;
            const bP = /portrait|headshot|president|rector|professor|faculty|staff|person|people/i.test(b) ? -1 : 0;
            return (bS + bP) - (aS + aP);
          });

        if (sorted.length > 0) {
          candidateFiles.set(original, sorted.slice(0, 4));
        }
      }
    } catch (err) {
      console.warn("Pass 2 batch failed:", (err as Error).message);
    }
    await sleep(350);
  }

  // ── PASS 3: imageinfo — resolve file names → actual URLs ──────────────────
  const allFiles = [...new Set([...candidateFiles.values()].flat())];
  const fileUrlMap = new Map<string, string>();

  if (allFiles.length > 0) {
    console.log(`  Pass 3: imageinfo for ${allFiles.length} candidate files…`);
    for (const batch of chunkArray(allFiles, 50)) {
      const titles = batch.join("|");
      const url =
        `https://en.wikipedia.org/w/api.php?action=query` +
        `&titles=${encodeURIComponent(titles)}` +
        `&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`;

      try {
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (!res.ok) { await sleep(1000); continue; }
        const data = (await res.json()) as {
          query?: {
            pages?: Record<string, {
              title: string;
              imageinfo?: Array<{ url?: string; thumburl?: string }>;
            }>;
          };
        };
        for (const page of Object.values(data?.query?.pages ?? {})) {
          const info = page.imageinfo?.[0];
          const finalUrl = info?.thumburl ?? info?.url;
          if (finalUrl && !LOGO_RE.test(finalUrl)) {
            fileUrlMap.set(page.title, finalUrl);
          }
        }
      } catch (err) {
        console.warn("Pass 3 batch failed:", (err as Error).message);
      }
      await sleep(350);
    }

    // Map best resolved file URL → university
    for (const [uniName, candidates] of candidateFiles) {
      for (const candidate of candidates) {
        const url = fileUrlMap.get(candidate);
        if (url) {
          imageMap.set(uniName, url);
          break;
        }
      }
    }
  }

  console.log(`  Pass 3 done: ${imageMap.size} total images`);

  // ── PASS 4: Wikimedia Commons — category files + search ───────────────────
  const stillMissing = names.filter((n) => !imageMap.has(n));
  if (stillMissing.length === 0) return imageMap;

  console.log(`  Pass 4: Wikimedia Commons for ${stillMissing.length} universities…`);

  // Step 4a: Get commonscat pageprops (official Commons category link)
  const commonsCatMap = new Map<string, string>(); // uniName → category name
  for (const batch of chunkArray(stillMissing, 50)) {
    const titles = batch.map((n) => n.replace(/ /g, "_")).join("|");
    const url =
      `https://en.wikipedia.org/w/api.php?action=query` +
      `&titles=${encodeURIComponent(titles)}` +
      `&prop=pageprops&ppprop=commonscat` +
      `&format=json&redirects=1&origin=*`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) { await sleep(800); continue; }
      const data = (await res.json()) as {
        query?: {
          pages?: Record<string, { title: string; pageprops?: { commonscat?: string } }>;
          redirects?: Array<{ from: string; to: string }>;
          normalized?: Array<{ from: string; to: string }>;
        };
      };
      const revMap = buildReverseMap(
        batch, data?.query?.normalized ?? [], data?.query?.redirects ?? []
      );
      for (const page of Object.values(data?.query?.pages ?? {})) {
        const original = revMap.get(page.title.replace(/ /g, "_"));
        const cat = page.pageprops?.commonscat;
        if (original && cat) commonsCatMap.set(original, cat);
      }
    } catch {}
    await sleep(300);
  }
  console.log(`  Found ${commonsCatMap.size} Commons categories`);

  // Filter for images (no logos, no SVGs, no portraits/maps/plans)
  const SKIP_RE =
    /logo|seal|coat.of.arms|emblem|shield|crest|badge|arms|flag|blazon|insignia|icon|portrait|headshot|rector|president|map|plan|diagram|svg$/i;

  // Step 4b: Get files from each Commons category
  const commonsCandidates = new Map<string, string[]>(); // uniName → [File:...]
  for (const [uniName, catName] of commonsCatMap) {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query` +
      `&list=categorymembers` +
      `&cmtitle=${encodeURIComponent("Category:" + catName)}` +
      `&cmtype=file&cmlimit=10&format=json&origin=*`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) { await sleep(800); continue; }
      const data = (await res.json()) as {
        query?: { categorymembers?: Array<{ title: string }> };
      };
      const members = data?.query?.categorymembers ?? [];
      const candidates = members
        .map((m) => m.title)
        .filter((t) => !SKIP_RE.test(t));
      if (candidates.length > 0) commonsCandidates.set(uniName, candidates.slice(0, 5));
    } catch {}
    await sleep(180);
  }

  // Step 4b-fallback: Commons keyword search for unis without a category
  const noCat = stillMissing.filter((n) => !commonsCandidates.has(n));
  if (noCat.length > 0) {
    console.log(`  Pass 4b: Commons search for ${noCat.length} universities…`);
    for (const name of noCat) {
      const query = encodeURIComponent(`${name} campus`);
      const url =
        `https://commons.wikimedia.org/w/api.php?action=query` +
        `&list=search&srsearch=${query}&srnamespace=6&srlimit=5` +
        `&format=json&origin=*`;
      try {
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (!res.ok) { await sleep(800); continue; }
        const data = (await res.json()) as {
          query?: { search?: Array<{ title: string }> };
        };
        const results = data?.query?.search ?? [];
        const candidates = results
          .map((r) => r.title)
          .filter((t) => !SKIP_RE.test(t));
        if (candidates.length > 0) commonsCandidates.set(name, candidates.slice(0, 3));
      } catch {}
      await sleep(180);
    }
  }

  // Step 4c: Batch imageinfo for all Commons candidates
  const allCommonsFiles = [...new Set([...commonsCandidates.values()].flat())];
  const commonsUrlMap = new Map<string, string>();
  if (allCommonsFiles.length > 0) {
    console.log(`  Pass 4c: imageinfo for ${allCommonsFiles.length} Commons files…`);
    for (const batch of chunkArray(allCommonsFiles, 50)) {
      const titles = batch.join("|");
      const url =
        `https://commons.wikimedia.org/w/api.php?action=query` +
        `&titles=${encodeURIComponent(titles)}` +
        `&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*`;
      try {
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (!res.ok) { await sleep(1000); continue; }
        const data = (await res.json()) as {
          query?: {
            pages?: Record<string, {
              title: string;
              imageinfo?: Array<{ url?: string; thumburl?: string }>;
            }>;
          };
        };
        for (const page of Object.values(data?.query?.pages ?? {})) {
          const info = page.imageinfo?.[0];
          const finalUrl = info?.thumburl ?? info?.url;
          if (finalUrl && !SKIP_RE.test(finalUrl)) {
            commonsUrlMap.set(page.title, finalUrl);
          }
        }
      } catch {}
      await sleep(350);
    }

    // Assign best Commons URL to each university
    for (const [uniName, candidates] of commonsCandidates) {
      for (const candidate of candidates) {
        const url = commonsUrlMap.get(candidate);
        if (url) {
          imageMap.set(uniName, url);
          break;
        }
      }
    }
  }

  console.log(`  Pass 4 done: ${imageMap.size} total images`);
  return imageMap;
}

const FALLBACK_UNIVERSITIES: SourceUniversity[] = [
  // United States
  { name: "Harvard University", country: "United States", "state-province": "Massachusetts", alpha_two_code: "US", web_pages: ["https://www.harvard.edu"], domains: ["harvard.edu"] },
  { name: "Massachusetts Institute of Technology", country: "United States", "state-province": "Massachusetts", alpha_two_code: "US", web_pages: ["https://www.mit.edu"], domains: ["mit.edu"] },
  { name: "Stanford University", country: "United States", "state-province": "California", alpha_two_code: "US", web_pages: ["https://www.stanford.edu"], domains: ["stanford.edu"] },
  { name: "Yale University", country: "United States", "state-province": "Connecticut", alpha_two_code: "US", web_pages: ["https://www.yale.edu"], domains: ["yale.edu"] },
  { name: "Princeton University", country: "United States", "state-province": "New Jersey", alpha_two_code: "US", web_pages: ["https://www.princeton.edu"], domains: ["princeton.edu"] },
  { name: "Columbia University", country: "United States", "state-province": "New York", alpha_two_code: "US", web_pages: ["https://www.columbia.edu"], domains: ["columbia.edu"] },
  { name: "University of California Berkeley", country: "United States", "state-province": "California", alpha_two_code: "US", web_pages: ["https://www.berkeley.edu"], domains: ["berkeley.edu"] },
  { name: "University of California Los Angeles", country: "United States", "state-province": "California", alpha_two_code: "US", web_pages: ["https://www.ucla.edu"], domains: ["ucla.edu"] },
  { name: "University of Chicago", country: "United States", "state-province": "Illinois", alpha_two_code: "US", web_pages: ["https://www.uchicago.edu"], domains: ["uchicago.edu"] },
  { name: "Duke University", country: "United States", "state-province": "North Carolina", alpha_two_code: "US", web_pages: ["https://www.duke.edu"], domains: ["duke.edu"] },
  { name: "Cornell University", country: "United States", "state-province": "New York", alpha_two_code: "US", web_pages: ["https://www.cornell.edu"], domains: ["cornell.edu"] },
  { name: "University of Pennsylvania", country: "United States", "state-province": "Pennsylvania", alpha_two_code: "US", web_pages: ["https://www.upenn.edu"], domains: ["upenn.edu"] },
  { name: "Johns Hopkins University", country: "United States", "state-province": "Maryland", alpha_two_code: "US", web_pages: ["https://www.jhu.edu"], domains: ["jhu.edu"] },
  { name: "Northwestern University", country: "United States", "state-province": "Illinois", alpha_two_code: "US", web_pages: ["https://www.northwestern.edu"], domains: ["northwestern.edu"] },
  { name: "Vanderbilt University", country: "United States", "state-province": "Tennessee", alpha_two_code: "US", web_pages: ["https://www.vanderbilt.edu"], domains: ["vanderbilt.edu"] },
  { name: "Georgetown University", country: "United States", "state-province": "Washington DC", alpha_two_code: "US", web_pages: ["https://www.georgetown.edu"], domains: ["georgetown.edu"] },
  { name: "New York University", country: "United States", "state-province": "New York", alpha_two_code: "US", web_pages: ["https://www.nyu.edu"], domains: ["nyu.edu"] },
  { name: "University of Michigan", country: "United States", "state-province": "Michigan", alpha_two_code: "US", web_pages: ["https://www.umich.edu"], domains: ["umich.edu"] },
  { name: "University of Washington", country: "United States", "state-province": "Washington", alpha_two_code: "US", web_pages: ["https://www.uw.edu"], domains: ["uw.edu"] },
  { name: "Georgia Institute of Technology", country: "United States", "state-province": "Georgia", alpha_two_code: "US", web_pages: ["https://www.gatech.edu"], domains: ["gatech.edu"] },
  // United Kingdom
  { name: "University of Oxford", country: "United Kingdom", "state-province": null, alpha_two_code: "GB", web_pages: ["https://www.ox.ac.uk"], domains: ["ox.ac.uk"] },
  { name: "University of Cambridge", country: "United Kingdom", "state-province": null, alpha_two_code: "GB", web_pages: ["https://www.cam.ac.uk"], domains: ["cam.ac.uk"] },
  { name: "Imperial College London", country: "United Kingdom", "state-province": null, alpha_two_code: "GB", web_pages: ["https://www.imperial.ac.uk"], domains: ["imperial.ac.uk"] },
  { name: "University College London", country: "United Kingdom", "state-province": null, alpha_two_code: "GB", web_pages: ["https://www.ucl.ac.uk"], domains: ["ucl.ac.uk"] },
  { name: "University of Edinburgh", country: "United Kingdom", "state-province": null, alpha_two_code: "GB", web_pages: ["https://www.ed.ac.uk"], domains: ["ed.ac.uk"] },
  { name: "University of Manchester", country: "United Kingdom", "state-province": null, alpha_two_code: "GB", web_pages: ["https://www.manchester.ac.uk"], domains: ["manchester.ac.uk"] },
  { name: "King's College London", country: "United Kingdom", "state-province": null, alpha_two_code: "GB", web_pages: ["https://www.kcl.ac.uk"], domains: ["kcl.ac.uk"] },
  { name: "London School of Economics", country: "United Kingdom", "state-province": null, alpha_two_code: "GB", web_pages: ["https://www.lse.ac.uk"], domains: ["lse.ac.uk"] },
  // Germany
  { name: "Technical University of Munich", country: "Germany", "state-province": "Bavaria", alpha_two_code: "DE", web_pages: ["https://www.tum.de"], domains: ["tum.de"] },
  { name: "Heidelberg University", country: "Germany", "state-province": "Baden-Wuerttemberg", alpha_two_code: "DE", web_pages: ["https://www.uni-heidelberg.de"], domains: ["uni-heidelberg.de"] },
  { name: "Humboldt University of Berlin", country: "Germany", "state-province": "Berlin", alpha_two_code: "DE", web_pages: ["https://www.hu-berlin.de"], domains: ["hu-berlin.de"] },
  { name: "Ludwig Maximilian University of Munich", country: "Germany", "state-province": "Bavaria", alpha_two_code: "DE", web_pages: ["https://www.lmu.de"], domains: ["lmu.de"] },
  { name: "RWTH Aachen University", country: "Germany", "state-province": "North Rhine-Westphalia", alpha_two_code: "DE", web_pages: ["https://www.rwth-aachen.de"], domains: ["rwth-aachen.de"] },
  { name: "Free University of Berlin", country: "Germany", "state-province": "Berlin", alpha_two_code: "DE", web_pages: ["https://www.fu-berlin.de"], domains: ["fu-berlin.de"] },
  // France
  { name: "Sorbonne University", country: "France", "state-province": null, alpha_two_code: "FR", web_pages: ["https://www.sorbonne-universite.fr"], domains: ["sorbonne-universite.fr"] },
  { name: "PSL University", country: "France", "state-province": null, alpha_two_code: "FR", web_pages: ["https://www.psl.eu"], domains: ["psl.eu"] },
  { name: "Ecole Polytechnique", country: "France", "state-province": null, alpha_two_code: "FR", web_pages: ["https://www.polytechnique.edu"], domains: ["polytechnique.edu"] },
  { name: "Sciences Po", country: "France", "state-province": null, alpha_two_code: "FR", web_pages: ["https://www.sciencespo.fr"], domains: ["sciencespo.fr"] },
  { name: "University of Paris-Saclay", country: "France", "state-province": null, alpha_two_code: "FR", web_pages: ["https://www.universite-paris-saclay.fr"], domains: ["universite-paris-saclay.fr"] },
  // Russia
  { name: "Moscow State University", country: "Russia", "state-province": "Moscow", alpha_two_code: "RU", web_pages: ["https://www.msu.ru"], domains: ["msu.ru"] },
  { name: "Saint Petersburg State University", country: "Russia", "state-province": "Saint Petersburg", alpha_two_code: "RU", web_pages: ["https://www.spbu.ru"], domains: ["spbu.ru"] },
  { name: "Moscow Institute of Physics and Technology", country: "Russia", "state-province": "Moscow Oblast", alpha_two_code: "RU", web_pages: ["https://www.mipt.ru"], domains: ["mipt.ru"] },
  { name: "Novosibirsk State University", country: "Russia", "state-province": "Novosibirsk Oblast", alpha_two_code: "RU", web_pages: ["https://www.nsu.ru"], domains: ["nsu.ru"] },
  // China
  { name: "Peking University", country: "China", "state-province": "Beijing", alpha_two_code: "CN", web_pages: ["https://www.pku.edu.cn"], domains: ["pku.edu.cn"] },
  { name: "Tsinghua University", country: "China", "state-province": "Beijing", alpha_two_code: "CN", web_pages: ["https://www.tsinghua.edu.cn"], domains: ["tsinghua.edu.cn"] },
  { name: "Fudan University", country: "China", "state-province": "Shanghai", alpha_two_code: "CN", web_pages: ["https://www.fudan.edu.cn"], domains: ["fudan.edu.cn"] },
  { name: "Zhejiang University", country: "China", "state-province": "Zhejiang", alpha_two_code: "CN", web_pages: ["https://www.zju.edu.cn"], domains: ["zju.edu.cn"] },
  { name: "Shanghai Jiao Tong University", country: "China", "state-province": "Shanghai", alpha_two_code: "CN", web_pages: ["https://www.sjtu.edu.cn"], domains: ["sjtu.edu.cn"] },
  { name: "Nanjing University", country: "China", "state-province": "Jiangsu", alpha_two_code: "CN", web_pages: ["https://www.nju.edu.cn"], domains: ["nju.edu.cn"] },
  { name: "University of Science and Technology of China", country: "China", "state-province": "Anhui", alpha_two_code: "CN", web_pages: ["https://www.ustc.edu.cn"], domains: ["ustc.edu.cn"] },
  { name: "Wuhan University", country: "China", "state-province": "Hubei", alpha_two_code: "CN", web_pages: ["https://www.whu.edu.cn"], domains: ["whu.edu.cn"] },
  // Japan
  { name: "University of Tokyo", country: "Japan", "state-province": "Tokyo", alpha_two_code: "JP", web_pages: ["https://www.u-tokyo.ac.jp"], domains: ["u-tokyo.ac.jp"] },
  { name: "Kyoto University", country: "Japan", "state-province": "Kyoto", alpha_two_code: "JP", web_pages: ["https://www.kyoto-u.ac.jp"], domains: ["kyoto-u.ac.jp"] },
  { name: "Osaka University", country: "Japan", "state-province": "Osaka", alpha_two_code: "JP", web_pages: ["https://www.osaka-u.ac.jp"], domains: ["osaka-u.ac.jp"] },
  { name: "Tohoku University", country: "Japan", "state-province": "Miyagi", alpha_two_code: "JP", web_pages: ["https://www.tohoku.ac.jp"], domains: ["tohoku.ac.jp"] },
  { name: "Nagoya University", country: "Japan", "state-province": "Aichi", alpha_two_code: "JP", web_pages: ["https://www.nagoya-u.ac.jp"], domains: ["nagoya-u.ac.jp"] },
  // South Korea
  { name: "Seoul National University", country: "South Korea", "state-province": "Seoul", alpha_two_code: "KR", web_pages: ["https://www.snu.ac.kr"], domains: ["snu.ac.kr"] },
  { name: "Korea Advanced Institute of Science and Technology", country: "South Korea", "state-province": "Daejeon", alpha_two_code: "KR", web_pages: ["https://www.kaist.ac.kr"], domains: ["kaist.ac.kr"] },
  { name: "POSTECH", country: "South Korea", "state-province": "North Gyeongsang", alpha_two_code: "KR", web_pages: ["https://www.postech.ac.kr"], domains: ["postech.ac.kr"] },
  { name: "Yonsei University", country: "South Korea", "state-province": "Seoul", alpha_two_code: "KR", web_pages: ["https://www.yonsei.ac.kr"], domains: ["yonsei.ac.kr"] },
  // Australia
  { name: "University of Melbourne", country: "Australia", "state-province": "Victoria", alpha_two_code: "AU", web_pages: ["https://www.unimelb.edu.au"], domains: ["unimelb.edu.au"] },
  { name: "University of Sydney", country: "Australia", "state-province": "New South Wales", alpha_two_code: "AU", web_pages: ["https://www.sydney.edu.au"], domains: ["sydney.edu.au"] },
  { name: "Australian National University", country: "Australia", "state-province": "Australian Capital Territory", alpha_two_code: "AU", web_pages: ["https://www.anu.edu.au"], domains: ["anu.edu.au"] },
  { name: "University of Queensland", country: "Australia", "state-province": "Queensland", alpha_two_code: "AU", web_pages: ["https://www.uq.edu.au"], domains: ["uq.edu.au"] },
  { name: "University of New South Wales", country: "Australia", "state-province": "New South Wales", alpha_two_code: "AU", web_pages: ["https://www.unsw.edu.au"], domains: ["unsw.edu.au"] },
  // Canada
  { name: "University of Toronto", country: "Canada", "state-province": "Ontario", alpha_two_code: "CA", web_pages: ["https://www.utoronto.ca"], domains: ["utoronto.ca"] },
  { name: "McGill University", country: "Canada", "state-province": "Quebec", alpha_two_code: "CA", web_pages: ["https://www.mcgill.ca"], domains: ["mcgill.ca"] },
  { name: "University of British Columbia", country: "Canada", "state-province": "British Columbia", alpha_two_code: "CA", web_pages: ["https://www.ubc.ca"], domains: ["ubc.ca"] },
  { name: "McMaster University", country: "Canada", "state-province": "Ontario", alpha_two_code: "CA", web_pages: ["https://www.mcmaster.ca"], domains: ["mcmaster.ca"] },
  { name: "University of Waterloo", country: "Canada", "state-province": "Ontario", alpha_two_code: "CA", web_pages: ["https://www.uwaterloo.ca"], domains: ["uwaterloo.ca"] },
  // India
  { name: "Indian Institute of Technology Delhi", country: "India", "state-province": "Delhi", alpha_two_code: "IN", web_pages: ["https://www.iitd.ac.in"], domains: ["iitd.ac.in"] },
  { name: "Indian Institute of Technology Bombay", country: "India", "state-province": "Maharashtra", alpha_two_code: "IN", web_pages: ["https://www.iitb.ac.in"], domains: ["iitb.ac.in"] },
  { name: "Indian Institute of Technology Madras", country: "India", "state-province": "Tamil Nadu", alpha_two_code: "IN", web_pages: ["https://www.iitm.ac.in"], domains: ["iitm.ac.in"] },
  { name: "Indian Institute of Science Bangalore", country: "India", "state-province": "Karnataka", alpha_two_code: "IN", web_pages: ["https://www.iisc.ac.in"], domains: ["iisc.ac.in"] },
  { name: "Jawaharlal Nehru University", country: "India", "state-province": "Delhi", alpha_two_code: "IN", web_pages: ["https://www.jnu.ac.in"], domains: ["jnu.ac.in"] },
  { name: "University of Delhi", country: "India", "state-province": "Delhi", alpha_two_code: "IN", web_pages: ["https://www.du.ac.in"], domains: ["du.ac.in"] },
  // Switzerland
  { name: "ETH Zurich", country: "Switzerland", "state-province": null, alpha_two_code: "CH", web_pages: ["https://www.ethz.ch"], domains: ["ethz.ch"] },
  { name: "EPFL", country: "Switzerland", "state-province": null, alpha_two_code: "CH", web_pages: ["https://www.epfl.ch"], domains: ["epfl.ch"] },
  { name: "University of Zurich", country: "Switzerland", "state-province": null, alpha_two_code: "CH", web_pages: ["https://www.uzh.ch"], domains: ["uzh.ch"] },
  // Netherlands
  { name: "Leiden University", country: "Netherlands", "state-province": null, alpha_two_code: "NL", web_pages: ["https://www.leiden.edu"], domains: ["leiden.edu"] },
  { name: "Delft University of Technology", country: "Netherlands", "state-province": null, alpha_two_code: "NL", web_pages: ["https://www.tudelft.nl"], domains: ["tudelft.nl"] },
  { name: "Utrecht University", country: "Netherlands", "state-province": null, alpha_two_code: "NL", web_pages: ["https://www.uu.nl"], domains: ["uu.nl"] },
  // Italy
  { name: "University of Bologna", country: "Italy", "state-province": "Emilia-Romagna", alpha_two_code: "IT", web_pages: ["https://www.unibo.it"], domains: ["unibo.it"] },
  { name: "Sapienza University of Rome", country: "Italy", "state-province": "Lazio", alpha_two_code: "IT", web_pages: ["https://www.uniroma1.it"], domains: ["uniroma1.it"] },
  { name: "University of Milan", country: "Italy", "state-province": "Lombardy", alpha_two_code: "IT", web_pages: ["https://www.unimi.it"], domains: ["unimi.it"] },
  // Spain
  { name: "Complutense University of Madrid", country: "Spain", "state-province": "Madrid", alpha_two_code: "ES", web_pages: ["https://www.ucm.es"], domains: ["ucm.es"] },
  { name: "University of Barcelona", country: "Spain", "state-province": "Catalonia", alpha_two_code: "ES", web_pages: ["https://www.ub.edu"], domains: ["ub.edu"] },
  { name: "University of Salamanca", country: "Spain", "state-province": "Castile and Leon", alpha_two_code: "ES", web_pages: ["https://www.usal.es"], domains: ["usal.es"] },
  // Sweden
  { name: "Uppsala University", country: "Sweden", "state-province": null, alpha_two_code: "SE", web_pages: ["https://www.uu.se"], domains: ["uu.se"] },
  { name: "Stockholm University", country: "Sweden", "state-province": null, alpha_two_code: "SE", web_pages: ["https://www.su.se"], domains: ["su.se"] },
  { name: "KTH Royal Institute of Technology", country: "Sweden", "state-province": null, alpha_two_code: "SE", web_pages: ["https://www.kth.se"], domains: ["kth.se"] },
  // Scandinavia
  { name: "University of Oslo", country: "Norway", "state-province": null, alpha_two_code: "NO", web_pages: ["https://www.uio.no"], domains: ["uio.no"] },
  { name: "University of Copenhagen", country: "Denmark", "state-province": null, alpha_two_code: "DK", web_pages: ["https://www.ku.dk"], domains: ["ku.dk"] },
  { name: "University of Helsinki", country: "Finland", "state-province": null, alpha_two_code: "FI", web_pages: ["https://www.helsinki.fi"], domains: ["helsinki.fi"] },
  { name: "Aalto University", country: "Finland", "state-province": null, alpha_two_code: "FI", web_pages: ["https://www.aalto.fi"], domains: ["aalto.fi"] },
  // Belgium & Austria
  { name: "Ghent University", country: "Belgium", "state-province": null, alpha_two_code: "BE", web_pages: ["https://www.ugent.be"], domains: ["ugent.be"] },
  { name: "KU Leuven", country: "Belgium", "state-province": null, alpha_two_code: "BE", web_pages: ["https://www.kuleuven.be"], domains: ["kuleuven.be"] },
  { name: "University of Vienna", country: "Austria", "state-province": null, alpha_two_code: "AT", web_pages: ["https://www.univie.ac.at"], domains: ["univie.ac.at"] },
  // Singapore & Southeast Asia
  { name: "National University of Singapore", country: "Singapore", "state-province": null, alpha_two_code: "SG", web_pages: ["https://www.nus.edu.sg"], domains: ["nus.edu.sg"] },
  { name: "Nanyang Technological University", country: "Singapore", "state-province": null, alpha_two_code: "SG", web_pages: ["https://www.ntu.edu.sg"], domains: ["ntu.edu.sg"] },
  { name: "University of Malaya", country: "Malaysia", "state-province": "Kuala Lumpur", alpha_two_code: "MY", web_pages: ["https://www.um.edu.my"], domains: ["um.edu.my"] },
  { name: "Chulalongkorn University", country: "Thailand", "state-province": "Bangkok", alpha_two_code: "TH", web_pages: ["https://www.chula.ac.th"], domains: ["chula.ac.th"] },
  { name: "University of Indonesia", country: "Indonesia", "state-province": "West Java", alpha_two_code: "ID", web_pages: ["https://www.ui.ac.id"], domains: ["ui.ac.id"] },
  { name: "University of the Philippines", country: "Philippines", "state-province": "Metro Manila", alpha_two_code: "PH", web_pages: ["https://www.up.edu.ph"], domains: ["up.edu.ph"] },
  { name: "Vietnam National University Hanoi", country: "Vietnam", "state-province": "Hanoi", alpha_two_code: "VN", web_pages: ["https://www.vnu.edu.vn"], domains: ["vnu.edu.vn"] },
  // Israel & Middle East
  { name: "Hebrew University of Jerusalem", country: "Israel", "state-province": null, alpha_two_code: "IL", web_pages: ["https://www.huji.ac.il"], domains: ["huji.ac.il"] },
  { name: "Tel Aviv University", country: "Israel", "state-province": null, alpha_two_code: "IL", web_pages: ["https://www.tau.ac.il"], domains: ["tau.ac.il"] },
  { name: "King Saud University", country: "Saudi Arabia", "state-province": "Riyadh", alpha_two_code: "SA", web_pages: ["https://www.ksu.edu.sa"], domains: ["ksu.edu.sa"] },
  { name: "King Abdullah University of Science and Technology", country: "Saudi Arabia", "state-province": "Makkah", alpha_two_code: "SA", web_pages: ["https://www.kaust.edu.sa"], domains: ["kaust.edu.sa"] },
  { name: "Middle East Technical University", country: "Turkey", "state-province": "Ankara", alpha_two_code: "TR", web_pages: ["https://www.metu.edu.tr"], domains: ["metu.edu.tr"] },
  { name: "Bogazici University", country: "Turkey", "state-province": "Istanbul", alpha_two_code: "TR", web_pages: ["https://www.boun.edu.tr"], domains: ["boun.edu.tr"] },
  { name: "University of Tehran", country: "Iran", "state-province": "Tehran", alpha_two_code: "IR", web_pages: ["https://www.ut.ac.ir"], domains: ["ut.ac.ir"] },
  { name: "Sharif University of Technology", country: "Iran", "state-province": "Tehran", alpha_two_code: "IR", web_pages: ["https://www.sharif.edu"], domains: ["sharif.edu"] },
  // Africa
  { name: "University of Cape Town", country: "South Africa", "state-province": "Western Cape", alpha_two_code: "ZA", web_pages: ["https://www.uct.ac.za"], domains: ["uct.ac.za"] },
  { name: "University of the Witwatersrand", country: "South Africa", "state-province": "Gauteng", alpha_two_code: "ZA", web_pages: ["https://www.wits.ac.za"], domains: ["wits.ac.za"] },
  { name: "University of Pretoria", country: "South Africa", "state-province": "Gauteng", alpha_two_code: "ZA", web_pages: ["https://www.up.ac.za"], domains: ["up.ac.za"] },
  { name: "Cairo University", country: "Egypt", "state-province": "Giza", alpha_two_code: "EG", web_pages: ["https://www.cu.edu.eg"], domains: ["cu.edu.eg"] },
  { name: "American University in Cairo", country: "Egypt", "state-province": "Cairo", alpha_two_code: "EG", web_pages: ["https://www.aucegypt.edu"], domains: ["aucegypt.edu"] },
  { name: "University of Lagos", country: "Nigeria", "state-province": "Lagos", alpha_two_code: "NG", web_pages: ["https://www.unilag.edu.ng"], domains: ["unilag.edu.ng"] },
  { name: "University of Ibadan", country: "Nigeria", "state-province": "Oyo", alpha_two_code: "NG", web_pages: ["https://www.ui.edu.ng"], domains: ["ui.edu.ng"] },
  { name: "University of Nairobi", country: "Kenya", "state-province": "Nairobi", alpha_two_code: "KE", web_pages: ["https://www.uonbi.ac.ke"], domains: ["uonbi.ac.ke"] },
  { name: "Addis Ababa University", country: "Ethiopia", "state-province": "Addis Ababa", alpha_two_code: "ET", web_pages: ["https://www.aau.edu.et"], domains: ["aau.edu.et"] },
  { name: "Mohammed V University", country: "Morocco", "state-province": "Rabat", alpha_two_code: "MA", web_pages: ["https://www.um5.ac.ma"], domains: ["um5.ac.ma"] },
  { name: "University of Ghana", country: "Ghana", "state-province": "Greater Accra", alpha_two_code: "GH", web_pages: ["https://www.ug.edu.gh"], domains: ["ug.edu.gh"] },
  // Latin America
  { name: "University of Sao Paulo", country: "Brazil", "state-province": "Sao Paulo", alpha_two_code: "BR", web_pages: ["https://www.usp.br"], domains: ["usp.br"] },
  { name: "University of Campinas", country: "Brazil", "state-province": "Sao Paulo", alpha_two_code: "BR", web_pages: ["https://www.unicamp.br"], domains: ["unicamp.br"] },
  { name: "Federal University of Rio de Janeiro", country: "Brazil", "state-province": "Rio de Janeiro", alpha_two_code: "BR", web_pages: ["https://www.ufrj.br"], domains: ["ufrj.br"] },
  { name: "National Autonomous University of Mexico", country: "Mexico", "state-province": "Mexico City", alpha_two_code: "MX", web_pages: ["https://www.unam.mx"], domains: ["unam.mx"] },
  { name: "Tecnologico de Monterrey", country: "Mexico", "state-province": "Nuevo Leon", alpha_two_code: "MX", web_pages: ["https://www.tec.mx"], domains: ["tec.mx"] },
  { name: "University of Buenos Aires", country: "Argentina", "state-province": "Buenos Aires", alpha_two_code: "AR", web_pages: ["https://www.uba.ar"], domains: ["uba.ar"] },
  { name: "Pontificia Universidad Catolica de Chile", country: "Chile", "state-province": "Santiago", alpha_two_code: "CL", web_pages: ["https://www.uc.cl"], domains: ["uc.cl"] },
  { name: "University of Chile", country: "Chile", "state-province": "Santiago", alpha_two_code: "CL", web_pages: ["https://www.uchile.cl"], domains: ["uchile.cl"] },
  { name: "Universidad de los Andes Colombia", country: "Colombia", "state-province": "Bogota", alpha_two_code: "CO", web_pages: ["https://www.uniandes.edu.co"], domains: ["uniandes.edu.co"] },
  { name: "Pontificia Universidad Catolica del Peru", country: "Peru", "state-province": "Lima", alpha_two_code: "PE", web_pages: ["https://www.pucp.edu.pe"], domains: ["pucp.edu.pe"] },
  // Eastern Europe & Central Asia
  { name: "University of Warsaw", country: "Poland", "state-province": "Masovian", alpha_two_code: "PL", web_pages: ["https://www.uw.edu.pl"], domains: ["uw.edu.pl"] },
  { name: "Jagiellonian University", country: "Poland", "state-province": "Lesser Poland", alpha_two_code: "PL", web_pages: ["https://www.uj.edu.pl"], domains: ["uj.edu.pl"] },
  { name: "Charles University Prague", country: "Czech Republic", "state-province": "Prague", alpha_two_code: "CZ", web_pages: ["https://www.cuni.cz"], domains: ["cuni.cz"] },
  { name: "Eotvos Lorand University", country: "Hungary", "state-province": "Budapest", alpha_two_code: "HU", web_pages: ["https://www.elte.hu"], domains: ["elte.hu"] },
  { name: "University of Bucharest", country: "Romania", "state-province": "Bucharest", alpha_two_code: "RO", web_pages: ["https://www.unibuc.ro"], domains: ["unibuc.ro"] },
  { name: "Kyiv Polytechnic Institute", country: "Ukraine", "state-province": "Kyiv", alpha_two_code: "UA", web_pages: ["https://www.kpi.ua"], domains: ["kpi.ua"] },
  // Southern Europe & Portugal
  { name: "University of Lisbon", country: "Portugal", "state-province": "Lisbon", alpha_two_code: "PT", web_pages: ["https://www.ulisboa.pt"], domains: ["ulisboa.pt"] },
  { name: "University of Porto", country: "Portugal", "state-province": "Porto", alpha_two_code: "PT", web_pages: ["https://www.up.pt"], domains: ["up.pt"] },
  { name: "National and Kapodistrian University of Athens", country: "Greece", "state-province": "Attica", alpha_two_code: "GR", web_pages: ["https://www.uoa.gr"], domains: ["uoa.gr"] },
  // East Asia
  { name: "National Taiwan University", country: "Taiwan", "state-province": null, alpha_two_code: "TW", web_pages: ["https://www.ntu.edu.tw"], domains: ["ntu.edu.tw"] },
  { name: "University of Hong Kong", country: "Hong Kong", "state-province": null, alpha_two_code: "HK", web_pages: ["https://www.hku.hk"], domains: ["hku.hk"] },
  { name: "Hong Kong University of Science and Technology", country: "Hong Kong", "state-province": null, alpha_two_code: "HK", web_pages: ["https://www.ust.hk"], domains: ["ust.hk"] },
  // New Zealand & Pakistan
  { name: "University of Auckland", country: "New Zealand", "state-province": "Auckland", alpha_two_code: "NZ", web_pages: ["https://www.auckland.ac.nz"], domains: ["auckland.ac.nz"] },
  { name: "University of Otago", country: "New Zealand", "state-province": "Otago", alpha_two_code: "NZ", web_pages: ["https://www.otago.ac.nz"], domains: ["otago.ac.nz"] },
  { name: "Lahore University of Management Sciences", country: "Pakistan", "state-province": "Punjab", alpha_two_code: "PK", web_pages: ["https://www.lums.edu.pk"], domains: ["lums.edu.pk"] },
];

async function fetchUniversitiesDataset(): Promise<SourceUniversity[]> {
  try {
    const response = await fetch("https://universities.hipolabs.com/search");
    if (!response.ok) {
      throw new Error(`Dataset request failed with status ${response.status}`);
    }
    const data = (await response.json()) as unknown;
    if (!Array.isArray(data)) {
      throw new Error("Dataset payload is not an array");
    }
    return data.filter((item): item is SourceUniversity => {
      return Boolean(
        item &&
          typeof item === "object" &&
          typeof (item as SourceUniversity).name === "string" &&
          typeof (item as SourceUniversity).country === "string"
      );
    });
  } catch (err) {
    console.warn("Could not fetch universities from API, using fallback data:", err);
    return FALLBACK_UNIVERSITIES;
  }
}

async function main() {
  console.log("Fetching universities dataset...");
  const universities = await fetchUniversitiesDataset();
  console.log(`Fetched ${universities.length} raw rows`);

  const countriesMap = new Map<string, { code: string; name: string }>();
  const universityRows: Array<{
    name: string;
    countryCode: string;
    city: string | null;
    website: string | null;
    domains: string[] | null;
  }> = [];
  const deduplicationSet = new Set<string>();

  for (const item of universities) {
    const countryName = normalizeText(item.country);
    const countryCode = resolveCountryCode(countryName, item.alpha_two_code);
    countriesMap.set(countryCode, {
      code: countryCode,
      name: countryName
    });

    const city = item["state-province"] ? normalizeText(item["state-province"]) : null;
    const website = item.web_pages?.[0] ?? null;
    const domains = Array.isArray(item.domains) && item.domains.length
      ? item.domains
      : null;

    const dedupeKey = [
      normalizeText(item.name).toLowerCase(),
      countryCode,
      (city ?? "").toLowerCase(),
      (website ?? "").toLowerCase()
    ].join("|");

    if (deduplicationSet.has(dedupeKey)) {
      continue;
    }
    deduplicationSet.add(dedupeKey);

    universityRows.push({
      name: normalizeText(item.name),
      countryCode,
      city,
      website,
      domains
    });
  }

  console.log(`Prepared ${countriesMap.size} countries and ${universityRows.length} universities`);

  console.log("Cleaning old data...");
  await prisma.$transaction([
    prisma.program.deleteMany(),
    prisma.faculty.deleteMany(),
    prisma.universityReviewCache.deleteMany(),
    prisma.countryPlaceCache.deleteMany(),
    prisma.university.deleteMany(),
    prisma.country.deleteMany()
  ]);

  console.log("Inserting countries...");
  await prisma.country.createMany({
    data: Array.from(countriesMap.values()),
    skipDuplicates: true
  });

  console.log("Fetching Wikipedia images (this takes ~30s)...");
  const wikiImages = await fetchWikipediaImages(
    universityRows.map((u) => u.name)
  );
  console.log(`Got ${wikiImages.size} images from Wikipedia`);

  console.log("Inserting universities...");
  for (const chunk of chunkArray(universityRows, 1000)) {
    await prisma.university.createMany({
      data: chunk.map((u) => ({
        ...u,
        imageUrl: wikiImages.get(u.name) ?? null
      })),
      skipDuplicates: true
    });
  }

  // Update imageUrls for universities that already existed in the DB
  if (wikiImages.size > 0) {
    console.log(`Updating imageUrls for ${wikiImages.size} universities with new Wikipedia images…`);
    for (const [name, imgUrl] of wikiImages) {
      await prisma.university.updateMany({
        where: { name },
        data: { imageUrl: imgUrl }
      });
    }
  }

  const dbUniversities = await prisma.university.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true
    }
  });

  const withImages = dbUniversities.filter((u) => u.imageUrl).length;
  console.log(`Universities with Wikipedia images: ${withImages}/${dbUniversities.length}`);

  console.log("Generating faculties...");
  const facultyRows: Array<{ universityId: number; name: string }> = [];
  const facultyProgramMap = new Map<string, string[]>();

  for (const university of dbUniversities) {
    const selectedFaculties = selectFaculties(university.name);
    for (const faculty of selectedFaculties) {
      facultyRows.push({
        universityId: university.id,
        name: faculty.name
      });
      facultyProgramMap.set(
        `${university.id}:${faculty.name}`,
        faculty.programs.slice(0, 2)
      );
    }
  }

  for (const chunk of chunkArray(facultyRows, 1000)) {
    await prisma.faculty.createMany({
      data: chunk,
      skipDuplicates: true
    });
  }

  const dbFaculties = await prisma.faculty.findMany({
    select: {
      id: true,
      universityId: true,
      name: true
    }
  });

  console.log("Generating programs...");
  const programRows: Array<{ facultyId: number; name: string; slug: string }> = [];
  for (const faculty of dbFaculties) {
    const programs =
      facultyProgramMap.get(`${faculty.universityId}:${faculty.name}`) ?? [];
    for (const programName of programs) {
      programRows.push({
        facultyId: faculty.id,
        name: programName,
        slug: slugify(programName, {
          lower: true,
          strict: true,
          trim: true
        })
      });
    }
  }

  for (const chunk of chunkArray(programRows, 1500)) {
    await prisma.program.createMany({
      data: chunk,
      skipDuplicates: true
    });
  }

  // ── Seed tourist places ──────────────────────────────────────
  console.log("Fetching place images from Wikipedia...");
  const allWikiTitles = Object.values(COUNTRY_PLACES)
    .flat()
    .map((p) => p.wikiTitle);
  const placeImageMap = await fetchPlaceImages(allWikiTitles);
  console.log(`Got ${placeImageMap.size} place images`);

  console.log("Seeding country places...");
  const uniqueCountryCodes = new Set(
    dbUniversities
      .map((u) => {
        const row = universityRows.find((r) => r.name === u.name);
        return row?.countryCode ?? null;
      })
      .filter(Boolean) as string[]
  );

  for (const countryCode of Array.from(uniqueCountryCodes)) {
    const places = COUNTRY_PLACES[countryCode];
    if (!places || places.length === 0) continue;

    const payload = places.map((p, idx) => ({
      name: p.name,
      rating: p.rating,
      address: p.address,
      placeId: `seed-${countryCode}-${idx}`,
      imageUrl: placeImageMap.get(p.wikiTitle) ?? null
    }));

    await prisma.countryPlaceCache.upsert({
      where: { countryCode },
      create: { countryCode, payload, fetchedAt: new Date() },
      update: { payload, fetchedAt: new Date() }
    });
  }
  console.log(`Seeded places for ${uniqueCountryCodes.size} countries`);

  // ── Seed student reviews ─────────────────────────────────────
  console.log("Seeding student reviews...");
  const reviewCache: Array<{
    universityId: number;
    payload: object;
    fetchedAt: Date;
  }> = [];

  for (const uni of dbUniversities) {
    const reviews = generateReviews(uni.name, uni.id);
    reviewCache.push({
      universityId: uni.id,
      payload: reviews,
      fetchedAt: new Date()
    });
  }

  for (const chunk of chunkArray(reviewCache, 100)) {
    await prisma.universityReviewCache.createMany({
      data: chunk,
      skipDuplicates: true
    });
  }
  console.log(`Seeded reviews for ${reviewCache.length} universities`);

  console.log(
    `Seed finished: countries=${countriesMap.size}, universities=${dbUniversities.length}, faculties=${dbFaculties.length}, programs=${programRows.length}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
