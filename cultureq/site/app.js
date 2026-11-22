'use strict';

/* =====================================================================
   1. CONSTANTS AND DATA
   ===================================================================== */

/* Four categories, named for what a person gets from them: money and programs to apply to, art and culture to attend, career events, and social gatherings. */
const CATEGORIES = { program: 'Funding', cultural: 'Arts & Culture', corporate: 'Career', social: 'Social' };
const VIEWS = ['home', 'our', 'my', 'submit', 'insights'];   // 'insights' is private: it opens only from #insights?key=…, with no link on the site
const PAGE_SIZE = 9;

/* Old links (#social, #saved …) keep working. */
const ROUTE_ALIASES = { discover: 'our', saved: 'my', social: 'our', corporate: 'our', cultural: 'our', program: 'our' };

/*
  Opportunity schema
    category    social | corporate | cultural | program
    kind        opportunity kind (Fellowship, Conference …)
    setting     in-person | online | hybrid
    price       0 = free, number = paid, null = unknown
    approximate true = show only the city, never the street address
    identities  groups an opportunity is designed for (filter only; never shown on the home page)
    audience    who may attend or apply (age or education level)
    dates[]     { role, label, start, end?, allDay? }
                role: opens | deadline | event | start | session
                all-day dates are 'YYYY-MM-DD'; timed dates are ISO UTC strings
*/
const date = (role, label, start, end, allDay) => ({ role, label, start, end: end || null, allDay: !!allDay });
const link = (label, url) => ({ label, url });
/* Last day of the current month, for rolling monthly deadlines. */
const monthEnd = () => { const d = new Date(); return new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0)).toISOString().slice(0, 10); };
/* A listing's `source` says where it was checked and the last day it was actually confirmed. Past listings keep the day they were last confirmed. */
const checked = (kind, day) => kind + ', checked ' + day;
const TONIGHT = 'Nov 22, 2026';   // update this only for listings confirmed on the organizer's page that day
const NEWS = checked('News report', 'Nov 11, 2026');
const ORGANIZER14 = checked('Organizer page', 'Nov 14, 2026');
const ORGANIZER15 = checked('Organizer page', 'Nov 15, 2026');
const ORGANIZER20 = checked('Organizer page', 'Nov 20, 2026');
const ORGANIZER12 = checked('Organizer page', 'Nov 12, 2026');
const ORGANIZER = checked('Organizer page', 'Nov 11, 2026');
const LISTING_NOW = checked('Event opportunity', 'Nov 11, 2026');
const UNCF15 = checked('UNCF scholarship page', 'Nov 15, 2026');
const LISTED = checked('Third-party site', 'Nov 10, 2026');
const CHECKED = checked('Official site', 'Nov 10, 2026');

