# Record Tracer: Add Campaign Finance, Federal Courts & Lobbyist Links

## OVERVIEW
Add two new sections to the existing `PublicRecordsLinks` component: "Political & Campaign Finance" and "Federal Records." These are additional public record databases that complete the background research picture.

## DEEP-LINK CLASSIFICATION
Some databases accept GET parameters in the URL (we can pre-populate the search name). Others are form-only (POST) or use JavaScript, so we can only link to the search landing page. The UI should handle both cases.

---

## NEW SECTION 1: "Political & Campaign Finance"

### Sources to add:

**1. FEC Individual Contributions** ✅ DEEP-LINKABLE
- URL pattern: `https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(searchName)}&contributor_state=FL`
- Agency: Federal Election Commission
- Description: Federal political donations ($200+)
- Icon: Vote (from lucide-react)
- This is the best one — it accepts name + state directly in the URL and returns results

**2. OpenSecrets Donor Lookup** ✅ DEEP-LINKABLE
- URL pattern: `https://www.opensecrets.org/donor-lookup/results?name=${encodeURIComponent(searchName)}&order=desc`
- Agency: OpenSecrets (Center for Responsive Politics)
- Description: Federal campaign contributions with industry analysis
- Icon: DollarSign
- Accepts name in URL, returns donor results page

**3. Florida Campaign Finance (Division of Elections)** ❌ LANDING PAGE ONLY
- URL: `https://dos.elections.myflorida.com/campaign-finance/contributions/`
- Agency: FL Division of Elections
- Description: State-level campaign contributions since 1996
- Icon: FileText
- Form-based (POST), cannot pre-populate name. Link goes to search page.

**4. FollowTheMoney (State Contributions)** ❌ LANDING PAGE ONLY
- URL: `https://www.followthemoney.org/`
- Agency: OpenSecrets / National Institute on Money in Politics
- Description: State-level candidate contributions, all 50 states
- Icon: Briefcase
- Entity-based search, cannot deep-link by name

**5. FL Legislature Lobbyist Directory** ❌ LANDING PAGE ONLY
- URL: `https://www.leg.state.fl.us/lobbyist/index.cfm?Mode=Directory&Submenu=3&Tab=lobbyist`
- Agency: Florida Legislature (Online Sunshine)
- Description: Registered legislative branch lobbyists & principals
- Icon: Building2
- Alphabetical browse only, no name search in URL

**6. FL Executive Branch Lobbyist Directory** ❌ LANDING PAGE ONLY
- URL: `https://www.floridalobbyist.gov/LobbyistInformation/ExecutiveFirmDirectory`
- Agency: FL Lobbyist Registration Office
- Description: Registered executive branch lobbyists & firms
- Icon: Building2
- Browse-only directory

---

## NEW SECTION 2: "Federal Records"

### Sources to add:

**7. CourtListener / RECAP Archive** ✅ DEEP-LINKABLE
- URL pattern: `https://www.courtlistener.com/?q=${encodeURIComponent(searchName)}&type=r&order_by=score+desc`
- Agency: Free Law Project (CourtListener)
- Description: Federal court cases, dockets & PACER documents
- Icon: Gavel
- Accepts search query + type=r (RECAP) in URL. Free alternative to PACER.

**8. CourtListener Case Law (Opinions)** ✅ DEEP-LINKABLE
- URL pattern: `https://www.courtlistener.com/?q=${encodeURIComponent(searchName)}&type=o&order_by=score+desc`
- Agency: Free Law Project (CourtListener)
- Description: Federal & state court opinions and decisions
- Icon: Scale
- Same as above but type=o for opinions

**9. FAA Aircraft Registry (Name Search)** ❌ LANDING PAGE ONLY
- URL: `https://registry.faa.gov/aircraftinquiry/Search/NameInquiry`
- Agency: Federal Aviation Administration
- Description: Aircraft ownership by registrant name
- Icon: Search (or use a generic icon)
- Form-based, cannot pre-populate name

**10. IRS Tax Exempt Organization Search** ❌ LANDING PAGE ONLY
- URL: `https://apps.irs.gov/app/eos/`
- Agency: Internal Revenue Service
- Description: Nonprofit & charity 990 filings and tax-exempt status
- Icon: FileText
- Form-based search

