"""Build the editable Practice10 report from recorded, verified evidence."""
from pathlib import Path
import json
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
BASE=Path(__file__).resolve().parents[1]
OUT=BASE/'Practice10_Boranov_Daniyar_Report.docx'
risks=json.loads((BASE/'risk-register.final.json').read_text())
summary=json.loads((BASE/'evidence/after/summary.json').read_text())
assert summary['fullVitest']['passed']==81 and summary['browser09']['passed']==18
assert summary['mitigationChecks']['passed']==7 and summary['uiComparisonsMatched']==25
D=Document();S=D.sections[0]
S.page_width,S.page_height=Inches(8.27),Inches(11.69)
S.top_margin=S.bottom_margin=Inches(.7);S.left_margin=S.right_margin=Inches(.75)
S.header_distance=S.footer_distance=Inches(.25)
for sty in D.styles:
 if sty.type in (1,2,3):
  sty.font.name='Times New Roman';sty.font.size=Pt(12);sty.font.color.rgb=RGBColor(0,0,0)
  rpr=sty.element.get_or_add_rPr();fonts=rpr.find(qn('w:rFonts'))
  if fonts is not None:
   for k in ['ascii','hAnsi','eastAsia','cs']:fonts.set(qn('w:'+k),'Times New Roman')
   for k in ['asciiTheme','hAnsiTheme','eastAsiaTheme','cstheme']:fonts.attrib.pop(qn('w:'+k),None)
  for border in list(sty.element.iter(qn('w:pBdr'))):border.getparent().remove(border)
for sty in ['Title','Heading 1','Heading 2']:
 D.styles[sty].font.bold=True
 D.styles[sty].paragraph_format.space_before=Pt(6)
 D.styles[sty].paragraph_format.space_after=Pt(6)
 D.styles[sty].paragraph_format.keep_with_next=True
n=D.styles['Normal'].paragraph_format;n.line_spacing=1.05;n.space_after=Pt(5)

def p(s='',bold=False,style=None):
 q=D.add_paragraph(style=style);r=q.add_run(s);r.bold=bold;return q

def h(s):return D.add_heading(s,level=1)
def sub(s):return D.add_heading(s,level=2)
def page():D.add_page_break()
def table(headers,rows,widths):
 t=D.add_table(rows=1,cols=len(headers));t.autofit=False
 for c,w in zip(t.columns,widths):c.width=Inches(w)
 for c,txt in zip(t.rows[0].cells,headers):c.text=txt
 for row in rows:
  for c,txt in zip(t.add_row().cells,row):c.text=str(txt)
 borders=OxmlElement('w:tblBorders')
 for name in ['top','bottom','insideH']:
  b=OxmlElement('w:'+name);b.set(qn('w:val'),'single');b.set(qn('w:sz'),'4');b.set(qn('w:color'),'000000');borders.append(b)
 for name in ['left','right','insideV']:
  b=OxmlElement('w:'+name);b.set(qn('w:val'),'nil');borders.append(b)
 t._tbl.tblPr.append(borders)
 t.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))
 for row in t.rows:
  row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
  for c,w in zip(row.cells,widths):
   c.width=Inches(w);c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
   for q in c.paragraphs:q.paragraph_format.space_before=Pt(3);q.paragraph_format.space_after=Pt(3);q.paragraph_format.line_spacing=1
 for c in t.rows[0].cells:
  for r in c.paragraphs[0].runs:r.bold=True
 p().paragraph_format.space_after=Pt(0)
 return t

def picture(rel,width,caption):
 q=D.add_paragraph();q.alignment=WD_ALIGN_PARAGRAPH.CENTER;q.paragraph_format.space_after=Pt(2)
 shape=q.add_run().add_picture(str(BASE/rel),width=Inches(width));shape._inline.docPr.set('descr',caption)
 p(caption,style='Caption')

def link(label,url):
 q=D.add_paragraph();el=OxmlElement('w:hyperlink')
 el.set(qn('r:id'),q.part.relate_to(url,'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',is_external=True))
 r=OxmlElement('w:r');pr=OxmlElement('w:rPr')
 for tag,val in [('rFonts',None),('sz','24'),('color','000000')]:
  e=OxmlElement('w:'+tag)
  if tag=='rFonts':e.set(qn('w:ascii'),'Times New Roman');e.set(qn('w:hAnsi'),'Times New Roman')
  else:e.set(qn('w:val'),val)
  pr.append(e)
 r.append(pr);text=OxmlElement('w:t');text.text=label;r.append(text);el.append(r);q._p.append(el)