const ITEMS = [
  /* ----- Opportunities verified against official pages or event listings (Nov 11, 2026) ----- */
  {
    id: 1, source: checked('Organizer page', TONIGHT), category: 'cultural', kind: 'Art fair', industry: 'Arts', topic: 'Visual arts',
    title: 'Art Basel Miami Beach 2026', organizer: 'Art Basel',
    description: 'The Miami Beach edition of the international modern and contemporary art fair, with galleries from around the world. Public days are Friday, Dec 4 through Sunday, Dec 6. VIP days are Wednesday, Dec 2 (from 4pm) and Thursday, Dec 3. Tickets are sold on the official page.',
    setting: 'in-person', price: null, city: 'Miami Beach, FL', address: 'Miami Beach Convention Center, 1901 Convention Center Dr, Miami Beach, FL 33139',
    lat: 25.795, lon: -80.134, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('event', 'Public days', '2026-12-04', '2026-12-06', true)],
    links: [link('Official page', 'https://www.artbasel.com/miami-beach'), link('At the show', 'https://www.artbasel.com/miami-beach/at-the-show'), link('Tickets', 'https://www.artbasel.com/miami-beach/buy-tickets')]
  },
  {
    id: 2, source: checked('Organizer page', TONIGHT), category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: '17th Annual Kwanzaa Market Festival', organizer: 'Pan African Cultural Community',
    description: 'A family celebration of culture, community, and cooperative economics with local vendors, performances, African drumming, food, and children’s activities.',
    setting: 'in-person', price: 0, city: 'San Antonio, TX', address: 'Second Baptist Community Center, 3310 E Commerce St, San Antonio, TX 78220',
    lat: 29.424, lon: -98.451, tz: 'America/Chicago', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Festival', '2026-12-05T18:00:00Z', '2026-12-05T23:00:00Z')],
    links: [link('Register', 'https://PACCKwanzaaMarketFest2026.eventbrite.com'), link('Event listing', 'https://www.tpr.org/community-calendar/event/17th-kwanzaa-market-festival-2026-celebrate-culture-and-community-09-09-2026-16-49-06')]
  },
  {
    id: 3, source: checked('Organizer page', TONIGHT), category: 'cultural', kind: 'Performance', industry: 'Arts', topic: 'Dance',
    title: 'Alvin Ailey American Dance Theater: Holiday Season', organizer: 'Alvin Ailey American Dance Theater',
    description: 'The company’s holiday season at New York City Center, running from December into early January.',
    setting: 'in-person', price: null, city: 'New York, NY', address: 'New York City Center, 131 W 55th St, New York, NY 10019',
    lat: 40.765, lon: -73.979, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Season', '2026-12-02', '2027-01-03', true)],
    links: [link('Official page', 'https://ailey.org'), link('Tickets', 'https://www.nycitycenter.org')]
  },
  {
    id: 4, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Study abroad',
    title: 'Gilman International Scholarship', organizer: 'Gilman Scholarship Program',
    description: 'Funding for U.S. undergraduates to study or intern abroad. The 2027 application opens in mid-January and covers programs from May 2027 through April 2028.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/Los_Angeles', identities: ['Low-income'], audience: ['College'],
    dates: [date('deadline', 'Applications close (11:59 pm PT)', '2027-02-25', null, true)],
    links: [link('Apply', 'https://www.gilmanscholarship.org')]
  },
  {
    id: 5, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Fellowship', industry: 'Nonprofit', topic: 'Equity',
    title: 'Atlantic Fellows for Social and Economic Equity 2027/28', organizer: 'London School of Economics, International Inequalities Institute',
    description: 'A fully funded fellowship for mid-career leaders (7+ years of experience) working on inequality. Residential in London or non-residential from home.',
    setting: 'hybrid', price: 0, city: 'London, UK', address: 'London School of Economics, London, UK', approximate: true,
    lat: 51.514, lon: -0.117, tz: 'Europe/London', identities: [], audience: ['Mid-career'],
    dates: [date('deadline', 'Applications close', '2027-01-11', null, true)],
    links: [link('Apply', 'https://afsee.atlanticfellows.lse.ac.uk')]
  },
  {
    id: 6, source: checked('Organizer page', TONIGHT), category: 'corporate', kind: 'Conference', industry: 'Engineering', topic: 'Careers',
    title: 'SHPE National Convention 2027', organizer: 'Society of Hispanic Professional Engineers',
    description: 'The annual national convention for Hispanic engineers and STEM professionals.',
    setting: 'in-person', price: null, city: 'Houston, TX', address: 'Houston, TX', approximate: true,
    lat: 29.76, lon: -95.37, tz: 'America/Chicago', identities: ['Hispanic / Latino'], audience: [],
    dates: [date('event', 'Convention', '2027-10-06', '2027-10-09', true)],
    links: [link('Official page', 'https://shpe.org')]
  },
  {
    id: 7, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Fellowship', industry: 'Business', topic: 'Careers',
    title: 'MLT Career Prep', organizer: 'Management Leadership for Tomorrow',
    description: 'A 20-month coaching and recruiting program for college sophomores headed into business or technology careers. Open to U.S. citizens and permanent residents.',
    setting: 'online', price: null, city: 'Online', address: '', tz: 'America/New_York', identities: ['Students of color'], audience: ['College'],
    dates: [date('deadline', 'General deadline', '2026-12-01', null, true), date('deadline', 'Final deadline', '2027-01-15', null, true)],
    links: [link('Apply', 'https://mlt.org/career-prep/apply-to-career-prep')]
  },
  {
    id: 8, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Summer program', industry: 'Government', topic: 'International affairs',
    title: 'Rangel Summer Enrichment Program', organizer: 'Charles B. Rangel International Affairs Program, Howard University',
    description: 'A six-week summer program at Howard University for undergraduates (sophomores and up, 3.2+ GPA, U.S. citizens) interested in international affairs. Covers tuition, travel, and housing, plus a $3,300 stipend. The 2027 deadline isn’t posted.',
    setting: 'in-person', price: 0, city: 'Washington, DC', address: 'Howard University, Washington, DC', approximate: true,
    lat: 38.923, lon: -77.019, tz: 'America/New_York', identities: ['Underrepresented students'], audience: ['College'],
    dates: [], links: [link('Apply', 'https://apply.rangelprogram.org')]
  },
  {
    id: 9, source: NEWS, category: 'cultural', kind: 'Festival', industry: 'Arts', topic: 'Music',
    title: 'Flytime Fest Lagos 2026', organizer: 'Flytime Fest',
    description: 'A three-day music festival at the Eko Convention Centre. Headliners to be announced.',
    setting: 'in-person', price: null, city: 'Lagos, Nigeria', address: 'Eko Convention Centre, Victoria Island, Lagos',
    lat: 6.428, lon: 3.422, tz: 'Africa/Lagos', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Festival', '2026-12-22', '2026-12-24', true)],
    links: [link('Tickets', 'https://cene.xyz')]
  },
  {
    id: 10, source: NEWS, category: 'cultural', kind: 'Festival', industry: 'Arts', topic: 'Music',
    title: 'Detty December Fest Lagos', organizer: 'Detty December Fest',
    description: 'A 13-day festival at the Detty December Village, opening December 18 with a Wizkid headline set.',
    setting: 'in-person', price: null, city: 'Lagos, Nigeria', address: 'Detty December Village, Lagos', approximate: true,
    lat: 6.45, lon: 3.42, tz: 'Africa/Lagos', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Festival', '2026-12-18', '2026-12-30', true)],
    links: [link('Event guide', 'https://www.riotimesonline.com/detty-december-2026-lagos-accra-guide/')]
  },
  {
    id: 11, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Fellowship', industry: 'Law', topic: 'Careers',
    title: 'SEO Law Fellowship', organizer: 'Sponsors for Educational Opportunity',
    description: 'A law school prep institute, a summer internship at a law firm partner, and first-year support. The 2027 application dates aren’t published yet (the 2026 deadline was March 1).',
    setting: 'hybrid', price: null, city: 'New York, NY', address: 'New York, NY', approximate: true,
    lat: 40.71, lon: -74, tz: 'America/New_York', identities: ['Students of color'], audience: ['College', 'Early career'],
    dates: [], links: [link('Apply', 'https://www.seo-usa.org/law/our-program/apply-to-fellowship')]
  },
  /* ----- Earlier research (dates added only when confirmed) ----- */
  {
    id: 14, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Point Foundation Scholarships', organizer: 'Point Foundation',
    description: 'Scholarships and mentoring for LGBTQ+ students and allies at accredited not-for-profit U.S. institutions. Most awards are closed for now and the page posts no deadlines; the Career & Technical Education Award is the one open at last check.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['LGBTQ+'], audience: ['College', 'Graduate school'],
    dates: [], links: [link('Apply', 'https://pointfoundation.org/scholarships')]
  },
  {
    id: 15, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'HSF Scholar Program', organizer: 'Hispanic Scholarship Fund',
    description: 'Need-based scholarships of $500 to $5,000 for students of Hispanic heritage who are U.S. citizens, permanent residents, or DACA recipients and enroll full-time in a four-year or graduate program. The 2026 application closed Feb 15, 2026, and the 2027 cycle is not posted yet.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['Hispanic / Latino'], audience: ['High school', 'College', 'Graduate school'],
    dates: [], links: [link('Apply', 'https://www.hsf.net/scholarship')]
  },
  {
    id: 16, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Engineering', topic: 'STEM',
    title: 'SWE Scholarships', organizer: 'Society of Women Engineers',
    description: 'One application covers many scholarships for women pursuing engineering, engineering technology, or computer science. The collegiate and graduate application runs Dec 1, 2026 to Feb 1, 2027, and the emerging first-year application runs Feb 8 to Mar 31, 2027.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['Women'], audience: ['High school', 'College', 'Graduate school'],
    dates: [date('opens', 'Collegiate and graduate applications open', '2026-12-01', null, true), date('deadline', 'Collegiate and graduate applications close', '2027-02-01', null, true), date('deadline', 'Emerging first-year applications close', '2027-03-31', null, true)], links: [link('Apply', 'https://swe.org/scholarships')]
  },
  {
    id: 17, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'LEAGUE Foundation Scholarship', organizer: 'LEAGUE Foundation',
    description: 'A scholarship for graduating U.S. high school students who identify as LGBTQ+ or as supporters and are moving directly into higher education. The application opens each January and closes in April.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['LGBTQ+'], audience: ['High school'],
    dates: [], links: [link('Apply', 'https://www.leaguefoundation.org/')]
  },
  {
    id: 18, source: checked('Organizer page', TONIGHT), category: 'corporate', kind: 'Conference', industry: 'Law', topic: 'Careers',
    title: 'Lavender Law Annual Conference & Career Fair 2027', organizer: 'National LGBTQ+ Bar Association',
    description: 'The annual conference and career fair for the LGBTQ+ legal community.',
    setting: 'in-person', price: null, city: 'Philadelphia, PA', address: 'Marriott Philadelphia Downtown, Philadelphia, PA',
    lat: 39.95, lon: -75.16, tz: 'America/New_York', identities: ['LGBTQ+'], audience: [],
    dates: [date('event', 'Conference', '2027-07-19', '2027-07-21', true)], links: [link('Official page', 'https://lgbtqbar.org')]
  },
  {
    id: 19, source: checked('Organizer page', TONIGHT), category: 'corporate', kind: 'Conference', industry: 'Business', topic: 'Leadership',
    title: 'Women’s Leadership Conference 2027', organizer: 'Bellevue Chamber of Commerce',
    description: 'An afternoon of learning and networking for women professionals in the Bellevue region.',
    setting: 'in-person', price: null, city: 'Bellevue, WA', address: 'Bellevue, WA', approximate: true,
    lat: 47.61, lon: -122.2, tz: 'America/Los_Angeles', identities: ['Women'], audience: [],
    dates: [date('event', 'Conference', '2027-02-23T20:00:00Z', '2027-02-24T01:00:00Z')],
    links: [link('Official page', 'https://www.bellevuechamber.org/events/2027-womens-leadership-conference')]
  },

  {
    id: 29, source: ORGANIZER14, category: 'cultural', kind: 'Film festival', industry: 'Film', topic: 'Film',
    title: 'Black Harvest Film Festival (32nd Annual)', organizer: 'Gene Siskel Film Center, School of the Art Institute of Chicago',
    description: 'Chicago’s annual festival of films by and about people of the African diaspora, screened at the Gene Siskel Film Center.',
    setting: 'in-person', price: null, city: 'Chicago, IL', address: 'Gene Siskel Film Center, 164 N State St, Chicago, IL 60601',
    lat: 41.885, lon: -87.628, tz: 'America/Chicago', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Festival', '2026-11-06', '2026-11-15', true)],
    links: [link('Official page', 'https://web.saic.edu/blackharvestfest/')]
  },
  /* ----- Added Nov 11, 2026, each checked against the organizer's own page where reachable ----- */
  {
    id: 30, source: ORGANIZER15, category: 'program', kind: 'Grant', industry: 'Arts', topic: 'Visual arts',
    title: 'Hopper Prize Artist Grants', organizer: 'The Hopper Prize',
    description: 'Two grants of $4,500 and four of $1,000 from a $13,000 pool, for visual artists 18 and older in any medium. $40 application fee.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Los_Angeles', identities: [], audience: [],
    dates: [date('deadline', 'Applications close (11:59 PM PT)', '2026-11-17', null, true)],
    links: [link('Apply', 'https://hopperprize.org')]
  },
  {
    id: 31, source: ORGANIZER20, category: 'program', kind: 'Open call', industry: 'Arts', topic: 'Visual arts',
    title: 'The 9th John Ruskin Prize: Not for Present Delight', organizer: 'The John Ruskin Prize and Trinity Buoy Wharf',
    description: 'Prizes totalling £10,000, shared across five winners, for artists, designers, and makers worldwide, in any 2D or 3D medium. Selected work is shown in an exhibition at Trinity Buoy Wharf, London.',
    setting: 'hybrid', price: null, city: 'London, UK', address: 'Trinity Buoy Wharf, London, UK', approximate: true,
    lat: 51.508, lon: 0.008, tz: 'Europe/London', identities: [], audience: [],
    dates: [date('deadline', 'Entries close (5 PM)', '2026-11-17', null, true)],
    links: [link('Enter', 'https://www.ruskinprize.co.uk/')]
  },
  {
    id: 33, source: ORGANIZER12, category: 'program', kind: 'Grant', industry: 'Arts', topic: 'Culture',
    title: 'Manhattan Arts Grants: Creative Learning', organizer: 'Lower Manhattan Cultural Council',
    description: 'Funding for artists and nonprofits to run arts learning projects for older adults in Manhattan in 2027. Applications close at 6 PM ET.',
    setting: 'in-person', price: null, city: 'New York, NY', address: 'Manhattan, New York, NY', approximate: true,
    lat: 40.758, lon: -73.985, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('deadline', 'Applications close', '2026-11-12', null, true)],
    links: [link('Apply', 'https://lmcc.net/resources/manhattan-arts-grants/creative-learning/')]
  },
  {
    id: 34, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Residency', industry: 'Arts', topic: 'Visual arts',
    title: 'Bernheim Forest 2027 Artist-in-Residence', organizer: 'Bernheim Arboretum and Research Forest',
    description: 'A residency of 6 to 8 weeks recommended (it can be split into two stays of at least 3 weeks) for visual and mixed-media artists. One residency is reserved for an artist in Kentucky or nearby southern Indiana counties, and one for an artist whose work addresses environmental issues. Set at Bernheim Forest in Clermont, KY.',
    setting: 'in-person', price: null, city: 'Clermont, KY', address: 'Bernheim Forest, Clermont, KY', approximate: true,
    lat: 37.915, lon: -85.652, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('deadline', 'Applications close', '2026-11-30', null, true)],
    links: [link('Apply', 'https://bernheim.org/arts-in-nature/artist-in-residence/')]
  },
  {
    id: 35, source: ORGANIZER, category: 'program', kind: 'Residency', industry: 'Arts', topic: 'Visual arts',
    title: 'Jan van Eyck Academie: 2028 Residency', organizer: 'Jan van Eyck Academie',
    description: 'An 11-month residency in Maastricht for artists, curators, designers, writers, architects, and artistic researchers. Applications close at 11:59 PM CET.',
    setting: 'in-person', price: null, city: 'Maastricht, Netherlands', address: 'Academieplein 1, Maastricht, Netherlands', approximate: true,
    lat: 50.848, lon: 5.69, tz: 'Europe/Amsterdam', identities: [], audience: [],
    dates: [date('deadline', 'Applications close', '2026-12-01', null, true), date('event', 'Residency', '2028-01-15', '2028-12-15', true)],
    links: [link('Apply', 'https://www.janvaneyck.nl/residency/apply')]
  },
  {
    id: 36, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Open call', industry: 'Arts', topic: 'Visual arts',
    title: 'Smack Mellon Emerging Artists Open Call: Summer 2027 Group Exhibition', organizer: 'Smack Mellon',
    description: 'For emerging artists living and working in the greater New York City area who are not enrolled in a degree program. A small stipend may be offered. Applications close at midnight.',
    setting: 'in-person', price: null, city: 'Brooklyn, NY', address: 'Dumbo, Brooklyn, NY', approximate: true,
    lat: 40.703, lon: -73.989, tz: 'America/New_York', identities: [], audience: ['Early career'],
    dates: [date('deadline', 'Applications close', '2026-12-01', null, true)],
    links: [link('Apply', 'https://smackmellon.submittable.com/')]
  },
  {
    id: 40, source: checked('Organizer event page', TONIGHT), category: 'social', kind: 'Party', industry: 'Arts', topic: 'Music',
    title: 'AfroBasel Day Party: Miami Art Week', organizer: 'VibeHauss',
    description: 'A day party during Miami Art Week, 3 to 9 PM at Blackbird Ordinary. The event page shows no price; check it for ticket tiers.',
    setting: 'in-person', price: null, city: 'Miami, FL', address: 'Blackbird Ordinary, 729 SW 1st Ave, Miami, FL 33130',
    lat: 25.768, lon: -80.198, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Day party', '2026-12-05T20:00:00Z', '2026-12-06T02:00:00Z')],
    links: [link('Tickets', 'https://www.eventbrite.com/e/afrobasel-day-party-miami-art-week-2026-tickets-2002903966681')]
  },
  {
    id: 41, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Fellowship', industry: 'Nonprofit', topic: 'Environment',
    title: 'Hazel M. Johnson Fellowship', organizer: 'Black Girl Environmentalist',
    description: 'A 10-week paid fellowship with a partner organization, for early-career women and gender-expansive people interested in the environment and climate. The page still describes the 2026 cycle; it says the next cycle opens in December 2026 with a Feb 14, 2027 deadline. The stipend is $5,000 plus at least $18 an hour, for 32 to 40 hours a week. For rising juniors and seniors, graduates up to two years out, and first-year graduate students.',
    setting: 'hybrid', price: 0, city: 'United States', address: 'Placements across the United States',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Women'], audience: ['College', 'Early career'],
    dates: [date('deadline', 'Applications close', '2027-02-14', null, true)],
    links: [link('Apply', 'https://blackgirlenvironmentalist.org/hazel-m-johnson')]
  },
  {
    id: 42, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Jackie Robinson Foundation Scholarship', organizer: 'Jackie Robinson Foundation',
    description: 'A merit-based scholarship for graduating U.S. high school seniors with financial need, with year-round mentoring, career support, and internship placement. Applications close at 5 PM ET and need a letter of recommendation and the CSS Profile. Applicants must be U.S. citizens.',
    setting: 'online', price: 0, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Low-income'], audience: ['High school'],
    dates: [date('deadline', 'Applications close', '2027-01-14', null, true)],
    links: [link('Apply', 'https://jackierobinson.org/APPLY/')]
  },
  {
    id: 43, source: UNCF15, category: 'program', kind: 'Scholarship', industry: 'Media', topic: 'Scholarships',
    title: 'National Geographic Content Scholarship', organizer: 'UNCF',
    description: '$5,000 plus a virtual immersion program and a National Geographic executive mentor, for juniors and seniors at one of ten listed schools (including Howard, Georgetown, and American) who are interested in storytelling and media careers.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['HBCU & PBI students'], audience: ['College'],
    dates: [date('deadline', 'Applications close', '2026-11-16', null, true)],
    links: [link('Apply', 'https://opportunities.uncf.org/s/program-landing-page?id=a2iVJ00000juKWnYAM')]
  },
  {
    id: 44, source: UNCF15, category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'TJX Scholarship Program', organizer: 'UNCF',
    description: 'A one-time, need-based $10,000 award for full-time undergraduates of any class year at accredited U.S. HBCUs, pursuing an associate or bachelor’s degree.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['HBCU & PBI students'], audience: ['College'],
    dates: [date('deadline', 'Applications close', '2026-11-16', null, true)],
    links: [link('Apply', 'https://opportunities.uncf.org/s/program-landing-page?id=a2iVJ00000jzxMDYAY')]
  },
  {
    id: 45, source: UNCF15, category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'UNCF Women in STEM Scholarship', organizer: 'UNCF',
    description: 'Up to $5,000, need-based, for women pursuing STEM or financial services degrees. Priority goes to applicants at an HBCU or the University of Miami.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Women'], audience: ['College'],
    dates: [date('deadline', 'Applications close', '2026-11-17', null, true)],
    links: [link('Apply', 'https://opportunities.uncf.org/s/program-landing-page?id=a2iiM0000015pSjQAI')]
  },
  {
    id: 46, source: UNCF15, category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'EA Madden Scholarship Program', organizer: 'UNCF',
    description: 'Up to $12,000 plus professional development, for students at Spelman, Morehouse, Clark Atlanta, Howard, NC A&T, Florida A&M, Prairie View, or Southern University A&M.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['HBCU & PBI students'], audience: ['College'],
    dates: [date('deadline', 'Applications close', '2026-11-20', null, true)],
    links: [link('Apply', 'https://opportunities.uncf.org/s/program-landing-page?id=a2iiM000000bzHSQAY')]
  },
  {
    id: 47, source: checked('UNCF scholarship page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Edna Blum Scholarship for NYC Residents', organizer: 'UNCF',
    description: 'Up to $5,000, need-based, for undergraduate and graduate students who live in New York City.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Low-income'], audience: ['College', 'Graduate school'],
    dates: [date('deadline', 'Applications close', '2026-11-23', null, true)],
    links: [link('Apply', 'https://opportunities.uncf.org/s/program-landing-page?id=a2iVJ00000j6a6wYAA'), link('UNCF scholarship list', 'https://uncf.org/the-latest/scholarships-for-november-at-uncf')]
  },
  {
    id: 48, source: checked('UNCF scholarship page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Pierre and Tana Matisse Scholarship', organizer: 'UNCF',
    description: 'Up to $7,500, renewable and need-based, for full-time undergraduate and graduate students who live in, or are permanent residents of, one of New York City’s five boroughs and attend an accredited two- or four-year college.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Low-income'], audience: ['College', 'Graduate school'],
    dates: [date('deadline', 'Applications close', '2026-11-27', null, true)],
    links: [link('Apply', 'https://opportunities.uncf.org/s/program-landing-page?id=a2iVJ00000hLF4vYAG'), link('UNCF scholarship list', 'https://uncf.org/the-latest/scholarships-for-november-at-uncf')]
  },
  {
    id: 49, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Residency', industry: 'Arts', topic: 'Culture',
    title: 'MacDowell Fellowship: Fall/Winter 2027–28', organizer: 'MacDowell',
    description: 'About 300 fellowships a year for architects, filmmakers, interdisciplinary artists, writers, composers, theatre makers, and visual artists. No residency fees, and need-based stipends and travel grants are available. Based in Peterborough, NH.',
    setting: 'in-person', price: 0, city: 'Peterborough, NH', address: 'Peterborough, NH', approximate: true,
    lat: 42.878, lon: -71.95, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('deadline', 'Applications close', '2027-02-10', null, true), date('event', 'Residency', '2027-09-01', '2028-02-29', true)],
    links: [link('Apply', 'https://www.macdowell.org/apply/apply-for-fellowship')]
  },
  {
    id: 50, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Residency', industry: 'Arts', topic: 'Culture',
    title: 'Ucross General Residency: Fall 2027', organizer: 'Ucross Foundation',
    description: 'A residency for visual artists, writers, composers, choreographers, interdisciplinary and performance artists, and collaborative teams, from August to early December 2027. For working professionals, emerging or established; students are not accepted. $40 application fee, no waivers. Applications close at 11:59 PM MT.',
    setting: 'in-person', price: 40, city: 'Ucross, WY', address: 'Ucross, WY', approximate: true,
    lat: 44.58, lon: -106.8, tz: 'America/Denver', identities: [], audience: [],
    dates: [date('deadline', 'Applications close', '2027-01-15', null, true)],
    links: [link('Apply', 'https://ucrossfoundation.submittable.com/submit')]
  },
  {
    id: 51, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'PTK Scholarship Application', organizer: 'Phi Theta Kappa',
    description: 'One application, due Dec 1, 2026, that is reviewed for 15 PTK scholarship programs, including the All-USA Academic Team, Coca-Cola Academic Team and several transfer scholarships.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('deadline', 'Applications close', '2026-12-01', null, true)],
    links: [link('Apply', 'https://www.ptk.org/scholarships/apply-now/')]
  },
  /* ----- Added Nov 12, 2026, each confirmed on the organizer's own page ----- */
  {
    id: 52, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Competition', industry: 'Arts', topic: 'Photography',
    title: 'Wildlife Photographer of the Year', organizer: 'Natural History Museum, London',
    description: 'An international photography competition for photographers 18 and over, with a free Young category for ages 17 and under. Entry is £35 for up to 25 photos across 19 categories, and free for entrants aged 18 to 26. Photos must be taken on or after 1 November 2021 and be free of AI-generated elements. Winners are shown in an exhibition in London.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'Europe/London', identities: [], audience: [],
    dates: [date('deadline', 'Entries close (11:30 GMT)', '2026-12-03', null, true)],
    links: [link('Enter', 'https://www.nhm.ac.uk/wildlife-photographer-of-the-year/competition.html')]
  },
  {
    id: 53, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Jack Kent Cooke Foundation Undergraduate Transfer Scholarship', organizer: 'Jack Kent Cooke Foundation',
    description: 'Up to $55,000 a year for two to three years for top community college students who plan to complete a bachelor’s degree at an accredited four-year U.S. institution. Last-dollar funding that applies after all other aid. Apply through the Common App transfer portal.',
    setting: 'online', price: 0, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Low-income'], audience: ['College'],
    dates: [date('deadline', 'Applications close', '2026-12-09', null, true)],
    links: [link('Apply', 'https://www.jkcf.org/our-scholarships/undergraduate-transfer-scholarship/')]
  },
  {
    id: 54, source: checked('Organizer page', TONIGHT), category: 'cultural', kind: 'Design fair', industry: 'Arts', topic: 'Design',
    title: 'Design Miami 2026', organizer: 'Design Miami',
    description: 'The collectible design fair during Miami Art Week, at the Miami Beach Convention Center. Public hours are 1 to 7 PM on Dec 2, 11 AM to 7 PM Dec 3 to 5, and 11 AM to 6 PM on Dec 6. Previews on Dec 1 and the morning of Dec 2 are by invitation.',
    setting: 'in-person', price: null, city: 'Miami Beach, FL', address: 'Miami Beach Convention Center, Convention Center Dr and 19th St, Miami Beach, FL', approximate: true,
    lat: 25.795, lon: -80.134, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('event', 'Public days', '2026-12-02', '2026-12-06', true)],
    links: [link('Official page', 'https://designmiami.com/fair/miami-2026')]
  },
  /* ----- Added Nov 13, 2026, each confirmed on the organizer's own page ----- */
  {
    id: 55, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Open call', industry: 'Arts', topic: 'Design',
    title: '2027 Beam Camp Project Open Call', organizer: 'Beam Center',
    description: 'A call for project proposals to be built at Beam Camp in July 2027. Open to creative people of any age from anywhere in the world, including artists, engineers, architects, builders, filmmakers, musicians, and designers. Selected proposers receive a $5,000 award and an approximate $15,000 fabrication budget, with reasonable travel to camp reimbursed.',
    setting: 'hybrid', price: null, city: 'Strafford, NH', address: 'Beam Camp, Strafford, NH', approximate: true,
    lat: 43.26, lon: -71.16, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('deadline', 'Applications close (11:59 PM ET)', '2026-11-30', null, true)],
    links: [link('Apply', 'https://www.beamcenter.org/events/2027-beam-camp-project-call-3bpb9')]
  },
  {
    id: 56, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Fellowship', industry: 'Arts', topic: 'Photography',
    title: 'Vital Impacts Environmental Photography Fellowships and Mentorships', organizer: 'Vital Impacts',
    description: 'One $20,000 fellowship, six $5,000 fellowships and ten mentorships for local photographers and visual storytellers who live in the community or country they document. Fellows get twelve months to develop their projects, with support to publish and show the work. Publication experience is not required. $25 entry fee, waived for economic hardship and for applicants from developing countries.',
    setting: 'online', price: 25, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('deadline', 'Applications close', '2026-11-30', null, true)],
    links: [link('Apply', 'https://vitalimpacts.org/pages/the-vital-impacts-environmental-photography-grant')]
  },
  {
    id: 57, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Dell Scholars Scholarship', organizer: 'Dell Scholars',
    description: 'A $20,000 flexible scholarship that covers tuition and housing. For Texas high school seniors who take part in an approved college readiness program in grades 11 and 12, are Pell Grant eligible, have at least a 2.4 GPA, and plan to enroll at an accredited four-year public college or university in Texas.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Chicago', identities: ['Low-income'], audience: ['High school'],
    dates: [date('deadline', 'Applications close', '2027-01-12', null, true)],
    links: [link('Apply', 'https://www.dellscholars.org/scholarship/')]
  },
  {
    id: 58, source: checked('Organizer page', TONIGHT), category: 'cultural', kind: 'Art fair', industry: 'Arts', topic: 'Visual arts',
    title: 'Prizm Art Fair 2026', organizer: 'Prizm',
    description: 'The 14th year of the Miami Art Week fair, at the Park Central Hotel on Ocean Drive. A VIP reception opens on Dec 1, and panels run Dec 3 and 4.',
    setting: 'in-person', price: null, city: 'Miami Beach, FL', address: 'Park Central Hotel, 640 Ocean Drive, Miami Beach, FL',
    lat: 25.776, lon: -80.13, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Fair', '2026-12-02', '2026-12-06', true)],
    links: [link('Official page', 'https://www.prizm.art/')]
  },
  {
    id: 60, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Fellowship', industry: 'Film', topic: 'Film',
    title: 'Sundance Graton Fellowship 2027', organizer: 'Sundance Institute',
    description: 'Two fellows each receive a $25,000 grant and a year of mentorship, plus creative services and a trip to the Sundance Film Festival. For artists from California tribes, federally recognized or not. No application fee. The application page on apply.sundance.org gives the deadline as Dec 1, 2026 at 3:30 PM PT. The artist deadlines page on sundance.org still lists Nov 16, 2026 as of Nov 20, so apply as early as you can.',
    setting: 'online', price: 0, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Los_Angeles', identities: ['Native American & Indigenous'], audience: [],
    dates: [date('deadline', 'Applications close (3:30 PM PT)', '2026-12-01', null, true)],
    links: [link('Apply', 'https://apply.sundance.org/prog/2027_graton_fellowship/')]
  },
  {
    id: 61, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Grant', industry: 'Film', topic: 'Screenwriting',
    title: 'Sundance Episodic Alfred P. Sloan Grant 2027', organizer: 'Sundance Institute',
    description: 'The submission window ran July 13 to Aug 25, 2026 (6 PM PT) and has closed. A grant from the Alfred P. Sloan Foundation and creative craft support for a writer or two-person team with an original half-hour or one-hour series about a historical figure, event, or an area of science, medicine, energy, mechanics, technology, mathematics or invention. $50 nonrefundable processing fee.',
    setting: 'online', price: 50, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Los_Angeles', identities: [], audience: [],
    dates: [date('deadline', 'Submissions closed (6 PM PT)', '2026-08-25', null, true)],
    links: [link('Apply', 'https://filmfreeway.com/SundanceEpisodicLab2027')]
  },
  {
    id: 62, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Fellowship', industry: 'Film', topic: 'Film',
    title: 'Sundance Ignite x Adobe Fellowship 2027', organizer: 'Sundance Institute',
    description: 'A year-long fellowship with development support, mentorship, and community, including a $5,000 artist grant, a weeklong lab at MASS MoCA, and a trip to the 2028 Sundance Film Festival. For emerging filmmakers ages 18 to 25 as of Feb 11, 2027 who submit a short film of 1 to 15 minutes. No fee is listed.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Los_Angeles', identities: [], audience: ['Early career'],
    dates: [date('deadline', 'Applications close', '2027-02-11', null, true)],
    links: [link('Apply', 'https://collab.sundance.org/catalog/2027-Sundance-Institute-Ignite-Adobe-Fellowship')]
  },
  {
    id: 63, source: checked('Organizer page', TONIGHT), category: 'cultural', kind: 'Festival', industry: 'Arts', topic: 'Books',
    title: 'Miami Book Fair 2026', organizer: 'Miami Book Fair, Miami Dade College',
    description: 'Eight days of author talks, with the free Street Fair on Nov 20–22. Author presentations are at Miami Dade College’s Wolfson Campus. The Street Fair is free to walk into; some author events are ticketed, so check the official page.',
    setting: 'in-person', price: null, city: 'Miami, FL', address: 'Miami Dade College Wolfson Campus, 300 NE 2nd Ave, Miami, FL 33132',
    lat: 25.7743, lon: -80.1937, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('event', 'Book fair', '2026-11-15', '2026-11-22', true)],
    links: [link('Official page', 'https://miamibookfair.com/')]
  },
  {
    id: 64, source: checked('Organizer page', TONIGHT), category: 'corporate', kind: 'Conference', industry: 'Engineering', topic: 'Careers',
    title: 'NSBE Annual Convention 2027', organizer: 'National Society of Black Engineers',
    description: 'The annual convention for engineering students and professionals, at the Thomas M. Menino Convention & Exhibition Center in Boston. The official page says registration opens in October; check it for rates.',
    setting: 'in-person', price: null, city: 'Boston, MA', address: 'Thomas M. Menino Convention & Exhibition Center, 415 Summer St, Boston, MA 02210',
    lat: 42.3467, lon: -71.0446, tz: 'America/New_York', identities: ['African diaspora'], audience: ['College', 'Early career'],
    dates: [date('event', 'Convention', '2027-03-31', '2027-04-04', true)],
    links: [link('Official page', 'https://convention.nsbe.org/')]
  },
  {
    id: 65, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'cultural', kind: 'Film festival', industry: 'Film', topic: 'Film',
    title: 'Pan African Film Festival 2027', organizer: 'Pan African Film & Arts Festival',
    description: 'Seven days of films from Africa and the diaspora at Culver Theatres in Culver City and Cinemark theaters in Los Angeles. Passes and ticket packages are in pre-sale through Nov 26.',
    setting: 'in-person', price: null, city: 'Los Angeles, CA', address: 'Culver Theatres, Culver City, and Cinemark Theaters, Los Angeles, CA',
    lat: 34.0195, lon: -118.3965, tz: 'America/Los_Angeles', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Festival', '2027-02-15', '2027-02-21', true)],
    links: [link('Official page', 'https://paff.org/')]
  },
  {
    id: 66, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'cultural', kind: 'Film festival', industry: 'Film', topic: 'Film',
    title: 'Sundance Film Festival 2027', organizer: 'Sundance Institute',
    description: 'The first edition in Boulder, Colorado, with venues within about two miles, including Macky Auditorium and Boulder Theater. World premieres run Jan 21–26 and online at-home screenings run Jan 28–31. Single tickets go on sale in early January.',
    setting: 'in-person', price: null, city: 'Boulder, CO', address: 'Boulder, CO',
    lat: 40.015, lon: -105.2705, tz: 'America/Denver', identities: [], audience: [],
    dates: [date('event', 'Festival', '2027-01-21', '2027-01-31', true)],
    links: [link('Official page', 'https://www.sundance.org/blogs/what-to-know-about-the-2027-sundance-film-festival/')]
  },
  {
    id: 67, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'corporate', kind: 'Workshop', industry: 'Business', topic: 'Careers',
    title: 'INROADS Internship Info Sessions', organizer: 'INROADS',
    description: 'Virtual sessions for college students on the INROADS paid internship program for business, STEM, and liberal arts majors. Applicants need a 3.0 GPA, a resume, and unofficial transcripts. Internships are competitive and not guaranteed.',
    setting: 'online', price: 0, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Students of color'], audience: ['College'],
    dates: [date('event', 'Info session', '2026-11-16', null, true), date('event', 'Info session', '2026-11-23', null, true), date('event', 'Info session', '2026-11-30', null, true), date('event', 'Info session', '2026-12-07', null, true), date('event', 'Info session', '2026-12-14', null, true)],
    links: [link('Learn more', 'https://inroads.org/internships/eligibility/'), link('Apply', 'https://ext1.inroads.org/IOL_Application/App/Eligibility')]
  },
  {
    id: 68, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'corporate', kind: 'Conference', industry: 'Technology', topic: 'Careers',
    title: 'Africa Tech Summit Nairobi 2027', organizer: 'Africa Tech Summit',
    description: 'The ninth Nairobi edition of the summit for African tech founders, investors, and teams. Pre-register on the official page for the lowest-rate tickets when they go on sale. The venue and prices are not posted yet.',
    setting: 'in-person', price: null, city: 'Nairobi, Kenya', address: 'Nairobi, Kenya', approximate: true,
    lat: -1.2921, lon: 36.8219, tz: 'Africa/Nairobi', identities: ['African diaspora'], audience: ['Early career', 'Mid-career'],
    dates: [date('event', 'Summit', '2027-02-10', '2027-02-11', true)],
    links: [link('Pre-register', 'https://www.africatechsummit.com/nairobi/pre-register/')]
  },
  {
    id: 69, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'corporate', kind: 'Networking', industry: 'Nonprofit', topic: 'Careers',
    title: 'Impactpool Virtual Career Fair for African Nationals', organizer: 'Impactpool',
    description: 'A free online career fair on Dec 3, 9:00 a.m. to 2:15 p.m. CET, for African nationals with 4+ years of international work experience, a postgraduate degree (a bachelor’s may count with more experience) and English, French, Arabic, or Spanish. Update your Impactpool profile and upload a CV in English. Approval-based and capacity is limited.',
    setting: 'online', price: 0, city: 'Online', address: '',
    lat: null, lon: null, tz: 'Europe/Paris', identities: ['African diaspora'], audience: ['Mid-career'],
    dates: [date('event', 'Career fair', '2026-12-03', null, true)],
    links: [link('Apply to attend', 'https://impactpool.org/vcf/events/JnOZK')]
  },
  {
    id: 70, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'social', kind: 'Festival', industry: 'Arts', topic: 'Carnival',
    title: 'Notting Hill Carnival 2027: Monday', organizer: 'Notting Hill Carnival',
    description: 'Monday’s Adult’s Parade starts at 10:30 and sound systems and the Powis Square Stage run from 12:00 to 19:00, with a moment of reflection at 3pm. Grandstand tickets are sold on the official page; watching from the street is free.',
    setting: 'in-person', price: null, city: 'London, UK', address: 'Notting Hill, London W11, UK',
    lat: 51.5155, lon: -0.2054, tz: 'Europe/London', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Carnival Monday', '2027-08-30', null, true)],
    links: [link('Official page', 'https://nhcarnival.org/monday')]
  },
  {
    id: 71, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'cultural', kind: 'Film festival', industry: 'Film', topic: 'Film',
    title: 'Berlinale 2027', organizer: 'Berlin International Film Festival',
    description: 'The 77th Berlin International Film Festival starts a day earlier this year. The awards ceremony is Feb 19 and the first Audience Days are Feb 20–21. The European Film Market runs Feb 9–16. Venues and ticket sale dates are not posted yet.',
    setting: 'in-person', price: null, city: 'Berlin, Germany', address: 'Berlin, Germany', approximate: true,
    lat: 52.52, lon: 13.405, tz: 'Europe/Berlin', identities: [], audience: [],
    dates: [date('event', 'Festival', '2027-02-10', '2027-02-21', true)],
    links: [link('Official page', 'https://www.berlinale.de/en/2027/news-press-releases/278428.html')]
  },
  {
    id: 72, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'cultural', kind: 'Film festival', industry: 'Film', topic: 'Film',
    title: 'FESPACO 2027 (30th Edition)', organizer: 'FESPACO',
    description: 'The Pan-African Film and Television Festival of Ouagadougou. Film fans can buy an Etalon Card for cinema access (CFA 25,000, about 39 euros) at the festival. Industry and media accreditation closes Nov 30 at 23:59 on the festival’s online platform.',
    setting: 'in-person', price: null, city: 'Ouagadougou, Burkina Faso', address: 'Ouagadougou, Burkina Faso', approximate: true,
    lat: 12.3714, lon: -1.5197, tz: 'Africa/Ouagadougou', identities: ['African diaspora'], audience: [],
    dates: [date('deadline', 'Accreditation closes', '2026-11-30', null, true), date('event', 'Festival', '2027-03-20', '2027-03-27', true)],
    links: [link('Official page', 'https://fespaco.bf/en/regulation-accreditations-fespaco-2027/')]
  },
  {
    id: 73, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'cultural', kind: 'Film festival', industry: 'Film', topic: 'Film',
    title: 'International Film Festival Rotterdam 2027', organizer: 'IFFR',
    description: 'Eleven days of films and expanded cinema. Ticket sale dates are not posted yet; check the official calendar.',
    setting: 'in-person', price: null, city: 'Rotterdam, Netherlands', address: 'Rotterdam, Netherlands', approximate: true,
    lat: 51.9244, lon: 4.4777, tz: 'Europe/Amsterdam', identities: [], audience: [],
    dates: [date('event', 'Festival', '2027-01-28', '2027-02-07', true)],
    links: [link('Official calendar', 'https://iffr.com/en/calendar')]
  },
  {
    id: 74, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'cultural', kind: 'Festival', industry: 'Media', topic: 'Film and music',
    title: 'SXSW 2027', organizer: 'SXSW',
    description: 'Conferences and festivals across Austin, Mar 15–21, 2027. Badges are on sale on the official page, which says badge prices will increase.',
    setting: 'in-person', price: null, city: 'Austin, TX', address: 'Downtown Austin, TX', approximate: true,
    lat: 30.2672, lon: -97.7431, tz: 'America/Chicago', identities: [], audience: [],
    dates: [date('event', 'Festival', '2027-03-15', '2027-03-21', true)],
    links: [link('Official page', 'https://sxsw.com/?p=204')]
  },
  {
    id: 75, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'corporate', kind: 'Conference', industry: 'Education', topic: 'Careers',
    title: 'SXSW EDU 2027', organizer: 'SXSW EDU',
    description: 'The education conference that opens SXSW week in downtown Austin, Mar 13–16. The official announcement lists no prices.',
    setting: 'in-person', price: null, city: 'Austin, TX', address: 'Downtown Austin, TX', approximate: true,
    lat: 30.2672, lon: -97.7431, tz: 'America/Chicago', identities: [], audience: ['Early career', 'Mid-career'],
    dates: [date('event', 'Conference', '2027-03-13', '2027-03-16', true)],
    links: [link('Official page', 'https://sxswedu.com/news/2026/sxsw-edu-2027-dates-announced/')]
  },
  {
    id: 76, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'cultural', kind: 'Competition', industry: 'Arts', topic: 'Art and writing',
    title: 'Scholastic Art & Writing Awards 2027', organizer: 'Alliance for Young Artists & Writers',
    description: 'A national program for young artists and writers. Entries opened Oct 1. The first regional deadline is Dec 1, and some regions run as late as Jan 4, 2027, so find your region on the official page. Regional results come Jan 27, and National Awards Week is June 8–11, 2027, in New York City.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: [], audience: ['High school'],
    dates: [date('deadline', 'First regional deadline', '2026-12-01', null, true), date('event', 'National Awards Week', '2027-06-08', '2027-06-11', true)],
    links: [link('Enter', 'https://www.artandwriting.org/awards/how-to-enter/calendar')]
  },
  {
    id: 77, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Jack Kent Cooke Young Scholars Program', organizer: 'Jack Kent Cooke Foundation',
    description: 'A selective five-year pre-college scholarship for students in 7th grade or entering 8th grade in fall 2027. It funds academic and extracurricular opportunities, such as music and art lessons and supplemental classes, and includes an educational adviser, annual summer programs, and a peer network. The application opens Feb 4 and closes Apr 28, 2027.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Low-income'], audience: ['Middle school'],
    dates: [date('deadline', 'Applications close', '2027-04-28', null, true)],
    links: [link('Learn more', 'https://www.jkcf.org/?p=733')]
  },
  {
    id: 78, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'School placement',
    title: 'A Better Chance: Placement at Top Schools', organizer: 'A Better Chance',
    description: 'Applications for students in grades 4–9 to be placed at member schools. The ideal candidate has a B+ average or higher, is at or above grade level in math and English, and shows leadership potential. Families apply in a portal with report cards and proof of income. The next cycle opens in early February 2027 for the 2028–2029 school year. The page lists Early Decision on March 3 and Regular Decision on April 15 but gives no year, so confirm both on the official page. The page also lists a family income limit of under $350,000 a year and requires U.S. citizenship or permanent residency. No fee is listed.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Students of color'], audience: ['Middle school'],
    dates: [date('deadline', 'Regular Decision, 11:59 PM ET', '2027-04-15', null, true)],
    links: [link('Apply', 'https://abetterchance.org/program/apply/')]
  },
  {
    id: 79, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'School placement',
    title: 'Prep for Prep', organizer: 'Prep for Prep',
    description: 'A pathway into New York City independent schools for students in 5th, 6th, or 7th grade with scores above the 85th percentile on state English and math tests, an 85% average, and significant financial need. Applicants must be U.S. citizens or permanent residents. Finalists complete an interview and an IQ exam, and decisions come in May and June.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Low-income'], audience: ['Middle school'],
    dates: [date('deadline', 'Applications close', '2027-01-13', null, true)],
    links: [link('Apply', 'https://prepforprep.org/admissions/apply-now')]
  },
  {
    id: 80, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'School placement',
    title: 'Oliver Scholars', organizer: 'Oliver Scholars',
    description: 'For 7th graders in any New York City district with a 90% overall average, a 3 or 4 on the state 6th-grade tests, and leadership potential. A teacher or other nominator starts the process. The application then needs parent and student forms, financial documents, report cards, proof of citizenship, and three teacher recommendations. The page gives the application deadline only as “February”, and the entrance exam is in March.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Students of color'], audience: ['Middle school'],
    dates: [date('deadline', 'Nominations close', '2027-01-11', null, true)],
    links: [link('Nominate', 'https://oliverscholars.org/admissions/')]
  },
  {
    id: 81, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Ron Brown Scholar Program', organizer: 'CAP Charitable Foundation',
    description: 'A $40,000 scholarship, paid as $10,000 a year and renewable, for African American high school seniors who are U.S. citizens or permanent residents. It looks for academic strength, leadership, community service, and financial need. Applications open after September 1, and recommendations are due December 15. The page gives the December 1 deadline without a year; this is for the 2027 competition.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['African diaspora'], audience: ['High school'],
    dates: [date('deadline', 'Final deadline', '2026-12-01', null, true)],
    links: [link('Apply', 'https://ronbrown.org/apply/faq/')]
  },
  {
    id: 82, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Posse Foundation Full-Tuition Scholarship', organizer: 'The Posse Foundation',
    description: 'Full-tuition scholarships to Posse partner colleges for high school seniors nominated by their school or a community organization. Students are chosen for leadership and academic potential, and the scholarship is open to all backgrounds. Nominators register with Posse in one of its recruitment cities, and deadlines vary by city and program, so contact your local Posse office early in the year. Separate nomination paths exist for arts, STEM, and veterans.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: [], audience: ['High school'],
    dates: [],
    links: [link('Nomination process', 'https://www.possefoundation.org/recruiting-students/the-nomination-process')]
  },
  {
    id: 83, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'Kwanzaa Celebration at the Saint Louis Art Museum', organizer: 'Saint Louis Art Museum',
    description: 'A free, full-day celebration for all ages with live performances, workshops, art making, lounge spaces, take-home materials, and a scavenger hunt through the galleries. A full schedule is still to come.',
    setting: 'in-person', price: 0, city: 'St. Louis, MO', address: 'Saint Louis Art Museum, One Fine Arts Drive, Forest Park, St. Louis, MO 63110',
    lat: 38.6393, lon: -90.2943, tz: 'America/Chicago', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Kwanzaa Celebration, 10 AM–3 PM', '2026-12-27T16:00:00Z', '2026-12-27T21:00:00Z')],
    links: [link('Event page', 'https://www.slam.org/event/kwanzaa-celebration-2026/')]
  },
  {
    id: 84, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'Celebrating Kwanzaa at Children’s Museum Houston', organizer: 'Children’s Museum Houston',
    description: 'A family day of Kwanzaa art and storytelling. Kids make a kinara candleholder and a Seven Principles hat, and join a Kwanzaa storytime and craft. Workshops are limited to 15 children per session, ages 5 and up. Museum admission applies, so check the ticket page for prices.',
    setting: 'in-person', price: null, city: 'Houston, TX', address: 'Children’s Museum Houston, 1500 Binz St, Houston, TX 77004',
    lat: 29.7217, lon: -95.3874, tz: 'America/Chicago', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Kwanzaa day, 9 AM–5 PM', '2026-12-28T15:00:00Z', '2026-12-28T23:00:00Z')],
    links: [link('Event page', 'https://www.cmhouston.org/events/celebrating-kwanzaa')]
  },
  {
    id: 85, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'Kwanzaa Celebration: “It’s All About the Children”', organizer: 'National Great Blacks in Wax Museum and The Men & Families Center',
    description: 'A Kwanzaa evening for families and children with drumming and cultural arts, wax figure displays, a Wax Museum presentation, raffles, gift bags, vendors, and community resource tables. Registration is required through Eventbrite, and the page lists no price. Use the security entrance.',
    setting: 'in-person', price: null, city: 'Baltimore, MD', address: 'Henderson-Hopkins Elementary, 2100 Ashland Ave, Baltimore, MD 21205',
    lat: 39.2995, lon: -76.5895, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Kwanzaa Celebration, 6 PM', '2026-12-26T23:00:00Z')],
    links: [link('Event page', 'https://www.greatblacksinwax.org/kwanzaa')]
  },
  {
    id: 86, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: '128th Annual Golden Dragon Parade', organizer: 'Chinese Chamber of Commerce of Los Angeles',
    description: 'The Lunar New Year parade through Los Angeles Chinatown, running from 1 to 4 PM. The page lists no admission price.',
    setting: 'in-person', price: null, city: 'Los Angeles, CA', address: 'Chinatown, Los Angeles, CA', approximate: true,
    lat: 34.0625, lon: -118.238, tz: 'America/Los_Angeles', identities: ['Asian American & Pacific Islander'], audience: [],
    dates: [date('event', 'Parade, 1–4 PM', '2027-02-13T21:00:00Z', '2027-02-14T00:00:00Z')],
    links: [link('Event page', 'https://www.lachinesechamber.org/events/2027/128th-annual-golden-dragon-parade')]
  },
  {
    id: 87, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'cultural', kind: 'Festival', industry: 'Music', topic: 'Music and heritage',
    title: 'New Orleans Jazz & Heritage Festival 2027', organizer: 'New Orleans Jazz & Heritage Festival',
    description: 'Two weekends of music, food, and crafts at the Fair Grounds Race Course. The musician list is still to be announced, and tickets are on sale now. The page lists no prices, so check the tickets page.',
    setting: 'in-person', price: null, city: 'New Orleans, LA', address: 'Fair Grounds Race Course, 1751 Gentilly Blvd, New Orleans, LA 70119',
    lat: 29.9855, lon: -90.078, tz: 'America/Chicago', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'First weekend', '2027-04-22', '2027-04-25', true), date('event', 'Second weekend', '2027-04-29', '2027-05-02', true)],
    links: [link('Festival site', 'https://www.nojazzfest.com/faq/')]
  },
  {
    id: 88, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'National Cherry Blossom Festival 2027', organizer: 'National Cherry Blossom Festival',
    description: 'Three weeks of events in Washington, DC. Highlights are the Opening Ceremony on March 20, Blossom Kite on March 27, Petalpalooza and fireworks on April 3, and the Parade on April 10. Many events are free and some charge admission. The organizer notes that dates may change.',
    setting: 'in-person', price: null, city: 'Washington, DC', address: 'Tidal Basin, West Potomac Park, Washington, DC', approximate: true,
    lat: 38.8853, lon: -77.0386, tz: 'America/New_York', identities: [], audience: [],
    dates: [date('event', 'Festival', '2027-03-20', '2027-04-11', true)],
    links: [link('Festival site', 'https://nationalcherryblossomfestival.org/faqs/')]
  },
  {
    id: 89, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'Fiesta San Antonio 2027', organizer: 'Fiesta San Antonio Commission',
    description: 'An 11-day celebration of parades, parties, cultural events, and community gatherings across San Antonio. Some events are free and others need tickets. The official calendar is subject to change.',
    setting: 'in-person', price: null, city: 'San Antonio, TX', address: 'Citywide, San Antonio, TX', approximate: true,
    lat: 29.4241, lon: -98.4936, tz: 'America/Chicago', identities: ['Hispanic / Latino'], audience: [],
    dates: [date('event', 'Fiesta', '2027-04-15', '2027-04-25', true)],
    links: [link('Official calendar', 'https://fiestasanantonio.org/schedule/')]
  },
  {
    id: 90, source: checked('Organizer page', TONIGHT), added: '2026-11-14', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'San Francisco Chinese New Year Parade 2027', organizer: 'Chinese New Year Festival and Parade',
    description: 'A 1.3-mile parade, about 2.5 hours long, from 2nd and Market Streets around Union Square to Kearny Street and Columbus Avenue. It is free to attend, but tickets are required for the bleacher seats.',
    setting: 'in-person', price: 0, city: 'San Francisco, CA', address: '2nd St and Market St, San Francisco, CA 94105', approximate: true,
    lat: 37.7875, lon: -122.402, tz: 'America/Los_Angeles', identities: ['Asian American & Pacific Islander'], audience: [],
    dates: [date('event', 'Parade, 5:15 PM', '2027-02-21T01:15:00Z', '2027-02-21T03:45:00Z')],
    links: [link('Parade info', 'https://chineseparade.com/faq/')]
  },
  /* ----- Added Nov 15, 2026, each confirmed on the organizer's own page ----- */
  {
    id: 91, source: checked('Organizer page', TONIGHT), added: '2026-11-15', category: 'program', kind: 'Fellowship', industry: 'Arts', topic: 'Visual arts',
    title: 'Kresge Artist Fellowships and Gilda Awards 2027', organizer: 'Kresge Arts in Detroit',
    description: 'Ten Kresge Artist Fellowships of $50,000 each, with no strings attached, and ten Gilda Awards of $5,000 each. This cycle covers literary arts and visual arts, for artists living in Wayne, Oakland, or Macomb county in Michigan. The online application opens Dec 1, 2026 and closes Jan 14, 2027 at 11:59 PM. The page lists no application fee.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Detroit', identities: [], audience: [],
    dates: [date('opens', 'Application opens', '2026-12-01', null, true), date('deadline', 'Applications close (11:59 PM)', '2027-01-14', null, true)],
    links: [link('Official page', 'https://kresgeartsindetroit.org/announcement/kaf27-app-cycle_begins/')]
  },
  {
    id: 92, source: checked('Organizer page', TONIGHT), added: '2026-11-15', category: 'program', kind: 'Fellowship', industry: 'Arts', topic: 'Culture',
    title: 'VCCA Alonzo Davis Fellowship', organizer: 'VCCA',
    description: 'A two-week residency fellowship with a $500 honorarium for American writers, visual artists, and composers of African or Latin American descent. Residencies run Sept 1 to Dec 31, 2027, in Virginia. The application fee is $30. If the fee is a significant barrier, start the application and email by Jan 10, 2027 to request a waiver.',
    setting: 'in-person', price: 30, city: 'Virginia', address: 'Virginia', approximate: true,
    lat: null, lon: null, tz: 'America/New_York', identities: ['African diaspora', 'Hispanic / Latino'], audience: [],
    dates: [date('deadline', 'Applications close', '2027-01-15', null, true), date('event', 'Residencies available', '2027-09-01', '2027-12-31', true)],
    links: [link('Apply', 'https://www.vcca.com/apply/fully-funded-fellowships/alonzo-davis-fellowship/')]
  },
  {
    id: 93, source: checked('Organizer page', TONIGHT), added: '2026-11-15', category: 'program', kind: 'Grant', industry: 'Writing', topic: 'Poetry and nonfiction',
    title: 'Money for Women: Poetry and Creative Nonfiction Awards (January 2027)', organizer: 'Barbara Deming Memorial Fund',
    description: 'Support grants of $500 to $3,000 for feminist women in the arts, including cis, transgender, and nonbinary women, with a primary residence in the U.S. or Canada. The January 2027 window is for poetry and creative nonfiction, for writers in the early or middle stages of their development with substantial work already underway. Applications are on Submittable. They open at 12:00 AM EST on Jan 1 and close at 11:59 PM EST on Jan 31, or sooner if 250 applications arrive in a genre. The fee is $25, and fee waivers are not offered. Former grantees wait three years to reapply.',
    setting: 'online', price: 25, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Women'], audience: ['Early career', 'Mid-career'],
    dates: [date('opens', 'Applications open (12:00 AM EST)', '2027-01-01', null, true), date('deadline', 'Applications close (11:59 PM EST)', '2027-01-31', null, true)],
    links: [link('Apply', 'https://www.demingfund.org/apply')]
  },
  {
    id: 94, source: checked('Organizer page', TONIGHT), added: '2026-11-15', category: 'program', kind: 'Grant', industry: 'Music', topic: 'Music',
    title: 'Salt Lick Incubator Artist Project Grant: Winter 2027', organizer: 'Salt Lick Incubator',
    description: 'Grants of $5,000 to $15,000 for emerging artists making music, for projects like recording a song or album, music videos, vinyl pressing, or touring. Applicants must be 18 or older, be a U.S. citizen or eligible to work in the U.S., own their master recordings, and have released no more than three full-length albums. Solo artists and small groups can apply. The project must have no label contract and no advance. Applications open Jan 2 and close Feb 15, 2027 at 11:59:59 PM PT.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Los_Angeles', identities: [], audience: [],
    dates: [date('opens', 'Applications open', '2027-01-02', null, true), date('deadline', 'Applications close (11:59 PM PT)', '2027-02-15', null, true)],
    links: [link('Apply', 'https://www.saltlickincubator.org/apply')]
  },
  {
    id: 96, source: checked('Organizer page', TONIGHT), added: '2026-11-15', category: 'program', kind: 'Competition', industry: 'Film', topic: 'Film',
    title: 'Sony Future Filmmaker Awards 2027', organizer: 'Sony Future Filmmaker Awards',
    description: 'A free-to-enter short film competition. The Student category is for filmmakers studying a film course at a registered institution at diploma or degree level. Shortlisted filmmakers are flown to Sony Pictures Studios in Culver City, California. The homepage lists no prizes, so check the official rules. Entries close at 7:00 AM CST.',
    setting: 'online', price: 0, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Chicago', identities: [], audience: [],
    dates: [date('deadline', 'Entries close (7:00 AM CST)', '2026-12-15', null, true)],
    links: [link('Enter', 'https://www.sonyfuturefilmmakerawards.com/')]
  },
  {
    id: 97, source: checked('Organizer page', TONIGHT), added: '2026-11-15', category: 'program', kind: 'Competition', industry: 'Writing', topic: 'Fiction',
    title: 'One Teen Story Contest 2027', organizer: 'One Story',
    description: 'A short story contest for writers aged 13 to 19 as of Dec 1, 2026. Stories run 2,000 to 4,500 words, and winners receive $500 on publication. There is no entry fee. Enter through the online submission manager and pick your age group (13–15, 16–17, or 18–19).',
    setting: 'online', price: 0, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: [], audience: ['Middle school', 'High school'],
    dates: [date('deadline', 'Contest closes', '2026-12-01', null, true)],
    links: [link('Enter', 'https://one-story.com/write/one-teen-story-contest/')]
  },
  {
    id: 98, source: checked('Organizer page', TONIGHT), added: '2026-11-15', category: 'program', kind: 'Summer program', industry: 'Arts', topic: 'Dance',
    title: 'Dance Theatre of Harlem Summer Intensive 2027', organizer: 'Dance Theatre of Harlem',
    description: 'Session 1 (July 6–16) is for ages 8 to 11 who are just starting ballet. Session 2 (July 19–August 6) is for ages 8 to 24 with at least two years of ballet training, and dancers can attend one, two, or three weeks. Audition by video or in person at a tour stop. The application fee is $40, and video submissions are due June 30, 2027. Audition tour stops run from Jan 16 to Mar 6, 2027, with Atlanta, Boston, Memphis, Winston-Salem, New York, the Bahamas, and a virtual date listed. Tuition is in a rates PDF, and the page gives no location. The company is based in New York City.',
    setting: 'in-person', price: null, city: 'New York, NY', address: 'New York, NY', approximate: true,
    lat: 40.8116, lon: -73.9465, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('deadline', 'Video submissions due', '2027-06-30', null, true), date('event', 'Session 1', '2027-07-06', '2027-07-16', true), date('event', 'Session 2', '2027-07-19', '2027-08-06', true)],
    links: [link('Register', 'https://www.dancetheatreofharlem.org/summerintensive')]
  },
  {
    id: 99, source: checked('Organizer page', TONIGHT), added: '2026-11-16', category: 'program', kind: 'Scholarship', industry: 'Government', topic: 'Public service',
    title: 'Truman Scholarship 2027', organizer: 'Harry S. Truman Scholarship Foundation',
    description: 'Up to $30,000 for graduate school, for college students planning careers in public service (government at any level, the uniformed services, or public interest organizations). Candidates must be U.S. citizens, U.S. nationals from American Samoa, or expecting citizenship by the date of the award, be in their next-to-last year of school (or final year for programs of three years or less), and secure a nomination from their college. Regional review panels run Mar 1 to Apr 15, 2027. Applications close at 11:59 PM in the applicant’s own time zone.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: [], audience: ['College'],
    dates: [date('deadline', 'Applications close (11:59 PM, your time zone)', '2027-02-02', null, true)],
    links: [link('Apply', 'https://www.truman.gov/apply')]
  },
  /* ----- Added Nov 17, 2026, each confirmed on the organizer's own page ----- */
  {
    id: 101, source: checked('Organizer page', TONIGHT), added: '2026-11-17', category: 'social', kind: 'Family event', industry: 'Community', topic: 'Holiday',
    title: 'Relaxed Sessions: A Festive Cracker', organizer: 'Southbank Centre',
    description: 'A festive session designed for children and families who would benefit from a sensory-adapted space and a smaller group, including families with SEND or other needs. It starts at 11 AM in the Clore Ballroom on Level 2 of the Royal Festival Hall and runs about 1 hour 30 minutes. Tickets are free but required, and become bookable eight days before the event. No age range is stated.',
    setting: 'in-person', price: 0, city: 'London, UK', address: 'Clore Ballroom, Royal Festival Hall, Belvedere Road, London SE1 8XX',
    lat: 51.5059, lon: -0.1166, tz: 'Europe/London', identities: ['People with disabilities'], audience: [],
    dates: [date('event', 'Relaxed session, 11 AM (about 1.5 hours)', '2026-12-05T11:00:00Z', '2026-12-05T12:30:00Z')],
    links: [link('Tickets', 'https://www.southbankcentre.co.uk/whats-on/relaxed-sessions-a-festive-cracker/')]
  },
  /* ----- Added Nov 18, 2026, each confirmed on the organizer's own page ----- */
  {
    id: 104, source: checked('Organizer page', TONIGHT), added: '2026-11-18', category: 'social', kind: 'Family event', industry: 'Community', topic: 'Holiday',
    title: 'Free Family Night: Celebrate Hanukkah With Us!', organizer: 'Children’s Museum Houston',
    description: 'A free evening of Hanukkah celebration for families of all ages, 5 to 8 PM. The page lists ticket reservation and event registration buttons.',
    setting: 'in-person', price: 0, city: 'Houston, TX', address: 'Children’s Museum Houston, 1500 Binz St, Houston, TX 77004',
    lat: 29.7217, lon: -95.3874, tz: 'America/Chicago', identities: ['Jewish'], audience: [],
    dates: [date('event', 'Family night, 5–8 PM', '2026-12-03T23:00:00Z', '2026-12-04T02:00:00Z')],
    links: [link('Event page', 'https://www.cmhouston.org/events/celebrate-hanukkah-with-us')]
  },
  /* ----- Added Nov 19, 2026, each confirmed on the organizer's own page ----- */
  {
    id: 111, source: checked('Organizer page', TONIGHT), added: '2026-11-19', category: 'cultural', kind: 'Open house', industry: 'Arts', topic: 'History',
    title: 'Martin Luther King Jr. Day Open House', organizer: 'Museum of Fine Arts, Boston',
    description: 'An open house on Monday, Jan 18, 2027, 10 AM to 5 PM. Admission is free with a valid Massachusetts zip code. Tickets are available in person on a first-come, first-served basis, and no advance registration is mentioned.',
    setting: 'in-person', price: null, city: 'Boston, MA', address: 'Museum of Fine Arts, Boston, 465 Huntington Ave, Boston, MA',
    lat: 42.3394, lon: -71.094, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Open house, 10 AM–5 PM', '2027-01-18T15:00:00Z', '2027-01-18T22:00:00Z')],
    links: [link('Event page', 'https://mfa.org/event/open-house/mlk-day')]
  },
  /* ----- Added Nov 20, 2026, each confirmed on the organizer's own page (merged onto live version 1795065266-a00f) ----- */
  {
    id: 112, source: checked('Organizer page', TONIGHT), added: '2026-11-20', category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'TheDream.US National Scholarship', organizer: 'TheDream.US',
    description: 'Up to $18,000 for an associate degree or $36,000 for a bachelor’s degree, plus up to $6,000 for books and supplies, at a partner college. For first-generation Dreamers who came to the U.S. before age 16 and before Nov. 1, 2021, with significant unmet financial need and a high school GPA of at least 2.5. The application round is open Nov 1, 2026 to Feb 28, 2027, with notifications in late April 2027.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Immigrants', 'Low-income', 'First-generation'], audience: ['High school', 'College'],
    dates: [date('opens', 'Application round opens', '2026-11-01', null, true), date('deadline', 'Applications close', '2027-02-28', null, true)],
    links: [link('Apply', 'https://www.thedream.us/scholarships/national-scholarship/')]
  },
  {
    id: 113, source: checked('Organizer page', TONIGHT), added: '2026-11-20', category: 'program', kind: 'Residency', industry: 'Arts', topic: 'Visual arts',
    title: 'Helene Wurlitzer Foundation Residency: 2028 Sessions', organizer: 'The Helene Wurlitzer Foundation of New Mexico',
    description: 'Residency grants of 10 to 12 weeks in Taos, New Mexico, for creative artists from all over the world: visual artists, literary artists, and music composers and songwriters. Session 2 is 10 weeks, and Sessions 1 and 3 are 12 weeks. The application fee is $30. Applications close at 11:59 PM MT; mailed work samples need a Jan 21 postmark. Selected residents pay a $300 deposit.',
    setting: 'in-person', price: 30, city: 'Taos, NM', address: 'Taos, NM', approximate: true,
    lat: 36.407, lon: -105.573, tz: 'America/Denver', identities: [], audience: [],
    dates: [date('deadline', 'Applications close (11:59 PM MT)', '2027-01-18', null, true)],
    links: [link('Apply', 'https://wurlitzerfoundation.org/apply')]
  },
  /* ----- Added Nov 22, 2026, each confirmed on the organizer's own page ----- */
  {
    id: 116, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'program', kind: 'Fellowship', industry: 'Arts', topic: 'Visual arts',
    title: 'Kala Art Institute Fellowship 2027–28', organizer: 'Kala Art Institute',
    description: 'A $3,000 cash award and one to nine months of 24/7 access to communal studio spaces, equipment, and resources at Kala in Berkeley, plus a place in the annual group exhibition of Fellowship artists. Open to international, national, and local artists producing innovative work in and across multiple media. Artists enrolled in a degree-granting program during the July 2027 to June 2028 program period are not eligible. Artists from outside the nine Bay Area counties receive one month of housing. There is no application fee through March 1, 2027, and a $25 fee from March 1 to April 1. Notifications come in June 2027.',
    setting: 'in-person', price: null, city: 'Berkeley, CA', address: 'Kala Art Institute, 1060 Heinz Avenue, Berkeley, CA 94710',
    lat: 37.8548, lon: -122.2887, tz: 'America/Los_Angeles', identities: [], audience: [],
    dates: [date('opens', 'Open call opens', '2027-01-01', null, true), date('deadline', 'Applications close', '2027-04-01', null, true)],
    links: [link('Apply', 'https://www.kala.org/residencies/fellowship-program/application-guidelines/'), link('Fellowship overview', 'https://www.kala.org/residencies/fellowship-program/')]
  },
  {
    id: 117, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'BURGER KING℠ Scholars: General Track 2027–28', organizer: 'Scholarship America',
    description: 'Scholarships of $1,000 or $5,000 to offset the cost of college or vocational school. Only the first 30,000 community applications are reviewed, so apply early. The General Track is for high school seniors graduating in 2027 who live in the U.S., Puerto Rico, Guam, or Canada, have a GPA of 2.0 or higher on a 4.0 scale, and plan to enroll full-time for the entire 2027–28 academic year. Past recipients who are current college undergraduates may also apply. Applications run Oct 15 to Dec 15, 2026, closing at 11:59 PM CT. A separate Employee-Based Track has its own requirements.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Chicago', identities: [], audience: ['High school'],
    dates: [date('opens', 'Applications open', '2026-10-15', null, true), date('deadline', 'Applications close (11:59 PM CT)', '2026-12-15', null, true)],
    links: [link('Apply', 'https://scholarshipamerica.org/scholarship/burgerking/')]
  },
  {
    id: 118, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'Kwanzaa Family Festival 2026', organizer: 'NJPAC',
    description: 'A free, full-day Kwanzaa celebration, held for more than 26 years, from 1 to 6 PM. It includes a candle-lighting ceremony, drumming and dance, Kwanzaa-themed arts and crafts, art projects led by NJPAC’s partners, and an Artisan Marketplace with dozens of vendors across two floors. The page lists an RSVP form. No age range is stated.',
    setting: 'in-person', price: 0, city: 'Newark, NJ', address: 'NJPAC, 1 Center Street, Newark, NJ 07102',
    lat: 40.7413, lon: -74.1713, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Festival, 1–6 PM', '2026-12-19T18:00:00Z', '2026-12-19T23:00:00Z')],
    links: [link('Event page', 'https://www.njpac.org/event/kwanzaa-festival')]
  },
  {
    id: 119, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'Kwanzaa Celebration at the Penn Museum', organizer: 'Penn Museum',
    description: 'A Free Community Day, 11 AM to 4 PM, tagged for kids and families. The page says advance registration is encouraged.',
    setting: 'in-person', price: 0, city: 'Philadelphia, PA', address: 'Penn Museum, 3260 South Street, Philadelphia, PA 19104',
    lat: 39.9496, lon: -75.1909, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Free Community Day, 11 AM–4 PM', '2026-12-27T16:00:00Z', '2026-12-27T21:00:00Z')],
    links: [link('Event page', 'https://penn.museum/calendar/1765/kwanzaa-celebration')]
  },
  {
    id: 121, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'cultural', kind: 'Open house', industry: 'Arts', topic: 'History',
    title: 'Martin Luther King Jr. Day at the Henry Ford', organizer: 'The Henry Ford',
    description: 'Admission and parking at Henry Ford Museum of American Innovation are free on the holiday, Monday, Jan 18, 2027, 9:30 AM to 5 PM. The page says 2027 programming will be announced later. It lists the exhibit With Liberty and Justice for All, a free audio tour through the THF Connect app, the Rosa Parks Bus, and a guided tour of the Dymaxion House.',
    setting: 'in-person', price: 0, city: 'Dearborn, MI', address: 'Henry Ford Museum of American Innovation, Dearborn, MI',
    lat: 42.3032, lon: -83.2338, tz: 'America/Detroit', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Free admission, 9:30 AM–5 PM', '2027-01-18T14:30:00Z', '2027-01-18T22:00:00Z')],
    links: [link('Event page', 'https://www.thehenryford.org/visit/things-to-do/calendar/detail/martin-luther-king-jr-day')]
  },
  {
    id: 122, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'corporate', kind: 'Conference', industry: 'Engineering', topic: 'STEM careers',
    title: 'BEYA STEM Conference 2027', organizer: 'Career Communications Group',
    description: 'The 2027 BEYA STEM Conference begins Feb 18 at the Baltimore Convention Center, with an online option through the BEYA digital platform. It serves pre-college and college students, corporate professionals, government and military representatives, and STEM employers. One-day passes and full registrations are sold on the official page, and the page does not post an end date or prices yet.',
    setting: 'hybrid', price: null, city: 'Baltimore, MD', address: 'Baltimore Convention Center, 1 W Pratt St, Baltimore, MD 21201',
    lat: 39.2859, lon: -76.6177, tz: 'America/New_York', identities: ['African diaspora'], audience: ['High school', 'College', 'Early career', 'Mid-career'],
    dates: [date('event', 'Conference begins', '2027-02-18', null, true)],
    links: [link('Official page', 'https://s4.goeshow.com/ccgroup/beyastem/2026/index.cfm')]
  },
  {
    id: 123, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'corporate', kind: 'Career fair', industry: 'Business', topic: 'Careers',
    title: 'Women’s History Month Career Fair', organizer: 'TalentAlly',
    description: 'A 100% online career fair on Mar 23, 2027, 12 to 4 PM ET. The page says it is open to all candidates across the nation and that candidates from diverse backgrounds are encouraged to attend. It lists no fee and no direct job-seeker sign-up link; it advises completing your profile and uploading an updated resume ahead of time.',
    setting: 'online', price: null, city: 'Online', address: '', tz: 'America/New_York', identities: ['Women'], audience: [],
    dates: [date('event', 'Online career fair, 12–4 PM ET', '2027-03-23T16:00:00Z', '2027-03-23T20:00:00Z')],
    links: [link('Event page', 'https://events.talentally.com/events/womens-history-month-2027/')]
  },
  {
    id: 124, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'corporate', kind: 'Career fair', industry: 'Business', topic: 'Inclusive hiring',
    title: 'Diversity & Inclusion Virtual Career Fair', organizer: 'CareerEco',
    description: 'A free online fair on Tuesday, Dec 1, 11 AM to 3 PM ET, connecting job seekers of any major or experience level with employers committed to inclusive hiring for full-time, internship, and co-op roles. Attendees also sign up, free, on CareerEco’s website.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: [], audience: [],
    dates: [date('event', 'Online career fair, 11 AM–3 PM ET', '2026-12-01T16:00:00Z', '2026-12-01T20:00:00Z')],
    links: [link('Event page', 'https://www.eventbrite.com/e/diversity-inclusion-virtual-career-fair-tickets-2003480018668')]
  },
  {
    id: 125, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'Three Kings Day Parade and Community Celebration', organizer: 'El Museo del Barrio',
    description: 'An annual parade and community celebration on Wednesday, Jan 6, 2027, 9 AM to 3 PM, with music, performances, art-making, and family activities. The procession goes through East Harlem with colorful floats, camels, and thousands of schoolchildren and community members. The page lists no price and has a registration link; performers and honored guests are still to be announced.',
    setting: 'in-person', price: null, city: 'New York, NY', address: 'El Museo del Barrio, 1230 Fifth Avenue, New York, NY 10029',
    lat: 40.7922, lon: -73.9519, tz: 'America/New_York', identities: ['Hispanic / Latino'], audience: [],
    dates: [date('event', 'Parade and celebration, 9 AM–3 PM', '2027-01-06T14:00:00Z', '2027-01-06T20:00:00Z')],
    links: [link('Event page', 'https://elmuseo.org/event/family-program-49th-annual-three-kings-day-parade-and-community-celebration/')]
  },
  /* ----- Added Nov 22, 2026 (second batch), each confirmed on the organizer's own page ----- */
  {
    id: 126, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'program', kind: 'Internship', industry: 'Government', topic: 'Public service',
    title: 'Congressional Internship Program: Summer 2027', organizer: 'Congressional Hispanic Caucus Institute',
    description: 'A summer internship in Washington, DC, with a $4,776 stipend, a $100 monthly Metro stipend, round-trip domestic transportation, medical insurance, and free furnished housing. For Latino college students and others who want to invest in the Latino community. Applicants must be enrolled full time in Spring 2027 (or graduate that spring) and be U.S. citizens, permanent residents, asylees, or otherwise authorized to work; F-1 and M-1 visa holders are not eligible. A 3.0 GPA is preferred. Applications close at 11:59 PM ET. The Fall 2027 deadline is Mar 1, 2027.',
    setting: 'in-person', price: null, city: 'Washington, DC', address: 'Washington, DC', approximate: true,
    lat: 38.9072, lon: -77.0369, tz: 'America/New_York', identities: ['Hispanic / Latino'], audience: ['College'],
    dates: [date('deadline', 'Summer applications close (11:59 PM ET)', '2026-12-01', null, true), date('event', 'Summer program', '2027-05-19', '2027-07-30', true)],
    links: [link('Apply', 'https://chci.org/programs/congressional-internship-program/')]
  },
  {
    id: 127, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'program', kind: 'Scholarship', industry: 'Community', topic: 'Scholarships',
    title: 'APIQWTC Scholarship 2027', organizer: 'Asian Pacific Islander Queer Women & Transgender Community',
    description: 'Two scholarships of $3,500 each for Asian/Pacific Islander lesbian, bisexual, and queer women, and transgender and non-binary people, who are high school seniors or entering a tuition-based, non-profit U.S. associate, bachelor’s, graduate, or certificate program in Summer or Fall 2027. Past recipients of the APIQWTC or Terri Higa Memorial Scholarship are not eligible. The application takes a cover letter, resume, four short answers, one or two recommendation letters, and an unofficial transcript. Applications and letters close at 11:59 PM PST. No fee is stated.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/Los_Angeles', identities: ['Asian American & Pacific Islander', 'LGBTQ+'], audience: ['High school', 'College', 'Graduate school'],
    dates: [date('deadline', 'Applications close (11:59 PM PST)', '2027-02-01', null, true)],
    links: [link('Apply', 'https://apiqwtc.org/call-for-applications-2027-apiqwtc-scholarship/')]
  },
  {
    id: 128, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'APIA Scholarship 2027–2028', organizer: 'APIA Scholars',
    description: 'Awards of $2,500 for one year, or up to $20,000 over several years, for undergraduates with high financial need pursuing an associate or bachelor’s degree at a U.S.-accredited institution. Open to U.S. citizens, nationals, and permanent residents, and to citizens or nationals of the Marshall Islands, Federated States of Micronesia, and Palau. People who already hold a bachelor’s degree are not eligible. Applications close at 11:59 PM ET. No fee is stated.',
    setting: 'online', price: null, city: 'Online', address: '',
    lat: null, lon: null, tz: 'America/New_York', identities: ['Asian American & Pacific Islander', 'Low-income'], audience: ['College'],
    dates: [date('deadline', 'Applications close (11:59 PM ET)', '2027-01-15', null, true)],
    links: [link('Apply', 'https://apiascholars.org/scholarship/')]
  },
  {
    id: 129, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'cultural', kind: 'Concert', industry: 'Music', topic: 'Mexican and Indigenous music',
    title: 'Lila Downs: Cambias Mi Mundo', organizer: 'Kupferberg Center for the Arts, Queens College',
    description: 'An evening of Mexican traditional music drawing on Lila Downs’s Oaxacan and Mixtec roots and Indigenous cultures, at 7 PM. Tickets start at $40 plus fees, with discounts for students, seniors, and groups, and are sold through Ticketmaster or the box office.',
    setting: 'in-person', price: 40, city: 'Flushing, NY', address: 'Colden Auditorium, 153-49 Reeves Ave, Flushing, NY 11367',
    lat: 40.7367, lon: -73.8184, tz: 'America/New_York', identities: ['Hispanic / Latino', 'Native American & Indigenous'], audience: [],
    dates: [date('event', 'Concert, 7 PM', '2027-04-18T23:00:00Z')],
    links: [link('Tickets', 'https://kupferbergcenter.org/?p=15467')]
  },
  {
    id: 130, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'social', kind: 'Party', industry: 'Community', topic: 'Culture',
    title: 'Queer Lunar New Year Celebration', organizer: 'San Francisco Gay Men’s Chorus and GAPA',
    description: 'A celebration honoring queer and transgender Asian and Pacific Islander communities, with music and cultural performances for the Year of the Goat, 7 to 10 PM. Tickets are required; the page shows no price. Ages 18 and up with photo ID. Light bites are included and there is a cash bar.',
    setting: 'in-person', price: null, city: 'San Francisco, CA', address: 'The Chan National Queer Arts Center, 170 Valencia Street, San Francisco, CA',
    lat: 37.7710, lon: -122.4222, tz: 'America/Los_Angeles', identities: ['Asian American & Pacific Islander', 'LGBTQ+'], audience: [],
    dates: [date('event', 'Celebration, 7–10 PM', '2027-02-20T03:00:00Z', '2027-02-20T06:00:00Z')],
    links: [link('Tickets', 'https://www.sfgmc.org/queer-lunar-new-year-2027')]
  },
  {
    id: 131, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'cultural', kind: 'Concert', industry: 'Music', topic: 'Haitian music',
    title: 'Sounds and Spirit of Haiti Featuring Tradisyon Lakou Lakay', organizer: 'Adrienne Arsht Center for the Performing Arts',
    description: 'A 3 PM, 60-minute program of traditional rhythms, folkloric dance, and storytelling that showcases the history, resilience, and creativity of the Haitian community. Pay what you can, starting at $0; guests who pay the listed minimum get priority seating. RSVP is required, with a limit of six tickets per household, first come, first served.',
    setting: 'in-person', price: 0, city: 'Miami, FL', address: 'Knight Concert Hall, 1300 Biscayne Blvd, Miami, FL 33132',
    lat: 25.7951, lon: -80.1887, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Concert, 3 PM (about 1 hour)', '2027-05-22T19:00:00Z', '2027-05-22T20:00:00Z')],
    links: [link('RSVP', 'https://www.arshtcenter.org/tickets/2026-2027/arsht-for-miami/sounds-and-spirit-of-haiti/')]
  },
  {
    id: 132, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'social', kind: 'Festival', industry: 'Community', topic: 'Culture',
    title: 'Heritage Fest 2027', organizer: 'Adrienne Arsht Center',
    description: 'A free festival honoring Pan-African culture, with Pan-African artists, live music and dance, food vendors, and workshops, starting at noon, plus an 18+ evening Juke Joint. RSVP is required. The page gives only the Arsht Center’s address and no end time.',
    setting: 'in-person', price: 0, city: 'Miami, FL', address: 'Adrienne Arsht Center, 1300 Biscayne Blvd, Miami, FL 33132', approximate: true,
    lat: 25.7951, lon: -80.1887, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Festival, from noon', '2027-02-20T17:00:00Z')],
    links: [link('RSVP', 'https://www.arshtcenter.org/arsht-impact/heritage-fest/')]
  },
  {
    id: 133, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'corporate', kind: 'Career fair', industry: 'Business', topic: 'Careers',
    title: 'HBCU Connect Spring Virtual Conference and Career Fair 2027', organizer: 'HBCU Connect',
    description: 'A free virtual career fair for students, alumni, and job seekers on the vFairs platform, 9 AM to 5 PM ET. Some sessions run on Zoom or Teams, and registered attendees get the links by email. The page states no formal eligibility requirement.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['HBCU & PBI students'], audience: ['College', 'Early career', 'Mid-career'],
    dates: [date('event', 'Virtual career fair, 9 AM–5 PM ET', '2027-03-31T13:00:00Z', '2027-03-31T21:00:00Z')],
    links: [link('Register', 'https://hbcuconnect.com/resumes/?cid=347')]
  },
  {
    id: 134, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'corporate', kind: 'Conference', industry: 'Science', topic: 'STEM careers',
    title: 'AISES 2027 National Conference', organizer: 'American Indian Science and Engineering Society',
    description: 'The national conference for Indigenous peoples of North America and the Pacific Islands, with educational, professional, and workforce development across STEM studies and careers, in Aurora, Colorado. The page gives no venue, time, or price yet.',
    setting: 'in-person', price: null, city: 'Aurora, CO', address: 'Aurora, CO', approximate: true,
    lat: 39.7294, lon: -104.8319, tz: 'America/Denver', identities: ['Native American & Indigenous'], audience: [],
    dates: [date('event', 'Conference', '2027-10-14', '2027-10-16', true)],
    links: [link('Official page', 'https://aises.org/events/2027-national-conference')]
  },
  {
    id: 135, source: checked('Organizer page', TONIGHT), added: '2026-11-22', category: 'corporate', kind: 'Career fair', industry: 'Law', topic: 'Careers',
    title: 'Multi-Bar Association Practice Area Fair', organizer: 'LGBT Bar Association of Greater New York',
    description: 'A fair for the LGBTQ+ legal community, run with partner bar associations, for law students, judicial law clerks, and attorneys. The page says the time and venue are coming soon, and lists no price.',
    setting: 'in-person', price: null, city: 'New York, NY', address: 'Greater New York', approximate: true,
    lat: 40.7128, lon: -74.006, tz: 'America/New_York', identities: ['LGBTQ+'], audience: ['Graduate school', 'Early career', 'Mid-career'],
    dates: [date('event', 'Practice area fair', '2027-03-01', null, true)],
    links: [link('Official page', 'https://www.lgbtbarny.org/career-fair')]
  },
  /* ----- Added Nov 10, 2026 from listing pages and organizer pages ----- */
  {
    id: 20, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'TMCF Lowe’s Gap Scholarship', organizer: 'Thurgood Marshall College Fund',
    description: 'Up to $5,000 for the 2026–2027 academic year, for 25 full-time undergraduates at TMCF member schools who are majoring in business or a STEM field. Requires a 3.0 GPA, financial need, and U.S. citizenship or permanent residency.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['HBCU & PBI students'], audience: ['College'],
    dates: [date('deadline', 'Applications close (11:59 PM ET)', '2026-12-01', null, true)], links: [link('Apply', 'https://tmcf.org/open-scholarships/2026-2027-tmcf-lowes-gap-scholarship/')]
  },
  {
    id: 21, source: LISTED, category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Jack Kent Cooke Foundation College Scholarship', organizer: 'Jack Kent Cooke Foundation',
    description: 'Up to $55,000 for high school seniors with financial need.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['Low-income'], audience: ['High school'],
    dates: [date('deadline', 'Applications close', '2026-11-11', null, true)], links: [link('Apply', 'https://www.jkcf.org')]
  },
  {
    id: 22, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Bright Lights Scholarship', organizer: 'Bold.org',
    description: 'A $1,100 scholarship, split between two winners at $550 each, for high school or undergraduate students from underrepresented backgrounds, first-generation students, or both. Winners are announced Jan 11, 2027.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['Students of color', 'First-generation'], audience: ['High school', 'College'],
    dates: [date('deadline', 'Applications close', '2026-12-10', null, true)], links: [link('Apply', 'https://bold.org/scholarships/bright-lights-scholarship/')]
  },
  {
    id: 23, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'How She Works Scholarship', organizer: 'Bold.org',
    description: 'A $1,000 scholarship for one winner, open to female-identifying students pursuing an undergraduate degree. Winners are announced Jan 18, 2027.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['Women'], audience: ['College'],
    dates: [date('deadline', 'Applications close', '2026-12-17', null, true)], links: [link('Apply', 'https://bold.org/scholarships/how-she-works-scholarship-for-womens-education/')]
  },
  {
    id: 24, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Scholarship', industry: 'Education', topic: 'Scholarships',
    title: 'Girls on Campus She Leads Scholarship', organizer: 'Girls on Campus',
    description: 'A $1,500 scholarship for one winner ($1,000 paid to the school and $500 to the student) for high school seniors and current undergraduate or graduate students who identify as women, gender nonconforming students and allies, enrolling in a U.S. accredited school for Fall 2027. Applicants identify as women of color or have a Hispanic/Latino, African American, Asian, Middle Eastern, or Native American background. Citizenship and immigration status do not matter. Apply with an essay of 250 to 500 words. No extensions are granted.',
    setting: 'online', price: 0, city: 'Online', address: '', tz: 'America/New_York', identities: ['Underrepresented students'], audience: ['High school', 'College'],
    dates: [date('deadline', 'Applications close (11:59 PM)', '2026-11-25', null, true)], links: [link('Apply', 'https://girlsoncampus.org/sheleadsscholarship')]
  },
  {
    id: 25, source: checked('Organizer page', TONIGHT), category: 'program', kind: 'Grant', industry: 'Business', topic: 'Entrepreneurship',
    title: 'Amber Grant for Women', organizer: 'WomensNet',
    description: 'Monthly $15,000 Amber Grants for women-owned businesses, with one application considered for every grant. The page lists the next cutoff as Nov 30, 2026, and says winners are announced by the 21st of the following month. It does not state an application fee.',
    setting: 'online', price: null, city: 'Online', address: '', tz: 'America/New_York', identities: ['Women'], audience: [],
    dates: [date('deadline', 'Monthly cutoff', monthEnd(), null, true)], links: [link('Apply', 'https://ambergrantsforwomen.com/get-an-amber-grant/')]
  },
  {
    id: 26, source: checked('Organizer ticket page', TONIGHT), category: 'cultural', kind: 'Gala', industry: 'Community', topic: 'History',
    title: 'Virginia Black History Month Gala', organizer: 'Virginia Black History Month Association',
    description: 'A black-tie-optional evening celebrating African American history, at the Renaissance Arlington Capital View Hotel. Tickets are $125 general admission, $200 VIP, $75 for students ages 12 to 22, and $50 for children 11 and under. The ticket page gives the hours as 4 to 9 PM.',
    setting: 'in-person', price: 125, city: 'Arlington, VA', address: 'Renaissance Arlington Capital View Hotel, 2800 Potomac Ave, Arlington, VA 22202',
    lat: 38.84, lon: -77.05, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Gala, 4–9 PM', '2027-02-27T21:00:00Z', '2027-02-28T02:00:00Z')],
    links: [link('Tickets', 'https://www.zeffy.com/en-US/ticketing/the-2027-virginia-black-history-month-gala')]
  },
  {
    id: 27, source: checked('Organizer page', TONIGHT), category: 'cultural', kind: 'Concert', industry: 'Arts', topic: 'Music',
    title: 'Black History Month with Kyaira', organizer: 'Prince George’s County Parks',
    description: 'An afternoon vocal performance by a rising regional singer.',
    setting: 'in-person', price: 20, city: 'Prince George’s County, MD', address: 'Prince George’s County, MD', approximate: true,
    lat: 38.83, lon: -76.85, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Concert', '2027-02-06T19:00:00Z', '2027-02-06T20:30:00Z')],
    links: [link('Official page', 'https://pgparks.com/event_list/special-event-black-history-month-with-kyaira-vocals')]
  },
  {
    id: 28, source: checked('Organizer page', TONIGHT), category: 'cultural', kind: 'Talk', industry: 'Arts', topic: 'History',
    title: 'Voices From the Past: Black Print Culture to Digital Blackness', organizer: 'Prince George’s County Parks',
    description: 'A discussion and performance on how print culture shaped what came next.',
    setting: 'in-person', price: 0, city: 'Prince George’s County, MD', address: 'Prince George’s County, MD', approximate: true,
    lat: 38.83, lon: -76.85, tz: 'America/New_York', identities: ['African diaspora'], audience: [],
    dates: [date('event', 'Talk and performance', '2027-02-21T21:00:00Z')],
    links: [link('Official page', 'https://pgparks.com/?p=1407285')]
  }
];