**11. FL Charity / Solicitation Search** ❌ LANDING PAGE ONLY
- URL: `https://csapp.fdacs.gov/CSPublicApp/CheckACharity/CheckACharity.aspx`
- Agency: FL Dept. of Agriculture & Consumer Services
- Description: Registered charities and solicitation organizations in Florida
- Icon: ShieldAlert
- ASP.NET form, cannot deep-link

---

## UI IMPLEMENTATION

### Visual distinction between deep-linkable and landing-page links:

For **deep-linkable** sources (FEC, OpenSecrets, CourtListener):
- Button text: `Search for "[searchName]" →`
- The URL is constructed dynamically with the search name injected
- These are the HIGH VALUE links — make them visually prominent (primary/accent styling)

For **landing page only** sources (FL DOS, FollowTheMoney, FAA, IRS, etc.):
- Button text: `Open Search Page →`
- Show a small helper note under the button: `Enter name manually on the external site`
- Use muted/secondary styling to differentiate from deep-linked sources
- Still valuable — journalists know to copy/paste the name

### Section layout in PublicRecordsLinks component:

Add these two new sections BETWEEN "Professional Licenses" and "Statewide Records":

```
Professional Licenses (existing)
─────────────────────────
Political & Campaign Finance (NEW)
  ├── FEC Individual Contributions     [Search for "John Smith" →]  ← deep-linked, prominent
  ├── OpenSecrets Donor Lookup         [Search for "John Smith" →]  ← deep-linked, prominent
  ├── FL Campaign Finance (DOS)        [Open Search Page →]         ← landing page, muted
  ├── FollowTheMoney                   [Open Search Page →]         ← landing page, muted
  ├── FL Legislative Lobbyists         [Open Search Page →]         ← landing page, muted
  └── FL Executive Branch Lobbyists    [Open Search Page →]         ← landing page, muted
─────────────────────────
Federal Records (NEW)
  ├── CourtListener RECAP (Dockets)    [Search for "John Smith" →]  ← deep-linked, prominent
  ├── CourtListener (Opinions)         [Search for "John Smith" →]  ← deep-linked, prominent
  ├── FAA Aircraft Registry            [Open Search Page →]         ← landing page, muted
  ├── IRS Tax Exempt Orgs              [Open Search Page →]         ← landing page, muted
  └── FL Charity Search (FDACS)        [Open Search Page →]         ← landing page, muted
─────────────────────────
Statewide Records (existing)
County Property Appraisers (existing)
County Clerk / Official Records (existing)
```

### Data structure addition:

Add to the existing data file (e.g. `src/data/florida-public-records.ts` or wherever the current sources are defined):

