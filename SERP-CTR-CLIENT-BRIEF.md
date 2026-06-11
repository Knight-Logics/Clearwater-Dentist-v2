# Search Result Improvements — Client Brief

**Prepared for:** Dr. Nadia Pokrovskaya, Clearwater Dentist  
**Prepared by:** Knight Logics  
**Date:** June 11, 2026  
**Site:** clearwaterdentist.com (v2 rebuild — not yet live on production)

---

## Why we did this

Your Google Search Console data shows the website is **visible** but often **not clicked**:

| Metric (16 months) | Value |
|---------------------|------:|
| Impressions | 208,397 |
| Clicks | 1,386 |
| Overall CTR | **0.67%** |

That means Google is showing your pages in search results, but the **headline and short description** under the link are not winning enough clicks compared to competitors.

This is not a ranking-only problem. It is a **SERP presentation** problem — how your listing looks on Google compared to other dentists in Clearwater.

We used:

1. **Your real Google Search Console data** (queries, impressions, CTR by page)
2. **Live competitor listings** via Serper (Google results API) on June 11, 2026
3. **SERP snippet length checks** (title ~600px / description ~920px display limits)

---

## What we changed (and why)

### 1. Homepage — `/`

**GSC signal:** Query *"dentist clearwater"* — **22,906 impressions**, only **39 clicks** (~0.17% CTR).

| | Live (Duda) | New (v2) |
|---|-------------|----------|
| **Title** | Clearwater Dentist: Family & Cosmetic Dentistry in Clearwater, FL | **Dentist in Clearwater, FL \| Family, Cosmetic & Emergency Care** |
| **Google rank (Jun 11)** | Position **#3** for *dentist clearwater fl* | Same URL — copy improved before relaunch |

**Why:** The new title leads with the exact phrase people search (**“Dentist in Clearwater, FL”**), adds **Emergency Care** as a differentiator, and stays within Google’s display width.

**Meta description (new):**  
*Dentist in Clearwater, FL for family, cosmetic, and emergency care. Same-day visits with Dr. Nadia Pokrovskaya. Book online today.*

**Why:** Shorter, benefit-led, includes doctor name and same-day emergency — matches what anxious searchers look for.

**Note on H1:** The on-page headline remains welcoming (“Welcome to the Office of Dr. Nadia”). The **title tag** is what Google usually shows as the blue link; we optimized that for search intent while keeping your brand voice on the page.

---

### 2. Emergency dentistry — `/emergency-dentistry-clearwater-fl`

**GSC signal:** **20,522 impressions**, **~0.06% CTR** — high visibility, almost no clicks.

| | Live (Duda) | New (v2) |
|---|-------------|----------|
| **Title** | Emergency Dentistry in Clearwater, FL \| Clearwater Dentist | **Emergency Dentist Clearwater, FL \| Same-Day Urgent Dental Care** |
| **Google rank (Jun 11)** | **Not in top 10** for *emergency dentist clearwater fl* | Opportunity to compete after relaunch |

**Competitors in top 5 (Jun 11):**

1. emergencydentistclearwaterfl.com — phone + “24/7 Call Now!”
2. dentaler.com — geo + zip
3. clearwatermoderndentistry.com — “Emergency Dentistry in Clearwater, FL”
4. dentistinclearwater.com — “Emergency Dental Care…”
5. suncoastdentalarts.com — phone in title

**Why our change:** Live title used the word **“Dentistry”** (the field), not **“Dentist”** (what people type). The new title matches search language, adds **Same-Day** and **Urgent**, and the description includes your **phone number** for high-intent clicks.

**Meta description (new):**  
*Need an emergency dentist in Clearwater, FL? Same-day care for tooth pain, broken teeth, and swelling. Call (727) 285-8132 for fast relief.*

---

### 3. XERF skin tightening — `/XERF-skin-tightening`

**GSC signal:** **366 clicks**, **32,000+ impressions** — your strongest service page; worth protecting.

| | Live (Duda) | New (v2) |
|---|-------------|----------|
| **Title** | XERF Skin Tightening in Clearwater, FL | **XERF Skin Tightening Clearwater, FL \| Non-Surgical Facial Renewal** |
| **Google rank (Jun 11)** | **#1** for *xerf skin tightening clearwater* | Maintain #1 with clearer benefit language |