/* Simplified coastlines used by the map view (longitude, latitude). */
const USC = [
    [-124.7,48.4],[-122.8,49],[-95.15,49],[-94.8,49.3],[-94.6,48.7],[-93,48.6],[-91.4,48.1],[-89.6,48],
    [-92.1,46.75],[-90.4,46.6],[-88.4,47.3],[-87.4,46.5],[-84.9,46.8],[-84.4,46.5],[-83.4,45.3],[-82.9,43.9],
    [-82.4,43],[-83.1,42.1],[-83.4,41.7],[-82.5,41.4],[-81.7,41.5],[-80.5,41.97],[-79,42.7],[-79.05,43.25],
    [-77.5,43.3],[-76.3,43.5],[-76.2,44],[-75,44.95],[-74.7,45],[-71.5,45],[-70.8,45.4],[-70,46.7],
    [-69.2,47.45],[-68.3,47.35],[-67.8,47.1],[-67.8,45.7],[-67,44.85],[-68.6,44.3],[-70.2,43.65],[-70.7,43],
    [-70.8,42.6],[-70.6,41.95],[-70,41.8],[-70.5,41.55],[-71.5,41.4],[-73.7,40.9],[-74,40.6],[-74.1,39.7],
    [-74.9,38.95],[-75.1,38.4],[-75.9,37.1],[-76,36.9],[-75.5,35.3],[-76.5,34.7],[-77.9,33.9],[-79.2,33.2],
    [-80.9,32],[-81.4,30.7],[-81.2,29.6],[-80.5,28.2],[-80,26.8],[-80.2,25.4],[-81.1,25.1],[-81.8,26.2],
    [-82.7,27.7],[-82.7,29],[-83.7,29.9],[-84.4,30],[-85.3,29.7],[-86.5,30.4],[-88,30.3],[-89.3,30.2],
    [-89.4,29],[-90.2,29.1],[-91.4,29.3],[-92.3,29.5],[-93.8,29.7],[-94.7,29.3],[-95.9,28.5],[-97.2,27.6],
    [-97.4,26],[-99.1,26.4],[-99.5,27.5],[-100.3,28.3],[-101.4,29.8],[-102.4,29.8],[-103.1,29],[-104.5,29.7],
    [-105,30.7],[-106.5,31.8],[-108.2,31.8],[-108.2,31.3],[-111.1,31.3],[-114.8,32.5],[-117.1,32.5],[-117.3,33.1],
    [-118.5,34],[-119.5,34.4],[-120.6,34.5],[-121.9,36.6],[-122.5,37.8],[-123.7,39],[-124.4,40.4],[-124.1,41.9],
    [-124.5,42.8],[-124,44.5],[-123.9,46.2],[-124.1,47]
  ];