```typescript
export interface RecordSource {
  name: string;
  agency: string;
  description: string;
  icon: string;
  // NEW FIELDS:
  deepLinkable: boolean;
  urlTemplate: string; // use ${name} as placeholder for search name, or static URL
}

export const CAMPAIGN_FINANCE_SOURCES: RecordSource[] = [
  {
    name: "FEC Individual Contributions",
    agency: "Federal Election Commission",
    description: "Federal political donations ($200+)",
    icon: "Vote",
    deepLinkable: true,
    urlTemplate: "https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${name}&contributor_state=FL"
  },
  {
    name: "OpenSecrets Donor Lookup",
    agency: "OpenSecrets",
    description: "Federal campaign contributions with industry analysis",
    icon: "DollarSign",
    deepLinkable: true,
    urlTemplate: "https://www.opensecrets.org/donor-lookup/results?name=${name}&order=desc"
  },
  {
    name: "FL Campaign Finance",
    agency: "FL Division of Elections",
    description: "State-level contributions since 1996",
    icon: "FileText",
    deepLinkable: false,
    urlTemplate: "https://dos.elections.myflorida.com/campaign-finance/contributions/"
  },
  {
    name: "FollowTheMoney",
    agency: "OpenSecrets / NIMSP",
    description: "State-level candidate contributions, all 50 states",
    icon: "Briefcase",
    deepLinkable: false,
    urlTemplate: "https://www.followthemoney.org/"
  },
  {
    name: "FL Legislative Lobbyists",
    agency: "Florida Legislature",
    description: "Registered legislative branch lobbyists & principals",
    icon: "Building2",
    deepLinkable: false,
    urlTemplate: "https://www.leg.state.fl.us/lobbyist/index.cfm?Mode=Directory&Submenu=3&Tab=lobbyist"
  },
  {
    name: "FL Executive Lobbyists",
    agency: "FL Lobbyist Registration Office",
    description: "Registered executive branch lobbyists & firms",
    icon: "Building2",
    deepLinkable: false,
    urlTemplate: "https://www.floridalobbyist.gov/LobbyistInformation/ExecutiveFirmDirectory"
  }
];

export const FEDERAL_RECORD_SOURCES: RecordSource[] = [
  {
    name: "Federal Court Dockets (RECAP)",
    agency: "Free Law Project / CourtListener",
    description: "Federal court cases, dockets & PACER documents (free)",
    icon: "Gavel",
    deepLinkable: true,
    urlTemplate: "https://www.courtlistener.com/?q=${name}&type=r&order_by=score+desc"
  },
  {
    name: "Federal & State Court Opinions",
    agency: "Free Law Project / CourtListener",
    description: "Court opinions and legal decisions",
    icon: "Scale",
    deepLinkable: true,
    urlTemplate: "https://www.courtlistener.com/?q=${name}&type=o&order_by=score+desc"
  },
  {
    name: "FAA Aircraft Registry",
    agency: "Federal Aviation Administration",
    description: "Aircraft ownership by registrant name",
    icon: "Search",
    deepLinkable: false,
    urlTemplate: "https://registry.faa.gov/aircraftinquiry/Search/NameInquiry"
  },
  {
    name: "IRS Tax Exempt Organizations",
    agency: "Internal Revenue Service",
    description: "Nonprofit 990 filings & tax-exempt status",
    icon: "FileText",
    deepLinkable: false,
    urlTemplate: "https://apps.irs.gov/app/eos/"
  },
  {
    name: "FL Charity Search",
    agency: "FL Dept. of Agriculture",
    description: "Registered charities & solicitation organizations",
    icon: "ShieldAlert",
    deepLinkable: false,
    urlTemplate: "https://csapp.fdacs.gov/CSPublicApp/CheckACharity/CheckACharity.aspx"
  }
];
```

### Rendering logic for the SourceCard component:

Update the existing `SourceCard` component (or create a new variant) to handle both link types:

```tsx
function SourceCard({ source, searchName }: { source: RecordSource; searchName: string }) {
  const Icon = ICON_MAP[source.icon] || Search;
  
  const url = source.deepLinkable
    ? source.urlTemplate.replace('${name}', encodeURIComponent(searchName))
    : source.urlTemplate;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="...">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
        <div className="flex-1">
          <div className="font-medium text-sm">{source.name}</div>
          <div className="text-xs text-muted-foreground">{source.agency}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{source.description}</div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>
      {source.deepLinkable ? (
        <div className="text-xs font-medium text-accent mt-1.5">
          Search for "{searchName}" →
        </div>
      ) : (
        <div className="text-xs text-muted-foreground/70 mt-1.5">
          Open search page · enter name manually
        </div>
      )}
    </a>
  );
}
```

### "Copy Name" helper button:

Add a small "Copy name to clipboard" button at the top of the PublicRecordsLinks component, near the header. This helps journalists quickly copy the search name before clicking any landing-page-only link:

```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => {
    navigator.clipboard.writeText(searchName);
    // show brief toast or change button text to "Copied!"
  }}
  className="text-xs"
>
  <Copy className="h-3 w-3 mr-1" />
  Copy "{searchName}"
</Button>
```

This is especially helpful for the landing-page-only links where the user needs to paste the name into an external form.

## IMPORTANT NOTES
- All links open in new tab (`target="_blank" rel="noopener noreferrer"`)
- Deep-linked URLs must use `encodeURIComponent()` on the search name
- The FEC link pre-filters to Florida (`contributor_state=FL`) — this is correct for a Florida-focused tool
- CourtListener is free and does not require authentication for basic searches
- OpenSecrets may show a paywall for full results — that's expected, the basic results are still useful
- The FL DOS campaign finance link is the CONTRIBUTIONS search page specifically, not the general campaign finance landing page
- Keep existing sections (Professional Licenses, Statewide Records, County Property, County Clerk) exactly as they are
- These new sections slot in between Professional Licenses and Statewide Records
