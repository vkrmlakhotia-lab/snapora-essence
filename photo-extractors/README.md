# Photo Extractors

Modular extractors for pulling photos from different photo services and dumping them to local folders with user permission.

## Current Extractors

### apple-photos/
**Status:** ✅ Working
**Description:** Extract photos from Apple Photos library (macOS)

**Run:**
```bash
cd apple-photos
python3 extract_photos.py
```

**Features:**
- Extract recent photos
- Search by person name (Kabir, Urmila, etc)
- Filter out screenshots automatically
- Rich metadata extraction (EXIF, location, quality scores, ML analysis)
- Face recognition and person-based filtering

**Files:**
- `extract_photos.py` — Main interactive script
- `run.sh` — Quick shell wrapper
- `config/settings.py` — Configuration and paths
- `src/` — Modular components
- `README.md` — Detailed documentation

---

### google-photos/
**Status:** 🚧 To be implemented
**Description:** Extract photos from Google Photos library

---

## Folder Structure

```
photo-extractors/
├── apple-photos/          ← Apple Photos extractor (working)
│   ├── extract_photos.py
│   ├── run.sh
│   ├── config/
│   ├── src/
│   └── ...
├── google-photos/         ← Google Photos extractor (planned)
│   ├── extract_photos.py
│   └── ...
└── README.md             ← This file
```

## Quick Reference

| Extractor | Status | Run Command |
|-----------|--------|------------|
| Apple Photos | ✅ | `cd apple-photos && python3 extract_photos.py` |
| Google Photos | 🚧 | Coming soon |

## Next Steps

1. **Google Photos Extractor** — Create similar structure for Google Photos
2. **Amazon Photos** — Optional support for Amazon Photos
3. **Flickr** — Optional support for Flickr

Each extractor follows the same pattern:
- Interactive CLI
- Person-based filtering
- Metadata extraction
- Local file copying with permission checks

---

**Last Updated:** April 3, 2026
**Apple Photos Version:** v1 (Working)
