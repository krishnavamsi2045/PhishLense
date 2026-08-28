# PhishLense — Upgrade Audit Report

> **Audit Date**: 2026-08-28
> **Auditor**: Phase 0 Repository Audit
> **Status**: COMPLETE — Ready for phased implementation

---

## 1. Current Architecture

```
PhishLense/
├── api/main.py                         # FastAPI app (327 lines) — ENTRY POINT
├── backend/
│   ├── main.py                         # Re-export of api.main (8 lines)
│   ├── analyzer/
│   │   ├── url_analyzer.py             # Main analysis pipeline (448 lines) — MONOLITH
│   │   ├── features/url_features.py    # 17 features + 2 metadata (192 lines)
│   │   ├── heuristics/heuristic_engine.py  # 14 rules (317 lines)
│   │   ├── ml/
│   │   │   ├── predictor.py            # Random Forest inference (34 lines)
│   │   │   └── train_model.py          # Training pipeline (224 lines)
│   │   ├── threat_intelligence/
│   │   │   ├── threat_intel_engine.py  # Unified TI (185 lines)
│   │   │   ├── virustotal.py           # VirusTotal v3 (333 lines)
│   │   │   ├── openphish.py            # OpenPhish feed (48 lines)
│   │   │   ├── google_safe_browsing.py # GSB v4 (52 lines)
│   │   │   ├── ssl_checker.py          # SSL cert check (60 lines)
│   │   │   ├── abuseipdb.py            # AbuseIPDB (47 lines) — NOT WIRED
│   │   │   ├── urlhaus.py              # URLhaus (45 lines) — NOT WIRED
│   │   │   ├── phishtank.py            # EMPTY FILE
│   │   │   ├── feed_manager.py         # Local feed CRUD (107 lines)
│   │   │   ├── feed_normalizer.py      # IOC normalization (96 lines)
│   │   │   ├── feed_downloader.py      # PhishTank download (78 lines)
│   │   │   └── feed_importer.py        # PhishTank import (70 lines)
│   │   ├── dns_analysis/
│   │   │   └── dns_intelligence.py     # EMPTY FILE
│   │   ├── ssl_analysis/
│   │   │   └── ssl_checker.py          # Duplicate of threat_intelligence/ssl_checker.py
│   │   └── reports/
│   │       └── report_generator.py     # EMPTY FILE
│   ├── api/routes.py                   # EMPTY (unused — routing in api/main.py)
│   ├── core/__init__.py                # EMPTY
│   ├── models/__init__.py              # EMPTY
│   └── services/__init__.py            # EMPTY
├── database/
│   ├── db.py                           # SQLAlchemy SQLite setup (20 lines)
│   └── models.py                       # Scan model: id, url, verdict, risk_score, created_at
├── data/
│   ├── datasets/
│   │   ├── url_dataset.csv             # 1,100 URLs (81 KB) — TRAINING DATA
│   │   └── phishing_urls.csv           # 6 URLs — OBSOLETE TEST DATA
│   ├── models/
│   │   ├── phishing_model.pkl          # Serialized RF (124 KB)
│   │   └── feature_columns.pkl         # Feature column order
│   └── threat_intelligence/
│       ├── malicious_urls.json         # 7 demo entries
│       ├── malicious_domains.json      # 4 demo entries
│       ├── malicious_ips.json          # 4 demo entries
│       └── raw/phishtank.json          # 344 bytes
├── frontend-app/                       # React 19 + Vite 8.2
│   ├── src/
│   │   ├── App.jsx, main.jsx
│   │   ├── App.css                     # 74 KB — massive stylesheet
│   │   ├── index.css                   # CSS variables + reset
│   │   ├── components/ (21 files)
│   │   ├── Pages/ (10 views)
│   │   ├── scenes/ (14 3D scenes + scene-director)
│   │   ├── hooks/ (4 hooks)
│   │   └── services/api.js
│   └── package.json
├── .env                                # Contains VT_API_KEY (COMMITTED!)
├── .gitignore                          # Missing .env.example
├── requirements.txt
├── start.bat
└── test_*.py (6 ad-hoc scripts)
```

---

## 2. Problems Discovered

### CRITICAL