# Cover
for _ in range(4):p()
q=p('Software Engineering Practice Work 10',style='Title');q.alignment=WD_ALIGN_PARAGRAPH.CENTER
for txt in ['Smart Campus Room Availability','Risk Review and Agent Readiness Audit','', 'Boranov Daniyar','24B031718','Thursday, 14:00–17:00','12 November 2026','', 'AI tool: OpenAI Codex','Model identifier: gpt-6.1-sol']:
 q=p(txt);q.alignment=WD_ALIGN_PARAGRAPH.CENTER
p()
p('I reviewed the existing Smart Campus application, checked the AI findings and applied two approved safeguards. All application checks passed. The release decision is CONDITIONAL because dependency findings and the first hosted CI run still need owner control.')
page()

h('1 Objective and Project Overview')
p('The aim was to review risks in the Practice09 project and improve how an agent prepares changes for review. Smart Campus is a React and TypeScript availability checker with fictional data. A-102 is the one-room exercise within the existing five-room interface. It checks requests without creating or saving bookings.')
p('The acceptance contract is preserved: AC1 rejects invalid, reversed and past times; AC2 limits requests to 120 minutes; AC3 rejects blocked rooms; AC4 rejects real overlaps and allows touching endpoints; AC5 preserves booking data; AC6 gives clear feedback on desktop and mobile.')
h('2 Baseline Inspection')
p('The baseline was main at commit 2857ed197bbc05296c6731fb458fa20a550913e8. I preserved it in a detached worktree and recorded source hashes before applying changes.')
table(['Location','Role'],[
('src/bookingLogic.ts','Pure validation, overlap, availability and time parsing.'),
('src/components/','BookingPanel, RoomCard, Timeline and CurrentTimeControl.'),
('src/sampleData.ts and types.ts','Five fictional rooms and five bookings; shared types.'),
('tests/ and Vitest config','Original, improved, Practice08 and Practice09 suites; browser scripts.'),
('README, AGENTS and package.json','Setup, architecture, acceptance rules and verification commands.')],[2.4,4.3])
p('The fresh baseline install passed. Vitest passed 81/81 tests: original 17, improved 43, Practice08 six and Practice09 fifteen. Legacy tests passed 9/9, and the existing Practice09 browser checks passed 18/18 at desktop and mobile sizes. Typecheck, lint and build passed.')
p('The documented browser rerun first stopped because its evidence already existed. For baseline capture I used a temporary copy with only the output destination changed. Its assertions and application source stayed unchanged. Exact commands, outputs, exit codes and the adapter diff are preserved in the evidence files.')
page()

h('3 AI Assisted Read Only Risk Review')
p('I asked Codex to inspect correctness, security, privacy, reliability, maintainability and agent operations without editing the application. The actual response was saved before the challenge stage. It proposed checking CI, agent boundaries, dependencies, test discovery, documentation, booking rules and fixture rendering. AI suggestions were treated as claims to examine.')
h('4 Verification of AI Findings')
p('I checked the referenced files, configuration and tests, then ran targeted diagnostics using actual tools. These checks were performed in the same Codex session; a separate human audit was not conducted.')
table(['ID','Classification','Actual observation'],[
('R1','Confirmed','No repository CI; documented browser rerun exited 1 before launch.'),
('R2','Confirmed','AGENTS lacked explicit secret, isolation and merge/acceptance boundaries.'),
('R3','Confirmed','Affected installed versions and audit records; Vite returned permissive origin headers.'),
('R4','Confirmed','A new temporary test was excluded by the four-file Vitest include list.'),
('R5','Confirmed','Historical README path/status did not match the current context.'),
('R6','Plausible / unverified','Helper accepted reference clock -1; normal UI clamps its clock and external policy is unspecified.'),
('R7','Unsupported','Both endpoint cases, real overlap and frozen booking checks passed.'),
('R8','Unsupported','Synthetic script text was escaped; no raw HTML sink or sampled credential-pattern match was found.')],[.45,1.65,4.6])
p('The temporary test-discovery diagnostic did not weaken the application. It was removed after the runner reported “No test files found”. Missing tests alone were not used as proof of broken booking logic. The limited credential scan is not a complete secret audit.')
page()

