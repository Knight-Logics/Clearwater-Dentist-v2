import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesPath = path.join(ROOT, 'src/content/pages.json');
const pages = JSON.parse(await fs.readFile(pagesPath, 'utf8'));

function page(route) {
  const item = pages.find(entry => entry.route === route);
  if (!item) throw new Error('Missing page: ' + route);
  return item;
}

function section(route, heading) {
  const item = page(route).sections.find(entry => entry.heading === heading);
  if (!item) throw new Error('Missing section ' + heading + ' on ' + route);
  return item;
}

// Financing
section('/financing', 'Flexible Financing for Your Dental Care').body.push(
  'For insurance participation, payment timing, membership plans, and our 48-hour cancellation policy, read our [Financial Policy](/financial-policy).'
);
section('/financing', 'Ready to Discuss Your Options?').body.push(
  'You can also review our [Financial Policy](/financial-policy) and [Privacy Policy](/privacy-policy) before your visit.'
);

// New patient FAQs
const faqInsurance = section('/new-patient-faqs', 'Insurance & Payments');
faqInsurance.items.push(
  'Where can I read your full payment and cancellation terms? See our [Financial Policy](/financial-policy) for out-of-network insurance, financing, membership plans, and appointment policies.',
  'Questions about how we handle your information? Review our [Privacy Policy](/privacy-policy) and [Notice of Privacy Practices](/notice-of-privacy-practices).'
);

// Dental implants
const implantPrep = section('/dental-implants-clearwater-fl', 'Planning and Preparation');
implantPrep.body[1] = implantPrep.body[1].replace(
  'we offer bone grafting procedures',
  'we offer [bone grafting](/bone-grafting) procedures'
);
const implantNatural = section('/dental-implants-clearwater-fl', 'The Most Natural Solution To Missing Teeth');
implantNatural.body[0] = implantNatural.body[0].replace(
  'Dental implants provide a superior alternative.',
  'Dental implants and [implant-supported dentures](/implant-supported-dentures-clearwater-fl) provide superior alternatives.'
);
implantNatural.body.push(
  'Patients who need extractions before implants can learn more about [tooth extraction](/tooth-extraction-clearwater-fl) and how we plan the next restorative step.'
);

// Emergency dentistry
const emergency = page('/emergency-dentistry-clearwater-fl');
emergency.sections.push(
  {
    heading: 'Common Emergency Treatments We Provide',
    body: [
      'Depending on your symptoms, same-day care may include pain relief, repair of a broken tooth, treatment for infection, or planning the next restorative step with Dr. Nadia.'
    ],
    items: [
      '[Tooth extraction](/tooth-extraction-clearwater-fl) for severe decay, infection, or trauma when a tooth cannot be saved',
      '[Root canal therapy](/root-canal-clearwater-fl) when the nerve of the tooth is infected but the tooth can still be preserved',
      '[Dental implants](/dental-implants-clearwater-fl) and [bone grafting](/bone-grafting) when a missing tooth needs long-term replacement',
      '[Sedation dentistry](/sedation-dentistry-clearwater-fl) for anxious patients who need urgent care in a calmer setting'
    ]
  },
  {
    heading: 'When to Call Right Away',
    body: [
      'Severe pain, swelling, fever, bleeding that will not stop, a knocked-out tooth, or a dental injury after an accident should be evaluated promptly. If you are unsure, call our office and we will help you decide the best next step.',
      'For preventive follow-up after urgent care, many patients continue with [general dentistry](/general-dentistry) and [oral cancer screening](/oral-cancer-screening) as part of a complete oral health plan.'
    ],
    items: []
  }
);

// Laser dentistry
const laserIntro = section('/laser-dentistry', 'A Faster, Gentler, Stress‑Free Dental Experience');
laserIntro.body.push(
  'Many patients also ask about [Solea Sleep](/solea-sleep) for snoring and sleep-disordered breathing, while others combine laser care with [gum disease treatment](/gum-disease-treatment).'
);
const laserWhat = section('/laser-dentistry', 'What Is the Solea(R) Laser?');
laserWhat.body.push(
  'Beyond routine laser dentistry, eligible patients may explore [Solea Sleep](/solea-sleep), while others pair laser care with [TMJ treatment](/tmj-treatment-clearwater-fl) or [facial esthetics](/facial-esthetics) for a more comprehensive plan.'
);

await fs.writeFile(pagesPath, JSON.stringify(pages, null, 2) + '\n', 'utf8');
console.log('Patched internal link markup in pages.json');
