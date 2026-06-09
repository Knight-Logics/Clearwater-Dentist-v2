import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesPath = path.join(ROOT, 'src/content/pages.json');
const site = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/site.json'), 'utf8'));
const pages = JSON.parse(await fs.readFile(pagesPath, 'utf8'));

const PHONE = site.phoneDisplay;
const PHONE_TEL = site.phoneTel;
const EMAIL = site.email;
const ADDR = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;
const EFFECTIVE = 'April 20, 2026';

const policyPages = [
  {
    route: '/privacy-policy',
    slug: 'privacy-policy',
    type: 'policy',
    title: 'Privacy Policy & Notice of Privacy Practices | Clearwater Dentist',
    description: 'Clearwater Dentist privacy policy and HIPAA notice explaining how we protect your health information, SMS communications, and website data.',
    h1: 'Privacy Policy and Notice of Privacy Practices',
    sections: [
      {
        heading: 'Effective Date',
        body: [`Effective Date: ${EFFECTIVE}`, 'THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.']
      },
      {
        heading: 'Our Commitment to Your Privacy',
        body: [
          'Clearwater Dentist Inc (“we,” “our,” or “us”) is required by law to maintain the privacy and security of your Protected Health Information (PHI) and to provide you with this Notice of our legal duties and privacy practices.',
          'We will follow the terms of this Notice currently in effect. We will notify you promptly if a breach occurs that may have compromised the privacy or security of your information.'
        ]
      },
      {
        heading: 'What is Protected Health Information (PHI)?',
        body: [
          'PHI includes any information about your health, treatment, or payment for healthcare services that can be linked to you, including medical and dental records, treatment plans, billing and insurance information, and contact details such as your phone number or email address.',
          'HIPAA requires dental and medical providers to explain how this information is used and protected.'
        ]
      },
      {
        heading: 'How We Use and Disclose Your Information',
        body: ['We may use and disclose your PHI for treatment, payment, and healthcare operations, including coordinating care with specialists or labs, billing insurance, and conducting internal quality reviews that help us improve patient care.']
      },
      {
        heading: 'Other Uses and Disclosures Allowed by Law',
        body: [
          'We may disclose your information without your authorization when required for public health reporting, law enforcement requests, health oversight activities, abuse or neglect reporting, or compliance with legal obligations.',
          'For uses not described in this Notice, we will obtain your written authorization, which you may revoke at any time.'
        ]
      },
      {
        heading: 'Special Protections',
        body: [
          'Certain records receive additional protections under federal law, including substance use disorder records, mental health information, and genetic and reproductive health information. Our policies are maintained to reflect these requirements.'
        ]
      },
      {
        heading: 'Your Rights Regarding Your Health Information',
        items: [
          'Access and obtain a copy of your records',
          'Request corrections to your records',
          'Request restrictions on how your information is used',
          'Request confidential communications',
          'Receive an accounting of disclosures',
          'File a complaint without retaliation'
        ]
      },
      {
        heading: 'SMS Communications',
        body: [
          'If you provide your phone number and consent, you may receive SMS messages from Clearwater Dentist Inc for appointment reminders, post-treatment follow-ups, billing notifications, and promotions or marketing offers if you opt in.',
          'Message frequency may vary. Message and data rates may apply. Reply STOP to unsubscribe or HELP for assistance. Consent to receive SMS messages is not a condition of receiving treatment. You must be 18 years of age or older to participate. Carriers are not liable for delayed or undelivered messages.'
        ]
      },
      {
        heading: 'Information We Collect on Our Website',
        body: [
          'We may collect personal information (name, phone, email, address, insurance details), health information submitted through forms, and automatically collected data such as IP address, device or browser type, and website usage data.'
        ]
      },
      {
        heading: 'Cookies, Tracking Technologies, and Analytics',
        body: [
          'We use cookies and similar technologies to help our website function, remember preferences, measure performance, and understand how visitors use our pages. We may use analytics tools such as Google Analytics.',
          'You can control or disable cookies through your browser settings. Disabling cookies may affect certain features. Some browsers offer a “Do Not Track” feature; our website may not respond to DNT signals at this time.',
          'Third-party providers that support analytics or marketing are contractually required to protect your information and use it only for the services they provide.'
        ]
      },
      {
        heading: 'Data Sharing',
        body: [
          'No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.',
          'Information may be shared with subcontractors such as communication platforms and service providers only as necessary to operate our business.',
          'All other use cases exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.'
        ]
      },
      {
        heading: 'Data Security',
        body: ['We implement administrative, technical, and physical safeguards designed to protect your information in compliance with HIPAA Security Rule standards.']
      },
      {
        heading: 'Changes to This Notice',
        body: ['We reserve the right to change this Notice and make the new Notice apply to all information we maintain. Updates will be posted on our website.']
      },
      {
        heading: 'Complaints and Contact Information',
        body: [
          `If you believe your privacy rights have been violated, you may file a complaint with Clearwater Dentist Inc or the U.S. Department of Health and Human Services. You will not be penalized for filing a complaint.`,
          `Clearwater Dentist Inc · ${ADDR} · ${PHONE} · ${EMAIL} · https://www.clearwaterdentist.com`
        ]
      }
    ]
  },
  {
    route: '/notice-of-privacy-practices',
    slug: 'notice-of-privacy-practices',
    type: 'policy',
    title: 'Notice of Privacy Practices | Clearwater Dentist',
    description: 'HIPAA Notice of Privacy Practices for Clearwater Dentist. Learn how we may use and disclose your health information and your patient rights.',
    h1: 'Notice of Privacy Practices',
    sections: [
      {
        heading: 'Our Pledge Regarding Your Health Information',
        body: [
          'We understand that medical information about you and your health is personal. We are committed to protecting medical information about you.',
          'We create a record of the care and services you receive at our office for use in your care and treatment. This notice applies to all records of your care generated by our practice.'
        ]
      },
      {
        heading: 'How We May Use and Disclose Medical Information About You',
        items: [
          'For Treatment: to provide, coordinate, or manage your dental care with dentists, hygienists, technicians, and other team members involved in your care',
          'For Payment: to bill and collect payment from you, your insurance company, or a third party',
          'For Health Care Operations: to run our office efficiently and help ensure quality care for all patients',
          'Appointment Reminders: to contact you about upcoming visits',
          'Treatment Alternatives: to tell you about options that may be of interest to you',
          'Health-Related Benefits and Services: to share information about services that may benefit you',
          'As Required By Law: when federal, state, or local law requires disclosure'
        ]
      },
      {
        heading: 'Your Rights Regarding Medical Information',
        items: [
          'Right to Inspect and Copy your records',
          'Right to Amend information you believe is incorrect or incomplete',
          'Right to an Accounting of Disclosures in certain situations',
          'Right to Request Restrictions on uses or disclosures for treatment, payment, or operations',
          'Right to Request Confidential Communications at a specific phone number or address'
        ]
      },
      {
        heading: 'Complaints',
        body: [
          'If you believe your privacy rights have been violated, you may file a complaint with our office or with the Secretary of the U.S. Department of Health and Human Services. You will not be penalized for filing a complaint.'
        ]
      },
      {
        heading: 'Contact Information',
        body: [
          `For more information about our privacy practices, or to file a complaint, contact Dr. Nadia Pokrovskaya at ${ADDR}.`,
          `Email: frontdesk@clearwaterdentist.com · Phone: ${PHONE}`,
          'We are required by law to maintain the privacy of your health information and to provide you with this notice of our legal duties and privacy practices. We reserve the right to change our privacy practices and the terms of this notice when permitted by law.'
        ]
      }
    ]
  },
  {
    route: '/terms-and-conditions',
    slug: 'terms-and-conditions',
    type: 'policy',
    title: 'Terms & Conditions | Clearwater Dentist',
    description: 'Terms and conditions for SMS messaging and website use at Clearwater Dentist in Clearwater, FL.',
    h1: 'Terms and Conditions',
    sections: [
      {
        heading: 'Effective Date',
        body: [`Effective Date: ${EFFECTIVE}`]
      },
      {
        heading: 'SMS Messaging Program',
        body: [
          'By providing your phone number and opting in, you agree to receive SMS text messages from Clearwater Dentist Inc related to appointment reminders, follow-up care, promotions, special offers, and general customer service communications.',
          'Consent to receive SMS messages is not a condition of purchasing any goods or services.'
        ]
      },
      {
        heading: 'Message Frequency, Rates, and Opt-Out',
        body: [
          'Message frequency may vary based on your appointment activity, inquiries, and promotions. Message and data rates may apply depending on your mobile carrier and plan.',
          'Reply STOP to cancel messaging or HELP for assistance. After opting out, you will not receive SMS messages unless you opt in again.'
        ]
      },
      {
        heading: 'Customer Support',
        body: [
          `For assistance, reply HELP to any message or contact us at ${PHONE} or ${EMAIL}.`,
          'Your information will be handled in accordance with our Privacy Policy at https://www.clearwaterdentist.com/privacy-policy.'
        ]
      },
      {
        heading: 'Data Sharing, Eligibility, and Carrier Disclaimer',
        body: [
          'No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. Information may be shared only with subcontractors providing support services, and only as necessary to operate our business.',
          'You must be 18 years of age or older to use this SMS service. Carriers are not liable for delayed or undelivered messages.'
        ]
      },
      {
        heading: 'Changes to Terms',
        body: [
          'We reserve the right to update or modify these Terms & Conditions at any time. Updates will be posted on this page with a revised effective date.',
          `Clearwater Dentist Inc · ${ADDR} · ${PHONE}`
        ]
      }
    ]
  },
  {
    route: '/accessibility-statement',
    slug: 'accessibility-statement',
    type: 'policy',
    title: 'Accessibility Statement | Clearwater Dentist',
    description: 'Clearwater Dentist accessibility statement and contact information for website accessibility feedback.',
    h1: 'Accessibility Statement',
    sections: [
      {
        heading: 'Our Commitment',
        body: [
          'We are committed to providing digital accessibility through https://www.clearwaterdentist.com for individuals with disabilities. We will implement improvements in compliance with the Americans with Disabilities Act, as amended (ADA), and other applicable regulations.',
          'We are working to ensure the website is in substantial conformance with the Web Content Accessibility Guidelines (WCAG) 2.1, Level A and AA.'
        ]
      },
      {
        heading: 'Third-Party Content',
        body: [
          'Our website may link to, or interface with, third-party websites and tools that we do not control. We cannot ensure accessibility on third-party websites or make accommodations on their behalf.',
          'Third-party vendors may provide content, plugins, or widgets on our website. We encourage vendors to comply with industry standards, but we cannot guarantee their compliance.'
        ]
      },
      {
        heading: 'Feedback',
        body: [
          'We want to hear from you if you encounter accessibility barriers on our website. Please contact Dr. Nadia at frontdesk@clearwaterdentist.com or call ' + PHONE + ' so we can assist you.',
          'Thank you for helping us improve access for every patient and visitor.'
        ]
      }
    ]
  },
  {
    route: '/financial-policy',
    slug: 'financial-policy',
    type: 'policy',
    title: 'Financial Policy | Clearwater Dentist',
    description: 'Financial policy for Clearwater Dentist including insurance, payments, financing, membership plans, and appointment cancellation terms.',
    h1: 'Financial Policy',
    sections: [
      {
        heading: 'Overview',
        body: [
          'This Financial Policy explains how payment, insurance, and financing work at Clearwater Dentist. Our goal is to make high-quality care understandable and accessible while maintaining the one-patient-at-a-time experience our practice is known for.'
        ]
      },
      {
        heading: 'Insurance',
        body: [
          'We are an out-of-network provider. This allows us to maintain our focused care model without many restrictions imposed by in-network contracts.',
          'If you have a PPO insurance plan, we will gladly submit claims to your insurance carrier on your behalf. Reimbursement is typically sent directly to you according to your plan benefits.',
          'We do not accept HMO plans, Medicaid, or state insurance programs that require patients to see a specific contracted provider.'
        ]
      },
      {
        heading: 'Payment at Time of Service',
        body: [
          'Payment for treatment is generally due at the time service is provided unless other arrangements have been made in advance.',
          'We accept major credit cards and other payment methods discussed during your visit. For larger treatment plans, we will review phased payment and financing options with you before care begins.'
        ]
      },
      {
        heading: 'Financing and Membership Options',
        body: [
          'We offer third-party financing options such as CareCredit, Sunbit, and Alphaeon for qualifying patients. Visit our Financing page to compare plans.',
          'For patients without traditional PPO insurance, or those who want additional benefits, we offer in-house membership plans with tiers focused on preventive care, premium maintenance, and aesthetic services. Your provider can help you choose the plan that fits your goals during your consultation.'
        ]
      },
      {
        heading: 'Treatment Estimates',
        body: [
          'We provide treatment estimates whenever possible so you can make informed decisions. Final fees may vary if clinical findings change during treatment. We will communicate with you before proceeding with additional care.'
        ]
      },
      {
        heading: 'Appointment Cancellation Policy',
        body: [
          'Because we reserve the office for your exclusive use, we require 48 hours’ notice for cancellations or rescheduling.',
          'Appointments canceled within the 48-hour window may be subject to a $99 fee. This policy helps us offer reserved appointment times fairly to all patients.'
        ]
      },
      {
        heading: 'Questions',
        body: [
          `If you have questions about insurance, financing, or payment options, contact our front desk at ${PHONE} or ${EMAIL} before your visit.`
        ]
      }
    ]
  }
];

