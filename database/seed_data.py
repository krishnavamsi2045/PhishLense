"""
PhishLense Enterprise Automatic Database Seeder
Seeds users, roles, audit logs, API keys, and 160+ historical multi-category scans.
"""

from datetime import datetime, timedelta, timezone
import random
from database.models import User, Scan, AuditLog, ApiKey, SystemMetric
from backend.auth.security import hash_password

INITIAL_USERS = [
    {
        "email": "Phishlense@analyst.com",
        "full_name": "PhishLense Lead Analyst",
        "password": "Phish@Lense",
        "role": "ADMIN",
        "organization": "PhishLense Cyber Defense Core",
    },
    {
        "email": "admin@phishlense.io",
        "full_name": "SOC Commander Admin",
        "password": "Admin@12345",
        "role": "ADMIN",
        "organization": "PhishLense Cyber Defense Core",
    },
    {
        "email": "analyst@phishlense.io",
        "full_name": "Senior Threat Analyst",
        "password": "Analyst@12345",
        "role": "USER",
        "organization": "Global SOC Operations",
    },
    {
        "email": "sarah.chen@phishlense.io",
        "full_name": "Sarah Chen",
        "password": "User@12345",
        "role": "USER",
        "organization": "Incident Response Team",
    },
    {
        "email": "marcus.vance@phishlense.io",
        "full_name": "Marcus Vance",
        "password": "User@12345",
        "role": "USER",
        "organization": "Threat Intelligence Unit",
    },
    {
        "email": "elena.rostova@phishlense.io",
        "full_name": "Elena Rostova",
        "password": "User@12345",
        "role": "ADMIN",
        "organization": "Infrastructure Security",
    },
]