h('5 Risk Register')
p('Likelihood: 1 unlikely, 2 possible, 3 likely. Impact: 1 minor, 2 moderate, 3 serious. Score = likelihood × impact, with a maximum of 9. Scores reflect this fictional classroom project and are judgments, not measured probabilities. All risk owners are Boranov Daniyar.')
table(['ID and category','Status','Initial L × I','Residual L × I'],[
(r['id']+' '+r['category'],r['status'].replace('PLAUSIBLE / UNVERIFIED','Plausible').replace('CONFIRMED','Confirmed').replace('UNSUPPORTED','Unsupported'),f"{r['likelihood']} × {r['impact']} = {r['score']}",f"{r['residualLikelihood']} × {r['residualImpact']} = {r['residualScore']}") for r in risks],[2.0,1.55,1.55,1.6])
p('R1 and R2 were selected from the three equal-score confirmed priorities. R1 removed a reproduced barrier to fresh verification. R2 added the human-review and isolation rules required for agent work. R3 stays an owned security finding: neither patch changes vulnerable dependency versions.')
p('R1 and R2 fell from 4 to 2 after verification. Their impact remains moderate, while their likelihood is judged unlikely with the new controls. Hosted CI still needs its first real run, and written rules still need enforcement. R3 remains 4. R4 and R5 remain 2. R6 remains 1. R7 and R8 retain hypothetical scores only; neither is counted as a confirmed defect.')
p('The following records state the cause, event, consequence, component, evidence, score reasoning, control and verification. The separate CSV provides the full register in the instructor’s column format.')
page()

sub('Register evidence for R1 to R4')
for title,paras in [
('R1 Reliability',[
'Cause/event/consequence: absent CI and a fixed evidence path could prevent a fresh browser check, leaving a proposed UI change without repeatable evidence. Component: workflow configuration and practice09-browser.mjs lines 14–16.',
'Evidence: the original command exited 1 because saved evidence existed. The approved output option produced 18/18 checks, and both overwrite guards passed. Initial 2 × 2 = 4; residual 1 × 2 = 2. The first hosted run remains unverified.',
'Control and verification: the approved CI file runs existing checks and preserves evidence. Owner: Boranov Daniyar. Review the first remote run and required-check policy before relying on CI for acceptance.']),
('R2 Agent operations',[
'Cause/event/consequence: missing operational rules could let an asynchronous agent share resources or accept a change without human review. Component: root AGENTS.md.',
'Evidence: the original file lacked explicit credential, worktree/port and merge/acceptance rules. The exact approved section is now present. Initial 2 × 2 = 4; residual 1 × 2 = 2. No unauthorized action was observed.',
'Control and verification: use isolated tasks, no credentials, actual test evidence and human review. Owner: Boranov Daniyar. The user approved both diffs before application; text rules still need enforcement.']),
('R3 Security and privacy',[
'Cause/event/consequence: affected dependency versions could expose development source or privileged tooling when used under the advisory conditions. Component: package-lock.json and dev/test server configuration.',
'Evidence: before and after audit reports contain 25 affected packages: 2 low, 7 moderate, 14 high and 2 critical. Production-only audit reports one high ws package through unused Supabase. No Supabase import was found in app source. Initial and residual score: 2 × 2 = 4.',
'Control and verification: owner Boranov Daniyar must review a compatible update and rerun audit/tests. Until then use trusted project pages, no credentials and no privileged test API/UI or network-exposed dev server. Loopback alone does not fix the Vite origin issue. No exploit or compromise was demonstrated.']),
('R4 Maintainability',[
'Cause/event/consequence: the four-file Vitest allowlist can omit a newly added test, leaving a future claim unchecked. Component: vitest.config.ts.',
'Evidence: an existing temporary diagnostic test was excluded and the runner exited 1. The present 81 tests still run. Initial and residual score: 2 × 1 = 2. Owner: Boranov Daniyar.',
'Control and verification: AGENTS now requires proof that a new test is collected. The allowlist itself is unchanged; a wider discovery change needs separate review.'])]:
 p(title,bold=True)
 for txt in paras:p(txt)
