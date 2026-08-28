# PhishLense Dataset Provenance & Metadata

## Overview
- **Dataset Name**: PhishLense Comprehensive URL Dataset (2026 Edition)
- **File**: `phishlense_dataset.csv`
- **Total Unique Records**: 65,718
- **Phishing Samples (label=1)**: 38,268 (58.23%)
- **Legitimate Samples (label=0)**: 27,450 (41.77%)
- **Collection & Build Date**: 2026-08-28

## Sources & Provenance
1. **OpenPhish Community Feed** (`OpenPhish_Live_Feed`): Active verified phishing targets.
2. **URLhaus Abuse.ch Feed** (`URLhaus_Recent`): Verified malicious distribution endpoints.
3. **PhishTank & Academic Phishing Corpuses** (`PhishTank_Pattern_Feed`, `Academic_Phishing_Corpus`): Curated phishing campaign architectures.
4. **Tranco Top 1M Whitelist & Benign Research Corpuses** (`Tranco_Curated_Corpus`, `Academic_Benign_Corpus`): High-reputation benign infrastructure.
5. **PhishLense Seed V1** (`phishlense_seed_v1`): Initial seed dataset.

## Preprocessing & Data Hygiene
- RFC 3986 URL parsing & structural validation.
- Schema & port normalization.
- Exact and canonical deduplication (355 duplicates removed).
- Conflict resolution (0 ambiguous labels purged).
- Raw records processed: 66,073.

## Category Breakdown
{
  "legitimate_web": 27431,
  "malware_distribution": 15797,
  "scam_infrastructure": 11944,
  "credential_harvesting": 10260,
  "brand_impersonation": 141,
  "ip_phishing": 126,
  "legitimate_enterprise": 19
}

## Validation Status
- **Acceptance Threshold**: >= 20,000 unique records.
- **Current Total**: 65,718 records.
- **Status**: PASSED
