=== BizOS Identity - Modern WordPress Authentication ===

Contributors: bizos
Tags: authentication, security, passwordless, 2fa, magic-link, login, totp, two-factor, security, sessions
Requires at least: 6.4
Tested up to: 6.7
Requires PHP: 8.1
Stable tag: 2.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Replace WordPress's standard authentication with passwordless magic links, 2FA TOTP, and modern session management.

== Description ==

BizOS Identity transforms WordPress login with modern security features:

**🔐 Passwordless Authentication**
Send magic links via email — one click, no password to remember. Links expire in 15 minutes and are one-time use.

**🛡️ Two-Factor Authentication (2FA)**
Industry-standard TOTP (Time-based One-Time Password). Compatible with RFC 6238 compliant authenticator applications. Includes 10 backup codes.

**🔒 Advanced Session Management**
* Multi-device tracking with device fingerprinting
* View all active sessions from your account page
* Revoke any session remotely
* Auto-logout after 24h idle / 7 days absolute
* Secure HttpOnly cookies with SameSite=Lax

**🛡️ Brute Force Protection**
* Rate limiting per IP and per email
* hCaptcha integration (auto-shown after 3 failed attempts)
* Progressive account lockout (5/10/20 failures = 15min/1h/24h)
* Suspicious activity detection (new device alerts)

**⛔ STRICT SECURITY RULES & POLICIES**
* **Zero Arbitrary Code Execution**: Strictly prohibits PHP/JS dynamic code execution, code editors, file managers, or eval()/exec().
* **Elimination of Mock Data & Account Links**: No mocked account data or artificial account ties. Uses real WordPress database operations and standard WP authentication hooks.
* **Strict Output Escaping**: All HTML rendering uses WordPress native escaping (esc_html, esc_attr, esc_url).
* **Prepared Database Queries**: 100% prepared SQL statements ($wpdb->prepare) to prevent SQL injection.
* **Data Privacy & GDPR**: Local database storage only, zero external tracking without user consent.

**📊 Admin Dashboard**
* Real-time security metrics
* Complete audit log of all auth events
* User-friendly interface

== Installation ==

1. Upload the `bizos-identity` folder to `/wp-content/plugins/` or install via WordPress Plugin Admin.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Visit `Settings > Identity` to configure.
4. Force 2FA for administrators or all users as needed.

== Frequently Asked Questions ==

= Does this replace standard WordPress login? =
Yes! BizOS Identity replaces wp-login.php with a modern, secure login flow while preserving full WP compatibility.

= Can I use both passwords AND magic links? =
Yes! Users can choose their preferred method via login tabs.

== Changelog ==

= 2.1.0 =
* Initial public release with Magic Links, 2FA TOTP, Session Manager & Audit Logs. Strict security compliance & zero mock data policy applied.
