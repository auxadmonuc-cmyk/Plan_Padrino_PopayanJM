# Security Specification: Firebase Rules Hardening

## 1. Data Invariants
1. **Admins and Query Operators Separation**:
   - Operator records are stored in `/users/{userId}`.
   - Users cannot update their own privileges or `role` value directly once defined to prevent privilege escalation.
2. **Collaborator Milestone Atomicity**:
   - All write operations inside `/collaborators/{collaboratorId}` (induction, day7, day30, day90) must adhere to defined Milestone properties (scheduledDate, status, remarks, and evidences list structure).
3. **Immutable History Logs**:
   - Audit logs stored in `/auditLogs/{logId}` are strictly system-only and user-app-generated; once written, they are immutable and cannot be deleted or modified.
4. **Verified Session Mandatory**:
   - Operators must be signed in with custom claims or verified operator accounts to register or edit collaborator data.

---

## 2. The "Dirty Dozen" Threat Payloads
Here are the 12 specific hostile payloads designed to compromise the system, configured for rejection by the hardened rule set:

1. **Self-Appointed Administrator Registration** (Privilege Escalation):
   - JSON: `{"id": "user123", "role": "Administrador", "email": "evil@attacker.com"}` (written to a public path)
   - *Result*: `PERMISSION_DENIED`
2. **Ghost Field Poisoning** (Adding shadow attributes):
   - JSON: `{"fullName": "John Doe", "isVerifiedAdmin": true, ...}` (adding unapproved keys to collaborator updates)
   - *Result*: `PERMISSION_DENIED`
3. **Arbitrary Timestamp Hijacking**:
   - JSON: `{"updatedAt": "1999-01-01T00:00:00Z"}` (backdating updates instead of server request time verification)
   - *Result*: `PERMISSION_DENIED`
4. **Overlarge Attachment Buffer Attack** (Denial of Wallet cost injection):
   - JSON: `{"fileSize": "99GB", ...}` (submitting enormous strings or illegal payload size parameters)
   - *Result*: `PERMISSION_DENIED`
5. **Milestone Terminal State Bypass**:
   - Attempting to overwrite remarks or revert status on a collaborator record that has been marked as completed.
   - *Result*: `PERMISSION_DENIED`
6. **Relational ID Spoofing / Orphan Insertion**:
   - Trying to register/reference a collaborator with a malformed identification document containing non-alphanumeric toxic characters (`"id": "A#$*^!"`).
   - *Result*: `PERMISSION_DENIED`
7. **Cross-Tenant List Interception**:
   - Attempting to query `/collaborators` database without proper login or trying to scrape full sets blindly.
   - *Result*: `PERMISSION_DENIED`
8. **PII Data Collection Harvesting**:
   - A standard operator or unauthenticated reader attempting to fetch emails or phone inputs from direct user profile paths.
   - *Result*: `PERMISSION_DENIED`
9. **Fake Verification Injection**:
   - Submitting `email_verified: false` but accessing privileged administrator operations.
   - *Result*: `PERMISSION_DENIED`
10. **State Machine Shortcircuiting**:
    - Jumping completed states or modifying locked metadata fields like `createdAt`.
    - *Result*: `PERMISSION_DENIED`
11. **Relational Sync Integrity Violation**:
    - Creating children records without validating the parent or operator references exist.
    - *Result*: `PERMISSION_DENIED`
12. **Audit Trail Disruption**:
    - Issuing a delete request on `/auditLogs/log_abc`.
    - *Result*: `PERMISSION_DENIED`

---

## 3. Test Invariant Declarations
The ruleset will be deployed and verified, confirming that attempting to read/write under invalid configurations results in absolute rejection.
