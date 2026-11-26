# Appsmith Community reproduction

This is a native Appsmith application. The [JSON](Smart_Campus_Availability_Appsmith.json) is the file produced by Appsmith's application export. The separately readable [AvailabilityRules.js](AvailabilityRules.js) is the JavaScript object used in the visual editor.

## Import and preview

1. Use an existing Appsmith workspace or run Appsmith Community v2.7.2 locally. The verified local image supports Linux ARM64 and AMD64. Appsmith recommends about 8 GB of host memory for the all-in-one container. This is the image digest used in the practice.

   ```sh
   docker run --detach --name practice12-appsmith \
     --label com.docker.compose.project=practice12 \
     --publish 127.0.0.1:8186:80 \
     --mount source=practice12-appsmith-stacks,target=/appsmith-stacks \
     appsmith/appsmith-ce@sha256:1f456089b75edec495c005f0e94858aa5c6d1408fcac5f7c1e2d85d69bd1592d
   ```

2. Open http://127.0.0.1:8186. On a fresh local instance, create your own instance administrator. This account opens the Appsmith builder. The room checker has no account feature.
3. In the destination workspace choose **Create new → Import → Import from file** and select `Smart_Campus_Availability_Appsmith.json`. The experiment verified the import in a separate local workspace. The file contains one page, one JS object and zero datasources or custom JS libraries.
4. Open **Preview** from the editor toolbar. Verify room A-102, 09:00, and the 10:00–11:00 row. Run the shared cases. The original local app opens at the link below for the signed-in local administrator. Loopback addresses are available on the machine running Docker.

[Original local Appsmith editor](http://127.0.0.1:8186/app/smart-campus-availability-practice-12/page1-6b07d28aa4c312c7e2747ef5/edit)

## Native configuration

| Widget | Configuration |
|---|---|
| Text1 | Smart Campus Availability, room A-102, reference clock 09:00 |
| Input1 | Single-line start time, default 12:00 |
| Input2 | Single-line duration, default 60. The rule checks empty, non-numeric and out-of-range values. |
| Switch1 | Room blocked, initially off |
| Button1 | Check Availability. The onClick calls `AvailabilityRules.check` and sets `practice12Result` with `storeValue` and persistence set to false. |
| Text2 | Formats the current boolean, fixed message and reason code. The binding checks that the displayed decision still matches the input snapshot. |
| Table1 | `{{ AvailabilityRules.bookingRows() }}`, three plain-text columns. No row-add, inline edit, search, filter, pagination or download action is needed for the single booking. |

The JSON also contains Appsmith-generated widget IDs and layout metadata. Its compatibility outside Appsmith, or with older Appsmith releases, is unverified. See [Appsmith Docker installation](https://docs.appsmith.com/getting-started/setup/installation-guides/docker) and [application JSON import/export](https://www.appsmith.com/blog/announcing-the-import-export-feature-for-appsmith-applications).

## Browser replay

Use a dedicated Chrome profile and restrict its debugging port to loopback. For example, start Chrome with `--user-data-dir=/tmp/practice12-appsmith-test --remote-debugging-address=127.0.0.1 --remote-debugging-port=9238`. Sign in to the intended Appsmith workspace in that test profile. From the repo root, run `node practice12/tools/check-ui.mjs appsmith '<imported-app-editor-url>' /tmp/practice12-appsmith-check`. The checks use real widgets and browser keyboard events in Preview. Test logs and screenshots are under [evidence](../evidence/low-code/).