const WORLD = [
  [
    [-168,66],[-162,70],[-156,71],[-141,70],[-128,70],[-115,68],[-95,72],[-82,69],
    [-80,63],[-94,59],[-90,52],[-80,52],[-78,58],[-70,60],[-62,57],[-56,52],
    [-60,47],[-66,45],[-70,43],[-74,40],[-76,35],[-81,31],[-80,26],[-82,28],
    [-84,30],[-90,29],[-97,27],[-97,22],[-92,18],[-88,21],[-87,16],[-83,15],
    [-83,9],[-79,9],[-77,8],[-80,7],[-86,11],[-92,14],[-97,16],[-105,20],
    [-110,24],[-112,29],[-115,30],[-110,23],[-117,32],[-121,35],[-124,40],[-124,47],
    [-130,55],[-140,60],[-150,60],[-158,57],[-165,60],[-166,64]
  ],
  [
    [-55,60],[-45,60],[-20,70],[-20,80],[-60,82],[-73,78],[-58,70]
  ],
  [
    [-77,8],[-72,12],[-62,10],[-52,5],[-50,0],[-35,-6],[-39,-14],[-41,-22],
    [-48,-26],[-53,-34],[-58,-38],[-65,-42],[-68,-52],[-70,-55],[-74,-50],[-73,-40],
    [-71,-30],[-70,-18],[-76,-14],[-81,-6],[-80,0],[-78,3]
  ],
  [
    [-9,37],[-9,43],[-2,43.5],[-1,46],[-4,48],[2,51],[8,54],[9,57],
    [11,56],[13,54],[19,54.5],[21,57],[24,59],[29,60],[22,61],[21,65],
    [25,66],[18,63],[17,60],[12,56],[8,58],[5,62],[14,68],[25,71],
    [40,68],[44,68],[60,69],[70,73],[100,77],[115,74],[140,72],[160,70],
    [180,68],[180,65],[170,60],[162,58],[156,51],[142,54],[140,48],[135,43],
    [130,42],[128,38],[126,35],[127,39],[121,40],[119,35],[122,30],[120,24],
    [110,20],[108,15],[109,11],[105,9],[100,13],[100,8],[104,1],[98,8],
    [98,16],[94,17],[92,22],[88,22],[86,20],[80,15],[78,8],[73,16],
    [72,21],[67,24],[57,25],[56,27],[50,30],[48,29],[51,24],[56,26],
    [59,22],[53,16],[44,12],[43,16],[39,22],[35,28],[34,31],[36,36],
    [30,36],[27,37],[26,40],[23,38],[20,40],[19,42],[13,45],[16,41],
    [12,38],[8,44],[3,43],[0,39],[-6,36]
  ],
  [
    [-17,21],[-13,28],[-6,36],[10,37],[11,33],[20,31],[32,31],[35,28],
    [43,12],[51,12],[48,5],[41,-2],[40,-10],[35,-20],[33,-26],[28,-33],
    [20,-35],[17,-30],[12,-17],[14,-10],[10,-2],[9,4],[0,5],[-8,4],
    [-13,8],[-17,14]
  ],
  [
    [114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[150,-37],
    [141,-38],[135,-35],[129,-32],[115,-34]
  ],
  [
    [-5,50],[1,51],[2,53],[-2,57],[-4,58.5],[-6,57],[-3,54],[-5,52]
  ],
  [
    [-10,52],[-6,52],[-6,55],[-10,54]
  ],
  [
    [130,31],[135,34],[141,38],[142,43],[140,41],[136,36],[131,34]
  ]
];

/* =====================================================================
   2. UTILITIES AND STORAGE
   ===================================================================== */

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/* Older Android WebViews lack <dialog>.showModal(); fall back to the open attribute. */
function openDialog(dlg) {
  if (dlg.open) return;
  if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
}
function closeDialog(dlg) {
  if (typeof dlg.close === 'function') dlg.close();
  else { dlg.removeAttribute('open'); dlg.dispatchEvent(new Event('close')); }
}

/* localStorage wrapper that never throws (private mode, blocked storage …). */
const store = {
  get(key, fallback) { try { const raw = localStorage.getItem(key); return raw == null ? fallback : JSON.parse(raw); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
  remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } }
};

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.className = 'show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 2600);
}

/* =====================================================================
   3. DATES AND TIME ZONES
   Event times are shown in the event's own time zone, with the visitor's
   time zone (detected from the device) alongside. All-day dates have no
   time zone and are never shifted.
   ===================================================================== */

let userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const now = () => new Date();
const startOf = d => (d.allDay ? new Date(d.start + 'T00:00:00Z') : new Date(d.start));
const endOf = d => (d.allDay ? new Date((d.end || d.start) + 'T23:59:59Z') : new Date(d.end || d.start));

const nextDate = item => item.dates.filter(d => endOf(d) >= now()).sort((a, b) => compare(+startOf(a), +startOf(b)))[0] || null;
const deadlineOf = item => item.dates.filter(d => d.role === 'deadline' && endOf(d) >= now()).sort((a, b) => compare(+startOf(a), +startOf(b)))[0] || null;
const lastDate = item => [...item.dates].sort((a, b) => compare(+endOf(b), +endOf(a)))[0] || null;
const isPast = item => item.dates.length > 0 && !nextDate(item);
/* "Open" means you can take part now: an application or registration that is accepting entries, or an event that is under way. */
const isAccepting = item => !!deadlineOf(item) && !item.dates.some(d => d.role === 'opens' && startOf(d) > now());
const isUnderway = item => item.dates.some(d => ['event', 'session', 'start'].includes(d.role) && startOf(d) <= now() && endOf(d) >= now());
const isOpen = item => isAccepting(item) || isUnderway(item);
const mainDate = item => item.dates.find(d => d.role === 'event' || d.role === 'start') || item.dates[0] || null;

function formatWhen(d, tz) {
  if (d.allDay) {
    const day = x => new Date(x + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    return day(d.start) + (d.end && d.end !== d.start ? ' – ' + day(d.end) : '');
  }
  const start = startOf(d);
  let text = start.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short' });
  if (d.end) text += ' – ' + endOf(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short' });
  if (tz !== userTz) {
    const mine = start.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: userTz, timeZoneName: 'short' });
    text += ` <span class="muted">(your time: ${esc(mine)})</span>`;
  }
  return text;
}

/* 'YYYY-MM' key of a date in the event's time zone. */
const monthKey = (value, allDay, tz) => (allDay ? value.slice(0, 7) : new Date(value).toLocaleDateString('en-CA', { timeZone: tz }).slice(0, 7));
const monthLabel = key => new Date(key + '-01T12:00:00Z').toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/* Every month a date range touches, e.g. Oct → Feb. */
function monthsBetween(first, last) {
  const out = [];
  let [y, m] = first.split('-').map(Number);
  for (;;) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    if (key > last) return out;
    out.push(key);
    if (++m > 12) { m = 1; y++; }
  }
}
const monthsOf = item => [...new Set(item.dates.flatMap(d => monthsBetween(monthKey(d.start, d.allDay, item.tz), monthKey(d.end || d.start, d.allDay, item.tz))))];

/* Calendar exports */
const stamp = value => new Date(value).toISOString().replace(/[-:]|\.\d+/g, '');
const dayAfter = day => { const t = new Date(day + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10); };

function buildIcs(item, d) {
  const text = v => v.replace(/[,;\n]/g, ' ');
  const when = d.allDay
    ? [`DTSTART;VALUE=DATE:${d.start.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${dayAfter(d.end || d.start).replace(/-/g, '')}`]
    : [`DTSTART:${stamp(d.start)}`, `DTEND:${stamp(d.end || d.start)}`];
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CultureQ//EN', 'BEGIN:VEVENT',
    `UID:cq-${item.id}-${d.role}@cultureq`, `DTSTAMP:${stamp(now())}`, ...when,
    `SUMMARY:${text(item.title)} — ${text(d.label)}`, `LOCATION:${text(item.address || 'Online')}`,
    ...(primaryLink(item) ? [`URL:${primaryLink(item).url}`] : []), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}
function googleCalendarUrl(item, d) {
  const range = d.allDay ? `${d.start.replace(/-/g, '')}/${dayAfter(d.end || d.start).replace(/-/g, '')}` : `${stamp(d.start)}/${stamp(d.end || d.start)}`;
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(`${item.title} — ${d.label}`) + '&dates=' + range + '&location=' + encodeURIComponent(item.address || 'Online');
}
/* Outlook on the web (personal accounts and Microsoft 365 share one link format). */
function outlookUrl(item, d, host) {
  const iso = v => new Date(v).toISOString();
  const [start, end] = d.allDay ? [d.start, dayAfter(d.end || d.start)] : [iso(d.start), iso(d.end || d.start)];
  const q = new URLSearchParams({ path: '/calendar/action/compose', rru: 'addevent', subject: `${item.title} — ${d.label}`,
    startdt: start, enddt: end, location: item.address || 'Online', body: (item.links[0] || {}).url || '' });
  if (d.allDay) q.set('allday', 'true');
  return `https://${host}/calendar/0/deeplink/compose?${q.toString().replace(/\+/g, "%20")}`;
}
/* One entry per calendar app. Apple Calendar and any other app open the same .ics file. */
const CALENDARS = [
  { id: 'google', label: 'Google Calendar', href: googleCalendarUrl },
  { id: 'outlook', label: 'Outlook.com', href: (i, d) => outlookUrl(i, d, 'outlook.live.com') },
  { id: 'office', label: 'Microsoft 365', href: (i, d) => outlookUrl(i, d, 'outlook.office.com') }
];
const isApple = /iPhone|iPad|iPod|Macintosh/.test((navigator.userAgent || '') + (navigator.platform || ''));
const mapUrl = (item, provider) => (provider === 'apple' ? 'https://maps.apple.com/?q=' : 'https://www.google.com/maps/search/?api=1&query=') + encodeURIComponent(item.address);

/* =====================================================================
   4. ICONS  (abstract line icons, drawn on a 24px grid)
   ===================================================================== */

const ICONS = {
  save: '<path d="M12 3l8 9-8 9-8-9z"/>',
  home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  pin: '<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  ext: '<path d="M8 16l8-8M9 8h7v7"/>',
  bell: '<path d="M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4"/>'
};
const icon = (name, filled = false) => `<svg class="icon${name === 'ext' ? ' icon-end' : ''}${filled ? ' is-filled' : ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

/* =====================================================================
   5. STATE, FILTERING, SEARCH AND SORTING
   ===================================================================== */

const LEVELS = ['Middle school', 'High school', 'College', 'Graduate school', 'Early career', 'Mid-career'];
const FORMATS = ['Online', 'In person'];

const blankFilters = () => ({ type: '', month: '', where: '', identity: '', industry: '', audience: '', price: '', new: '', open: '', soon: '', past: false });
const SELECT_KEYS = ['type', 'month', 'where', 'identity', 'industry', 'audience', 'price'];
/* Every filter an alert can watch: the dropdowns plus "New" and "Open now". */
const ALERT_KEYS = [...SELECT_KEYS, 'new', 'open', 'soon'];
const firstOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1);

const S = {
  view: 'home', tab: 'saved', q: '', F: blankFilters(), sort: 'date', mode: 'list', shown: PAGE_SIZE,
  calMonth: firstOfMonth(new Date()), calDay: '', fbKind: 'Idea', fbRating: 0, fbSent: false, mapScope: '', pin: '', zoom: [], filtersOpen: false, detailId: null, sheet: null, amount: 10,
  insightsDays: 30, insightsKey: ''
};
/* Listings that were merged into one keep working for people who saved the old one: old id → id it became. */
const MERGED_IDS = { 59: 1 };
const favs = new Set(store.get('fav', []).map(id => MERGED_IDS[id] || id));

/* Sort helper: known values first in the given order, then the rest A–Z. */
const rank = list => (a, b) => ((list.indexOf(a) + 1) || 99) - ((list.indexOf(b) + 1) || 99) || compare(a, b);

/*
  Each facet drives one filter. A dropdown only offers values found in the
  opportunities currently in scope, each with a count. Related values share one
  dropdown under group headings: Type (category or kind) and Where (format or
  city).
*/
const FACETS = {
  type:     { label: 'Type', values: i => [i.category, i.kind], text: v => CATEGORIES[v] || v,
              group: v => (CATEGORIES[v] ? 'Category' : 'Kind'), order: rank(Object.keys(CATEGORIES)) },
  month:    { label: 'Month', values: monthsOf, text: monthLabel, order: compare },
  where:    { label: 'Where', text: v => v, group: v => (FORMATS.includes(v) ? 'Format' : 'City'), order: rank(FORMATS),
              values: i => [...(i.setting !== 'in-person' ? ['Online'] : []), ...(i.setting !== 'online' ? ['In person', i.city] : [])] },
  identity: { label: 'For', values: i => i.identities, text: v => v },
  industry: { label: 'Field', values: i => [i.industry], text: v => v },
  audience: { label: 'Stage', values: i => i.audience, text: v => v, order: rank(LEVELS) },
  price:    { label: 'Cost', values: i => (i.price === 0 ? ['free'] : i.price > 0 ? ['paid'] : []), text: v => (v === 'free' ? 'Free' : 'Paid') },
  new:      { label: 'Status', values: i => (isNew(i) ? ['new'] : []), text: () => 'New' },
  open:     { label: 'Status', values: i => (isOpen(i) ? ['open'] : []), text: () => 'Open now' },
  soon:     { label: 'Status', values: i => (isSoon(i) ? ['soon'] : []), text: () => 'This week' }
};

const matchesFilters = (item, F) => Object.keys(FACETS).every(key => !F[key] || FACETS[key].values(item).includes(F[key]));

/* Converts filters saved by earlier versions (kind, location, setting, age, stage …). */
function migrateFilters(old = {}) {
  const F = blankFilters();
  Object.keys(F).forEach(k => { if (typeof old[k] === typeof F[k]) F[k] = old[k]; });
  if (old.kind) F.type = old.kind;
  if (!F.where) F.where = old.location || (old.setting === 'online' ? 'Online' : old.setting === 'in-person' ? 'In person' : '');
  if (!F.audience) F.audience = old.age || old.stage || '';
  return F;
}

const haystacks = new Map();
function haystack(item) {
  if (!haystacks.has(item.id)) {
    haystacks.set(item.id, [item.title, item.description, item.organizer, item.industry, item.topic, item.city, item.kind, CATEGORIES[item.category],
      ...item.identities, ...item.audience, ...item.links.map(l => l.label)].join(' ').toLowerCase());
  }
  return haystacks.get(item.id);
}

const nextStart = item => { const d = nextDate(item); return d ? +startOf(d) : Infinity; };

/* "Soon": under way now, or a date within the next 7 days. */
const SOON_DAYS = 7;
/* A multi-day event that is already running counts as Open, not Soon, through its last day. */
const isRunning = item => item.dates.some(d => ['event', 'session', 'start'].includes(d.role) && endOf(d) - startOf(d) >= 864e5 && startOf(d) <= now() && endOf(d) >= now());
const isSoon = item => !isPast(item) && !isRunning(item) && nextStart(item) <= +now() + SOON_DAYS * 864e5;
const deadlineStart = item => { const d = deadlineOf(item); return d ? +startOf(d) : Infinity; };
const SORTERS = {
  date: (a, b) => (isPast(a) && isPast(b) ? compare(+endOf(lastDate(b)), +endOf(lastDate(a))) : compare(nextStart(a), nextStart(b))),     /* past: most recent first */
  deadline: (a, b) => compare(deadlineStart(a), deadlineStart(b)) || compare(nextStart(a), nextStart(b)),
  title: (a, b) => a.title.localeCompare(b.title)
};

/* Opportunities that match a search. Also used by alerts. */
function runQuery({ q = '', F = blankFilters(), sort = 'date', onlyFavs = false }) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return ITEMS
    .filter(i => (F.past ? isPast(i) : !isPast(i)) && (!onlyFavs || favs.has(i.id)) && matchesFilters(i, F) && words.every(w => haystack(i).includes(w)))
    .sort(SORTERS[sort] || SORTERS.date);
}
const currentResults = () => runQuery({ q: S.q, F: S.F, sort: S.sort, onlyFavs: S.view === 'my' });
/* Counts for one filter come from what the search and every OTHER active filter leave,
   so each number is what you would get by also choosing that option. */
const poolOfOptions = key => runQuery({ q: S.q, F: { ...S.F, [key]: blankFilters()[key] }, sort: S.sort, onlyFavs: S.view === 'my' });
const activeFilterCount = () => Object.values(S.F).filter(Boolean).length;
/* Map picks: S.zoom is a stack of zoom levels, each the cities of a merged pin the map is zoomed into; S.pin is the pin chosen inside the current view. */
const clearMapPick = () => { S.pin = ''; S.zoom = []; };
/* The calendar shows the month chosen in the Month filter, or the current month when there is none. */
const syncCalendarMonth = () => {
  const [year, month] = S.F.month ? S.F.month.split('-').map(Number) : [];
  S.calMonth = year ? new Date(year, month - 1, 1) : firstOfMonth(new Date());
  S.calDay = '';
};
const resetSearch = () => { S.q = ''; S.F = blankFilters(); S.shown = PAGE_SIZE; clearMapPick(); S.mapScope = ''; syncCalendarMonth(); };

/*
  Everything a filter could ever offer, listed or not, so an alert can watch for something that has no
  listing yet. Kinds, fields and communities are a fixed vocabulary; cities come from every listing,
  past ones included; months run a year ahead.
*/
const KINDS = ['Scholarship', 'Fellowship', 'Grant', 'Residency', 'Open call', 'Competition', 'Internship', 'Summer program', 'Workshop',
  'Conference', 'Career fair', 'Networking', 'Festival', 'Family event', 'Film festival', 'Concert', 'Performance', 'Talk', 'Art fair', 'Design fair', 'Open house', 'Gala', 'Party'];
const FIELDS = ['Arts', 'Business', 'Community', 'Education', 'Engineering', 'Film', 'Government', 'Health', 'Law', 'Media', 'Music',
  'Nonprofit', 'Science', 'Technology', 'Writing'];
const COMMUNITIES = ['African diaspora', 'Asian American & Pacific Islander', 'First-generation', 'Hispanic / Latino', 'HBCU & PBI students',
  'Immigrants', 'Jewish', 'LGBTQ+', 'Low-income', 'Native American & Indigenous', 'People with disabilities', 'Students of color',
  'Underrepresented students', 'Veterans', 'Women'];
function vocabulary(key) {
  const cities = [...new Set(ITEMS.filter(i => i.setting !== 'online').map(i => i.city))];
  const months = Array.from({ length: 12 }, (_, n) => { const d = new Date(now().getFullYear(), now().getMonth() + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; });
  return {
    type: [...Object.keys(CATEGORIES), ...KINDS], month: months, where: [...FORMATS, ...cities], audience: LEVELS,
    identity: COMMUNITIES, industry: FIELDS, price: ['free', 'paid'], new: ['new'], open: ['open'], soon: ['soon']
  }[key] || [];
}

/* <option> markup for one filter. Counts come from `pool`; `extra` values with no match are still offered, without a count. */
function optionsFor(key, pool = poolOfOptions(key), current = S.F[key], extra = []) {
  const facet = FACETS[key], counts = new Map();
  pool.forEach(i => new Set(facet.values(i)).forEach(v => counts.set(v, (counts.get(v) || 0) + 1)));
  extra.forEach(v => { if (!counts.has(v)) counts.set(v, 0); });
  if (key === 'month' && !S.F.past) {
    const thisMonth = monthKey(now().toISOString().slice(0, 10), true);
    [...counts.keys()].forEach(k => { if (k < thisMonth) counts.delete(k); });
  }
  if (current && !counts.has(current)) counts.set(current, 0);
  const order = facet.order || ((a, b) => facet.text(a).localeCompare(facet.text(b)));
  const keys = [...counts.keys()].sort(order);
  const count = v => (counts.get(v) || !extra.length ? ` (${counts.get(v)})` : '');
  const option = v => `<option value="${esc(v)}"${current === v ? ' selected' : ''}>${esc(facet.text(v))}${count(v)}</option>`;
  const any = '<option value="">Any</option>';
  if (!facet.group) return any + keys.map(option).join('');
  const groups = new Map();
  keys.forEach(v => { const g = facet.group(v); groups.set(g, [...(groups.get(g) || []), v]); });
  return any + [...groups].map(([g, values]) => `<optgroup label="${g}">${values.map(option).join('')}</optgroup>`).join('');
}

/* =====================================================================
   6. UI COMPONENTS
   ===================================================================== */

/* Unknown prices are left out entirely rather than sent to "see site". */
const priceLabel = i => (i.price == null ? '' : i.price ? '$' + i.price : 'Free');
const placeLabel = i => (i.setting === 'online' ? 'Online' : esc(i.city) + (i.setting === 'hybrid' ? ' + online' : ''));
/* The main call to action: a link labelled Apply, Register, Enter or Tickets, else the first link. */
const primaryLink = i => i.links.find(l => /^(apply|register|enter|tickets?)/i.test(l.label)) || i.links[0];
const linkVerb = l => /^apply/i.test(l.label) ? 'Apply' : /^register/i.test(l.label) ? 'Register'
  : /^enter/i.test(l.label) ? 'Enter' : /^tickets?/i.test(l.label) ? 'Get tickets' : 'Open page';

function dateBadge(item) {
  const d = nextDate(item) || lastDate(item);      /* a past listing keeps its last date */
  if (!d) return '<b>TBA</b>';
  const tz = d.allDay ? 'UTC' : item.tz, when = d.allDay ? new Date(d.start + 'T12:00:00Z') : new Date(d.start);
  return `<b>${when.toLocaleDateString('en-US', { day: 'numeric', timeZone: tz })}</b>${when.toLocaleDateString('en-US', { month: 'short', timeZone: tz }).toUpperCase()}`;
}

/* Date badge for a picked calendar day. */
const dayBadge = day => { const when = new Date(day + 'T12:00:00Z'); return `<b>${when.getUTCDate()}</b>${when.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase()}`; };
/* The one date line on a card opened from the calendar: the date that falls on the tapped day. */
function pickedDateLine(item, d, day) {
  const text = `${esc(d.label)}: ${formatWhen(d, item.tz)}`;
  return d.role === 'deadline' ? `<p class="deadline">${icon('clock')}${text}</p>` : `<p class="when">${icon('cal')}${text}</p>`;
}

function deadlineChip(item) {
  const d = deadlineOf(item);
  if (!d) {
    const closed = item.dates.filter(x => x.role === 'deadline').sort((a, b) => compare(+endOf(b), +endOf(a)))[0];
    return closed ? `<p class="deadline is-closed">${icon('clock')}Closed: ${formatWhen(closed, item.tz)}</p>` : '';
  }
  const days = Math.ceil((endOf(d) - now()) / 864e5);
  const left = days <= 30 ? ` · ${days <= 1 ? 'last day' : days + ' days left'}` : '';
  return `<p class="deadline">${icon('clock')}${esc(d.label)}: ${formatWhen(d, item.tz)}${left}</p>`;
}

/* Next date that is not the deadline (the deadline chip already shows that one). */
function whenLine(item) {
  const deadline = deadlineOf(item);
  const rest = item.dates.filter(d => d !== deadline && d.role !== 'deadline');
  const other = rest.filter(d => endOf(d) >= now()).sort((a, b) => compare(+startOf(a), +startOf(b)))[0]
    || (isPast(item) ? rest.sort((a, b) => compare(+endOf(b), +endOf(a)))[0] : null);
  if (!other) return '';
  return `<p class="when">${icon('cal')}${esc(other.label)} · ${formatWhen(other, item.tz)}</p>`;
}

/* Status flags on a card: past, newly added (last 7 days), and happening this week (a deadline or start within 7 days). */
const NEW_DAYS = 7;   /* an opportunity is "New" for the 7 days after its `added` date; no `added` date, no tag */
/* Whole calendar days since a YYYY-MM-DD date, in the visitor's time zone. */
const daysSince = day => Math.round((new Date(now().toLocaleDateString('en-CA') + 'T00:00:00Z') - new Date(day + 'T00:00:00Z')) / 864e5);
/* "New": added within the last NEW_DAYS days (no `added` date, never new). */
const isNew = item => !!item.added && daysSince(item.added) >= 0 && daysSince(item.added) < NEW_DAYS;
/* Calendar cells have room for one word. This is the most telling word of each title; listings added later fall back to
   the first word of the title that is not a year, a number, or a generic word like "Annual" or "Scholarship". */
const CAL_WORDS = {
  1: 'Basel', 2: 'Kwanzaa', 3: 'Ailey', 4: 'Gilman', 5: 'Atlantic', 6: 'SHPE',
  7: 'MLT', 8: 'Rangel', 9: 'Flytime', 10: 'Detty', 11: 'SEO', 14: 'Point',
  15: 'HSF', 16: 'SWE', 17: 'LEAGUE', 18: 'Lavender', 19: 'Bellevue', 20: 'TMCF',
  21: 'Cooke', 22: 'Bright', 23: 'Works', 24: 'Leads', 25: 'Amber', 26: 'Gala',
  27: 'Kyaira', 28: 'Voices', 29: 'Harvest', 30: 'Hopper', 31: 'Ruskin', 33: 'LMCC',
  34: 'Bernheim', 35: 'Eyck', 36: 'Smack', 40: 'Afro', 41: 'Hazel', 42: 'Robinson',
  43: 'NatGeo', 44: 'TJX', 45: 'STEM', 46: 'Madden', 47: 'Blum', 48: 'Matisse',
  49: 'Mac', 50: 'Ucross', 51: 'PTK', 52: 'Wildlife', 53: 'Cooke', 54: 'Design',
  55: 'Beam', 56: 'Vital', 57: 'Dell', 58: 'Prizm', 60: 'Graton', 61: 'Sloan',
  62: 'Ignite', 63: 'Book', 64: 'NSBE', 65: 'PAFF', 66: 'Sundance', 67: 'INROADS',
  68: 'Africa', 69: 'Impact', 70: 'Notting', 71: 'Berlin', 72: 'FESPACO', 73: 'IFFR',
  74: 'SXSW', 75: 'EDU', 76: 'Writing', 77: 'Cooke', 78: 'Chance', 79: 'Prep',
  80: 'Oliver', 81: 'Brown', 82: 'Posse', 83: 'Kwanzaa', 84: 'Kwanzaa', 85: 'Kwanzaa',
  86: 'Dragon', 87: 'Jazz', 88: 'Cherry', 89: 'Fiesta', 90: 'Chinese', 91: 'Kresge',
  92: 'VCCA', 93: 'Money', 94: 'Salt', 96: 'Sony', 97: 'Teen', 98: 'Harlem',
  99: 'Truman', 101: 'Relaxed', 104: 'Hanukkah', 111: 'MLK', 112: 'Dream', 113: 'Taos',
  116: 'Kala', 117: 'Burger', 118: 'Kwanzaa', 119: 'Kwanzaa', 121: 'MLK', 122: 'BEYA',
  123: 'Women', 124: 'Diverse', 125: 'Kings',
  126: 'CHCI', 127: 'APIQWTC', 128: 'APIA', 129: 'Downs', 130: 'Queer', 131: 'Haiti',
  132: 'Heritage', 133: 'HBCU', 134: 'AISES', 135: 'LeGaL'
};
const GENERIC_WORDS = new Set(['the', 'a', 'an', 'of', 'for', 'and', 'in', 'at', 'annual', 'national', 'international', 'foundation', 'program', 'programs',
  'scholarship', 'scholarships', 'fellowship', 'fellowships', 'festival', 'fest', 'conference', 'award', 'awards', 'grant', 'grants', 'celebration', 'day', 'open', 'call']);
const calWord = item => CAL_WORDS[item.id]
  || item.title.split(/\s+/).map(w => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')).find(w => w && !/^\d/.test(w) && !GENERIC_WORDS.has(w.toLowerCase()))
  || item.title;
function flagsHTML(item) {
  const flags = [];
  if (isPast(item)) return '<span class="flags"><span class="flag flag-past">Past</span></span>';
  if (isSoon(item)) flags.push('<span class="flag flag-soon">This week</span>');
  if (isNew(item)) flags.push('<span class="flag flag-new">New</span>');
  return flags.length ? `<span class="flags">${flags.join('')}</span>` : '';
}

/* `day` (YYYY-MM-DD) is the calendar day a person tapped: the card then shows that day's date instead of the next one. */
function cardHTML(item, day) {
  const saved = favs.has(item.id), primary = primaryLink(item);
  const hit = day ? item.dates.find(d => dayKeys(item, d).includes(day)) : null;
  return `<article class="card" data-act="open" data-id="${item.id}">
    <div class="card-top">
      <span class="eyebrow"><i class="dot cat-${item.category}"></i>${CATEGORIES[item.category]} · ${esc(item.kind)}</span>
      ${flagsHTML(item)}
      <button class="star" data-act="fav" data-id="${item.id}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from' : 'Save to'} MyQueue: ${esc(item.title)}">${icon('save', saved)}</button>
    </div>
    <div class="card-head">
      <div class="datebadge" aria-hidden="true">${hit ? dayBadge(day) : dateBadge(item)}</div>
      <div><h3><a href="#" data-act="open" data-id="${item.id}">${esc(item.title)}</a></h3>
        <p class="muted">${icon('pin')}${placeLabel(item)}${S.mode === 'map' && awayLabel(item) ? ' · ' + awayLabel(item) + ' away' : ''}${priceLabel(item) ? ' · ' + priceLabel(item) : ''}</p></div>
    </div>
    ${hit ? pickedDateLine(item, hit, day) : deadlineChip(item) + whenLine(item)}
    <div class="actions">
      <button class="btn btn-sm" data-act="open" data-id="${item.id}">Details</button>
      ${primary ? `<a class="btn btn-outline btn-sm" href="${esc(primary.url)}" data-out data-item="${item.id}" target="_blank" rel="noopener noreferrer">${isPast(item) ? 'View' : linkVerb(primary)}</a>` : ''}
    </div>
    ${S.view === 'my' && saved ? reminderStripHTML(item) : ''}
  </article>`;
}
const cardsHTML = (items, day) => `<div class="grid">${items.map(i => cardHTML(i, day)).join('')}</div>`;

/* ----- Detail dialog ----- */
function openDetail(id) {
  const item = ITEMS.find(i => i.id === Number(id));
  if (!item) return;
  S.detailId = item.id;
  const main = mainDate(item), primary = primaryLink(item), saved = favs.has(item.id);
  const others = item.links.filter(l => l !== primary);
  const where = item.setting === 'online' ? 'Online only'
    : item.approximate || !item.address ? esc(item.city)
    : `${esc(item.address)}<br><a href="${mapUrl(item, 'google')}" target="_blank" rel="noopener noreferrer">Google Maps${icon('ext')}</a> ${isApple ? `<a href="${mapUrl(item, 'apple')}" target="_blank" rel="noopener noreferrer">Apple Maps${icon('ext')}</a>` : ''}`;
  const audience = [...item.identities, ...item.audience].map(esc).join(' · ');
  const dates = item.dates.map(d => `<li${d.role === 'deadline' ? ' class="is-deadline"' : ''}><b>${esc(d.label)}:</b> ${formatWhen(d, item.tz)}</li>`).join('');
  const externalLink = l => `<a href="${esc(l.url)}" data-out data-item="${item.id}" target="_blank" rel="noopener noreferrer">${esc(l.label)}${icon('ext')}</a>`;

  const dlg = $('#detail');
  dlg.innerHTML = `
    <div class="dialog-head">
      <span class="eyebrow"><i class="dot cat-${item.category}"></i>${CATEGORIES[item.category]} · ${esc(item.kind)}</span>
      <button class="btn btn-outline btn-sm" data-act="close-detail" aria-label="Close details">${icon('close')}Close</button>
    </div>
    <h2 id="detail-title">${esc(item.title)}</h2>
    <div class="actions">
      ${primary ? `<a class="btn btn-gold" href="${esc(primary.url)}" data-out data-item="${item.id}" target="_blank" rel="noopener noreferrer">${esc(primary.label)}${icon('ext')}</a>` : ''}
      ${main ? calendarMenuHTML(item, main) : ''}
      <button class="btn btn-outline" data-act="fav" data-id="${item.id}" aria-pressed="${saved}">${icon('save', saved)} ${saved ? 'Saved' : 'Save'}</button>
    </div>
    <dl class="facts">
      <div><dt>Where</dt><dd>${where}</dd></div>
      ${priceLabel(item) ? `<div><dt>Price</dt><dd>${priceLabel(item)}</dd></div>` : ''}
      <div><dt>Organizer</dt><dd>${esc(item.organizer)}</dd></div>
      ${audience ? `<div><dt>For</dt><dd>${audience}</dd></div>` : ''}
      <div><dt>Source</dt><dd>${esc(item.source)}</dd></div>
    </dl>
    ${dates ? `<h3>Key dates</h3><ul class="dates">${dates}</ul>` : ''}
    <p class="description">${esc(item.description)}</p>
    ${others.length ? `<h3>More links</h3><ul>${others.map(l => `<li>${externalLink(l)}</li>`).join('')}</ul>` : ''}`;
  openDialog(dlg);
}

/* "Add to calendar" menu: a native <details>, so it works with keyboard and screen readers and needs no script. */
function calendarMenuHTML(item, d) {
  const web = CALENDARS.map(c => `<a href="${esc(c.href(item, d))}" target="_blank" rel="noopener noreferrer">${c.label}${icon('ext')}</a>`);
  const file = `<button type="button" data-act="ics" data-id="${item.id}">${isApple ? 'Apple Calendar' : 'Apple Calendar (.ics)'}</button>`;
  return `<details class="menu"><summary class="btn btn-outline">Add to calendar</summary>
    <div class="menu-list">${isApple ? file + web.join('') : web.join('') + file}</div></details>`;
}

function downloadIcs(id) {
  const item = ITEMS.find(i => i.id === Number(id)), d = item && mainDate(item);
  if (!d) return;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([buildIcs(item, d)], { type: 'text/calendar' }));
  link.download = `cultureq-${item.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  toast('Calendar file downloaded.');
}