| ID | Problem | File(s) | Severity |
|----|---------|---------|----------|
| C1 | **API key committed to repo** | `.env` (line 3) | 🔴 CRITICAL |
| C2 | **CORS allows all origins** | `api/main.py:36` | 🔴 CRITICAL |
| C3 | **No input validation** on `/analyze` | `api/main.py:75` | 🔴 HIGH |
| C4 | **No error handling** — raw tracebacks leak | `api/main.py` (all endpoints) | 🔴 HIGH |
| C5 | **No authentication or rate limiting** | `api/main.py` | 🔴 HIGH |

### ARCHITECTURAL

| ID | Problem | File(s) |
|----|---------|---------|
| A1 | `url_analyzer.py` is a monolith (448 lines, all pipeline logic) | `backend/analyzer/url_analyzer.py` |
| A2 | Risk score has no breakdown — only final integer | `url_analyzer.py:401-448` |
| A3 | Duplicate SSL checker files | `threat_intelligence/ssl_checker.py` vs `ssl_analysis/ssl_checker.py` |
| A4 | Empty stub files: `phishtank.py`, `dns_intelligence.py`, `report_generator.py`, `routes.py`, `core/__init__.py`, `models/__init__.py`, `services/__init__.py` | Multiple |
| A5 | AbuseIPDB and URLhaus implemented but NOT integrated into pipeline | `abuseipdb.py`, `urlhaus.py` |
| A6 | No URL validation or normalization before analysis | `url_analyzer.py:70` |
| A7 | Backend `api/` and `backend/api/` namespace collision | `api/main.py` vs `backend/api/routes.py` |

### MACHINE LEARNING