function upsertPage(page) {
  const index = pages.findIndex(item => item.route === page.route);
  if (index === -1) pages.push(page);
  else pages[index] = { ...pages[index], ...page };
}

for (const page of policyPages) upsertPage(page);

upsertPage({
  route: '/solea-sleep',
  title: 'Solea Sleep Clearwater, FL | Snoring & Sleep-Disordered Breathing',
  description: 'Solea Sleep laser snoring treatment in Clearwater, FL. Non-surgical laser therapy for eligible patients with snoring or mild sleep-disordered breathing.',
  h1: 'Solea Sleep Snoring Treatment',
  heroImage: {
    src: '/assets/images/clearwater-dentist-clearwater-fl-laser-dentistry-1920w.jpg',
    alt: 'Solea laser treatment at Clearwater Dentist'
  },
  sections: [
    {
      heading: 'A Gentler Option for Snoring and Sleep-Disordered Breathing',
      body: [
        'Solea Sleep is a laser-assisted treatment designed to help eligible patients who struggle with snoring or mild sleep-disordered breathing. At Clearwater Dentist, we combine advanced laser technology with a calm, patient-focused environment so you can explore options without feeling rushed.',
        'Many patients put off sleep-related concerns because they assume treatment means surgery, appliances, or a long recovery. Solea Sleep is different for many eligible patients: it is non-surgical, performed in-office, and designed to tighten soft tissue in the airway with minimal downtime.'
      ]
    },
    {
      heading: 'How Solea Sleep Works',
      body: [
        'Solea Sleep uses the Solea dental laser to gently treat soft palate tissue. The goal is to reduce the vibration and airway obstruction that contribute to snoring.',
        'Treatment is typically quick and well tolerated. Most patients return to normal activities the same day. Your provider will review whether you are a good candidate based on your symptoms, anatomy, and overall health history.'
      ]
    },
    {
      heading: 'Who May Benefit',
      items: [
        'Adults who snore and want a non-surgical option to explore',
        'Patients with mild sleep-disordered breathing who have been evaluated for suitability',
        'Partners or family members affected by snoring at home',
        'Patients already familiar with our Solea laser dentistry services who want a related sleep solution'
      ]
    },
    {
      heading: 'What to Expect at Your Visit',
      body: [
        'Your visit begins with a conversation about your sleep history, snoring patterns, and goals. We will explain whether Solea Sleep, an oral appliance, or a referral for further sleep evaluation is the most appropriate next step.',
        'If Solea Sleep is recommended, we will walk you through the procedure, expected sensations, and any follow-up visits before treatment begins.'
      ]
    },
    {
      heading: 'Related Care at Clearwater Dentist',
      body: [
        'Solea Sleep is part of our broader laser and airway-focused services. Many patients also explore laser dentistry for gum treatment and restorative care, TMJ evaluation for jaw tension, or sedation options if dental anxiety has kept them from getting care.',
        'If snoring is part of a larger oral health concern, we will help you understand how treatment pieces fit together rather than offering a one-size-fits-all answer.'
      ]
    },
    {
      heading: 'Schedule a Consultation',
      body: [
        `Ready to learn whether Solea Sleep is right for you? Request an appointment online or call ${PHONE}. Our team serves Clearwater, Safety Harbor, Dunedin, Palm Harbor, Largo, and the greater Tampa Bay area.`
      ]
    }
  ]
});