/* ----- Calendar view ----- */
const dayKey = (item, d) => (d.allDay ? d.start : new Date(d.start).toLocaleDateString('en-CA', { timeZone: item.tz }));
/* Every calendar day a date covers: a multi-day event shows on each of its days, anything else on one (capped at 62 days). */
function dayKeys(item, d) {
  const first = dayKey(item, d);
  if (!d.end || !['event', 'session', 'start'].includes(d.role)) return [first];
  const last = d.allDay ? d.end : new Date(d.end).toLocaleDateString('en-CA', { timeZone: item.tz });
  const keys = [];
  for (let t = Date.parse(first + 'T00:00:00Z'); t <= Date.parse(last + 'T00:00:00Z') && keys.length < 62; t += 864e5) keys.push(new Date(t).toISOString().slice(0, 10));
  return keys.length ? keys : [first];
}

/* Opening the calendar with no month chosen: if this month holds none of the current results, jump to the first month that does. */
function showMatchesInCalendar() {
  if (S.F.month) return;
  const keys = currentResults().flatMap(i => i.dates.flatMap(d => dayKeys(i, d))).sort();
  const here = `${S.calMonth.getFullYear()}-${String(S.calMonth.getMonth() + 1).padStart(2, '0')}`;
  if (!keys.length || keys.some(k => k.startsWith(here))) return;
  const next = keys.find(k => k >= new Date().toLocaleDateString('en-CA')) || keys[0];
  S.calMonth = new Date(Number(next.slice(0, 4)), Number(next.slice(5, 7)) - 1, 1);
  S.calDay = '';
}

const CAL_LEGEND = Object.keys(CATEGORIES).map(c => `<span><i class="dot cat-${c}"></i>${CATEGORIES[c]}</span>`).join('');
const dayLabel = key => new Date(key + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

/* Month grid. Each day is one button: coloured dots show how many opportunities fall on it (and their
   categories), and tapping it lists them all underneath. Works the same with a finger, mouse or keyboard. */
function calendarHTML(items) {
  const year = S.calMonth.getFullYear(), month = S.calMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate(), pad = n => String(n).padStart(2, '0');
  const today = new Date().toLocaleDateString('en-CA'), byDay = new Map();
  items.forEach(i => i.dates.forEach(d => dayKeys(i, d).forEach(key => {
    if (!byDay.has(key)) byDay.set(key, new Map());
    byDay.get(key).set(i.id, i);                                  /* one entry per opportunity per day */
  })));
  let cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<div class="dow" aria-hidden="true">${d}</div>`).join('');
  cells += '<div></div>'.repeat(S.calMonth.getDay());
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${pad(month + 1)}-${pad(day)}`, here = [...(byDay.get(key) || new Map()).values()];
    const dots = here.slice(0, 4).map(i => `<i class="dot cat-${i.category}"></i>`).join('');
    const names = here.slice(0, 2).map(i => `<span class="chip-line cat-${i.category}" title="${esc(i.title)}"><i class="dot cat-${i.category}"></i>${esc(calWord(i))}</span>`).join('');
    cells += here.length
      ? `<button class="day has${key === today ? ' today' : ''}" data-act="cal-day" data-day="${key}" aria-pressed="${S.calDay === key}"
          aria-label="${dayLabel(key)}: ${plural(here.length, 'opportunity')}"><b>${day}</b>
          <span class="day-names">${names}${here.length > 2 ? `<span class="more">+${here.length - 2} more</span>` : ''}</span>
          <span class="day-dots">${dots}${here.length > 4 ? '<em>+</em>' : ''}</span></button>`
      : `<div class="day${key === today ? ' today' : ''}"><b>${day}</b></div>`;
  }
  const picked = S.calDay && byDay.has(S.calDay) ? [...byDay.get(S.calDay).values()] : [];
  const panel = picked.length
    ? `<h2 class="section-title" id="cal-day-title" tabindex="-1">${dayLabel(S.calDay)} · ${plural(picked.length, 'opportunity')}</h2>${cardsHTML(picked, S.calDay)}`
    : '<p class="muted cal-hint">Tap a day to see its opportunities.</p>';
  return `<div class="cal-head"><button class="btn btn-outline btn-sm" data-act="cal-prev" aria-label="Previous month">‹</button>
    <b>${S.calMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</b>
    <button class="btn btn-outline btn-sm" data-act="cal-next" aria-label="Next month">›</button></div>
    <div class="cal">${cells}</div><p class="legend" aria-hidden="true">${CAL_LEGEND}</p>${panel}${picked.length ? '' : agendaHTML(items)}`;
}

/* Everything with a date this month, in date order, as the same cards the list and map views use. */
function agendaHTML(items) {
  const prefix = `${S.calMonth.getFullYear()}-${String(S.calMonth.getMonth() + 1).padStart(2, '0')}`;
  const firstDay = item => item.dates.flatMap(d => dayKeys(item, d)).filter(k => k.startsWith(prefix)).sort()[0];
  const thisMonth = items.filter(firstDay).sort((a, b) => compare(firstDay(a), firstDay(b)));
  if (!thisMonth.length) return '<p class="muted" style="margin-top:1rem">Nothing this month.</p>';
  return `<h2 class="section-title">All month · ${plural(thisMonth.length, 'opportunity')}</h2>${cardsHTML(thisMonth)}`;
}

/* ----- Map view ----- */
/*
  Where the visitor is. Kept in memory only: never stored, never sent, gone when the
  page closes. A precise position is approximated to one decimal place (about 11 km) the
  moment it arrives, so nothing more exact than a neighbourhood-sized area ever exists
  here. Starts as the middle of their time zone.
*/
const ZONE_CITIES = {
  'America/New_York': [40.7, -74], 'America/Detroit': [42.3, -83], 'America/Chicago': [41.9, -87.6], 'America/Denver': [39.7, -105],
  'America/Phoenix': [33.4, -112], 'America/Los_Angeles': [34.05, -118.2], 'America/Anchorage': [61.2, -149.9], 'Pacific/Honolulu': [21.3, -157.9],
  'America/Toronto': [43.7, -79.4], 'America/Jamaica': [18, -76.8], 'America/Sao_Paulo': [-23.5, -46.6], 'Europe/London': [51.5, -0.1],
  'Europe/Paris': [48.9, 2.35], 'Africa/Lagos': [6.5, 3.4], 'Africa/Accra': [5.6, -0.2], 'Africa/Johannesburg': [-26.2, 28], 'Africa/Nairobi': [-1.3, 36.8]
};
const zoneLocation = () => { const c = ZONE_CITIES[userTz]; return c ? { lat: c[0], lon: c[1], precise: false } : null; };
S.loc = zoneLocation();

function distanceKm(a, b) {
  const rad = x => (x * Math.PI) / 180, dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
}
const hasPlace = i => i.setting !== 'online' && i.lat != null;
const awayKm = item => (S.loc && hasPlace(item) ? distanceKm(S.loc, { lat: item.lat, lon: item.lon }) : null);
function awayLabel(item) {
  const km = awayKm(item);
  if (km == null) return '';
  const miles = /-(US|GB|LR|MM)$/i.test(navigator.language || ''), n = Math.round(miles ? km * 0.621371 : km), unit = miles ? 'mi' : 'km';
  return n < 1 ? 'Under 1 ' + unit : `${n.toLocaleString('en-US')} ${unit}`;
}
/* Closest first; online opportunities and opportunities without a place follow in date order. */
function byDistance(items) {
  if (!S.loc) return items;
  const key = i => { const km = awayKm(i); return km == null ? Infinity : km; };
  return [...items].sort((a, b) => compare(key(a), key(b)) || compare(nextStart(a), nextStart(b)));
}
const LOCATION_BLUR = 10;  // coordinates are approximated to 1/10 of a degree
const blur = degrees => Math.round(degrees * LOCATION_BLUR) / LOCATION_BLUR;

function locate() {
  if (!navigator.geolocation) { toast('This device can’t share its location. Using your time zone.'); return; }
  track('locate');
  navigator.geolocation.getCurrentPosition(pos => {
    S.loc = { lat: blur(pos.coords.latitude), lon: blur(pos.coords.longitude), precise: true };
    refreshResults();
  }, err => toast(err && err.code === 1
    ? 'Location is blocked. Allow it in your browser settings to sort by distance.'
    : 'Couldn’t find your location. Using your time zone.'), { timeout: 10000, maximumAge: 600000 });
}

const inUS = i => i.lon >= -125 && i.lon <= -66 && i.lat >= 24 && i.lat <= 50;

/* Map views: Worldwide, the United States, one view for each other continent that has an opportunity, and Online.
   Every view is a window onto the same simplified outline. */
const US = 'United States';
const isUS = i => inUS(i) || (/, [A-Z]{2}$/.test(i.city) && !/, UK$/.test(i.city));
const CONTINENTS = {
  'North America': [-170, -50, 5, 75], 'South America': [-92, -30, -57, 14], Europe: [-25, 45, 34, 72],
  Africa: [-20, 52, -36, 38], Asia: [26, 150, -11, 78], Oceania: [110, 180, -48, 0]
};
function continentOf(i) {
  if (i.lon < -30) return i.lat >= 7.5 || i.lon < -92 ? 'North America' : 'South America';
  if (i.lon >= 110 && i.lat < -8 || i.lon >= 155) return 'Oceania';
  if (i.lon >= -20 && i.lon <= 52 && i.lat < 35) return 'Africa';
  if (i.lon >= -25 && i.lon <= 45 && i.lat >= 35) return 'Europe';
  return 'Asia';
}
const regionOf = i => isUS(i) ? US : continentOf(i);

/* A flat projection that fits a window of the world into a 710-unit-wide map. */
function projection([lonMin, lonMax, latMin, latMax], shapes = WORLD) {
  const k = Math.min(710 / (lonMax - lonMin), 420 / (latMax - latMin));
  const range = (min, max) => { const out = []; for (let v = Math.ceil(min / 10) * 10; v <= max; v += 10) out.push(v); return out; };
  return { w: 710, h: Math.round(k * (latMax - latMin)), x: lon => (lon - lonMin) * k, y: lat => (latMax - lat) * k,
           shapes, meridians: range(lonMin, lonMax), parallels: range(latMin, latMax) };
}
const WORLD_BOUNDS = [-170, 190, -58, 78];
const US_MAP = { w: 710, h: 400, x: lon => (lon + 125) * 11.4 + 20, y: lat => (49.8 - lat) * 14.6 + 15, shapes: [USC], meridians: [-120, -110, -100, -90, -80, -70], parallels: [30, 35, 40, 45] };

/* The window around a merged pin's cities: their bounding box, padded. Each deeper level zooms closer than the last (down to a
   fiftieth of a degree), so cities that sit side by side still separate. */
function zoomBounds(items, level) {
  const minLon = Math.max(.02, 6 / 3 ** (level - 1));
  const span = (values, min, lo, hi) => {
    const a = Math.min(...values), b = Math.max(...values), mid = (a + b) / 2, half = Math.max((b - a) * .7, min / 2);
    return [Math.max(lo, mid - half), Math.min(hi, mid + half)];
  };
  return [...span(items.map(i => i.lon), minLon, -180, 190), ...span(items.map(i => i.lat), minLon * 2 / 3, -58, 78)];
}

/* Map views for the items on show: Worldwide first, then the United States, other continents A to Z, and Online last.
   Each view lists only its own opportunities. Online opportunities have no place on the map, so that view has no pins. */
const ONLINE = 'online';
function mapRegions(placed, online) {
  const by = new Map();
  placed.forEach(i => { const r = regionOf(i); (by.get(r) || by.set(r, []).get(r)).push(i); });
  const places = [...by.keys()].sort((a, b) => (b === US) - (a === US) || compare(a, b));
  return [
    ...(placed.length ? [{ key: 'world', label: 'Worldwide', items: placed, map: projection(WORLD_BOUNDS) }] : []),
    ...places.map(p => ({ key: p, label: p, items: by.get(p), map: p === US ? US_MAP : projection(CONTINENTS[p]) })),
    ...(online.length ? [{ key: ONLINE, label: 'Online', items: online }] : [])
  ];
}

const outlinePath = m => m.shapes.map(poly => 'M' + poly.map(([lon, lat]) => `${m.x(lon).toFixed(1)} ${m.y(lat).toFixed(1)}`).join('L') + 'Z').join('');
const gridPath = m => m.meridians.map(l => `M${m.x(l).toFixed(1)} 0V${m.h}`).join('') + m.parallels.map(l => `M0 ${m.y(l).toFixed(1)}H${m.w}`).join('');

/* Cards for a picked pin. When the pin covers several cities, each city gets its own header, nearest city first. */
function cardsByLocation(pin) {
  if (pin.cities.size < 2) return cardsHTML(byDistance(pin.items));
  const sections = [...pin.cities].map(city => {
    const items = byDistance(pin.items.filter(i => i.city === city));
    const km = items.map(awayKm).filter(n => n != null);
    return { city, items, nearest: km.length ? Math.min(...km) : Infinity };
  }).sort((a, b) => a.nearest - b.nearest || a.city.localeCompare(b.city));
  return sections.map(s => `<h3 class="subhead place-head">${esc(s.city)} <span class="muted">· ${plural(s.items.length, 'opportunity')}${s.nearest < Infinity ? ' · ' + awayLabel(s.items[0]) + ' away' : ''}</span></h3>${cardsHTML(s.items)}`).join('');
}

const PIN_GAP = 24, US_PIN_GAP = 18, ZOOM_PIN_GAP = 18;   // pins closer than this (in map units) merge; phones raise it so dots stay thumb-sized
/* Map units to screen pixels: the map is 710 units wide and fills the page up to 1040px. */
const mapScale = () => Math.max(.3, Math.min((typeof innerWidth === 'number' ? innerWidth : 1080) - 40, 1040) / 710);

/* Online opportunities have no place on the map, so that view shows a globe with a network around it instead. */
function onlineArt(count) {
  const nodes = [[-210, -62], [-150, 58], [-70, -82], [80, -70], [160, 60], [215, -48]];
  return `<svg class="online-art" viewBox="0 0 710 300" role="img" aria-label="${plural(count, 'online opportunity')}. Join from anywhere.">
    <rect width="710" height="300" class="sea"/>
    <g transform="translate(355 118)" fill="none" stroke="var(--line-strong)" stroke-width="1.2">
      <circle r="150" stroke-opacity=".45"/><circle r="110" stroke-opacity=".6"/>
      ${nodes.map(([x, y]) => `<path d="M0 0L${x} ${y}" stroke-dasharray="4 5"/><circle cx="${x}" cy="${y}" r="9" fill="var(--gold)" stroke="var(--paper)" stroke-width="2.5"/>`).join('')}
      <circle r="62" fill="var(--paper)" stroke="var(--gold)" stroke-width="2"/>
      <ellipse rx="26" ry="62" stroke="var(--gold)"/><ellipse rx="52" ry="62" stroke="var(--gold)" stroke-opacity=".6"/>
      <path d="M-62 0H62M-54 -30H54M-54 30H54" stroke="var(--gold)"/>
    </g>
    <text x="355" y="252" class="online-title">Join from anywhere</text>
    <text x="355" y="278" class="online-sub">${plural(count, 'online opportunity')}</text>
  </svg>`;
}