page()

sub('Register evidence for R5 to R8')
for title,paras in [
('R5 Maintainability',[
'Cause/event/consequence: historical README paths and publication status can lead an agent to the wrong evidence. Component: README Assignment artifacts and Practice09 context.',
'Evidence: the named sibling folder is absent in this checkout, while the current demo link responds correctly. Initial and residual score: 2 × 1 = 2. Core setup commands work, so impact stays minor.',
'Control and verification: owner Boranov Daniyar uses the explicit Practice10 source/evidence references and may review a later historical documentation cleanup. Unrelated cleanup was outside the approved patches.']),
('R6 Correctness',[
'Cause/event/consequence: a future direct caller could supply an out-of-day reference clock and receive an availability result. Component: validateBasicRange and CurrentTimeControl.',
'Evidence: currentMinutes = -1 returned valid for a free request. The UI clamps normal input, and the external clock-domain policy is unspecified. The finding is plausible/unverified as a contract risk. Initial and residual score: 1 × 1 = 1.',
'Control and verification: owner Boranov Daniyar should clarify that domain before changing behavior or adding a required regression. No new acceptance rule was invented.']),
('R7 Correctness',[
'Hypothesis: touching requests are rejected or booking data is mutated, violating AC4/AC5. Components: overlap/availability helpers, RoomCard and fixtures.',
'Evidence: source uses half-open overlap and a copied sort. Existing tests, frozen-data probes and repeated browser checks passed. The proposed defect is unsupported. The hypothetical score remains 1 × 2 = 2.',
'Control and verification: owner Boranov Daniyar retains the existing endpoint and immutability regressions. No booking-rule patch was justified.']),
('R8 Security and privacy',[
'Hypothesis: fixture text creates script content or tracked source reveals credentials. Components: React rendering and tracked text/configuration.',
'Evidence: a synthetic script string was escaped by the real panel. No raw HTML sink or sampled credential pattern appeared in the limited 304-file scan. The proposed issue is unsupported. The hypothetical score remains 1 × 2 = 2.',
'Control and verification: owner Boranov Daniyar keeps fictional data and reviews any new HTML/secret path. These bounded checks do not certify the full repository or Git history.'])]:
 p(title,bold=True)
 for txt in paras:p(txt)
p('Primary advisory references',bold=True)
link('Vite maintainer advisory GHSA-vg6x-rcgg-rjx6','https://github.com/vitejs/vite/security/advisories/GHSA-vg6x-rcgg-rjx6')
link('Vitest maintainer advisory GHSA-5xrq-8626-4rwp','https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp')
page()

h('6 Agent Readiness Audit')
p('The final level is 2 — Documented, with stronger operating controls. The repository has working checks, a lockfile, modular code and project instructions. CI is now defined, but its first hosted run and enforcement are not established. Level 3 is not awarded automatically.')
table(['Lecture check','Final assessment and evidence'],[
('Level 1 Formatting','Consistent source conventions; no formal formatter configuration.'),
('Level 1 Lint and types','Fresh lint and TypeScript checks passed.'),
('Level 1 Tests and build','81/81 tests, 9/9 legacy and build passed; npm ci uses the lockfile.'),
('Level 1 Dependencies','Versions resolve reproducibly, but audit findings remain.'),
('Level 2 Setup and architecture','Setup works; pure rules, components and fixtures are documented.'),
('Level 2 AGENTS','Approved scope, no-secret, isolation, evidence and human-review rules.'),
('Level 2 Environment example','Not needed: this fictional client demo uses no application credentials.'),
('Level 3 CI and hooks','CI file and local syntax/commands checked. No hosted run; no hooks configured.'),
('Level 3 Integration evidence','Fresh browser outputs, overwrite protection, genuine screenshots and 25 matching comparisons.'),
('Level 3 Security checks','Actual audits and bounded source checks saved; unresolved findings have an owner.'),
('Level 3 Isolated workflow','Baseline worktree used; unique loopback port and explicit approval recorded.')],[2.12,4.58])
p('Improvement needs a reviewed compatible dependency update, proof of the first hosted CI run and owner-selected required checks. Formatting conventions and historical documentation also need continued care. A local passing run is evidence for the tested source, not proof of remote policy enforcement.')
page()