INITIAL_SEEDS = [
    # Safe / Clean Infrastructure (55 URLs)
    ("https://www.google.com/search?q=cybersecurity+defense", "SAFE", 0, "MINIMAL"),
    ("https://en.wikipedia.org/wiki/Phishing", "SAFE", 0, "MINIMAL"),
    ("https://github.com/torvalds/linux", "SAFE", 0, "MINIMAL"),
    ("https://www.microsoft.com/en-us/security", "SAFE", 0, "MINIMAL"),
    ("https://appleid.apple.com/", "SAFE", 0, "MINIMAL"),
    ("https://aws.amazon.com/products/security/", "SAFE", 0, "MINIMAL"),
    ("https://www.cloudflare.com/learning/access-management/what-is-zero-trust/", "SAFE", 0, "MINIMAL"),
    ("https://stackoverflow.com/questions/tagged/python", "SAFE", 0, "MINIMAL"),
    ("https://www.python.org/downloads/release/python-3130/", "SAFE", 0, "MINIMAL"),
    ("https://www.mozilla.org/en-US/firefox/new/", "SAFE", 0, "MINIMAL"),
    ("https://www.docker.com/products/docker-desktop/", "SAFE", 0, "MINIMAL"),
    ("https://kubernetes.io/docs/concepts/overview/", "SAFE", 0, "MINIMAL"),
    ("https://mit.edu/research/computer-science", "SAFE", 0, "MINIMAL"),
    ("https://stanford.edu/academics/departments", "SAFE", 0, "MINIMAL"),
    ("https://harvard.edu/programs/cyber-policy", "SAFE", 0, "MINIMAL"),
    ("https://www.ox.ac.uk/research/initiatives", "SAFE", 0, "MINIMAL"),
    ("https://www.nature.com/articles/s41586-026-0001", "SAFE", 0, "MINIMAL"),
    ("https://ieeexplore.ieee.org/document/9876543", "SAFE", 0, "MINIMAL"),
    ("https://www.sciencedirect.com/science/article/pii/S1234", "SAFE", 0, "MINIMAL"),
    ("https://www.reuters.com/technology/cybersecurity/", "SAFE", 0, "MINIMAL"),
    ("https://www.bbc.com/news/technology-6819283", "SAFE", 0, "MINIMAL"),
    ("https://www.nytimes.com/section/technology", "SAFE", 0, "MINIMAL"),
    ("https://www.theguardian.com/technology/data-computer-security", "SAFE", 0, "MINIMAL"),
    ("https://www.bloomberg.com/cybersecurity", "SAFE", 0, "MINIMAL"),
    ("https://www.forbes.com/innovation/", "SAFE", 0, "MINIMAL"),
    ("https://stripe.com/docs/security/guide", "SAFE", 0, "MINIMAL"),
    ("https://www.paypal.com/us/home", "SAFE", 0, "MINIMAL"),
    ("https://www.amazon.com/gp/help/customer/display.html", "SAFE", 0, "MINIMAL"),
    ("https://www.walmart.com/help", "SAFE", 0, "MINIMAL"),
    ("https://www.target.com/c/electronics/-/N-5xtg6", "SAFE", 0, "MINIMAL"),
    ("https://www.ebay.com/help/account/protecting-account", "SAFE", 0, "MINIMAL"),
    ("https://shopify.dev/docs/apps", "SAFE", 0, "MINIMAL"),
    ("https://www.cdc.gov/flu/about/index.html", "SAFE", 0, "MINIMAL"),
    ("https://www.nasa.gov/missions/artemis/", "SAFE", 0, "MINIMAL"),
    ("https://www.who.int/emergencies/disease-outbreak-news", "SAFE", 0, "MINIMAL"),
    ("https://europa.eu/european-union/index_en", "SAFE", 0, "MINIMAL"),
    ("https://www.nih.gov/health-information", "SAFE", 0, "MINIMAL"),
    ("https://weather.com/weather/today/l/USNY0996", "SAFE", 0, "MINIMAL"),
    ("https://www.imdb.com/chart/top/", "SAFE", 0, "MINIMAL"),
    ("https://www.booking.com/hotel/us/times-square.html", "SAFE", 0, "MINIMAL"),
    ("https://www.airbnb.com/rooms/10892019", "SAFE", 0, "MINIMAL"),
    ("https://www.tripadvisor.com/Attractions-g60763", "SAFE", 0, "MINIMAL"),
    ("https://medium.com/tag/machine-learning", "SAFE", 0, "MINIMAL"),
    ("https://reddit.com/r/netsec/", "SAFE", 0, "MINIMAL"),
    ("https://twitch.tv/directory", "SAFE", 0, "MINIMAL"),
    ("https://spotify.com/us/premium/", "SAFE", 0, "MINIMAL"),
    ("https://slack.com/features/security", "SAFE", 0, "MINIMAL"),
    ("https://notion.so/product/enterprise", "SAFE", 0, "MINIMAL"),
    ("https://canva.com/templates/", "SAFE", 0, "MINIMAL"),
    ("https://zoom.us/security", "SAFE", 0, "MINIMAL"),
    ("https://dropbox.com/business/trust/security", "SAFE", 0, "MINIMAL"),
    ("https://gitlab.com/explore/projects", "SAFE", 0, "MINIMAL"),
    ("https://apache.org/licenses/", "SAFE", 0, "MINIMAL"),
    ("https://archive.org/web/", "SAFE", 0, "MINIMAL"),
    ("https://vimeo.com/categories", "SAFE", 0, "MINIMAL"),

    # Suspicious Anomaly Flags (50 URLs)
    ("http://bit.ly/3xY7kL9_secure_redirect", "SUSPICIOUS", 42, "MEDIUM"),
    ("http://tinyurl.com/account-verify-9912", "SUSPICIOUS", 55, "MEDIUM"),
    ("http://t.co/kX928aN1_auth", "SUSPICIOUS", 38, "LOW"),
    ("http://is.gd/sysupdate2026", "SUSPICIOUS", 45, "MEDIUM"),
    ("http://rb.gy/98dfa1-session", "SUSPICIOUS", 48, "MEDIUM"),
    ("http://secure-login.duckdns.org:8080/portal", "SUSPICIOUS", 54, "MEDIUM"),
    ("http://account-check.no-ip.biz:8443/auth.php", "SUSPICIOUS", 52, "MEDIUM"),
    ("http://cloud-auth-tunnel.ngrok-free.app/login", "SUSPICIOUS", 49, "MEDIUM"),
    ("http://system-diagnostics.localtunnel.me/check", "SUSPICIOUS", 46, "MEDIUM"),
    ("http://freeflarum-account-sync.org/verify", "SUSPICIOUS", 40, "LOW"),
    ("http://customer-support-portal.top/ticket?ref=direct", "SUSPICIOUS", 50, "MEDIUM"),
    ("http://system-security-check.xyz/report.html", "SUSPICIOUS", 52, "MEDIUM"),
    ("http://client-billing-center.club/invoice/8912", "SUSPICIOUS", 48, "MEDIUM"),
    ("http://global-rewards-claim.buzz/lottery/spin", "SUSPICIOUS", 53, "MEDIUM"),
    ("http://document-shared-view.work/folder?id=88a", "SUSPICIOUS", 44, "MEDIUM"),
    ("http://id-verification-agent.icu/auth/step1", "SUSPICIOUS", 51, "MEDIUM"),
    ("http://urgent-notice-security.cam/session/expired", "SUSPICIOUS", 55, "MEDIUM"),
    ("http://portal-auth-gate.cfd/login.html", "SUSPICIOUS", 47, "MEDIUM"),
    ("http://multi-stage-verify.sbs/renew-service", "SUSPICIOUS", 52, "MEDIUM"),
    ("http://security-update-center.tk/confirm.php", "SUSPICIOUS", 54, "MEDIUM"),
    ("http://support-desk-tickets.ml/ticket/view", "SUSPICIOUS", 50, "MEDIUM"),
    ("http://portal-identity-auth.ga/login", "SUSPICIOUS", 48, "MEDIUM"),
    ("http://fast-redirect-server.gq/go?url=phish", "SUSPICIOUS", 55, "MEDIUM"),
    ("http://auth-service-node.stream/video/watch", "SUSPICIOUS", 43, "MEDIUM"),
    ("http://company-portal.us-east.service.node-99.net:9000/", "SUSPICIOUS", 47, "MEDIUM"),
    ("http://enterprise-solution-771.ac.uk:8088/helpdesk", "SUSPICIOUS", 42, "MEDIUM"),
    ("http://remote-access-terminal-gateway.internal.info/", "SUSPICIOUS", 41, "LOW"),
    ("http://192.168.10.50:8000/console/login.php", "SUSPICIOUS", 52, "MEDIUM"),
    ("http://10.200.45.12/admin-portal/auth", "SUSPICIOUS", 48, "MEDIUM"),
    ("http://app-sync-service-2026.cloud/sync?token=892", "SUSPICIOUS", 44, "MEDIUM"),
    ("http://web-document-preview-portal.site/doc_9918.pdf", "SUSPICIOUS", 49, "MEDIUM"),
    ("http://account-recovery-assistant.online/lookup", "SUSPICIOUS", 42, "MEDIUM"),
    ("http://express-delivery-confirm.store/tracking", "SUSPICIOUS", 45, "MEDIUM"),
    ("http://secure-billing-service.vip/checkout", "SUSPICIOUS", 53, "MEDIUM"),
    ("http://cloud-storage-file-sharing.space/drive", "SUSPICIOUS", 46, "MEDIUM"),
    ("http://vpn-access-portal.tech/vpn-login", "SUSPICIOUS", 48, "MEDIUM"),
    ("http://global-auth-gateway.website/auth/login", "SUSPICIOUS", 40, "LOW"),
    ("http://network-test-diagnostic.pro/check", "SUSPICIOUS", 38, "LOW"),
    ("http://instant-bonus-claim.fun/wallet", "SUSPICIOUS", 54, "MEDIUM"),
    ("http://digital-invoice-review.press/download", "SUSPICIOUS", 47, "MEDIUM"),
    ("http://client-login-gateway.host/signin", "SUSPICIOUS", 43, "MEDIUM"),
    ("http://web-service-proxy-node.digital/proxy", "SUSPICIOUS", 42, "MEDIUM"),
    ("http://cloud-auth-node.rest/api/v1/auth", "SUSPICIOUS", 45, "MEDIUM"),
    ("http://service-alert-center.fit/renew", "SUSPICIOUS", 44, "MEDIUM"),
    ("http://account-safety-check.men/login", "SUSPICIOUS", 52, "MEDIUM"),
    ("http://portal-service-validation.cc/session", "SUSPICIOUS", 46, "MEDIUM"),
    ("http://auth-session-recovery.ws/verify", "SUSPICIOUS", 48, "MEDIUM"),
    ("http://secure-server-node-8812.biz/portal", "SUSPICIOUS", 42, "MEDIUM"),
    ("http://verification-desk-alert.info/action", "SUSPICIOUS", 52, "MEDIUM"),
    ("http://client-access-checkpoint.mobi/login", "SUSPICIOUS", 45, "MEDIUM"),

    # High Confidence Phishing Threats (55 URLs)
    ("http://paypal-verification-secure-banking.com/login/webscr.php", "PHISHING", 96, "CRITICAL"),
    ("http://paypal-update-account-center.xyz/auth/login.php?ref=mail", "PHISHING", 98, "CRITICAL"),
    ("http://paypal-security-alert-resolve.top/verification.html", "PHISHING", 92, "HIGH"),
    ("http://chase-online-banking-security-update.com/verify-identity", "PHISHING", 94, "CRITICAL"),
    ("http://chase-bank-account-suspended.xyz/auth/login.php", "PHISHING", 99, "CRITICAL"),
    ("http://wellsfargo-secure-verification-portal.net/login.jsp", "PHISHING", 95, "CRITICAL"),
    ("http://wellsfargo-card-protection.xyz/customer/auth", "PHISHING", 97, "CRITICAL"),
    ("http://bankofamerica-login-security-id.com/portal/signin.php", "PHISHING", 93, "HIGH"),
    ("http://bankofamerica-alert-resolve.top/auth/verify", "PHISHING", 96, "CRITICAL"),
    ("http://citi-card-secure-authentication.net/card/login", "PHISHING", 91, "HIGH"),
    ("http://apple-id-suspended-recovery-center.xyz/appleid/verify", "PHISHING", 86, "HIGH"),
    ("http://appleid-manage-icloud-secure.top/auth/login.php", "PHISHING", 98, "CRITICAL"),
    ("http://apple-account-security-alert.xyz/verify-device", "PHISHING", 94, "CRITICAL"),
    ("http://microsoft-online-account-security.net/common/login.srf", "PHISHING", 95, "CRITICAL"),
    ("http://microsoft-365-password-reset-portal.xyz/owa/auth.php", "PHISHING", 97, "CRITICAL"),
    ("http://google-drive-shared-secure-document.com/view/doc8819", "PHISHING", 89, "HIGH"),
    ("http://google-account-recovery-security-check.xyz/login", "PHISHING", 96, "CRITICAL"),
    ("http://facebook-security-appeal-recovery.top/support/cases/9812", "PHISHING", 92, "HIGH"),
    ("http://instagram-helpdesk-copyright-infringement.xyz/appeal", "PHISHING", 90, "HIGH"),
    ("http://netflix-billing-update-subscription.xyz/login/renew", "PHISHING", 94, "CRITICAL"),
    ("http://netflix-account-on-hold-billing.top/verify.php", "PHISHING", 96, "CRITICAL"),
    ("http://amazon-prime-delivery-issue.xyz/ap/signin?openid.mode=check", "PHISHING", 95, "CRITICAL"),
    ("http://amazon-security-lock-alert.top/account/verify", "PHISHING", 100, "CRITICAL"),
    ("http://metamask-wallet-synchronization-portal.io/sync-seed.php", "PHISHING", 100, "CRITICAL"),
    ("http://binance-kyc-verification-security.xyz/login/2fa", "PHISHING", 98, "CRITICAL"),
    ("http://coinbase-auth-recovery-device.top/security/confirm", "PHISHING", 97, "CRITICAL"),
    ("http://usps-package-redelivery-fee-notice.xyz/tracking/redeliver", "PHISHING", 93, "HIGH"),
    ("http://dhl-express-shipment-clearance.top/customs/pay-fee", "PHISHING", 95, "CRITICAL"),
    ("http://fedex-tracking-delivery-exception.xyz/confirm-address", "PHISHING", 91, "HIGH"),
    ("http://irs-tax-refund-portal-direct.xyz/refund/claim.php", "PHISHING", 99, "CRITICAL"),
    ("http://steam-community-trade-offer-99.xyz/tradeoffer/new", "PHISHING", 88, "HIGH"),
    ("http://discord-nitro-gift-claim-free.top/nitro/gift-9912", "PHISHING", 94, "CRITICAL"),
    ("http://185.220.101.5/apple-verification/login.php?token=98aef", "PHISHING", 100, "CRITICAL"),
    ("http://194.26.29.12/paypal-login/auth.php?session=4491", "PHISHING", 100, "CRITICAL"),
    ("http://45.132.18.22/chase-verification/login.php", "PHISHING", 100, "CRITICAL"),
    ("http://91.240.118.99/microsoft-verification/login.php", "PHISHING", 100, "CRITICAL"),
    ("http://103.145.13.77/bank-verification/login.php", "PHISHING", 98, "CRITICAL"),
    ("http://193.106.191.8/netflix-verification/login.php", "PHISHING", 97, "CRITICAL"),
    ("http://185.191.34.99/amazon-verification/login.php", "PHISHING", 99, "CRITICAL"),
    ("http://195.201.201.1/paypal-verification/login.php", "PHISHING", 100, "CRITICAL"),
    ("http://xn--googl-pra.com/auth/login.php", "PHISHING", 92, "HIGH"),
    ("http://xn--microsft-84a.com/portal/signin", "PHISHING", 94, "CRITICAL"),
    ("http://xn--aple-4qa.com/verify-identity", "PHISHING", 91, "HIGH"),
    ("http://xn--paypl-era.com/signin/webscr", "PHISHING", 95, "CRITICAL"),
    ("http://xn--amazn-r4a.com/ap/signin", "PHISHING", 93, "HIGH"),
    ("http://xn--chse-qqa.com/logon/login", "PHISHING", 96, "CRITICAL"),
    ("http://xn--netflx-t9a.com/browse/renew", "PHISHING", 90, "HIGH"),
    ("http://xn--facebok-94a.com/recover/checkpoint", "PHISHING", 92, "HIGH"),
    ("http://dhl-tracking-express-delivery.top/index.php", "PHISHING", 91, "HIGH"),
    ("http://adobe-cloud-sign-document-review.xyz/auth.php", "PHISHING", 94, "CRITICAL"),
    ("http://dropbox-shared-file-encrypted.top/access.html", "PHISHING", 93, "HIGH"),
    ("http://hsbc-banking-security-update.xyz/login.php", "PHISHING", 97, "CRITICAL"),
    ("http://irs-tax-stimulus-payment-verify.top/claim", "PHISHING", 98, "CRITICAL"),
    ("http://bofa-card-verify-security.xyz/portal/verify", "PHISHING", 95, "CRITICAL"),
    ("http://secure-wellsfargo-customer-id.top/login.php", "PHISHING", 96, "CRITICAL"),
]