function mapHTML(items) {
  /* Dots come from the opportunities on show: upcoming ones, or past ones when "Past" is ticked. */
  const placed = items.filter(i => i.setting !== 'online' && i.lat != null);
  const onlineItems = items.filter(i => i.setting === 'online');
  /* In-person or hybrid opportunities with no single place (placements across a country, say) have no dot; they are listed under "Location varies". */
  const unplaced = items.filter(i => i.setting !== 'online' && i.lat == null);
  const variesList = unplaced.length ? `<div class="near-bar"><h2 class="section-title">Location varies</h2></div>${cardsHTML(unplaced)}` : '';
  const regions = mapRegions(placed, onlineItems);
  if (!regions.length) return variesList;
  /* Open on the chosen view. With a single place, open on it; otherwise on the whole world. */
  const region = regions.find(r => r.key === S.mapScope) || (regions.length === 2 && placed.length ? regions[1] : regions[0]);
  const isWorld = region.key === 'world', isOnline = region.key === ONLINE, local = region.key === US;
  /* Zoomed in on a merged pin: only its cities, on a map fitted to them, so each city gets its own dot. */
  const level = S.zoom.length, zoomCities = level ? S.zoom[level - 1] : [];
  const zoomItems = isOnline ? [] : region.items.filter(i => zoomCities.includes(i.city));
  const zoomed = zoomItems.length > 0;
  const shown = zoomed ? zoomItems : region.items;
  const m = zoomed ? projection(zoomBounds(zoomItems, level), local ? [USC] : WORLD) : region.map;
  /* Sizes are set in screen pixels and converted to map units: small, fine dots (7.5px radius, 9.5px on phones) with a larger invisible tap area,
     spaced so neither dots nor tap areas overlap. */
  const k = mapScale(), px = n => Math.round(n / k * 10) / 10;
  const dotPx = k >= 1 ? 7.5 : 9.5, r = px(dotPx), tapR = px(dotPx * 1.5), countSize = px(dotPx * 1.35), nameSize = px(12);
  const gap = Math.max(zoomed ? ZOOM_PIN_GAP : local ? US_PIN_GAP : PIN_GAP, r * 2.7);

  /* One spot per city: opportunities in the same city share a spot (the middle of their venues), so a city never gets two dots.
     Then any city within a pin's width of an existing pin joins it, so pins never overlap and every one stays tappable.
     The U.S. map is drawn larger, so its pins merge over a shorter distance. A pin that merges several cities sits at the middle of them. */
  const spots = new Map();
  if (!isOnline) shown.forEach(i => (spots.get(i.city) || spots.set(i.city, { items: [] }).get(i.city)).items.push(i));
  spots.forEach(c => {
    c.lon = c.items.reduce((t, i) => t + i.lon, 0) / c.items.length;
    c.lat = c.items.reduce((t, i) => t + i.lat, 0) / c.items.length;
    c.x = m.x(c.lon); c.y = m.y(c.lat);
  });
  /* Merge the closest pair of dots until none is nearer than one dot-width, so no dots overlap whatever their order. */
  const groups = [...spots].map(([city, c]) => ({ key: String(c.items[0].id), x: c.x, y: c.y, cities: new Set([city]), items: [...c.items], spots: [c] }));
  for (let merging = true; merging;) {
    let best = null;
    groups.forEach((a, ai) => groups.slice(ai + 1).forEach(b => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < gap && (!best || d < best.d)) best = { a, b, d };
    }));
    merging = !!best;
    if (best) {
      const { a, b } = best;
      a.spots.push(...b.spots); a.items.push(...b.items); b.cities.forEach(c => a.cities.add(c));
      a.x = a.spots.reduce((t, c) => t + c.x, 0) / a.spots.length;
      a.y = a.spots.reduce((t, c) => t + c.y, 0) / a.spots.length;
      groups.splice(groups.indexOf(b), 1);
    }
  }
  const picked = groups.find(g => g.key === S.pin);
  /* Place each pin's name beside it, on the right or else the left, so no name overlaps another name or a pin.
     Busier pins choose first, and a name with nowhere to go is hidden (its pin and the list below still work). */
  const room = r + px(3);
  const boxes = groups.map(g => ({ g, x0: g.x - room, x1: g.x + room, y0: g.y - room, y1: g.y + room }));
  const hits = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
  const placedNames = [];
  [...groups].sort((a, b) => b.items.length - a.items.length).forEach(g => {
    g.label = g.cities.size > 1 ? g.cities.size + ' cities' : [...g.cities][0].split(',')[0];
    const w = Math.round(g.label.length * nameSize * .6) + 8, h = nameSize + 4, base = Math.round(nameSize * .35);
    const side = (x0, anchor, tx) => ({ x0, x1: x0 + w, y0: g.y - h / 2, y1: g.y + h / 2, anchor, tx, ty: g.y + base });
    /* Beside the dot first (right, then left), then above or below it. */
    const options = [
      side(g.x + room, 'start', g.x + room), side(g.x - room - w, 'end', g.x - room),
      { x0: g.x - w / 2, x1: g.x + w / 2, y0: g.y - room - h, y1: g.y - room, anchor: 'middle', tx: g.x, ty: g.y - room - 4 },
      { x0: g.x - w / 2, x1: g.x + w / 2, y0: g.y + room, y1: g.y + room + h, anchor: 'middle', tx: g.x, ty: g.y + room + h - 4 }
    ];
    const spot = options.find(o => o.x0 >= 0 && o.x1 <= m.w && o.y0 >= 0 && o.y1 <= m.h
      && !boxes.some(b => b.g !== g && hits(o, b)) && !placedNames.some(p => hits(o, p)));
    g.spot = spot || (g === picked ? options[0] : null);   // a chosen dot always shows its name
    if (spot) placedNames.push(spot);
  });
  /* A merged pin zooms in every time it is clicked, each level closer than the last, until its cities stand apart. */
  const canZoom = g => new Set(g.spots.map(c => c.lon + ',' + c.lat)).size > 1;
  const names = g => [...g.cities].join(' · ');

  const pinSvg = g => `<g class="pin${picked === g ? ' selected' : ''}" tabindex="0" role="button" data-act="pin" data-key="${esc(g.key)}"${canZoom(g) ? ` data-cities="${esc(JSON.stringify([...g.cities]))}"` : ''}
      aria-label="${esc(names(g))}: ${plural(g.items.length, 'opportunity')}${canZoom(g) ? '. Zooms in.' : ''}">
      <circle class="hit" cx="${g.x.toFixed(1)}" cy="${g.y.toFixed(1)}" r="${tapR}"/>
      <circle cx="${g.x.toFixed(1)}" cy="${g.y.toFixed(1)}" r="${r}"/>
      <text font-size="${countSize}" x="${g.x.toFixed(1)}" y="${(g.y + countSize * .35).toFixed(1)}">${g.items.length}</text>
      ${g.spot ? `<text class="label" font-size="${nameSize}" style="text-anchor: ${g.spot.anchor}" x="${g.spot.tx.toFixed(1)}" y="${g.spot.ty.toFixed(1)}">${esc(g.label)}</text>` : ''}</g>`;

  const tabs = regions.map(r => `<button type="button" class="chip" data-act="map-scope" data-scope="${esc(r.key)}" aria-pressed="${r === region}">${esc(r.label)} · ${r.items.length}</button>`).join('');
  const bar = `<figcaption class="map-bar"><div class="region-tabs" role="group" aria-label="Map view">${tabs}</div></figcaption>`;
  const svg = isOnline ? onlineArt(onlineItems.length) : `<svg viewBox="0 0 ${m.w} ${m.h}" role="group" aria-label="${esc(region.label)} map with ${groups.length} opportunity locations. All opportunities are also shown below.">
      <rect width="${m.w}" height="${m.h}" class="sea"/><path class="grid-lines" d="${gridPath(m)}"/><path class="land" d="${outlinePath(m)}"/>${groups.map(pinSvg).join('')}
    </svg>`;

  const sorted = byDistance(shown);
  const distanceNote = `<p class="muted">${S.loc ? `Closest first, from ${S.loc.precise ? 'your approximate location' : 'your time zone'}.` : 'Share your location to sort by distance.'}
      ${S.loc && S.loc.precise ? '' : '<button class="btn btn-outline btn-sm" data-act="locate">Use my location</button>'}
      <br>Approximated. Never saved or sent.</p>`;
  const heading = text => `<div class="near-bar"><h2 class="section-title">${esc(text)}</h2></div>`;
  let list;
  const zoomOut = zoomed ? '<button class="btn btn-outline btn-sm" data-act="zoom-out">Zoom out</button>' : '';
  if (picked) list = `<h2 class="section-title">${esc(names(picked))}<button class="btn btn-outline btn-sm" data-act="pin" data-key="">${zoomed ? 'All these cities' : 'Show all'}</button></h2>${cardsByLocation(picked)}`;
  else if (zoomed) list = `<h2 class="section-title">${esc([...new Set(zoomItems.map(i => i.city))].join(' · '))}${zoomOut}</h2>${cardsByLocation({ cities: new Set(zoomItems.map(i => i.city)), items: zoomItems })}`;
  else if (isOnline) list = heading('Online') + cardsHTML(onlineItems);
  else list = heading(isWorld ? 'Near you' : region.label) + distanceNote + cardsHTML(sorted)
    + (isWorld && onlineItems.length ? heading('Online') + cardsHTML(onlineItems) : '') + (isWorld ? variesList : '');

  return `<figure class="map${isWorld ? ' world' : ''}">${svg}${bar}</figure>${list}`;
}

/* =====================================================================
   7. VIEWS
   ===================================================================== */

const NAV = [['home', 'Home', 'home'], ['our', 'OurQueue', 'compass'], ['my', 'MyQueue', 'save'], ['submit', 'Submit', 'plus']];
function renderNav() {
  $('#nav').innerHTML = NAV.map(([view, label, ic]) => `<button data-act="go" data-view="${view}"${S.view === view ? ' aria-current="page"' : ''}>${icon(ic)}<span>${label}${view === 'my' && favs.size ? ` <b class="count">${favs.size}</b>` : ''}</span></button>`).join('');
}

/* ----- Home ----- */
/* Search suggestions drawn from what is actually listed. */
function searchHint() {
  const live = ITEMS.filter(i => !isPast(i));
  const ranked = values => {
    const counts = new Map();
    values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || compare(a[0], b[0])).map(([v]) => v);
  };
  const kinds = ranked(live.map(i => i.kind)), cities = ranked(live.filter(i => i.setting !== 'online').map(i => i.city.split(',')[0]));
  const words = [kinds[0] && kinds[0].toLowerCase(), cities[0]].filter(Boolean);
  return words.length === 2 ? `Try “${words[0]}” or “${words[1]}”` : 'Search opportunities';
}

const HOME_COUNT = 6;

/*
  Home shows one list, "Last call": every opportunity with a date in the next
  SOON_DAYS days (a deadline, or the start of an event), earliest first, with
  nothing hidden. Anything already under way counts. If the week is empty, the
  next HOME_COUNT dated opportunities are shown instead so the page is never bare.
*/
function homeSections() {
  const dated = ITEMS.filter(i => !isPast(i) && nextStart(i) < Infinity).sort(SORTERS.date);
  const week = dated.filter(isSoon);
  return { closing: week.length ? week : dated.slice(0, HOME_COUNT) };
}

function homeHTML() {
  const { closing } = homeSections();
  const upcoming = ITEMS.filter(i => !isPast(i));
  const section = (title, items) => (items.length ? `<h2 class="section-title">${title}</h2>${cardsHTML(items)}` : '');
  return `
    <section class="hero">
      <h1>Culture is capital.<br>Invest in it.</h1>
      <p class="lede">Find it. Save it. Never miss out.</p>
      <form class="hero-search" role="search" data-form="hero-search">
        <input type="search" name="q" enterkeyhint="search" aria-label="Search CultureQ" placeholder="${esc(searchHint())}">
        <button class="btn btn-gold">Search</button>
        <button type="button" class="btn btn-outline" data-act="open-filters">Filters</button>
      </form>
      <div class="chips" role="group" aria-label="Quick searches">
        <button class="chip" data-act="chip" data-chip="new">New</button>
        <button class="chip" data-act="chip" data-chip="open">Open</button>
        <button class="chip" data-act="chip" data-chip="soon">This week</button>
        <button class="chip" data-act="chip" data-chip="free">Free</button>
        <button class="chip" data-act="chip" data-chip="online">Online</button>
      </div>
      <p class="muted hero-stats">${upcoming.length} opportunities · ${upcoming.filter(isOpen).length} open now · ${upcoming.filter(isSoon).length} this week</p>
    </section>
    <section class="how" aria-labelledby="how-title">
      <h2 class="section-title" id="how-title">How it works</h2>
      <ol class="steps">
        <li><b>Find</b><span>Search for an opportunity, or filter by type, month, place, stage, community, field, or cost.</span></li>
        <li><b>Save</b><span>Tap the diamond to add an opportunity to MyQueue.</span></li>
        <li><b>Stay ahead</b><span>Set a reminder for any date, or an alert for new matches.</span></li>
        <li><b>Go</b><span>Click a link to go to that organizer’s own page.</span></li>
      </ol>
      <h3 class="subhead">Your four tabs</h3>
      <div class="tab-guide">
        <button type="button" data-act="go" data-view="home"><b>Home</b><span>This week’s deadlines and opportunities, plus quick search.</span></button>
        <button type="button" data-act="go" data-view="our"><b>OurQueue</b><span>Every opportunity, as a list, calendar, or map.</span></button>
        <button type="button" data-act="go" data-view="my"><b>MyQueue</b><span>Your saved opportunities, reminders, and alerts.</span></button>
        <button type="button" data-act="go" data-view="submit"><b>Submit</b><span>Share an opportunity, support the mission, or give feedback.</span></button>
      </div>
    </section>
    ${section('Last call', closing)}`;
}

/* ----- Search, filters and results (shared by OurQueue and MyQueue) ----- */
function emptyHTML(title, text, actions) {
  return `<div class="card empty"><h3>${title}</h3><p>${text}</p><div class="actions">${actions}</div></div>`;
}

function listBody(items) {
  return cardsHTML(items.slice(0, S.shown))
    + (items.length > S.shown ? '<p style="text-align:center;margin-top:1.2rem"><button class="btn btn-outline" data-act="more">Load more</button></p>' : '');
}

function resultsHTML() {
  const my = S.view === 'my', items = currentResults();
  const tabs = [['list', 'List'], ['calendar', 'Calendar'], ['map', 'Map']]
    .map(([m, text]) => `<button data-act="mode" data-mode="${m}" aria-pressed="${S.mode === m}">${text}</button>`).join('');
  const row = `<div class="view-row"><div class="tabs" role="group" aria-label="View">${tabs}</div>
    <span class="muted" aria-live="polite">${items.length} result${items.length === 1 ? '' : 's'}</span>
    ${my ? '' : `<button class="btn btn-outline btn-sm" data-act="new-alert" data-from="search">${icon('bell')}Get alerts</button>`}</div>`;
  if (!items.length) return row + emptyHTML('Nothing here yet', 'Loosen a filter or two.', '<button class="btn" data-act="clear">Clear all</button>');
  return row + (S.mode === 'calendar' ? calendarHTML(items) : S.mode === 'map' ? mapHTML(items) : listBody(items));
}

/* Removable chips for the filters currently applied. */
function activeFiltersHTML() {
  const chips = Object.keys(FACETS).filter(k => S.F[k]).map(k => [k, FACETS[k].text(S.F[k])]);
  if (S.F.past) chips.push(['past', 'Past']);
  return chips.length
    ? `<div class="chips" role="group" aria-label="Active filters">${chips.map(([k, text]) => `<button class="chip" data-act="remove-filter" data-key="${k}" aria-label="Remove filter: ${esc(text)}">${esc(text)}${icon('close')}</button>`).join('')}</div>` : '';
}

function searchBlockHTML() {
  const active = activeFilterCount(), total = currentResults().length;
  const selects = SELECT_KEYS.map(key => `<label>${FACETS[key].label}<select data-filter="${key}">${optionsFor(key)}</select></label>`).join('');
  const sortOption = (value, text) => `<option value="${value}"${S.sort === value ? ' selected' : ''}>${text}</option>`;
  const check = (key, checked, text) => `<label class="check"><input type="checkbox" data-filter="${key}"${checked ? ' checked' : ''}>${text}</label>`;
  return `
    <form class="toolbar" role="search" data-form="search">
      <input type="search" id="q" value="${esc(S.q)}" placeholder="${esc(searchHint())}" aria-label="Search">
      <select id="sort" aria-label="Sort">${sortOption('date', 'Date')}${sortOption('deadline', 'Deadline')}${sortOption('title', 'A–Z')}</select>
      <button type="button" class="btn ${S.filtersOpen || active ? 'btn-gold' : 'btn-outline'}" data-act="toggle-filters" aria-expanded="${S.filtersOpen}" aria-controls="filters">Filters${active ? ` (${active})` : ''}</button>
    </form>
    <div class="filters" id="filters" tabindex="-1"${S.filtersOpen ? '' : ' hidden'}>
      <div class="filter-grid">${selects}</div>
      <div class="filters-foot">
        ${check('new', S.F.new, 'New')}${check('open', S.F.open, 'Open now')}${check('soon', S.F.soon, 'This week')}${check('past', S.F.past, 'Past')}
        <button type="button" class="btn btn-outline btn-sm" data-act="clear">Clear all</button>
        <button type="button" class="btn btn-gold" data-act="close-filters">Show ${total} result${total === 1 ? '' : 's'}</button>
      </div>
    </div>
    ${activeFiltersHTML()}
    <div id="results">${resultsHTML()}</div>`;
}

/* ----- MyQueue: account, saved opportunities and alerts ----- */
function savedTabHTML() {
  if (!favs.size) {
    return emptyHTML('Your queue’s empty', 'Tap the diamond on any opportunity to save it here.',
      '<button class="btn" data-act="go" data-view="our">Browse OurQueue</button><button class="btn btn-outline" data-act="new-alert">' + icon('bell') + 'Set up alerts</button>');
  }
  return notifyPromptHTML() + searchBlockHTML();
}

function myQueueHTML() {
  const tab = ['alerts', 'reminders'].includes(S.tab) ? S.tab : 'saved';
  const button = (id, text, count) => `<button data-act="tab" data-tab="${id}" aria-pressed="${tab === id}">${text}${count ? ` (${count})` : ''}</button>`;
  const body = tab === 'alerts' ? alertsTabHTML() : tab === 'reminders' ? remindersTabHTML() : savedTabHTML();
  return `<h1 class="page-title">MyQueue</h1>${accountCardHTML()}
    <div class="tabs my-tabs" role="group" aria-label="MyQueue sections">${button('saved', 'Saved', favs.size)}${button('alerts', 'Alerts', getAlerts().length)}${button('reminders', 'Reminders', activeReminders().length)}</div>
    ${body}`;
}

function browseHTML() {
  return S.view === 'my' ? myQueueHTML() : `<h1 class="page-title">OurQueue</h1>${searchBlockHTML()}`;
}
const refreshResults = () => { const box = $('#results'); if (box && S.view !== 'home') box.innerHTML = resultsHTML(); else render(); };

/* ----- Submit (a link is all we need) and optional contribution ----- */
const AMOUNTS = [5, 10, 25, 50];

/*
  CONTRIBUTIONS GO STRAIGHT TO YOUR STRIPE ACCOUNT. This site never sees a card number.
  In your Stripe dashboard (Payment Links) make one link per amount, plus one
  "customer chooses the price" link for other amounts, and paste them below. Stripe
  hosts the checkout, takes the payment and pays out to the bank account on your
  Stripe account. Only Stripe's own addresses are accepted here. Stripe shows you
  each donor's receipt details in your dashboard; this site stores nothing.
*/
const CONTRIBUTE_LINKS = { 5: '', 10: '', 25: '', 50: '', other: '' };
const contributeLink = amount => {
  const url = CONTRIBUTE_LINKS[AMOUNTS.includes(amount) ? amount : 'other'] || '';
  return /^https:\/\/(donate|buy)\.stripe\.com\/[\w-]+$/.test(url) ? url : '';
};

/* Private feedback: sent to your reporting service, readable only with your owner key. */
/* No limit in the form. The service only refuses something absurd (over 20,000 characters, many pages) so one note cannot fill the database. */
const FEEDBACK_KINDS = ['Idea', 'Problem', 'Praise'], FEEDBACK_LIMIT = 20000;

async function sendFeedback(form) {
  const text = fieldOf(form, 'fb-text').trim(), err = $('#fb-error');
  err.textContent = '';
  if (text.length < 3 && !S.fbRating) { err.textContent = 'Tap a diamond or write a few words.'; return; }
  if (text && text.length < 3) { err.textContent = 'Add a few more words, or clear the note and just send your diamonds.'; return; }
  if (text.length > FEEDBACK_LIMIT) { err.textContent = 'That’s a lot! Please split it into two notes.'; return; }
  if (!ANALYTICS_URL) { toast('Preview: nothing was sent.'); return; }
  const button = form.querySelector('.btn'), label = button.textContent;
  button.disabled = true;
  button.textContent = 'Sending…';
  try {
    const res = await fetch(`${ANALYTICS_URL}/feedback`, { method: 'POST', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ kind: S.fbKind, rating: S.fbRating, text }) });
    if (!res.ok) throw new Error(res.status);
    S.fbSent = true;
    S.fbRating = 0;
    render();
    return;
  } catch (e) { err.textContent = 'Could not send. Your note is still here. Try again in a moment.'; }
  button.disabled = false;
  button.textContent = label;
}

const FEEDBACK_PROMPTS = { Idea: 'What would make CultureQ better?', Problem: 'What went wrong, and where?', Praise: 'What’s working well for you?' };
const RATING_WORDS = ['Not yet', 'Needs work', 'It’s okay', 'Good', 'Great', 'Love it'];   // index = number of diamonds