h('7 AGENTS Review')
p('The original playbook already protected AC1–AC6, fixtures, responsive UI and the small product scope. It prohibited login, database, persistence and unauthorized publishing/email. The missing rules concerned secrets, asynchronous isolation, shared ports and review before acceptance or merge.')
p('The proposed section retained A-102 as the one-room exercise and preserved all five rooms. Both exact diffs were shown for review. The user explicitly approved them before application. The saved approval, original file, approved diff and final file provide the before/after record.')
h('8 Two Risk Mitigations')
sub('Mitigation 1 Repeatable verification')
p('Before: the documented browser command exited 1 because its saved evidence existed, and no repository CI file was present. After: an optional evidence directory lets the unchanged assertions run in a fresh location. The original default and refusal to overwrite remain.')
p('The approved workflow runs install, tests, typecheck, lint, build and real browser checks. It uses pinned Actions, read-only repository permission and no persisted checkout credentials. It records dependency advisories for human review. It does not deploy or merge.')
p('Applied output-path change',bold=True)
p("const submission = path.resolve(project,\n  process.env.PRACTICE09_EVIDENCE_DIR || `practice09/evidence/ui-${phase}`);")
p('Verification: the real fresh-directory run passed 18/18. Repeating it was rejected before any evidence changed. The default historical directory also stayed protected. Workflow YAML, shell syntax and required command checks passed locally; no successful hosted run is claimed.')
sub('Mitigation 2 Agent boundaries and human review')
p('Before: review, credential and isolation requirements were incomplete. After: AGENTS requires a separate branch/worktree for requested background work, unique ports, no credential-store access, scope-limited edits, actual evidence and human review. It explains that a worktree is not a security sandbox.')
p('Verification: all four applied files match the exact reviewed copies. Application source, fixtures, prior unit suites and package/lockfile are unchanged. The two selected residual scores fall from 4 to 2. Written rules reduce ambiguity but do not enforce system permissions.')
page()

h('9 Testing and Verification')
table(['Command or check','Baseline','After'],[
('npm ci','Passed','Passed'),
('npx vitest run','81/81','81/81'),
('npm run test:legacy','9/9','9/9'),
('npm run typecheck','Passed','Passed'),
('npm run lint','Passed','Passed'),
('npm run build','Passed','Passed'),
('Practice09 browser runner','18/18 via output adapter','18/18 via approved option'),
('Historical browser scripts','Covered by current runner','Practice07 12/12; Practice08 14/14; earlier final script passed'),
('node practice10/tools/verify-mitigations.mjs','Original barrier reproduced','7/7 checks passed'),
('node practice10/tools/compare-ui.mjs','Reference capture','25/25 comparisons matched'),
('npm audit --json','25 affected packages; exit 1','Same 25; exit 1')],[3.3,1.4,2.0])
p('The 81-test total includes original 17, improved 43, Practice08 six and Practice09 fifteen; subset counts are not extra unique tests. The seven new checks cover approved-file identity, source/assertion preservation, fresh evidence, both overwrite guards and workflow structure. Historical browser copies changed only destinations and local origin, preserving earlier evidence and assertions.')
p('Observed outcomes cover past/reversed input, 120 versus 121 minutes, blocked rooms, real overlap, both touching endpoints, frozen data and exact feedback precedence. Browser checks compare 14 feedback states, layout, fixture display, storage and uncaught errors. Built assets are byte-identical before and after.')
p('Evidence logs retain exact commands, UTC times and exit codes. Browser environment settings and output adapters are recorded. Text terminal logs are used as evidence where a separate terminal screenshot was not captured. The browser screenshots below come from real executions.')
p('Measured tools: Node 22.22.0, npm 10.9.4, Vitest 2.1.9 and Vite 5.4.8. Build passed with a Browserslist data notice. Audit findings remain unresolved and were not hidden by changing dependencies or test expectations.')
page()