def auto_seed_scans_if_needed(db_session, force=False):
    """Automatically seeds initial enterprise users, audit logs, and 160+ multi-category scans."""
    try:
        # 1. Seed Users if not present
        created_users = []
        for u in INITIAL_USERS:
            clean_email = u["email"].lower().strip()
            existing = db_session.query(User).filter(User.email.ilike(clean_email)).first()
            if not existing:
                new_user = User(
                    email=clean_email,
                    full_name=u["full_name"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                    organization=u["organization"],
                    is_active=True,
                    last_login=datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48)),
                )
                db_session.add(new_user)
                created_users.append(new_user)
            else:
                existing.email = clean_email
                existing.password_hash = hash_password(u["password"])
                existing.role = u["role"]
                existing.is_active = True
                created_users.append(existing)
        db_session.commit()

        admin_user = db_session.query(User).filter(User.role == "ADMIN").first()
        analyst_user = db_session.query(User).filter(User.role == "USER").first() or admin_user

        # 2. Seed Initial Audit Logs if empty
        if db_session.query(AuditLog).count() == 0 and admin_user:
            actions = [
                ("AUTH_LOGIN", "Web Console", "192.168.1.45", "SUCCESS", "Admin session established with 2FA"),
                ("MODEL_LOAD", "RandomForest_v2.4", "127.0.0.1", "SUCCESS", "Loaded weights: 65,718 URL dataset"),
                ("THREAT_FEED_SYNC", "VirusTotal + OpenPhish", "127.0.0.1", "SUCCESS", "Synchronized 1,420 IoCs"),
                ("ROLE_ASSIGN", "user:analyst@phishlense.io", "192.168.1.45", "SUCCESS", "Assigned Tier-3 SOC Analyst"),
                ("RATE_LIMIT_RULE", "Global Gateway", "192.168.1.45", "SUCCESS", "Configured 120 req/min token bucket"),
                ("DATASET_AUDIT", "phishlense_dataset.csv", "127.0.0.1", "SUCCESS", "Verified zero NaN duplicate entries"),
            ]
            for action, res, ip, st, det in actions:
                log = AuditLog(
                    user_id=admin_user.id,
                    user_email=admin_user.email,
                    action=action,
                    resource=res,
                    ip_address=ip,
                    status=st,
                    details=det,
                    created_at=datetime.now(timezone.utc) - timedelta(hours=random.randint(2, 72))
                )
                db_session.add(log)
            db_session.commit()

        # 3. Seed Scans if missing or incomplete
        phish_cnt = db_session.query(Scan).filter(Scan.verdict.in_(["PHISHING", "MALICIOUS", "HIGH_RISK"])).count()
        susp_cnt = db_session.query(Scan).filter(Scan.verdict.in_(["SUSPICIOUS", "MEDIUM_RISK"])).count()
        total_cnt = db_session.query(Scan).count()

        if force or phish_cnt == 0 or susp_cnt == 0 or total_cnt < 100:
            print("[INFO] Re-seeding balanced multi-category historical scans into database...", flush=True)
            db_session.query(Scan).delete()
            now = datetime.now(timezone.utc)
            random.seed(42)
            
            for url, verdict, score, level in INITIAL_SEEDS:
                hours_offset = random.uniform(0.5, 336.0)
                scan_time = now - timedelta(hours=hours_offset)
                assigned_user = random.choice(created_users) if created_users else None
                
                scan = Scan(
                    user_id=assigned_user.id if assigned_user else None,
                    url=url,
                    verdict=verdict,
                    risk_score=score,
                    threat_level=level,
                    confidence=random.uniform(92.0, 99.4),
                    domain_age_days=random.randint(3, 4000) if verdict == "SAFE" else random.randint(1, 30),
                    ssl_valid=verdict == "SAFE",
                    scan_type=random.choice(["MANUAL", "API", "BULK"]),
                    created_at=scan_time
                )
                db_session.add(scan)
            
            db_session.commit()
            print(f"[INFO] Successfully seeded {len(INITIAL_SEEDS)} balanced scans!", flush=True)
            return len(INITIAL_SEEDS)

        return total_cnt
    except Exception as e:
        print(f"[WARN] Failed to auto-seed enterprise data: {e}", flush=True)
        db_session.rollback()
        return 0