function feedbackHTML() {
  if (S.fbSent) {
    return `<section class="card submit-card" aria-labelledby="fb-title"><h3 id="fb-title">You’re a legend.</h3>
      <p>Sent privately, with no name or contact info. Every note gets read.</p>
      <button class="btn btn-outline" data-act="fb-again">Send another</button></section>`;
  }
  return `<form class="card submit-card feedback-form" data-form="feedback" novalidate>
    <h3><label for="fb-text">Share your feedback</label></h3>
    <p>Anonymous and private. Rate it, write it, or both.</p>
    <div class="rating-block">
      <p class="rating-title" id="fb-rating-label">Rate CultureQ <small>(optional)</small></p>
      <div class="rating" role="radiogroup" aria-labelledby="fb-rating-label">
        ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="star" role="radio" data-act="fb-rate" data-n="${n}" aria-checked="${S.fbRating === n}" aria-label="${n} of 5, ${RATING_WORDS[n]}">${n <= S.fbRating ? '◆' : '◇'}</button>`).join('')}
      </div>
      <p class="muted rating-hint" id="fb-rating-hint" aria-live="polite">${S.fbRating ? RATING_WORDS[S.fbRating] : 'More diamonds = you like it more. 1 is “needs work”, 5 is “love it”.'}</p>
    </div>
    <div class="chips" role="group" aria-label="Kind of feedback">${FEEDBACK_KINDS.map(k => `<button type="button" class="chip" data-act="fb-kind" data-kind="${k}" aria-pressed="${S.fbKind === k}">${k}</button>`).join('')}</div>
    <textarea id="fb-text" rows="5" placeholder="${FEEDBACK_PROMPTS[S.fbKind]}" aria-describedby="fb-error" required></textarea>
    <div class="actions"><button class="btn btn-gold">Send</button></div>
    <span class="error" id="fb-error" role="alert"></span>
    <p class="muted note">Share only what you’re comfortable with. Leave out personal details unless you want us to see them.${ANALYTICS_URL ? '' : ' Preview: nothing is sent yet.'}</p>
  </form>`;
}

function submitHTML() {
  return `
    <h1 class="page-title">Contribute to CultureQ</h1>
    <form class="card submit-card" data-form="submit" novalidate>
      <h3><label for="s-link">Official link</label></h3>
      <p class="muted">Know one we missed? Send the link.</p>
      <div class="inline-form"><input id="s-link" type="text" inputmode="url" enterkeyhint="send" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" placeholder="example.org/apply" aria-describedby="s-error"><button class="btn btn-gold">Send</button></div>
      <span class="error" id="s-error" role="alert"></span>
      <p class="muted note">Every find is verified on the organizer’s own page before it joins OurQueue.${ANALYTICS_URL ? '' : ' Preview: nothing is sent yet.'}</p>
    </form>
    <div id="submit-done"></div>
    <section class="card contribution submit-card" aria-labelledby="contribution-title">
      <h3 id="contribution-title">Support the mission</h3>
      <p>Increasing our access to cultural capital. Optional, and it never affects an opportunity.</p>
      <div class="chips" role="group" aria-label="Contribution amount">${AMOUNTS.map(a => `<button class="chip" data-act="contribution" data-amount="${a}" aria-pressed="${S.amount === a}">$${a}</button>`).join('')}</div>
      <div class="inline-form"><input id="contribution-custom" type="number" min="1" inputmode="numeric" placeholder="Other amount" aria-label="Other amount in dollars"><button class="btn btn-gold" id="contribute-btn" data-act="contribute">Contribute $${S.amount}</button></div>
      <p class="muted note">${contributeLink(S.amount) ? 'Secure checkout by Stripe. Your card never touches this site.' : 'Preview: nothing is charged.'}</p>
    </section>
    ${feedbackHTML()}`;
}

/*
  LINK VETTING DESIGN
  A submitted link reaches the public site only after it has been scanned by a
  server and approved by a person, and nothing about the submitter is kept.

  This preview runs steps 1 and 2 in the browser. Steps 3 to 6 need a server and
  are described here so the page and the server can be built to match.

    1. Receive      Checks below (scheme, length, credentials, look-alike names,
                    shorteners, file downloads). The server repeats them; the
                    browser is never trusted.
    2. Rate limit   A cap per network address per hour, kept only as a short-lived
                    hashed counter, and duplicates of a known link are dropped.
    3. Resolve      Fetched by an isolated worker: no cookies or sign-in, 10 second
                    timeout, 2 MB cap, at most 3 redirects, private and internal
                    addresses refused. A final host that differs from the submitted
                    one is shown to the reviewer.
    4. Scan         Safe-browsing and reputation lookups; downloads, password
                    fields and card fields are rejected.
    5. Extract      Title, dates, price and location pulled from the page text into
                    a draft shown beside the live page. Nothing is posted
                    automatically.
    6. Review       A person approves, edits or rejects. Posted links are re-scanned
                    daily and hidden on any failure.

  States: received > scanning > needs review > posted > hidden, or rejected.
  Anonymity: no names, emails or accounts; the address hash expires within an hour
  and is never stored with a submission; contributions share no data with submissions.
*/
const SUBMIT_LIMIT = 5;           // links per visit, a stand-in for the server's hourly cap
const sentLinks = new Set();      // links sent this visit, kept in memory only

/* A link as "host/path" without scheme, "www." or trailing slash, so near-duplicates match. */
const linkKey = url => (url.hostname.replace(/^www\./, '') + url.pathname).replace(/\/+$/, '').toLowerCase();

/*
  Link safety. A submitted link is only ever treated as text: it is never opened,
  fetched, or turned into a clickable link here. It must pass every check below
  before it is accepted. These checks catch the common tricks; a live service would
  also scan the page itself before anything is posted.
*/
const LINK_MAX_LENGTH = 2048;
const SHORTENERS = /^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly|shorturl\.at|tiny\.cc|rb\.gy|lnkd\.in)$/;
const RISKY_FILE = /\.(exe|msi|apk|dmg|pkg|bat|cmd|com|scr|jar|js|vbs|ps1|sh|lnk|iso|zip|rar|7z|docm|xlsm|pptm)$/i;
const LOCAL_HOST = /(^localhost$|\.(local|localhost|internal|lan|home|corp)$)/;

/* Returns { url } for a link that passes every check, or { error } saying why not. */
function checkLink(raw) {
  const text = String(raw || '').trim();
  if (!text) return { error: 'Enter the official link, like example.org/apply' };
  if (text.length > LINK_MAX_LENGTH) return { error: 'That link is too long.' };
  if (/[\s\u0000-\u001f\u007f]/.test(text)) return { error: 'Links can’t contain spaces or hidden characters.' };
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(text);
  if (scheme && !/^https?$/i.test(scheme[1]) && !/^[a-z][a-z\d+.-]*:\d/i.test(text)) return { error: 'Only web links (http or https) are accepted.' };
  let url;
  try { url = new URL(/^https?:\/\//i.test(text) ? text : 'https://' + text.replace(/^\/\//, '')); } catch { return { error: 'That doesn’t look like a web address.' }; }
  const host = url.hostname.toLowerCase();
  if (url.username || url.password) return { error: 'Links with a name or password in them aren’t accepted.' };
  if (!/^[a-z\d-]+(\.[a-z\d-]+)*\.[a-z]{2,}$/.test(host)) return { error: /^[\d.]+$|:/.test(host) ? 'Use the organizer’s website name, not a number.' : 'That doesn’t look like a web address.' };
  if (host.split('.').some(label => label.startsWith('xn--'))) return { error: 'Look-alike (international) web addresses aren’t accepted.' };
  if (LOCAL_HOST.test(host)) return { error: 'That address isn’t a public website.' };
  if (SHORTENERS.test(host)) return { error: 'Shortened links hide where they go. Paste the full official link.' };
  if (url.port && !['80', '443'].includes(url.port)) return { error: 'That address uses an unusual port.' };
  if (RISKY_FILE.test(url.pathname)) return { error: 'That link points to a file download, not a web page.' };
  return { url };
}

/* Kept for callers that only need the URL: the URL, or null when the link is rejected. */

function handleSubmit() {
  const { url, error } = checkLink($('#s-link').value);
  const known = url && (sentLinks.has(linkKey(url)) || ITEMS.some(i => i.links.some(l => { const u = checkLink(l.url).url; return u && linkKey(u) === linkKey(url); })));
  const message = error || (known && 'We already have that link.') || (url && sentLinks.size >= SUBMIT_LIMIT && 'That’s the limit for now. Please try again later.') || '';
  $('#s-error').textContent = message;
  if (!url || message) return;
  sentLinks.add(linkKey(url));
  track('submit');
  $('#submit-done').innerHTML = `<div class="card submit-card"><h3>Link passed our safety checks</h3><p class="muted">${esc(url.hostname)} · It would be reviewed before posting. Preview only: nothing was sent.</p></div>`;
  $('#s-link').value = '';
}

function updateContribution() {
  document.querySelectorAll('[data-act="contribution"]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.amount) === S.amount)));
  const button = $('#contribute-btn');
  if (button) button.textContent = `Contribute $${S.amount}`;
}

/* =====================================================================
   9. ENGAGEMENT (ANONYMOUS COUNTS) AND INSIGHTS
   Measures how the app is used without identifying anyone.

   What is counted: how many times each thing happened (visit, search, open,
   save, reminder, link to the official page …), plus three coarse labels:
   operating system, screen size class and browser-or-installed-app.
   What is never collected: names, contacts, accounts, search words, filter
   choices, locations, network addresses, or anything that links two events
   to one person. "Returning" is one flag in the visitor's own storage.

   Counts are always kept on the visitor's own device (the "This device" view).
   They are also sent to a reporting service only when ANALYTICS_URL is set,
   and never when the browser sends Do Not Track or Global Privacy Control.
   analytics-worker.js is a ready-made service (Cloudflare Worker + D1).
   ===================================================================== */

const ANALYTICS_URL = '';   // e.g. 'https://stats.example.org'. Empty: nothing leaves the device.

const EVENT_NAMES = ['visit_new', 'visit_return', 'engaged', 'search', 'filter', 'open', 'outbound', 'save', 'reminder', 'alert',
  'submit', 'locate', 'view_list', 'view_calendar', 'view_map'];
const ACTION_EVENTS = ['search', 'filter', 'open', 'outbound', 'save', 'reminder', 'alert', 'submit', 'locate'];
const ENGAGING_EVENTS = ['search', 'open', 'outbound', 'save', 'reminder', 'alert', 'submit'];  // the first one makes a visit "engaged"
const ITEM_EVENTS = ['open', 'outbound', 'save', 'reminder'];
const INSIGHT_RANGES = [7, 30, 90];
const TREND_DAYS = 14;

/* Coarse device facts only. */
function platform() {
  const ua = navigator.userAgent || '';
  const hint = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  const iPadAsMac = /mac/i.test(hint) && navigator.maxTouchPoints > 1;
  const os = /android/i.test(ua) ? 'android'
    : /iphone|ipad|ipod/i.test(ua) || iPadAsMac ? 'ios'
    : /win/i.test(hint) ? 'windows'
    : /mac/i.test(hint) ? 'mac'
    : /linux|cros/i.test(hint + ua) ? 'linux' : 'other';
  const display = typeof screen === 'undefined' ? {} : screen;
  const shortSide = Math.min(display.width || 1024, display.height || 1024);   // no screen information: call it a desktop
  let installed = false;
  try { installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch { /* ignore */ }
  return { os, size: shortSide < 600 ? 'phone' : shortSide < 900 ? 'tablet' : 'desktop', mode: installed ? 'app' : 'browser' };
}

const doNotTrack = () => navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;

/* Sends one anonymous count. Reporting can fail silently; it must never affect the page. */
function report(name, itemId) {
  if (!ANALYTICS_URL || doNotTrack()) return;
  const body = JSON.stringify({ e: name, ...platform(), ...(ITEM_EVENTS.includes(name) && itemId ? { item: Number(itemId) } : {}) });
  try {
    const queued = navigator.sendBeacon && navigator.sendBeacon(ANALYTICS_URL + '/e', new Blob([body], { type: 'text/plain' }));
    if (!queued) fetch(ANALYTICS_URL + '/e', { method: 'POST', body, keepalive: true, mode: 'no-cors' }).catch(() => {});
  } catch { /* ignore */ }
}

/* Counts on this device since a date, plus the optional report. */
function tally(name, itemId) {
  const ledger = store.get('activity', null) || { since: new Date().toISOString().slice(0, 10), counts: {} };
  ledger.counts[name] = (ledger.counts[name] || 0) + 1;
  store.set('activity', ledger);
  report(name, itemId);
}

let sessionEngaged = false;
function track(name, itemId) {
  if (!EVENT_NAMES.includes(name)) return;
  tally(name, itemId);
  if (!sessionEngaged && ENGAGING_EVENTS.includes(name)) { sessionEngaged = true; tally('engaged'); }
}

/* One visit per browser session; new or returning from a single flag kept on the device. */
function trackVisit() {
  try {
    if (sessionStorage.getItem('visit')) return;
    sessionStorage.setItem('visit', '1');
  } catch { /* storage blocked: every load counts as a visit */ }
  const returning = store.get('seen', false);
  store.set('seen', true);
  tally(returning ? 'visit_return' : 'visit_new');
}

/* ----- Turning counts into numbers people can read ----- */
/*
  data = { days: { 'YYYY-MM-DD': { event: count } },
           platforms: [{ os, size, mode, n }],            visits only
           items: { '<id>': { open, outbound, save, reminder } } }
*/
function summarize(data) {
  const days = data.days || {};
  const total = name => Object.values(days).reduce((n, day) => n + (day[name] || 0), 0);
  const visits = total('visit_new') + total('visit_return');
  const actions = ACTION_EVENTS.reduce((n, name) => n + total(name), 0);
  const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);
  const share = key => {
    const groups = {};
    (data.platforms || []).forEach(p => { groups[p[key]] = (groups[p[key]] || 0) + p.n; });
    const sum = Object.values(groups).reduce((a, b) => a + b, 0);
    return Object.entries(groups).sort((a, b) => b[1] - a[1]).map(([label, n]) => ({ label, n, pct: percent(n, sum) }));
  };
  const trend = Array.from({ length: TREND_DAYS }, (_, i) => {
    const day = new Date(Date.now() - (TREND_DAYS - 1 - i) * 864e5).toISOString().slice(0, 10);
    const counts = days[day] || {};
    return { day, n: (counts.visit_new || 0) + (counts.visit_return || 0) };
  });
  const top = Object.entries(data.items || {})
    .map(([id, c]) => ({ item: ITEMS.find(i => i.id === Number(id)), opens: c.open || 0, outbound: c.outbound || 0, saves: (c.save || 0) + (c.reminder || 0) }))
    .filter(row => row.item)
    .sort((a, b) => b.outbound - a.outbound || b.opens - a.opens || b.saves - a.saves)
    .slice(0, 5);
  /* Interest = opens + saves + reminders + clicks to the official page, summed per listing, then grouped by what the listing is. */
  const rows = Object.entries(data.items || {}).map(([id, c]) => ({ item: ITEMS.find(i => i.id === Number(id)), score: (c.open || 0) + (c.save || 0) + (c.reminder || 0) + (c.outbound || 0) })).filter(r => r.item);
  const interest = rows.reduce((n, r) => n + r.score, 0);
  const by = pick => {
    const groups = new Map();
    rows.forEach(r => [].concat(pick(r.item)).filter(Boolean).forEach(k => groups.set(k, (groups.get(k) || 0) + r.score)));
    return [...groups].filter(([, n]) => n).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, n]) => ({ label, n, pct: percent(n, interest) }));
  };
  const live = ITEMS.filter(i => !isPast(i));
  const gaps = Object.keys(CATEGORIES).map(key => {
    const supply = percent(live.filter(i => i.category === key).length, live.length);
    const demand = percent(rows.filter(r => r.item.category === key).reduce((n, r) => n + r.score, 0), interest);
    return { label: CATEGORIES[key], supply, demand, gap: demand - supply };
  }).sort((a, b) => b.gap - a.gap);
  const per100 = name => (visits ? Math.round((total(name) / visits) * 100) : 0);
  const funnel = [['Visits', 100], ['Engaged', percent(total('engaged'), visits)], ['Opened an opportunity', per100('open')], ['Saved or set a reminder', per100('save') + per100('reminder')], ['Went to the official page', per100('outbound')]];
  const views = ['list', 'calendar', 'map'].map(v => ({ label: v[0].toUpperCase() + v.slice(1), n: total('view_' + v) }));
  const segments = {
    interest,
    category: by(i => CATEGORIES[i.category]), kind: by(i => i.kind), field: by(i => i.industry), community: by(i => i.identities), level: by(i => i.audience),
    cost: by(i => (i.price === 0 ? 'Free' : i.price == null ? 'Price not listed' : 'Paid')), setting: by(i => (i.setting === 'online' ? 'Online' : 'In person'))
  };
  return {
    visits, returningPct: percent(total('visit_return'), visits), engagedPct: percent(total('engaged'), visits),
    perVisit: visits ? Math.round((actions / visits) * 10) / 10 : 0,
    actions: [['Searches', 'search'], ['Opportunities opened', 'open'], ['Saved', 'save'], ['Reminders set', 'reminder'], ['Alerts created', 'alert'],
      ['Went to the official page', 'outbound'], ['Links submitted', 'submit']].map(([label, name]) => ({ label, n: total(name) })),
    trend, os: share('os'), size: share('size'), mode: share('mode'), top, segments, gaps, funnel, views, alerts: total('alert')
  };
}

/* What this device has done, shown when no reporting service is connected. */
function localData() {
  const ledger = store.get('activity', null) || { since: new Date().toISOString().slice(0, 10), counts: {} };
  const here = platform();
  const visits = (ledger.counts.visit_new || 0) + (ledger.counts.visit_return || 0);
  return { days: { [new Date().toISOString().slice(0, 10)]: ledger.counts }, platforms: visits ? [{ ...here, n: visits }] : [], items: {} };
}

const PLATFORM_LABELS = { ios: 'iOS', android: 'Android', windows: 'Windows', mac: 'macOS', linux: 'Linux', other: 'Other', phone: 'Phone', tablet: 'Tablet', desktop: 'Desktop', app: 'Installed app', browser: 'Browser' };
const bar = (label, n, max, suffix = '') => `<div class="bar-row"><span>${esc(label)}</span><span class="bar-track"><span class="bar-fill" style="width:${max ? Math.max(2, Math.round((n / max) * 100)) : 0}%"></span></span><b>${n.toLocaleString()}${suffix}</b></div>`;
const kpi = (value, label, hint) => `<div class="kpi"><b>${value}</b><span>${label}</span><small class="muted">${hint}</small></div>`;

/* Plain-language takeaways from the numbers. Says so when there is not enough activity to say anything. */
function takeaways(m) {
  if (m.segments.interest < 20) return ['Not enough activity yet. Takeaways appear after about 20 opens, saves, and clicks.'];
  const out = [], s = m.segments, gap = m.gaps[0], top = (rows, what) => (rows[0] ? `${rows[0].label} (${rows[0].pct}% of interest)` : what);
  if (gap && gap.gap >= 10) out.push(`Add more ${gap.label}: it gets ${gap.demand}% of interest but is ${gap.supply}% of the opportunities.`);
  const lead = m.funnel[4][1], opened = m.funnel[2][1];
  if (opened >= 20 && lead < opened / 4) out.push('Many people open an opportunity but few go to the official page. Check that each description answers cost, date, and who it is for.');
  if (m.returningPct < 20 && m.visits >= 20) out.push('Few visitors come back. Alerts and reminders are the way to bring them back: promote them on each opportunity.');
  const mobile = m.size.find(r => r.label === 'phone');
  if (mobile && mobile.pct >= 60) out.push(`${mobile.pct}% of visits are on phones. Test every change on a phone first.`);
  out.push(`Strongest audience: ${top(s.community, 'not enough data')}. Strongest field: ${top(s.field, 'not enough data')}. Those are your most natural sponsor and partner categories.`);
  return out;
}

function insightsBody(data, { local = false } = {}) {
  const m = summarize(data);
  const maxAction = Math.max(1, ...m.actions.map(a => a.n)), maxDay = Math.max(1, ...m.trend.map(t => t.n));
  const group = rows => (rows.length ? rows.map(r => bar(PLATFORM_LABELS[r.label] || r.label, r.pct, 100, '%')).join('') : '<p class="muted">No visits yet.</p>');
  return `
    ${local ? '<p class="card note-card">Showing this device only. No reporting service is connected, so visits from other people and devices are not counted.</p>' : ''}
    <div class="kpis">
      ${kpi(m.visits.toLocaleString(), 'Visits', `${m.returningPct}% were returning visitors`)}
      ${kpi(m.engagedPct + '%', 'Engaged visits', 'Searched, opened, saved, or set a reminder')}
      ${kpi(m.perVisit, 'Actions per visit', 'Searches, opens, saves, reminders, and clicks')}
      ${kpi(m.actions[5].n.toLocaleString(), 'Went to the official page', 'The outcome that matters most')}
    </div>
    <h2 class="section-title">What to do next</h2>
    <ul class="takeaways">${takeaways(m).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    <h2 class="section-title">From visit to official page</h2>
    <p class="muted">Actions per 100 visits (one visit can open several opportunities). A big drop between two steps shows what to improve.</p>
    <div class="bars">${m.funnel.map(([label, n]) => bar(label, n, 100)).join('')}</div>
    <h2 class="section-title">Visits, last ${TREND_DAYS} days</h2>
    <div class="trend" role="img" aria-label="Visits per day">${m.trend.map(t => `<span title="${t.day}: ${t.n}" style="height:${Math.max(3, Math.round((t.n / maxDay) * 100))}%"></span>`).join('')}</div>
    <h2 class="section-title">What people did</h2>
    <div class="bars">${m.actions.map(a => bar(a.label, a.n, maxAction)).join('')}</div>
    <div class="split">
      <div><h2 class="section-title">Device</h2><div class="bars">${group(m.os)}</div></div>
      <div><h2 class="section-title">Screen</h2><div class="bars">${group(m.size)}</div></div>
      <div><h2 class="section-title">Browser or app</h2><div class="bars">${group(m.mode)}</div></div>
    </div>
    <h2 class="section-title">How people browse</h2>
    <div class="bars">${m.views.map(v => bar(v.label, v.n, Math.max(1, ...m.views.map(x => x.n)))).join('')}</div>
    ${m.segments.interest ? `<h2 class="section-title">What people want</h2>
      <p class="muted">Share of interest (opens, saves, reminders, and clicks). This is what a sponsor or partner would ask for: who your audience is and what they chase.</p>
      <div class="split">${[['Category', 'category'], ['Kind', 'kind'], ['Field', 'field'], ['For', 'community'], ['Stage', 'level'], ['Cost', 'cost'], ['Setting', 'setting']]
        .map(([title, key]) => m.segments[key].length ? `<div><h3 class="subhead">${title}</h3><div class="bars">${m.segments[key].map(r => bar(r.label, r.pct, 100, '%')).join('')}</div></div>` : '').join('')}</div>
      <h2 class="section-title">Supply and demand</h2>
      <p class="muted">Share of opportunities against share of interest. Where demand is higher, add more.</p>
      <div class="bars">${m.gaps.map(g => `<div class="bar-row top-row"><span>${esc(g.label)}</span><b>${g.supply}% of opportunities · ${g.demand}% of interest</b></div>`).join('')}</div>` : ''}
    ${m.top.length ? `<h2 class="section-title">Most used opportunities</h2><div class="bars">${m.top.map(r => `<div class="bar-row top-row"><span>${esc(r.item.title)}</span><b>${r.outbound} to site · ${r.opens} opens · ${r.saves} saved</b></div>`).join('')}</div>` : ''}`;
}

const insightsNotice = text => `<p class="card note-card" role="status">${esc(text)}</p>`;

function insightsHTML() {
  return `
    <h1 class="page-title">Insights</h1>
    <p class="muted">Anonymous counts only: no names, contacts, locations, or search words.</p>
    <div class="actions">
      <div class="tabs" role="group" aria-label="Time range">${INSIGHT_RANGES.map(d => `<button data-act="insights-range" data-days="${d}" aria-pressed="${S.insightsDays === d}">${d} days</button>`).join('')}</div>
    </div>
    <div id="insights-body" aria-live="polite"></div>`;
}

async function loadInsights() {
  const box = $('#insights-body');
  if (!box) return;
  if (!ANALYTICS_URL) { box.innerHTML = insightsBody(localData(), { local: true }); return; }
  box.innerHTML = insightsNotice('Loading…');
  const show = html => { if ($('#insights-body') === box) box.innerHTML = html; };
  try {
    const res = await fetch(`${ANALYTICS_URL}/stats?days=${S.insightsDays}${S.insightsKey ? '&key=' + encodeURIComponent(S.insightsKey) : ''}`);
    if (res.status === 401) return show(insightsNotice('This page needs its access key. Ask whoever shared it for the full link.'));
    if (!res.ok) throw new Error(String(res.status));
    show(insightsBody(await res.json()));
    loadFeedback(box);
  } catch { show(insightsNotice('Couldn’t reach the reporting service. Try again in a moment.')); }
}

/* Private feedback. The service answers only to the owner key, so for anyone else this quietly adds nothing. */
async function loadFeedback(box) {
  if (!S.insightsKey) return;
  try {
    const res = await fetch(`${ANALYTICS_URL}/feedback?key=${encodeURIComponent(S.insightsKey)}`);
    if (!res.ok || $('#insights-body') !== box) return;
    const { feedback } = await res.json();
    const rated = feedback.filter(f => f.rating), avg = rated.length ? (rated.reduce((n, f) => n + f.rating, 0) / rated.length).toFixed(1) : '';
    const kinds = FEEDBACK_KINDS.map(k => `${feedback.filter(f => f.kind === k).length} ${k.toLowerCase()}`).join(' · ');
    box.insertAdjacentHTML('beforeend', `<h2 class="section-title">Feedback · ${feedback.length}${avg ? ` · average ${avg} of 5 from ${rated.length}` : ''}</h2><p class="muted">${kinds}</p>`
      + (feedback.length ? `<ul class="feedback">${feedback.map(f => `<li><span class="eyebrow">${esc(f.kind)} · ${esc(f.day)}${f.rating ? ' · ' + '◆'.repeat(f.rating) : ''}</span>${f.text ? `<p>${esc(f.text)}</p>` : '<p class="muted">Rating only</p>'}</li>`).join('')}</ul>`
        : '<p class="muted">Nothing yet.</p>'));
  } catch { /* feedback is optional here */ }
}

/* ----- Render ----- */
function render() {
  if (!VIEWS.includes(S.view)) S.view = 'home';
  const hash = S.view === 'insights' && S.insightsKey ? 'insights?key=' + encodeURIComponent(S.insightsKey) : S.view;
  try { if (location.hash.slice(1) !== hash) location.hash = hash; } catch { /* ignore */ }
  renderNav();
  const app = $('#app');
  try {
    app.innerHTML = S.view === 'home' ? homeHTML() : S.view === 'submit' ? submitHTML() : S.view === 'insights' ? insightsHTML() : browseHTML();
    if (S.view === 'insights') loadInsights();
  } catch (err) {
    console.error(err);
    app.innerHTML = '<div class="card empty" role="alert"><h3>That page hit a snag</h3><p>Your saved items are safe. Reset the view to try again.</p><button class="btn" data-act="reset">Reset and go home</button></div>';
  }
}

function navigate(view) {
  S.view = view;
  S.shown = PAGE_SIZE;
  clearMapPick();
  render();
  scrollTo(0, 0);
  $('#app').focus({ preventScroll: true });
}

/* =====================================================================
   8. SAVED OPPORTUNITIES, REMINDERS, ALERTS AND ACCOUNTS
   Privacy model: an account is an email address or mobile number, kept only as a salted hash and a masked hint.
   In this preview everything stays in the browser and nothing is sent.
   ===================================================================== */

const CHANNELS = [['push', 'Push'], ['text', 'Text'], ['email', 'Email']];
const FREQS = [['instant', 'As they’re listed'], ['daily', 'Daily digest'], ['weekly', 'Weekly digest'], ['monthly', 'Monthly digest']];
const UNITS = [['hours', 'hours'], ['days', 'days'], ['weeks', 'weeks']];
const REPEATS = [['none', 'Just once'], ['daily', 'Daily until then'], ['weekly', 'Weekly until then'], ['custom', 'Every few days']];
const NOTE = 'Preview: saved here, not sent yet.';

const labelOf = (list, value) => (list.find(([v]) => v === value) || [])[1] || '';
const maskPhone = digits => '•••• ' + digits.slice(-4);
const maskEmail = value => { const [name, domain] = value.split('@'); return name[0] + '•••@' + domain; };
const fmtDateTime = d => d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const timeLabel = hhmm => { const [h, m] = hhmm.split(':').map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); };
const channelNames = list => list.map(c => labelOf(CHANNELS, c)).join(', ');
const plural = (n, word) => `${n} ${n === 1 ? word : word.replace(/([^aeiou])y$/, '$1ie') + 's'}`;

function toggleFav(id) {
  favs.has(id) ? favs.delete(id) : favs.add(id);
  if (!store.set('fav', [...favs])) { toast('Could not save in this browser.'); return; }
  if (!favs.has(id)) removeAllReminders(id);
  if (favs.has(id)) track('save', id);
  toast(favs.has(id) ? 'Saved. Set reminders in MyQueue.' : 'Removed.');
  const y = scrollY;
  render();
  scrollTo(0, y);
  if ($('#detail').open && S.detailId === id) openDetail(id);
}

/* Reminders and alerts need an account. */
function requireAccount() {
  if (signedIn()) return true;
  toast(getAccount() ? 'Sign in to continue.' : 'Create your account to continue.');
  if (S.view !== 'my') navigate('my');
  ACTIONS['focus-account']();
  return false;
}

/* ----- Contact channels (shared by reminders and alerts) ----- */
/* Validates the chosen channels. Only masked hints are kept. */
function buildChannels(v, previous = {}) {
  if (!v.channels.length) return { error: 'Choose at least one way to be notified.' };
  const hints = {};
  if (v.channels.includes('text')) {
    const typed = (v.phone || '').trim(), digits = typed.replace(/\D/g, '');
    if (typed && (digits.length < 10 || digits.length > 15)) return { error: 'Enter a valid mobile number.' };
    hints.text = typed ? maskPhone(digits) : previous.text;
    if (!hints.text) return { error: 'Enter your mobile number.' };
  }
  if (v.channels.includes('email')) {
    const typed = (v.mail || '').trim();
    if (typed && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(typed)) return { error: 'Enter a valid email address.' };
    hints.email = typed ? maskEmail(typed.toLowerCase()) : previous.email;
    if (!hints.email) return { error: 'Enter your email address.' };
  }
  return { channels: v.channels, hints };
}

function channelFieldsHTML(channels, hints) {
  const contact = (channel, name, type, placeholder) => `<div class="contact" id="contact-${channel}"${channels.includes(channel) ? '' : ' hidden'}>
      <input name="${name}" type="${type}" autocomplete="off" placeholder="${placeholder}" aria-label="${placeholder}">
      ${hints[channel] ? `<span class="muted">Using ${esc(hints[channel])}. Enter another to change.</span>` : ''}</div>`;
  return `<fieldset><legend>How</legend>${CHANNELS.map(([v, t]) =>
    `<label class="check-row"><input type="checkbox" name="channels" value="${v}" data-channel="${v}"${channels.includes(v) ? ' checked' : ''}>${t}</label>`
    + (v === 'text' ? contact('text', 'phone', 'tel', 'Mobile number') : v === 'email' ? contact('email', 'mail', 'email', 'Email address') : '')).join('')}</fieldset>`;
}

const fieldOf = (form, name) => (form.elements[name] ? form.elements[name].value : '');
const channelsOf = form => [...form.querySelectorAll('input[name="channels"]:checked')].map(i => i.value);
const selectHTML = (name, options, selected) => `<select name="${name}">${options.map(([v, t]) => `<option value="${esc(v)}"${String(v) === String(selected) ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`;

/* ----- Reminders for saved opportunities -----
   Every upcoming date on a saved opportunity can have its own reminder: how long
   before (hours, days, or weeks), the time of day, how often it repeats and
   how to be told. Reminders are stored under "<opportunity id>:<date number>",
   or "<opportunity id>:announce" for opportunities whose dates are not set yet. */
const remKey = (id, date) => `${id}:${date}`;
const remindersOf = (id, map) => Object.keys(map).filter(key => key.startsWith(id + ':'));

/* Reminders saved by earlier versions (one per opportunity, with lead/freq) are upgraded on read. */
function normalizeReminder(r) {
  if (!r) return null;
  const out = { amount: 3, unit: 'days', time: '09:00', repeat: 'none', every: 2, ...r };
  if (r.lead && r.amount == null) {
    const m = /^(\d+)d$/.exec(r.lead), days = m ? Number(m[1]) : 3, weeks = days && days % 7 === 0;
    out.amount = weeks ? days / 7 : days;
    out.unit = weeks ? 'weeks' : 'days';
  }
  if (r.freq && !r.repeat) out.repeat = r.freq === 'once' ? 'none' : r.freq;
  out.channels = r.channels || ['push'];
  out.hints = r.hints || {};
  return out;
}
function getReminders() {
  const map = {};
  Object.entries(store.get('rem', {})).forEach(([key, value]) => {
    const r = normalizeReminder(value);
    if (r) map[key.includes(':') ? key : remKey(key, r.date)] = r;
  });
  return map;
}
function putReminders(map) { if (!store.set('rem', map)) toast('Could not save in this browser.'); }
function removeReminder(id, date) { const map = getReminders(); delete map[remKey(id, date)]; putReminders(map); }
function removeAllReminders(id) { const map = getReminders(); remindersOf(id, map).forEach(key => delete map[key]); putReminders(map); }

/* The dates of an opportunity that can carry a reminder: those still ahead. */
function reminderTargets(item) {
  if (!item.dates.length) return [{ key: 'announce', label: 'Dates to be announced', d: null }];
  return item.dates.map((d, index) => ({ key: String(index), label: d.label, d })).filter(t => endOf(t.d) >= now());
}
const defaultTarget = item => { const all = reminderTargets(item); return all.find(t => t.d && t.d.role === 'deadline') || all[0]; };
const shortDate = (item, d) => (d.allDay ? new Date(d.start + 'T12:00:00Z') : startOf(d))
  .toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: d.allDay ? 'UTC' : item.tz });

/* When the first reminder fires, in the visitor's local time. */
function reminderStart(item, r) {
  const d = r.date === 'announce' ? null : item.dates[Number(r.date)];
  if (!d) return null;
  const amount = Math.max(0, Number(r.amount) || 0), [hh, mm] = (r.time || '09:00').split(':').map(Number);
  if (d.allDay) {
    const [y, mo, da] = d.start.split('-').map(Number), days = r.unit === 'weeks' ? amount * 7 : amount;
    return new Date(y, mo - 1, da - days, hh, mm);
  }
  const base = startOf(d);
  if (r.unit === 'hours') return new Date(+base - amount * 36e5);
  const t = new Date(base);
  t.setDate(t.getDate() - (r.unit === 'weeks' ? amount * 7 : amount));
  t.setHours(hh, mm, 0, 0);
  return t;
}
function reminderEvent(item, r) {
  const d = item.dates[Number(r.date)];
  if (!d) return null;
  if (!d.allDay) return startOf(d);
  const [y, mo, da] = d.start.split('-').map(Number);
  return new Date(y, mo - 1, da, 23, 59);
}
const repeatStep = r => (r.repeat === 'weekly' ? 7 : r.repeat === 'custom' ? Math.max(1, Number(r.every) || 1) : 1) * 864e5;

/* The next time this reminder fires, or null when it is over. */
function reminderNext(item, r, from = now()) {
  const start = reminderStart(item, r);
  if (!start) return null;
  if (start >= from) return start;
  if (!r.repeat || r.repeat === 'none') return null;
  const step = repeatStep(r), next = new Date(+start + Math.ceil((from - start) / step) * step), end = reminderEvent(item, r);
  return end && next <= end ? next : null;
}

function reminderSummary(r) {
  if (r.date === 'announce') return `${channelNames(r.channels)} · when dates are announced`;
  const amount = Number(r.amount) || 0;
  const lead = amount ? `${amount} ${amount === 1 ? r.unit.replace(/s$/, '') : r.unit} before` : 'On the day';
  const at = r.unit === 'hours' ? '' : ` at ${timeLabel(r.time)}`;
  const repeat = r.repeat === 'none' ? '' : ` · ${r.repeat === 'custom' ? `every ${plural(Number(r.every) || 1, 'day')}` : r.repeat} until then`;
  return `${channelNames(r.channels)} · ${lead}${at}${repeat}`;
}

/* Validates the form values; returns { reminder } or { error }. */
function buildReminder(item, v, previous = {}) {
  const ch = buildChannels(v, previous);
  if (ch.error) return ch;
  const date = String(v.date);
  const r = { date, amount: Math.round(Number(v.amount)), unit: v.unit, time: v.time || '09:00', repeat: v.repeat || 'none', every: Math.round(Number(v.every)) || 2, channels: ch.channels, hints: ch.hints };
  if (date === 'announce') return { reminder: { ...r, amount: 0, unit: 'days', repeat: 'none' } };
  if (!item.dates[Number(date)]) return { error: 'Choose a date.' };
  if (!(r.amount >= 0 && r.amount <= 99)) return { error: 'Enter a number from 0 to 99.' };
  if (!UNITS.some(([u]) => u === r.unit)) return { error: 'Choose hours, days, or weeks.' };
  if (item.dates[Number(date)].allDay && r.unit === 'hours') return { error: 'Choose days or weeks for this date.' };
  if (!/^\d{2}:\d{2}$/.test(r.time)) return { error: 'Choose a time.' };
  if (!REPEATS.some(([x]) => x === r.repeat)) return { error: 'Choose how often.' };
  if (r.repeat === 'custom' && !(r.every >= 1 && r.every <= 60)) return { error: 'Repeat every 1 to 60 days.' };
  if (!reminderNext(item, r)) return { error: 'That time has passed. Try a shorter lead.' };
  return { reminder: r };
}
function saveReminder(item, values) {
  const map = getReminders(), key = remKey(item.id, values.date), previous = { ...accountHints(), ...((map[key] || {}).hints || {}) };
  const result = buildReminder(item, values, previous);
  if (result.error) return result;
  map[key] = result.reminder;
  putReminders(map);
  return result;
}

/* Every reminder on a saved opportunity, soonest first. */
function activeReminders() {
  const map = getReminders();
  return Object.keys(map).map(key => {
    const [id, date] = key.split(':'), item = ITEMS.find(i => i.id === Number(id)), r = map[key];
    return item && favs.has(item.id) ? { item, r, target: reminderTargets(item).find(t => t.key === date), next: reminderNext(item, r) } : null;
  }).filter(x => x && x.target).sort((a, b) => (+a.next || Infinity) - (+b.next || Infinity));
}

function remindersTabHTML() {
  const list = activeReminders();
  if (!list.length) {
    return emptyHTML('No reminders yet', 'Open Saved and tap Remind me on any date.', '<button class="btn" data-act="tab" data-tab="saved">Go to Saved</button>');
  }
  return `<ul class="reminder-list">${list.map(({ item, r, target, next }) => `<li class="card">
    <div><b>${esc(item.title)}</b><br><span class="muted">${esc(target.label)}${target.d ? ' · ' + shortDate(item, target.d) : ''}</span>
      <p class="muted" style="margin:.3rem 0 0">${esc(reminderSummary(r))}${next ? '<br>Next: ' + esc(fmtDateTime(next)) : ''}</p></div>
    <div class="actions"><button class="btn btn-outline btn-sm" data-act="remind" data-id="${item.id}" data-date="${target.key}">Edit</button>
      <button class="btn btn-outline btn-sm" data-act="remove-reminder" data-id="${item.id}" data-date="${target.key}">Remove</button></div></li>`).join('')}</ul>`;
}

/* One row per upcoming date on a saved opportunity, each with its own reminder. */
function reminderStripHTML(item) {
  const map = getReminders();
  const rows = reminderTargets(item).map(t => {
    const r = map[remKey(item.id, t.key)], next = r && reminderNext(item, r);
    const detail = r ? `${esc(reminderSummary(r))}${next ? '<br>Next: ' + esc(fmtDateTime(next)) : ''}` : 'No reminder';
    return `<li><div><b>${esc(t.label)}</b>${t.d ? ' · ' + shortDate(item, t.d) : ''}<br><span class="muted">${detail}</span></div>
      <button class="btn ${r ? 'btn-outline' : 'btn-gold'} btn-sm" data-act="remind" data-id="${item.id}" data-date="${t.key}">${icon('bell')}${r ? 'Edit' : 'Remind me'}</button></li>`;
  }).join('');
  return rows ? `<ul class="reminders" aria-label="Reminders">${rows}</ul>` : '';
}

/* ----- Alerts: what to watch for, how often, and how to be told ----- */
function normalizeAlert(a) {
  return { q: a.q || '', F: migrateFilters(a.F || {}), freq: a.freq || 'daily', channels: a.channels || ['push'], hints: a.hints || {},
    paused: a.paused ?? a.alert === false, seen: a.seen || [] };
}
function getAlerts() {
  const list = store.get('alerts', null);
  if (list) return list.map(normalizeAlert);
  return store.get('saved', []).map(normalizeAlert); /* searches saved by earlier versions */
}
function putAlerts(list) {
  if (!store.set('alerts', list)) toast('Could not save in this browser.');
  else store.remove('saved');
}
function alertLabel(a) {
  const parts = [];
  if (a.q) parts.push(`“${a.q}”`);
  Object.keys(FACETS).forEach(k => { if (a.F[k]) parts.push(FACETS[k].text(a.F[k])); });
  return parts.join(' · ') || 'All opportunities';
}
const alertMatches = a => runQuery({ q: a.q, F: { ...a.F, past: false } });
const alertFresh = a => alertMatches(a).filter(i => !a.seen.includes(i.id));
function newMatches() {
  const found = new Map();
  getAlerts().forEach(a => { if (!a.paused) alertFresh(a).forEach(i => found.set(i.id, i)); });
  return [...found.values()];
}

function buildAlert(v, previous = {}) {
  const F = blankFilters();
  ALERT_KEYS.forEach(k => { if (v.F && v.F[k]) F[k] = v.F[k]; });
  const q = (v.q || '').trim().slice(0, 60);
  if (!q && !ALERT_KEYS.some(k => F[k])) return { error: 'Pick at least one type of opportunity or a keyword.' };
  if (!FREQS.some(([f]) => f === v.freq)) return { error: 'Choose how often.' };
  const ch = buildChannels(v, previous);
  if (ch.error) return ch;
  return { alert: { q, F, freq: v.freq, channels: ch.channels, hints: ch.hints } };
}

function markSeen() {
  const list = getAlerts();
  list.forEach(a => { if (!a.paused) a.seen = alertMatches(a).map(i => i.id); });
  putAlerts(list);
  render();
}

function alertsTabHTML() {
  const list = getAlerts(), fresh = newMatches();
  const cards = list.map((a, n) => {
    const count = a.paused ? 0 : alertFresh(a).length;
    return `<div class="card alert-card"><div class="row"><h3>${esc(alertLabel(a))}</h3>${a.paused ? '<span class="badge">Paused</span>' : count ? `<span class="badge is-new">${count} new</span>` : ''}</div>
      <p class="muted">${esc(labelOf(FREQS, a.freq))} · ${esc(channelNames(a.channels))}</p>
      <div class="actions"><button class="btn btn-sm" data-act="run-alert" data-n="${n}">View</button>
        <button class="btn btn-outline btn-sm" data-act="edit-alert" data-n="${n}">Edit</button>
        <button class="btn btn-outline btn-sm" data-act="toggle-alert" data-n="${n}">${a.paused ? 'Resume' : 'Pause'}</button>
        <button class="btn btn-outline btn-sm" data-act="delete-alert" data-n="${n}">Delete</button></div></div>`;
  }).join('');
  if (!list.length) {
    return emptyHTML('No alerts yet', 'Tell us what you want. We’ll flag new matches.', `<button class="btn btn-gold" data-act="new-alert">${icon('bell')}New alert</button>`);
  }
  return `<div class="tab-head"><button class="btn btn-gold btn-sm" data-act="new-alert">${icon('bell')}New alert</button></div>
    <div class="grid">${cards}</div>
    ${fresh.length ? `<h2 class="section-title">From your alerts (${fresh.length})</h2>${cardsHTML(fresh)}<p><button class="btn btn-outline btn-sm" data-act="seen">Mark all seen</button></p>` : ''}`;
}

/* The nudge at the top of Saved: shows how to set up reminders and alerts. */
function notifyPromptHTML() {
  const map = getReminders();
  const missing = ITEMS.filter(i => favs.has(i.id) && !remindersOf(i.id, map).length && reminderTargets(i).length);
  const text = missing.length ? `${plural(missing.length, 'saved opportunity')} without a reminder.` : 'Reminders are set. Want alerts for new opportunities too?';
  const first = missing[0] && defaultTarget(missing[0]);
  return `<div class="card prompt">${icon('bell')}<div><b>Stay in the loop</b><p class="muted">${text}</p></div>
    <div class="actions">${first ? `<button class="btn btn-gold btn-sm" data-act="remind" data-id="${missing[0].id}" data-date="${first.key}">Set reminder</button>` : ''}
    <button class="btn ${first ? 'btn-outline' : 'btn-gold'} btn-sm" data-act="new-alert">New alert</button></div></div>`;
}

/* ----- The sheet: one dialog for reminders and alerts ----- */
function openSheet(html) {
  const dlg = $('#sheet');
  dlg.innerHTML = html;
  openDialog(dlg);
  syncSheet();
}
const sheetHead = title => `<div class="dialog-head"><h2 id="sheet-title">${title}</h2><button type="button" class="btn btn-outline btn-sm" data-act="close-sheet" aria-label="Close">${icon('close')}Close</button></div>`;

function unitOptions(item, dateValue, selected) {
  const d = item.dates[Number(dateValue)];
  const options = UNITS.filter(([u]) => u !== 'hours' || (d && !d.allDay));
  return options.map(([v, t]) => `<option value="${v}"${v === selected ? ' selected' : ''}>${t}</option>`).join('');
}

function openReminderSheet(id, date) {
  const item = ITEMS.find(i => i.id === Number(id));
  if (!item || !requireAccount()) return;
  const target = reminderTargets(item).find(t => t.key === String(date)) || defaultTarget(item);
  if (!target) return;
  S.sheet = { kind: 'reminder', id: item.id, date: target.key };
  const r = getReminders()[remKey(item.id, target.key)];
  const base = r || { amount: 3, unit: 'days', time: '09:00', repeat: 'none', every: 2, channels: ['push'], hints: {} };
  const hints = { ...accountHints(), ...base.hints };
  openSheet(`<form data-form="sheet">
    ${sheetHead('Reminder')}
    <p><b>${esc(item.title)}</b><br><span class="muted">${esc(target.label)}${target.d ? ' · ' + formatWhen(target.d, item.tz) : ''}</span></p>
    <div id="rem-timing"${target.d ? '' : ' hidden'}>
      <fieldset><legend>Remind me</legend><div class="row">
        <input name="amount" type="number" min="0" max="99" inputmode="numeric" value="${base.amount}" aria-label="How long before">
        <select name="unit" aria-label="Unit">${unitOptions(item, target.key, base.unit)}</select>
        <span class="muted">before, at</span>
        <input name="time" type="time" value="${esc(base.time)}" id="rem-time" aria-label="Time of day"></div></fieldset>
      <fieldset><legend>How often</legend><div class="row">${selectHTML('repeat', REPEATS, base.repeat)}
        <span id="rem-every"><input name="every" type="number" min="1" max="60" inputmode="numeric" value="${base.every}" aria-label="Days between reminders"> <span class="muted">days apart</span></span></div></fieldset>
    </div>
    ${channelFieldsHTML(base.channels, hints)}
    <p class="preview" id="sheet-preview" aria-live="polite"></p>
    <p class="error" id="sheet-error" role="alert"></p>
    <div class="actions"><button class="btn btn-gold">Save reminder</button>
      ${r ? `<button type="button" class="btn btn-outline" data-act="remove-reminder" data-id="${item.id}" data-date="${target.key}">Remove</button>` : ''}</div>
    <p class="muted">${NOTE}</p></form>`);
}

function readReminder(form) {
  return { date: S.sheet.date, amount: fieldOf(form, 'amount'), unit: fieldOf(form, 'unit'), time: fieldOf(form, 'time'), repeat: fieldOf(form, 'repeat'),
    every: fieldOf(form, 'every'), phone: fieldOf(form, 'phone'), mail: fieldOf(form, 'mail'), channels: channelsOf(form) };
}

function openAlertSheet(n, prefill = {}) {
  if (!requireAccount()) return;
  const editing = n >= 0 && getAlerts()[n];
  const a = editing || normalizeAlert({ ...prefill, F: prefill.F ? { ...prefill.F, past: false } : {} });
  S.sheet = { kind: 'alert', n: editing ? n : -1 };
  const pool = ITEMS.filter(i => !isPast(i)), hints = { ...accountHints(), ...a.hints };
  const selects = ALERT_KEYS.map(k => `<label>${FACETS[k].label}<select name="f_${k}">${optionsFor(k, pool, a.F[k], vocabulary(k))}</select></label>`).join('');
  openSheet(`<form data-form="sheet">
    ${sheetHead(editing ? 'Edit alert' : 'New alert')}
    <p class="muted">Pick what to watch. Mix and match.</p>
    <fieldset><legend>Watch for</legend>
      <input name="q" type="search" value="${esc(a.q)}" placeholder="Keyword, like “fellowship”" aria-label="Keyword" maxlength="60">
      <div class="filter-grid">${selects}</div></fieldset>
    <fieldset><legend>How often</legend>${selectHTML('freq', FREQS, a.freq)}</fieldset>
    ${channelFieldsHTML(a.channels, hints)}
    <p class="preview" id="sheet-preview" aria-live="polite"></p>
    <p class="error" id="sheet-error" role="alert"></p>
    <div class="actions"><button class="btn btn-gold">${editing ? 'Save alert' : 'Create alert'}</button></div>
    <p class="muted">${NOTE}</p></form>`);
}

function readAlert(form) {
  const F = {};
  ALERT_KEYS.forEach(k => { F[k] = fieldOf(form, 'f_' + k); });
  return { q: fieldOf(form, 'q'), F, freq: fieldOf(form, 'freq'), phone: fieldOf(form, 'phone'), mail: fieldOf(form, 'mail'), channels: channelsOf(form) };
}

/* Keeps the sheet's fields and preview line in step with what's chosen. */
function syncSheet() {
  const form = $('#sheet form'), sheet = S.sheet;
  if (!form || !sheet) return;
  const preview = $('#sheet-preview');
  if (sheet.kind === 'alert') {
    const v = readAlert(form), count = alertMatches({ q: v.q.trim(), F: { ...blankFilters(), ...v.F } }).length;
    preview.textContent = v.q.trim() || ALERT_KEYS.some(k => v.F[k]) ? `${plural(count, 'opportunity')} match${count === 1 ? 'es' : ''} now.` : '';
    return;
  }
  const item = ITEMS.find(i => i.id === sheet.id);
  if (!item) return;
  const unit = form.elements.unit, date = sheet.date;
  if (unit && date !== 'announce') {
    const wanted = unit.value;
    unit.innerHTML = unitOptions(item, date, wanted);
    if (!unit.value) unit.value = 'days';
  }
  const time = $('#rem-time'), every = $('#rem-every');
  if (time) time.hidden = fieldOf(form, 'unit') === 'hours';
  if (every) every.hidden = fieldOf(form, 'repeat') !== 'custom';
  const key = remKey(item.id, date), result = buildReminder(item, readReminder(form), { ...accountHints(), ...((getReminders()[key] || {}).hints || {}) });
  if (date === 'announce') preview.textContent = 'We’ll remind you once dates are announced.';
  else if (result.reminder) preview.textContent = 'First reminder: ' + fmtDateTime(reminderNext(item, result.reminder));
  else preview.textContent = result.error.startsWith('That time') ? result.error : '';
}

function submitSheet(form) {
  const sheet = S.sheet;
  if (!sheet) return;
  const fail = message => { $('#sheet-error').textContent = message; };
  if (sheet.kind === 'reminder') {
    const item = ITEMS.find(i => i.id === sheet.id);
    const result = saveReminder(item, readReminder(form));
    if (result.error) return fail(result.error);
    closeDialog($('#sheet'));
    track('reminder', item.id);
    toast('Reminder saved.');
  } else {
    const list = getAlerts(), previous = sheet.n >= 0 ? list[sheet.n] : null;
    const result = buildAlert(readAlert(form), { ...accountHints(), ...((previous || {}).hints || {}) });
    if (result.error) return fail(result.error);
    const saved = { ...result.alert, paused: previous ? previous.paused : false, seen: previous ? previous.seen : [] };
    if (previous) list[sheet.n] = saved; else list.push(saved);
    putAlerts(list);
    if (!previous) track('alert');
    closeDialog($('#sheet'));
    S.tab = 'alerts';
    toast(previous ? 'Alert updated.' : 'Alert created.');
    if (S.view !== 'my') S.view = 'my';
  }
  render();
}

function toggleAlert(n) {
  const list = getAlerts();
  if (!list[n]) return;
  list[n].paused = !list[n].paused;
  putAlerts(list);
  toast(list[n].paused ? 'Alert paused.' : 'Alert resumed.');
  render();
}
function deleteAlert(n) { const list = getAlerts(); list.splice(n, 1); putAlerts(list); render(); }
function runAlert(n) {
  const a = getAlerts()[n];
  if (!a) return;
  resetSearch();
  S.q = a.q; S.F = { ...blankFilters(), ...a.F };
  syncCalendarMonth();
  navigate('our');
}

/* ----- Account: email or mobile number -----
   Only a salted one-way hash and a masked hint (j•••@example.com) are kept,
   never the full address or number. A server would additionally key the hash
   with a secret, verify with a one-time code, and hold the real contact in a
   separate encrypted store. */
const getAccount = () => { const a = store.get('acct', null); return a && a.key ? a : null; };
const signedIn = () => !!getAccount() && store.get('signedin', false) === true;
const randomHex = n => Array.from({ length: n }, () => {
  const byte = window.crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] : Math.floor(Math.random() * 256);
  return byte.toString(16).padStart(2, '0');
}).join('');