sub('Desktop before and after')
picture('evidence/baseline/ui/01-desktop.png',6.0,'Figure 1 Baseline desktop at 1440 × 900 showing a genuine overlap.')
picture('evidence/after/ui/01-desktop.png',6.0,'Figure 2 Desktop after mitigation with the same booking feedback and layout.')
page()

sub('Mobile before and after')
q=D.add_paragraph();q.alignment=WD_ALIGN_PARAGRAPH.CENTER
for i,rel in enumerate(['evidence/baseline/ui/mobile-feedback-viewport.png','evidence/after/ui/mobile-feedback-viewport.png']):
 if i:q.add_run('     ')
 shape=q.add_run().add_picture(str(BASE/rel),width=Inches(2.6));shape._inline.docPr.set('descr','Mobile feedback '+('before' if i==0 else 'after'))
p('Figures 3 and 4 Mobile at 375 × 812. Before is on the left; after is on the right. These two viewport PNGs are byte-identical.',style='Caption')
p('Both runs allow vertical page scrolling and internal timeline scrolling without document-level horizontal overflow. All recorded behavior comparisons match. Two of eight complete screenshot pairs are byte-identical; differences in the others are not presented as behavior changes.')
p('The existing public demo also returned HTTP 200 and the expected Smart Campus title. It rejected the A-102 10:30–11:30 overlap and accepted 11:00–12:00. Its bundle differs from the local build, so its deployed revision is not claimed as the tested local change.')
link('Published Smart Campus demo','https://smart-campus-room-ch-50zs.bolt.host/')
page()

h('10 Background Agent Safety Scenario')
p('This is a thought experiment. No asynchronous remote agent execution is claimed. An owner first approves a narrow task. The agent then uses a separate branch/worktree and a unique loopback port. A disposable environment without host credentials is needed for untrusted execution because a worktree only isolates files and Git changes.')
p('The agent may read source, tests, README, AGENTS, package/lockfile and the register. It may modify only approved paths and run documented install, test, typecheck, lint, build and browser commands. Credentials, real student records, production services, shared ports and other branches stay outside its scope.')
p('Parallel tasks use different branches, ports and evidence directories. The owner reviews overlapping proposals sequentially and tests their combined source. Required evidence is the diff, changed-file list, actual test outputs, build result, register update, review note and limitations. A human must review that evidence before merge. Deployment needs a separate explicit decision.')
h('11 Release Decision')
p('CONDITIONAL for the fictional classroom demo and human review. All local application and mitigation checks passed, and core source/UI behavior stayed unchanged. R1 and R2 are reduced to 2, while dependency risk R3 remains 4. Readiness remains Level 2.')
p('Boranov Daniyar owns the conditions: trusted use of development tooling, no credentials or privileged test API exposure, a reviewed dependency update, actual test-collection checks and the first hosted CI run before relying on CI for acceptance. The audit count includes installed development tooling and an unused production dependency path; it does not prove a live-site compromise.')
p('No remote push, merge or deployment was performed. The existing demo was checked separately. The release decision does not replace human review or establish the deployed revision of the local patch.')
h('12 Conclusion')
p('I preserved the existing Practice09 source and checked eight proposed findings against real evidence. Two approved safeguards improved repeatable verification and agent review boundaries. All 81 application tests, nine legacy tests, seven mitigation checks and the browser runs passed, with 25 matching before/after comparisons. Known dependency findings remain documented, so the final decision is CONDITIONAL with named owner controls.')

# Enforce black Times New Roman 12 pt in body, captions, tables and footer.
for q in list(D.paragraphs)+[q for t in D.tables for row in t.rows for cell in row.cells for q in cell.paragraphs]:
 for r in q.runs:r.font.name='Times New Roman';r.font.size=Pt(12);r.font.color.rgb=RGBColor(0,0,0)
f=S.footer.paragraphs[0];f.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=f.add_run();r.font.name='Times New Roman';r.font.size=Pt(12);r.font.color.rgb=RGBColor(0,0,0)
fld=OxmlElement('w:fldSimple');fld.set(qn('w:instr'),'PAGE');r._r.addnext(fld)
D.core_properties.title='Software Engineering Practice Work 10'
D.core_properties.subject='Smart Campus Risk Review and Agent Readiness Audit'
D.core_properties.author='Boranov Daniyar'
D.save(OUT)
print(OUT)