| ID | Problem | File(s) |
|----|---------|---------|
| M1 | Training dataset only 1,100 URLs | `data/datasets/url_dataset.csv` |
| M2 | No evaluation metrics recorded | `train_model.py` (prints accuracy, doesn't save) |
| M3 | No cross-validation | `train_model.py` |
| M4 | No model comparison | — |
| M5 | No feature importance / explainability | `predictor.py` |
| M6 | No model metadata (version, training date, dataset version) | — |
| M7 | Model loaded at module import — failure crashes entire app | `predictor.py:10-11` |
| M8 | `hostname` field in features not consistently handled | `url_features.py` vs `train_model.py` |

### DATABASE

| ID | Problem | File(s) |
|----|---------|---------|
| D1 | Scan model stores only 5 fields — no severity, confidence, duration | `database/models.py` |
| D2 | No analysis_duration_ms tracking | — |
| D3 | DB sessions not using context managers consistently | `api/main.py` |

### FRONTEND

| ID | Problem | File(s) |
|----|---------|---------|
| F1 | Frontend fallback generates fake results when backend offline | `hooks/useScan.js:44-87`, `Pages/ScanView.jsx:74-118` |
| F2 | Fallback results are NOT labeled as fallback | Same |
| F3 | `App.css` is 74KB — monolithic, hard to maintain | `App.css` |
| F4 | Some frontend views may display hardcoded demo data | Various Pages |

### TESTING

| ID | Problem | File(s) |
|----|---------|---------|
| T1 | No automated test suite | `tests/unit/` and `tests/integration/` are empty |
| T2 | Ad-hoc test scripts not runnable via pytest | `test_*.py` at root |
| T3 | No mocking of external APIs | — |

### THREAT INTELLIGENCE

| ID | Problem | File(s) |
|----|---------|---------|
| TI1 | Local threat feeds have only demo data (4-7 entries) | `data/threat_intelligence/` |
| TI2 | Google Safe Browsing key not configured | `.env` |
| TI3 | No TI caching — repeated calls for same URL | — |
| TI4 | No unified provider status reporting | — |
| TI5 | VirusTotal called TWICE per analysis (in `threat_intel_engine.py` AND `url_analyzer.py`) | Both files |

### PERFORMANCE

| ID | Problem | File(s) |
|----|---------|---------|
| P1 | Analysis duration not measured | `url_analyzer.py` |
| P2 | External API calls are sequential, not concurrent | `url_analyzer.py` |
| P3 | No OpenPhish feed caching TTL — only first-load cache | `openphish.py` |

---

## 3. Proposed Upgrades (Ordered by Implementation Phase)

### Phase 1: ML & Evaluation (Backend-only, no breaking changes)

| Task | Files | Risk |
|------|-------|------|
| Expand dataset to 20,000+ URLs | `data/datasets/`, new `dataset_pipeline.py` | LOW — additive |
| Create evaluation pipeline | New `evaluate_model.py` | LOW — additive |
| Add model comparison | New `evaluate_model.py` | LOW — additive |
| Add feature importance extraction | `predictor.py` | LOW — additive |
| Add model metadata | New `data/models/model_metadata.json` | LOW — additive |
| Retrain model on larger dataset | `train_model.py` | MEDIUM — changes model |
| Save evaluation results | `data/models/evaluation_results.json` | LOW — additive |

### Phase 2: Detection Pipeline Refactor (Backend, preserving API contract)

| Task | Files | Risk |
|------|-------|------|
| Add URL validation module | New `backend/analyzer/validation.py` | LOW — additive |
| Add URL normalization | New `backend/analyzer/normalization.py` | LOW — additive |
| Refactor url_analyzer.py into pipeline stages | `url_analyzer.py` | MEDIUM — core logic |
| Add risk breakdown tracking | `url_analyzer.py`, heuristic_engine.py | MEDIUM — changes response |
| Add analysis duration tracking | `url_analyzer.py` | LOW — additive |
| Improve brand impersonation | `heuristic_engine.py` | LOW — enhancement |
| Wire AbuseIPDB and URLhaus into pipeline | `url_analyzer.py`, `threat_intel_engine.py` | LOW — additive |
| Remove duplicate SSL checker | Delete `ssl_analysis/ssl_checker.py` | LOW — cleanup |
| Implement report generator | `reports/report_generator.py` | LOW — fills stub |

### Phase 3: Threat Intelligence (Backend)

| Task | Files | Risk |
|------|-------|------|
| Fix duplicate VirusTotal calls | `threat_intel_engine.py`, `url_analyzer.py` | MEDIUM — logic change |
| Add TI caching layer | New caching module | LOW — additive |
| Unified provider status API | New `/threat-intelligence/status` | LOW — additive |
| Normalize all TI responses | `threat_intel_engine.py` | MEDIUM — restructure |

### Phase 4: API Hardening (Backend)

| Task | Files | Risk |
|------|-------|------|
| Add input validation on /analyze | `api/main.py` | LOW — protective |
| Add structured error handling | `api/main.py` | MEDIUM — changes error format |
| Restrict CORS | `api/main.py` | LOW — config |
| Add rate limiting (slowapi) | `api/main.py` | LOW — additive |
| Create .env.example | New file | LOW — additive |
| Upgrade /health to system status | `api/main.py` | LOW — enhancement |
| Add Pydantic response models | `api/main.py` | MEDIUM — restructure |
| Add request ID logging | `api/main.py` | LOW — additive |

### Phase 5: Database (Backend)

| Task | Files | Risk |
|------|-------|------|
| Extend Scan model (severity, confidence, duration) | `database/models.py` | MEDIUM — migration |
| Add DB context manager helper | `database/db.py` | LOW — enhancement |

### Phase 6: Frontend — Real Data & Reliability

| Task | Files | Risk |
|------|-------|------|
| Label fallback results as LOCAL FALLBACK | `useScan.js`, `ScanView.jsx` | LOW — UI change |
| Remove/label fake statistics | Various Pages | LOW — content |
| Add backend connection indicator | `AppShell.jsx`, `Topbar.jsx` | LOW — UI |
| Add risk breakdown display | `ScanView.jsx` | MEDIUM — UI enhancement |

### Phase 7: Testing

| Task | Files | Risk |
|------|-------|------|
| Create unit tests (features, heuristics, ML, validation) | `tests/unit/` | LOW — additive |
| Create integration tests (API, database, pipeline) | `tests/integration/` | LOW — additive |
| Add pytest configuration | `conftest.py` | LOW — additive |

### Phase 8: Documentation & Final Audit

| Task | Files | Risk |
|------|-------|------|
| Rewrite README.md | `README.md` | LOW — documentation |
| Create docs/ files | `docs/` | LOW — documentation |
| Create FINAL_AUDIT.md | `docs/FINAL_AUDIT.md` | LOW — documentation |
| Create .env.example | Root | LOW — documentation |

---

## 4. Files That Need Modification

| File | Changes |
|------|---------|
| `backend/analyzer/url_analyzer.py` | Refactor into pipeline stages, add risk breakdown, remove duplicate VT call |
| `backend/analyzer/features/url_features.py` | Add new features (entropy, ratios, TLD) |
| `backend/analyzer/heuristics/heuristic_engine.py` | Improve brand impersonation, add risk breakdown output |
| `backend/analyzer/ml/predictor.py` | Add feature importance, safe model loading, model metadata |
| `backend/analyzer/ml/train_model.py` | Expanded dataset support, evaluation metrics, cross-validation |
| `backend/analyzer/threat_intelligence/threat_intel_engine.py` | Remove duplicate VT call, normalize responses, add provider status |
| `backend/analyzer/threat_intelligence/openphish.py` | Add cache TTL |
| `api/main.py` | Input validation, error handling, CORS, rate limiting, extended /health |
| `database/models.py` | Add severity, confidence, analysis_duration_ms columns |
| `database/db.py` | Add context manager helper |
| `frontend-app/src/hooks/useScan.js` | Label fallback results |
| `frontend-app/src/Pages/ScanView.jsx` | Label fallback, add risk breakdown display |
| `.gitignore` | Ensure .env coverage, add data/models/*.pkl if needed |
| `README.md` | Complete rewrite |

## 5. Files That Need Creation

| File | Purpose |
|------|---------|
| `backend/analyzer/validation.py` | URL validation |
| `backend/analyzer/normalization.py` | URL normalization |
| `backend/analyzer/ml/evaluate_model.py` | Model evaluation + comparison |
| `backend/analyzer/ml/dataset_pipeline.py` | Dataset ingestion + cleaning |
| `backend/analyzer/reports/report_generator.py` | Investigation report generation |
| `data/datasets/README.md` | Dataset provenance documentation |
| `data/datasets/phishlense_dataset.csv` | Expanded 20K+ URL dataset |
| `data/datasets/dataset_statistics.json` | Dataset stats |
| `data/models/evaluation_results.json` | Evaluation metrics |
| `data/models/model_metadata.json` | Model versioning |
| `data/models/model_comparison.json` | Multi-model comparison |
| `.env.example` | Template environment file |
| `tests/conftest.py` | Pytest fixtures |
| `tests/unit/test_features.py` | Feature extraction tests |
| `tests/unit/test_heuristics.py` | Heuristic engine tests |
| `tests/unit/test_ml.py` | ML predictor tests |
| `tests/unit/test_validation.py` | URL validation tests |
| `tests/unit/test_risk_engine.py` | Risk scoring tests |
| `tests/integration/test_api.py` | API endpoint tests |
| `tests/integration/test_database.py` | Database persistence tests |
| `tests/integration/test_pipeline.py` | End-to-end pipeline tests |
| `docs/TECHNICAL_ARCHITECTURE.md` | Architecture documentation |
| `docs/ML_EVALUATION.md` | ML evaluation documentation |
| `docs/THREAT_INTELLIGENCE.md` | TI documentation |
| `docs/API_DOCUMENTATION.md` | API documentation |
| `docs/SECURITY_REVIEW.md` | Security review |
| `docs/FUTURE_ROADMAP.md` | Future work |
| `docs/FINAL_AUDIT.md` | Final audit checklist |

---

## 6. Recommended Implementation Order

```
PHASE 1 ─── ML + Dataset + Evaluation ──────── (backend only, no API changes)
    │
PHASE 2 ─── Detection Pipeline Refactor ─────── (backend, preserving API response)
    │
PHASE 3 ─── Threat Intelligence ─────────────── (backend, fix duplicate calls)
    │
PHASE 4 ─── API Hardening ──────────────────── (validation, errors, CORS, rate limit)
    │
PHASE 5 ─── Database Upgrade ───────────────── (extend Scan model)
    │
PHASE 6 ─── Frontend Real Data + UI ─────────── (label fallbacks, real stats)
    │
PHASE 7 ─── Automated Testing ──────────────── (unit + integration)
    │
PHASE 8 ─── Documentation + Final Audit ─────── (README, docs/, FINAL_AUDIT)
```

Each phase should be verified before proceeding to the next.
