# Clearwater Dentist — live Google sync

Pulls **real Search Console** and **Google Business Profile** data into the local admin dashboard.

## Credentials (already on this machine)

Documented in `E:\Nothing\credential-routing.md`:

| Source | Where |
| --- | --- |
| **GSC OAuth** | `E:\KnightLogics-Growth-System\MainSite\.env.gsc.local` + `.gsc-token.json` |
| **GBP OAuth** | `C:\Users\nknig\.copilot-secrets\accounts.env` (`GBP_OAUTH_*`, `GBP_REFRESH_TOKEN`) |

Optional overrides in `.env.google.local` (gitignored):

- `CLEARWATER_GBP_ACCOUNT_NAME=accounts/...`
- `CLEARWATER_GBP_LOCATION_NAME=locations/...`
- `CLEARWATER_GBP_LOCATION_TITLE=Clearwater Dentist`

**GBP direct mode is recommended** on this machine because account-discovery API quota can be `0/min`. With both IDs set, sync skips discovery entirely.

### If GSC says `invalid_grant`

**Access tokens** auto-refresh on every sync. **`invalid_grant`** means the long-lived **refresh token** died (common when the OAuth app is still in Google’s “Testing” mode — often ~7 days).

Re-auth once (opens browser):

```powershell
cd "E:\Website Audit\High Prospective Clients\DentistClearwater v2"
npm run sync:google:reauth
```

Or manually:

```powershell
cd E:\KnightLogics-Growth-System\MainSite
python scripts/gsc_api.py auth
```

Then re-run `npm run sync:google`.

### If GBP says quota / `CLEARWATER_GBP_*`

Two different problems get lumped together:

1. **Account discovery blocked** — sync tries to call `mybusinessaccountmanagement.googleapis.com` to list accounts. When that API’s quota is `0/min`, discovery fails. **Fix:** set direct IDs in `.env.google.local` (see `.env.google.local.example`).

2. **All GBP APIs blocked** — if *every* Business Profile API on the CustomerAccounts GCP project shows `quota_limit_value: 0`, Google is blocking the whole project until you [request a quota increase](https://cloud.google.com/docs/quotas/help/request_increase) for `mybusinessbusinessinformation.googleapis.com` and `businessprofileperformance.googleapis.com`. Direct IDs alone will not help until quota is restored.

```powershell
npm run discover:gbp   # tries known accounts from accounts.env + address search
```

## Commands

```powershell
cd "E:\Website Audit\High Prospective Clients\DentistClearwater v2"
npm install
npm run sync:google
npm run build
npm run serve
```

Then open `http://127.0.0.1:4178/admin/` and refresh **Reports & Summary**.

## Output

Writes `public/assets/data/google-live.json` (gitignored). The admin UI merges this over demo GSC/GBP numbers when the file exists.

## GSC property

Default: `sc-domain:clearwaterdentist.com` (falls back to `https://www.clearwaterdentist.com/`). Edit `scripts/google/config.json` if needed.