**Why:** Adds **Non-Surgical Facial Renewal** so the listing explains the treatment, not just the brand name.

**Meta description (new):**  
*XERF skin tightening in Clearwater, FL. Non-surgical facial renewal to firm skin and soften fine lines with little downtime. Book a consultation.*

---

### 4. TMJ treatment — `/tmj-treatment-clearwater-fl`

**GSC signal:** **43 clicks** — meaningful traffic page.

| | New (v2) |
|---|----------|
| **Title** | TMJ Treatment Clearwater, FL \| Jaw Pain & Teeth Grinding Relief |
| **Google rank (Jun 11)** | **#3** for *tmj treatment clearwater fl* |

**Why:** Title names the **symptoms** people feel (jaw pain, grinding), not only “TMJ.”

**Meta description (new):**  
*TMJ treatment in Clearwater, FL for jaw pain, clicking, and teeth grinding. Custom appliances from Dr. Nadia Pokrovskaya.*

---

### 5. Toothache article — `/taming-toothaches-home-remedies-and-when-to-see-a-dentist`

**GSC signal:** **41 clicks**, **16,000+ impressions**.

| | Live-style | New (v2) |
|---|------------|----------|
| **Title** | Long article-style title | **Toothache Home Remedies & When to See a Dentist \| Clearwater, FL** |
| **Google rank (Jun 11)** | Not top 10 for generic *toothache home remedies* (Mayo, Healthline rank) | Page targets informational intent + local follow-up |

**Why:** Shortened title for mobile display; description ties home remedies to **when to see a dentist in Clearwater**.

---

## Other sitewide SEO fixes (supporting CTR & trust)

These were done in the same launch pass and affect how Google and patients perceive the practice:

| Issue on live site | Fix in v2 |
|--------------------|-----------|
| 4 duplicate H1s on homepage | Single H1 |
| “X **at** Clearwater, FL” on ~25 service H1s | Corrected to “**in** Clearwater, FL” |
| Missing or broken meta descriptions | All 82 pages have descriptions |
| Emoji in SERP titles | Removed |
| Multiple phone numbers on site | One canonical: **(727) 285-8132** |
| Weak blog → service internal links | 13 blog posts link to money pages |
| 20K+ emergency impressions / near-zero CTR | Emergency title + meta rewritten (above) |

---

## What we measured (June 11, 2026)

**Tool:** Serper.dev (live Google results API)  
**Location:** Clearwater, Florida  
**Raw data:** `reports/serp-snapshot-2026-06-11.json`  
**Re-run anytime:** `npm run serp:snapshot`

This is the first formal SERP snapshot saved for this project. Earlier work used GSC exports and manual audit only.

---

## What to expect after launch

1. **CTR will not change overnight.** Google must recrawl the new site on **www.clearwaterdentist.com**.
2. **Compare after 30–60 days** in Search Console (same URLs, new titles/descriptions).
3. **Emergency page** is the biggest upside: 20K+ impressions at 0.06% CTR — even a move to 1% CTR ≈ **200 additional clicks/year** from that page alone.
4. **Homepage** query *dentist clearwater* at 0.17% CTR — target 1–2% after relaunch.

---

## What we are not claiming

- These changes do not guarantee #1 rankings.
- Competitors use aggressive titles (24/7, phone numbers). We kept copy **accurate** to your hours (Mon–Fri 9–5) and same-day emergency positioning.
- Rich Results / FAQ schema is separate and already built on 55 pages — it helps eligibility for enhanced listings but does not replace good titles and descriptions.

---

## Summary for Dr. Nadia (one paragraph)

*We reviewed how your website appears on Google using your own Search Console data and live competitor listings. The site was showing up often but not getting clicked — especially the emergency page (20,000+ views, almost no clicks). We rewrote the search headlines and short descriptions for your most important pages so they match what patients type, highlight same-day emergency care and your phone number where appropriate, and read clearly on mobile. These updates go live with the new website; we’ll track click-through rates in Google Search Console after launch.*

---

*Questions: Knight Logics — this file lives in the v2 project as `SERP-CTR-CLIENT-BRIEF.md`.*