/* SHA-256 for browsers without crypto.subtle (it needs https; a saved file opened on a phone has none). */
function sha256Fallback(text) {
  const K = [], H = [];
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let n = 2, found = 0; found < 64; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
    if (!prime) continue;
    if (found < 8) H[found] = (Math.pow(n, 1 / 2) % 1) * 4294967296 | 0;
    K[found++] = (Math.pow(n, 1 / 3) % 1) * 4294967296 | 0;
  }
  const bytes = Array.from(unescape(encodeURIComponent(text)), c => c.charCodeAt(0)), bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (bitLength >>> (i * 8)) & 255);
  for (let off = 0; off < bytes.length; off += 64) {
    const w = [];
    for (let i = 0; i < 64; i++) {
      if (i < 16) w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
      else w[i] = (w[i - 16] + (rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) + w[i - 7] + (rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10))) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    [a, b, c, d, e, f, g, hh].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
  }
  return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}
async function sha256(text) {
  if (!(window.crypto && crypto.subtle)) return sha256Fallback(text);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/* Reads an email address or mobile number; returns null when it is neither. */
function parseContact(raw) {
  const value = (raw || '').trim();
  if (value.includes('@')) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? { kind: 'email', value: value.toLowerCase(), hint: maskEmail(value.toLowerCase()) } : null;
  }
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 ? { kind: 'phone', value: digits, hint: maskPhone(digits) } : null;
}
/* The contact already on file counts for the matching channel. */
function accountHints() {
  const a = getAccount();
  return a ? (a.kind === 'email' ? { email: a.hint } : { text: a.hint }) : {};
}

function accountError(message) {
  const el = $('#acct-error');
  if (el) el.textContent = message; else toast(message);
}

async function accountAction(op, raw) {
  try {
    if (op === 'out') {
      store.set('signedin', false);
      toast('Signed out.');
    } else {
      const contact = parseContact(raw);
      if (!contact) return accountError('Enter a valid email or mobile number.');
      if (op === 'new') {
        const salt = randomHex(8);
        store.set('acct', { kind: contact.kind, hint: contact.hint, salt, key: await sha256(`${salt}:${contact.value}`) });
        store.set('signedin', true);
        toast('Account created.');
      } else {
        const account = getAccount();
        if (!account || await sha256(`${account.salt}:${contact.value}`) !== account.key) return accountError('That doesn’t match your account.');
        store.set('signedin', true);
        toast('Signed in.');
      }
    }
    render();
  } catch (err) {
    console.error(err);
    toast('That didn’t work. Please try again.');
  }
}

function accountCardHTML() {
  const account = getAccount();
  const form = (op, title, text, button) => `<div class="card account"><h3>${title}</h3><p class="muted">${text}</p>
    <form class="inline-form" data-form="account" data-op="${op}"><input id="contact" name="contact" autocomplete="email" placeholder="Email or mobile number" aria-label="Email or mobile number"><button class="btn btn-gold">${button}</button></form>
    <p class="error" id="acct-error" role="alert"></p></div>`;
  if (!account) return form('new', 'Create your account', 'Use your email or mobile number. We only keep an anonymized version.', 'Create account');
  if (!signedIn()) return form('in', 'Welcome back', `Enter the email or number you used (${esc(account.hint)}).`, 'Sign in');
  return `<div class="card account compact"><div class="row"><span>Signed in as <b>${esc(account.hint)}</b></span><span class="spacer"></span>
    <button class="btn btn-outline btn-sm" data-act="signout">Sign out</button>
    <button class="btn btn-outline btn-sm" data-act="wipe">Delete account</button></div></div>`;
}

let wipeArmed = false;
function wipeData() {
  if (!wipeArmed) {
    wipeArmed = true;
    setTimeout(() => { wipeArmed = false; }, 4000);
    toast('Tap again to delete everything.');
    return;
  }
  wipeArmed = false;
  ['fav', 'alerts', 'saved', 'acct', 'rem', 'signedin'].forEach(key => store.remove(key));
  favs.clear();
  toast('Account and saved data deleted.');
  render();
}

/* =====================================================================
   10. EVENTS AND START-UP
   One delegated listener per event type; elements opt in with data-act.
   ===================================================================== */

function quickSearch(chip) {
  resetSearch();
  track('search');
  if (chip === 'free') S.F.price = 'free';
  if (chip === 'online') S.F.where = 'Online';
  if (chip === 'new') S.F.new = 'new';
  if (chip === 'open') S.F.open = 'open';
  if (chip === 'soon') S.F.soon = 'soon';
  S.mode = 'list';   // a quick search always opens as a list; the calendar and map show the same results when toggled to
  navigate('our');
}

const ACTIONS = {
  go: el => {
    navigate(el.dataset.view);
    if (el.classList.contains('brand')) {   // the logo: a shimmer on the mark and a fresh start for the page
      const mark = el.querySelector('.brand-mark'), app = $('#app');
      [mark, app].forEach((node, i) => { node.classList.remove(i ? 'refresh' : 'shimmer'); void node.offsetWidth; node.classList.add(i ? 'refresh' : 'shimmer'); });
    }
  },
  open: el => { track('open', el.dataset.id); openDetail(el.dataset.id); },
  'close-detail': () => closeDialog($('#detail')),
  'close-sheet': () => closeDialog($('#sheet')),
  locate,
  fav: el => toggleFav(Number(el.dataset.id)),
  ics: el => { downloadIcs(el.dataset.id); el.closest('details')?.removeAttribute('open'); },
  chip: el => quickSearch(el.dataset.chip),
  mode: el => { S.mode = el.dataset.mode; if (S.mode === 'calendar') showMatchesInCalendar(); track('view_' + S.mode); refreshResults(); },
  'insights-range': el => { S.insightsDays = Number(el.dataset.days) || 30; render(); },
  more: () => { S.shown += PAGE_SIZE; refreshResults(); },
  'cal-prev': () => { S.calMonth = new Date(S.calMonth.getFullYear(), S.calMonth.getMonth() - 1, 1); S.calDay = ''; refreshResults(); },
  'cal-next': () => { S.calMonth = new Date(S.calMonth.getFullYear(), S.calMonth.getMonth() + 1, 1); S.calDay = ''; refreshResults(); },
  'cal-day': el => {
    S.calDay = S.calDay === el.dataset.day ? '' : el.dataset.day;     /* tap again to close */
    refreshResults();
    const title = $('#cal-day-title');
    if (title) { title.scrollIntoView({ block: 'start', behavior: 'smooth' }); title.focus({ preventScroll: true }); }
  },
  pin: el => {
    if (el.dataset.cities) { S.zoom = [...S.zoom, JSON.parse(el.dataset.cities)]; S.pin = ''; }   // a merged pin: zoom in, again and again, until its cities separate
    else S.pin = el.dataset.key || '';
    refreshResults();
  },
  'zoom-out': () => { S.zoom = S.zoom.slice(0, -1); S.pin = ''; refreshResults(); },
  'map-scope': el => {
    S.mapScope = el.dataset.scope;
    clearMapPick();
    refreshResults();
    const on = $('.region-tabs [aria-pressed="true"]');
    if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  },
  'close-filters': () => {
    $('#filters').hidden = true;
    S.filtersOpen = false;
    const toggle = $('[data-act="toggle-filters"]');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    const box = $('#results');
    if (box && box.scrollIntoView) box.scrollIntoView({ block: 'start' });
  },
  'open-filters': () => { resetSearch(); S.filtersOpen = true; navigate('our'); },
  'toggle-filters': el => {
    const panel = $('#filters');
    panel.hidden = !panel.hidden;
    S.filtersOpen = !panel.hidden;
    el.setAttribute('aria-expanded', S.filtersOpen);
    el.classList.toggle('btn-gold', S.filtersOpen || activeFilterCount() > 0);   /* gold while open or while filters apply */
    el.classList.toggle('btn-outline', !(S.filtersOpen || activeFilterCount() > 0));
  },
  clear: () => { resetSearch(); render(); },
  'remove-filter': el => {
    const key = el.dataset.key;
    S.F[key] = key === 'past' ? false : '';
    S.shown = PAGE_SIZE;
    if (key === 'month') syncCalendarMonth();
    render();
  },
  tab: el => { S.tab = ['alerts', 'reminders'].includes(el.dataset.tab) ? el.dataset.tab : 'saved'; S.shown = PAGE_SIZE; render(); },
  remind: el => openReminderSheet(el.dataset.id, el.dataset.date),
  'remove-reminder': el => { removeReminder(el.dataset.id, el.dataset.date); closeDialog($('#sheet')); toast('Reminder removed.'); render(); },
  'new-alert': el => openAlertSheet(-1, el.dataset.from === 'search' ? { q: S.q, F: S.F } : {}),
  'edit-alert': el => openAlertSheet(Number(el.dataset.n)),
  'toggle-alert': el => toggleAlert(Number(el.dataset.n)),
  'delete-alert': el => deleteAlert(Number(el.dataset.n)),
  'run-alert': el => runAlert(Number(el.dataset.n)),
  seen: markSeen,
  signout: () => accountAction('out'),
  'focus-account': () => {
    const box = $('.account'), field = $('#contact');
    if (box && box.scrollIntoView) box.scrollIntoView({ block: 'center' });
    if (field) field.focus();
  },
  contribution: el => { S.amount = Number(el.dataset.amount); const custom = $('#contribution-custom'); if (custom) custom.value = ''; updateContribution(); },
  /* Preview: nothing is collected, stored, or sent. A live version would hand off to a hosted
     checkout from a payment provider (so card data never reaches this site) and keep only
     the amount and date, with no link to any account, saved opportunity, or contact. */
  contribute: () => {
    const url = contributeLink(S.amount);
    if (url) window.open(url, '_blank', 'noopener,noreferrer'); else toast('Preview: nothing was charged.');
  },
  'fb-kind': el => {
    S.fbKind = el.dataset.kind;
    document.querySelectorAll('[data-act="fb-kind"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === S.fbKind)));
    $('#fb-text').placeholder = FEEDBACK_PROMPTS[S.fbKind];
  },
  'fb-rate': el => {   // same star again clears it; no re-render, so typed text stays
    const n = Number(el.dataset.n);
    S.fbRating = S.fbRating === n ? 0 : n;
    document.querySelectorAll('[data-act="fb-rate"]').forEach(b => {
      const on = Number(b.dataset.n) <= S.fbRating;
      b.setAttribute('aria-checked', String(Number(b.dataset.n) === S.fbRating));
      b.textContent = on ? '◆' : '◇';
    });
    $('#fb-rating-hint').textContent = S.fbRating ? RATING_WORDS[S.fbRating] : 'More diamonds = you like it more. 1 is “needs work”, 5 is “love it”.';
  },
  'fb-again': () => { S.fbSent = false; render(); },
  wipe: wipeData,
  reset: () => { resetSearch(); S.view = 'home'; render(); }
};

document.addEventListener('click', e => {
  const out = e.target.closest('a[data-out]');
  if (out) { track('outbound', out.dataset.item); if (!out.dataset.act) return; }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  /* Ctrl/⌘/Shift-click on a link keeps the browser's own behaviour. */
  if (el.tagName === 'A') e.preventDefault();
  const action = ACTIONS[el.dataset.act];
  if (action) action(el);
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset && t.dataset.filter) {
    const key = t.dataset.filter;
    S.F[key] = key === 'open' || key === 'new' || key === 'soon' ? (t.checked ? key : '') : key === 'past' ? t.checked : t.value;
    S.shown = PAGE_SIZE;
    clearMapPick();
    S.filtersOpen = true;
    track('filter');
    if (key === 'month') syncCalendarMonth();
    render();
    /* The panel is rebuilt with fresh counts; park focus on it (not on a list) so no list is left open. */
    const next = t.type === 'checkbox' ? $(`[data-filter="${key}"]`) : $('#filters');
    if (next) next.focus({ preventScroll: true });
    return;
  }
  if (t.dataset && t.dataset.channel) {
    const box = $('#contact-' + t.dataset.channel);
    if (box) box.hidden = !t.checked;
  } else if (t.id === 'sort') {
    S.sort = t.value;
    refreshResults();
  }
  if (t.closest && t.closest('#sheet')) syncSheet();
});

/* Search as you type (results only, so the field keeps focus). */
let searchTimer, countTimer;
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q') {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { S.q = t.value; S.shown = PAGE_SIZE; clearMapPick(); refreshResults(); }, 200);
    clearTimeout(countTimer);   // one count per finished search, not per keystroke
    countTimer = setTimeout(() => { if (t.value.trim()) track('search'); }, 1500);
  } else if (t.id === 'contribution-custom') {
    const amount = Math.floor(Number(t.value));
    if (amount > 0) S.amount = Math.min(amount, 10000);
    updateContribution();
  } else if (t.closest && t.closest('#sheet')) {
    syncSheet();
  }
});

const FORMS = {
  'hero-search': form => { resetSearch(); S.q = form.elements.q.value; if (S.q.trim()) track('search'); navigate('our'); },
  search: () => { S.q = $('#q').value; if (S.q.trim()) track('search'); refreshResults(); },
  submit: handleSubmit,
  feedback: sendFeedback,
  sheet: submitSheet,
  account: form => accountAction(form.dataset.op, fieldOf(form, 'contact'))
};
document.addEventListener('submit', e => {
  const form = e.target.closest('[data-form]');
  if (!form) return;
  e.preventDefault();
  if (FORMS[form.dataset.form]) FORMS[form.dataset.form](form);
});

/* Keyboard: "/" focuses search; Enter/Space activates a map pin. */
document.addEventListener('keydown', e => {
  const t = e.target;
  if ((e.key === 'Enter' || e.key === ' ') && t.matches && t.matches('.pin')) { e.preventDefault(); ACTIONS.pin(t); return; }
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
    const field = $('#q') || $('.hero-search input');
    if (field) { e.preventDefault(); field.focus(); }
  }
});

/* Dialogs: close on backdrop click; tidy up on close. */
const ON_CLOSE = {
  '#detail': () => { S.detailId = null; },
  '#sheet': () => { S.sheet = null; }
};
Object.keys(ON_CLOSE).forEach(selector => {
  const dlg = $(selector);
  dlg.addEventListener('click', e => {
    if (e.target !== dlg) return;
    const r = dlg.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(dlg);
  });
  dlg.addEventListener('close', () => ON_CLOSE[selector](dlg));
});

/* Routing via the URL hash (#home, #our, #my, #alerts, #submit; older aliases still work). */
function routeFromHash() {
  const [raw, query] = location.hash.slice(1).split('?');
  const key = new URLSearchParams(query || '').get('key');
  if (key) S.insightsKey = key;
  if (CATEGORIES[raw]) S.F.type = raw;
  if (raw === 'alerts' || raw === 'reminders') { S.tab = raw; return 'my'; }
  const view = ROUTE_ALIASES[raw] || raw;
  if (view === 'insights' && !S.insightsKey) return null;   /* private: only a link that carries the key opens it */
  return VIEWS.includes(view) ? view : null;
}
addEventListener('hashchange', () => { const view = routeFromHash(); if (view && view !== S.view) { S.view = view; render(); } });

/* The visitor's time zone is detected automatically and re-checked when they return to the tab. */
document.addEventListener('visibilitychange', () => {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (zone !== userTz) { userTz = zone; if (!S.loc || !S.loc.precise) S.loc = zoneLocation(); render(); }
});

/*
  Day counts ("12 days left"), open/closed state and the home list are all computed
  from the visitor's own clock each time a page renders. This re-renders at their
  next local midnight, and whenever they return to the tab on a new day.
*/
let renderedDay = now().toDateString();
function refreshForNewDay() {
  if (now().toDateString() !== renderedDay) { renderedDay = now().toDateString(); render(); }
}
function scheduleMidnightRefresh() {
  const next = new Date(now()); next.setHours(24, 0, 1, 0);
  setTimeout(() => { refreshForNewDay(); scheduleMidnightRefresh(); }, next - now());
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshForNewDay(); });
/* Dot and name sizes depend on the screen width, so redraw the map after a resize or a turn of the phone. */
let mapSizeTimer = 0, mapSize = Math.round(mapScale() * 10);
addEventListener('resize', () => {
  clearTimeout(mapSizeTimer);
  mapSizeTimer = setTimeout(() => {
    const size = Math.round(mapScale() * 10);
    if (size !== mapSize && S.view === 'our' && S.mode === 'map') refreshResults();
    mapSize = size;
  }, 200);
});
addEventListener('focus', refreshForNewDay);
scheduleMidnightRefresh();

S.view = routeFromHash() || 'home';
trackVisit();
render();
