# Practice 12 comparison

| Criterion | Code-based | Low-code |
|---|---|---|
| Functional tests | 8/8 in the real React UI. | 8/8 in real Appsmith Preview. The final JSON re-import also passed 8/8. |
| Build and repair time | 1.30 min to adapt the existing project. No code repair was needed after the first UI test. | 9.57 min for visual assembly and rule bindings plus repair. Includes 5.08 min implementation, 4.47 min repair/layout and a 1.4 s mobile column refinement. Setup is separate. |
| Customization | React/Tailwind control of the layout, accessible status node and responsive stacking. | Seven native widgets and one JS object. Native resize and column controls made the narrow preview readable. |
| Security controls | Bounded parsing, static text, read-only fixtures and no booking connector. Full audit 25 findings, production audit one high finding. | Equivalent rule validation and read-only fixtures. The app remained private, used no connector, and had no custom libraries. The app operator still depends on platform updates. |
| Versioning / portability | TypeScript/React source and lockfile can be reviewed in a Git diff and built to static files. Existing CI covers the original regression checks. | Vendor JSON includes widgets and expressions. It passed a same-version Appsmith re-import. Migration to another builder was unverified. Git sync was not connected. |
| Ongoing cost | $0 new spend for the local test. Public Bolt account cost and future hosting usage were not part of the experiment. | $0 new spend using Community Edition locally. A long-lived self-hosted install needs machine resources, backups and operator time. |

The existing code path already held the rule engine, fixtures, tests and responsive styles. The measured adaptation was shorter here. The new Appsmith app started with an empty canvas, so the timings do not estimate two greenfield builds. The first Appsmith prototype decision worked before final layout repair. Setup included the local container and instance onboarding.

The React flow supports code review and pull requests through the existing GitHub repository. Its rule engine serves the original checker and Practice 12, while the UI applies a small input adapter. Appsmith allows a teammate to review the widget tree and change labels or bindings visually. The JS object can be reviewed directly, although a JSON diff also includes generated IDs and layout metadata. Appsmith Git sync and team permissions were not exercised. Team collaboration cannot be ranked without a real shared edit and review.

Neither checker needed integrations. React can call services through code and Appsmith provides visual connectors, but future costs, data scopes and maintenance would require a connection test and a permission review. Appsmith portability is demonstrated between workspaces on the same version. Cross-version migration requires a real re-import and the same UI replay. The security results show validation and read-only behavior for the tested apps. Independent Appsmith platform dependency coverage and viewer-role behavior remain unverified.

**Recommendation.** Keep React for this existing Smart Campus project. It reuses the tested engine, preserves the existing booking and explanation screens, and fits its current Git review process. Appsmith is suitable for a small internal checker when the team already operates Appsmith and values visual changes. Its 8/8 result and successful export re-import support that use.

Evidence [engineering effort](Engineering_Effort.md), [test cases](Test_Cases.csv), [security checklist](Security_Checklist.md), [Appsmith pricing](https://www.appsmith.com/pricing) and [Appsmith import/export](https://www.appsmith.com/blog/announcing-the-import-export-feature-for-appsmith-applications).
