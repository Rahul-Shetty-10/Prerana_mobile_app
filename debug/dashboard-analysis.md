# Dashboard API Analysis

## Endpoint
`GET /student/dashboard`

## HTTP Status
`200 OK`

## Response Size
* **Total Payload Size:** ~3.15 KB (3,152 bytes)
* **Status Envelope:** `{ ok: true, data: { ... } }`

---

## Top-Level Keys

| Key | Data Type | Description |
| :--- | :--- | :--- |
| `ok` | `boolean` | Indicates whether the API request succeeded at application level (`true`). |
| `data` | `object` | Main container object holding all student dashboard payload sections. |

---

## Complete Response Schema (Recursive Field List)

```json
{
  "ok": "boolean",
  "data": {
    "student": {
      "userName": "string",
      "greeting": "string",
      "notificationCount": "number",
      "avatarUrl": "string (URL)"
    },
    "welcomeCard": {
      "badgeText": "string",
      "title": "string",
      "description": "string",
      "subjects": "Array<string>"
    },
    "stats": [
      {
        "title": "string",
        "value": "string",
        "icon": "string (IconName)",
        "variant": "string ('coral' | 'amber' | 'blue' | 'emerald' | 'purple')",
        "changeText": "string",
        "changeType": "string ('positive' | 'negative' | 'neutral')"
      }
    ],
    "focusNow": {
      "nextChapter": {
        "subjectName": "string",
        "chapterTitle": "string",
        "progressPercentage": "number",
        "estimatedMinutes": "number"
      },
      "libraryStatus": {
        "savedResourcesCount": "number",
        "activeLabsCount": "number"
      }
    },
    "performance": {
      "overallAccuracy": "number",
      "masteryLevel": "string",
      "subjectsPerformance": [
        {
          "subject": "string",
          "scorePercentage": "number",
          "questionsSolved": "number",
          "colorVariant": "string ('coral' | 'amber' | 'blue' | 'emerald' | 'purple')"
        }
      ]
    },
    "signals": [
      {
        "id": "string",
        "category": "string ('assessments' | 'requests' | 'library')",
        "title": "string",
        "subtitle": "string",
        "timestamp": "string",
        "statusText": "string",
        "statusVariant": "string ('success' | 'warning' | 'info')",
        "iconName": "string (IconName)"
      }
    ],
    "quickRoutes": [
      {
        "id": "string",
        "title": "string",
        "subtitle": "string",
        "icon": "string (IconName)",
        "badgeText": "string",
        "variant": "string ('coral' | 'amber' | 'blue' | 'emerald' | 'purple')"
      }
    ]
  }
}
```

---

## Missing Fields Compared to `DashboardDataPayload`

The frontend `DashboardDataPayload` interface expects `welcomeCard.selectedSubject` to drive the active subject pill selection on mount.

| Missing Field Path | Required by Component | Current Handling in Frontend |
| :--- | :--- | :--- |
| `welcomeCard.selectedSubject` | `WelcomeCardProps` | The service assigns `rawData.welcomeCard?.subjects?.[0] || MOCK_WELCOME_DATA.selectedSubject`. |

---

## Extra Fields Returned by Backend

| Extra Field | Purpose / Context |
| :--- | :--- |
| `ok` | Standard API response envelope boolean (`{ ok: true, data: { ... } }`). Unwrapped inside `src/api/mobileApi.ts`. |

---

## Suggested Mapping

To safely bridge the backend API response (`DashboardApiResponse`) with the frontend UI data payload (`DashboardDataPayload`), the existing service mapping in `src/features/dashboard/services/dashboardService.ts` should be maintained as follows:

```ts
return {
  // 1. Student Header Mapping
  student: {
    userName: rawData.student?.userName || MOCK_STUDENT.userName,
    greeting: rawData.student?.greeting || MOCK_STUDENT.greeting,
    notificationCount: rawData.student?.notificationCount ?? MOCK_STUDENT.notificationCount,
    avatarUrl: rawData.student?.avatarUrl || MOCK_STUDENT.avatarUrl,
  },

  // 2. Welcome Card Mapping
  welcomeCard: {
    badgeText: rawData.welcomeCard?.badgeText || MOCK_WELCOME_DATA.badgeText,
    title: rawData.welcomeCard?.title || MOCK_WELCOME_DATA.title,
    description: rawData.welcomeCard?.description || MOCK_WELCOME_DATA.description,
    subjects: rawData.welcomeCard?.subjects || MOCK_WELCOME_DATA.subjects,
    selectedSubject:
      rawData.welcomeCard?.subjects?.[0] || MOCK_WELCOME_DATA.selectedSubject,
  },

  // 3. Stats Section Mapping
  stats: rawData.stats && rawData.stats.length > 0 ? rawData.stats : MOCK_STATS_DATA,

  // 4. Focus Now Section Mapping
  focusNow: rawData.focusNow || MOCK_FOCUS_NOW,

  // 5. Performance Overview Section Mapping
  performance: rawData.performance || MOCK_PERFORMANCE,

  // 6. Latest Signals Mapping
  signals: rawData.signals && rawData.signals.length > 0 ? rawData.signals : MOCK_SIGNALS,

  // 7. Quick Routes Mapping
  quickRoutes: rawData.quickRoutes && rawData.quickRoutes.length > 0 ? rawData.quickRoutes : MOCK_QUICK_ROUTES,
};
```
