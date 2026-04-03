# Apple Photos Metadata Spreadsheet

I've created a **CSV file** with all 130+ metadata fields from Apple Photos database.

## File Location
📁 `/Users/vikramadityalakhotia/Documents/Claude/Projects/Snapora/APPLE_PHOTOS_METADATA.csv`

## What's Inside

**Columns:**
- **Category** — Which group (Core Identifiers, Date/Time, Quality/AI Scoring, etc)
- **Field Name** — Exact database field name (ZUUID, ZKIND, etc)
- **Data Type** — INTEGER, FLOAT, VARCHAR, TIMESTAMP, BLOB
- **Priority** — CRITICAL, VERY HIGH, HIGH, MEDIUM, LOW, VERY LOW
- **Mutable** — Yes/No (can user change this value?)
- **Synced** — Yes/No (syncs across devices via iCloud?)
- **Range/Example Values** — What values are possible
- **What It Is** — Plain English explanation
- **Key Use Cases** — 3-5 specific ways to use it

## How to Import to Google Sheets

### Option 1: Direct Import (Recommended)
1. Go to **Google Sheets** (sheets.google.com)
2. Click **"+ New"** → **"Spreadsheet"**
3. Go to **File** → **Import**
4. Select **"Upload"** tab
5. Find and upload: `APPLE_PHOTOS_METADATA.csv`
6. Choose **"Create new spreadsheet"**
7. Done! Sheet will populate with all fields

### Option 2: Copy-Paste
1. Open the CSV file in Excel or Google Sheets locally
2. Select all (Cmd+A)
3. Copy (Cmd+C)
4. Create new Google Sheet
5. Paste (Cmd+V)

### Option 3: Manual URL Creation
Share the CSV publicly:
1. Save CSV to Google Drive
2. Get shareable link
3. Replace `?edit` with `/edit` in URL
4. Import via File → Import → Paste URL

## Quick Facts

**Total Fields: 134**

| Priority | Count | Fields |
|----------|-------|--------|
| CRITICAL | 6 | ZUUID, ZKIND, ZDATECREATED, ZFAVORITE, ZISDETECTEDSCREENSHOT, ZTRASHEDSTATE |
| VERY HIGH | 5 | ZLATITUDE, ZLONGITUDE, ZICONICSCORE, ZOVERALLAESTHETICSCORE |
| HIGH | 6 | ZFILENAME, ZWIDTH, ZHEIGHT, ZORIENTATION, ZCLOUDISMYASSET, DUPLICATION |
| MEDIUM | 40+ | Cloud sync, organization, video, analysis and more |
| LOW | 30+ | Memories, highlights, library management |
| VERY LOW | 45+ | Internal database, specialized fields |

## Color Coding (in Excel/Google Sheets)
- **Red** = CRITICAL - Must use
- **Orange** = VERY HIGH - Very important
- **Gold** = HIGH - Important
- **Light Green** = MEDIUM - Useful
- **Light Blue** = LOW - Optional
- **Light Gray** = VERY LOW - Internal/niche

## Recommended Implementation Order

### Phase 1 (Core Functionality)
Use these 13 fields first:
```
ZUUID, ZKIND, ZDATECREATED, ZADDEDDATE, ZWIDTH, ZHEIGHT
ZFAVORITE, ZHIDDEN, ZISDETECTEDSCREENSHOT, ZTRASHEDSTATE
ZLATITUDE, ZLONGITUDE, ZORIENTATION
```

### Phase 2 (Smart Features)
Add these fields next:
```
ZICONICSCORE, ZOVERALLAESTHETICSCORE, ZPROMOTIONSCORE
ZFACEAREAPOINTS, ZMOMENT, ZDURATION, ZUNIFORMTYPEIDENTIFIER
ZMODIFICATIONDATE, ZCLOUDISMYASSET
```

### Phase 3 (Advanced)
Technical fields:
```
ZHDRGAIN, ZHDRTYPE, ZDEPTHTYPE, ZSPATIALTYPE
Technical/ML analysis fields
```

## Notes

- **ZTRASHEDSTATE = 0** is what you already filter in your script!
- **LATITUDE/LONGITUDE** = -180.0 means no location data
- **ZICONICSCORE** = -1.0 for videos (not applicable)
- Most timestamps use Apple's special format (needs conversion)
- Some fields are corrupted in real databases (check for validity)

## Sharing

You can:
1. Share the Google Sheet with team members
2. Make it public for documentation
3. Use it as a reference while coding
4. Filter/sort by Priority to focus on what matters

---

**Ready to import!** Use the CSV file in your Snapora project folder.
