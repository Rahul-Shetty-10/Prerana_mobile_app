# Mobile multi-tenant backend contract

The backend is not part of this repository. The mobile client can only enforce its request and caching rules; the server must enforce authorization.

## `GET /api/mobile/v1/session`

Authenticate with the Clerk JWT. Do not require or trust `X-Tenant-Slug` on this endpoint. Resolve the Clerk subject on the server, load the user's active student membership, and return the following envelope:

```json
{
  "ok": true,
  "data": {
    "userId": "user_...",
    "tenantId": "tenant_...",
    "tenantSlug": "school-alpha",
    "tenantName": "School Alpha",
    "membershipId": "membership_...",
    "role": "student",
    "membershipStatus": "active",
    "memberships": [
      {
        "id": "membership_...",
        "tenantId": "tenant_...",
        "tenantSlug": "school-alpha",
        "tenantName": "School Alpha",
        "role": "student",
        "status": "active"
      }
    ]
  }
}
```

The product currently enforces one active student membership per Clerk user. Return `401` for an unauthenticated or expired Clerk session, and `403` for a user with no active student membership, a non-student role, or multiple memberships. Do not select an arbitrary membership.

## Tenant authorization

Every tenant-scoped endpoint must derive the Clerk user from the verified JWT and verify that the requested tenant is an active membership of that user. `X-Tenant-Slug` is only a routing hint and must never be the authorization decision. Reject mismatches with `403`; never return another tenant's records.

Apply the same rule to dashboard, profile, subjects, fundamentals, library, progress, quiz attempts, quiz questions/reviews, exercise creation/submission, arcade, and resource/media downloads. A request must not be processed without a validated tenant context.

## Account deletion

The deletion workflow must remove or anonymize, according to the published retention policy:

- Clerk user and authentication identifiers.
- Student profile and membership records.
- Tenant-specific learning progress, chapter milestones, active-learning records, quiz attempts, exercise submissions, and arcade data.
- Uploaded or generated educational content associated with the user.
- Any backups or derived records within the documented retention period.

The external deletion page and the in-app deletion action must create a traceable request, explain any school-admin approval or retention exception, and report completion/failure to the user.