upsertPage({
  route: '/oral-cancer-screening',
  title: 'Oral Cancer Screening Clearwater, FL | Early Detection Exams',
  description: 'Oral cancer screening in Clearwater, FL with thorough oral pathology exams, soft tissue evaluation, and patient education from Dr. Nadia Pokrovskaya.',
  h1: 'Oral Cancer Screening at Clearwater, FL',
  sections: [
    {
      heading: 'We Perform Thorough Oral Pathology Exams',
      body: [
        'At Clearwater Dentist, we take your wellbeing seriously by offering oral pathology and cancer screenings designed to detect diseases of the mouth, jaw, and related structures early enough for timely intervention.',
        'Only one-third of oral cancers are detected at a stage where treatment is most effective, which is why routine screenings matter even when you feel fine. Many oral diseases develop without obvious pain at first.',
        'Our team conducts comprehensive soft-tissue exams and reviews findings based on color, shape, size, location, and texture. When additional evaluation is needed, we discuss next steps clearly and compassionately.'
      ]
    },
    {
      heading: 'What Happens During a Screening',
      items: [
        'Visual exam of the lips, cheeks, tongue, floor of mouth, palate, and throat',
        'Palpation of the jaw, neck, and lymph node areas when indicated',
        'Review of your health history, tobacco or alcohol use, and risk factors',
        'Discussion of any sores, patches, lumps, or changes you have noticed at home',
        'Clear explanation of findings and recommended follow-up, including biopsy referral when appropriate'
      ]
    },
    {
      heading: 'Oral Pathology Signs To Check at Home',
      items: [
        'Red or white patches in the mouth',
        'Bleeding sores that do not heal',
        'Lumps or thickening tissue in the mouth or neck',
        'Persistent sore throat or difficulty swallowing',
        'Numbness, pain, or unexplained changes in how teeth fit together'
      ]
    },
    {
      heading: 'Prevention Begins With Routine Care',
      body: [
        'If a biopsy or referral is needed, we help coordinate the next step and support you through the process. Dr. Nadia Pokrovskaya recommends combining professional screenings with at-home awareness.',
        'If you notice anything suspicious such as lumps, pain, or discoloration, schedule an appointment promptly rather than waiting for your next routine visit.'
      ]
    },
    {
      heading: 'Who Should Be Screened',
      body: [
        'Every adult benefits from periodic oral cancer screening as part of comprehensive dental care. Screening is especially important for patients who use tobacco, drink alcohol regularly, have a history of oral lesions, or have had significant sun exposure affecting the lips.',
        'Oral cancer screening is not only for high-risk patients. Because early disease is often painless, routine evaluation remains the safest approach.'
      ]
    },
    {
      heading: 'Frequently Asked Questions',
      items: [
        'Is an oral cancer screening painful? No. The exam is non-invasive and typically completed during a regular dental visit.',
        'How often should I be screened? Many patients receive screening at least once a year during preventive visits. Your provider may recommend more frequent checks based on risk factors.',
        'Does insurance cover oral cancer screening? Coverage varies by plan. Our team can help you understand benefits before treatment.',
        'What if something looks abnormal? We explain findings, discuss whether monitoring or further testing is appropriate, and help you take the next step without unnecessary alarm.'
      ]
    }
  ]
});

upsertPage({
  route: '/bone-grafting',
  title: 'Bone Grafting Clearwater, FL | Jaw Support for Dental Implants',
  description: 'Bone grafting in Clearwater, FL to rebuild jawbone for dental implants. Guided tissue regeneration and full-scope implant planning with Dr. Nadia.',
  h1: 'Bone Grafting at Clearwater, FL',
  sections: [
    {
      heading: 'Bone Grafting Rebuilds Your Jawbone',
      body: [
        'Your jawbone supports natural teeth and provides the foundation required for successful dental implants. When bone volume is lost because of periodontal disease, extractions, trauma, or long-term denture wear, implant placement may require bone grafting first.',
        'Bone grafting rebuilds acceptable bone volume and creates a stable site for implant support. At Clearwater Dentist, grafting is planned as part of a comprehensive implant workflow rather than as an isolated procedure.',
        'From consultation through graft healing and implant placement, our team coordinates care in-house so you understand each phase before it begins.'
      ]
    },
    {
      heading: 'When Bone Grafting Is Recommended',
      items: [
        'Insufficient bone height or width for secure implant placement',
        'Bone loss after tooth extraction or long-term missing teeth',
        'Periodontal disease that has reduced supporting bone',
        'Trauma or infection that damaged jaw structure',
        'Ridge augmentation before implant-supported dentures or full-arch treatment'
      ]
    },
    {
      heading: 'How We Perform the Procedure',
      body: [
        'Bone graft material may come from your own body or a donor source depending on the site and treatment plan. The material is placed where bone volume needs to be restored.',
        'Over time, the graft integrates with surrounding bone. Guided tissue regeneration (GTR) may be used to protect the graft with a biocompatible membrane while new bone forms.',
        'Healing timelines vary, but the goal is to create enough healthy bone volume to support implants predictably before restorative treatment continues.'
      ]
    },
    {
      heading: 'Full-Scope Implant Care In-House',
      body: [
        'Bone grafting is often combined with extractions, implant placement, or implant-supported denture planning. We map the full timeline up front so you know what to expect at each stage.',
        'If you are exploring implant-supported dentures or full-arch solutions, grafting may be an important step toward long-term stability and confident chewing.',
        'Our team also offers sedation options for anxious patients and clear post-operative instructions to support comfortable healing.'
      ]
    },
    {
      heading: 'Frequently Asked Questions',
      items: [
        'Why is bone grafting necessary for dental implants? Implants need adequate bone for stability. Grafting rebuilds volume when natural bone is insufficient.',
        'How long does recovery take? Initial healing begins within weeks, but full bone maturation often takes several months depending on the graft site and plan.',
        'Is bone grafting painful? The area is numbed for the procedure. Soreness afterward is usually manageable with standard post-operative care.',
        'Are financing options available? Yes. We offer financing paths and will review phased treatment planning during your consultation.',
        'Can bone grafting and implants happen at the same time? In some cases yes. Your provider will recommend the safest approach based on imaging and bone quality.'
      ]
    },
    {
      heading: 'Plan Your Implant Foundation',
      body: [
        `If you have been told you do not have enough bone for implants, schedule a consultation to review grafting options. Call ${PHONE} or request an appointment online to get started.`
      ]
    }
  ]
});

pages.sort((a, b) => a.route.localeCompare(b.route));
await fs.writeFile(pagesPath, JSON.stringify(pages, null, 2) + '\n', 'utf8');
console.log('Updated pages.json:', pages.length, 'pages');
