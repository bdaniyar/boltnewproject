"""Build the editable academic report from the measured Practice09 evidence."""
from pathlib import Path
import json
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

BASE = Path(__file__).resolve().parents[1]
OUT = BASE / 'Practice09_Boranov_Daniyar_Report.docx'
doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.27), Inches(11.69)
sec.top_margin = sec.bottom_margin = Inches(.72)
sec.left_margin = sec.right_margin = Inches(.78)
sec.header_distance = sec.footer_distance = Inches(.3)
for style in doc.styles:
    if style.type in (1, 2, 3):
        style.font.name = 'Times New Roman'
        style.font.size = Pt(12)
        style.font.color.rgb = RGBColor(0, 0, 0)
        rpr = style.element.get_or_add_rPr()
        fonts = rpr.find(qn('w:rFonts'))
        if fonts is not None:
            for key in ['ascii','hAnsi','eastAsia','cs']:
                fonts.set(qn('w:'+key),'Times New Roman')
            for key in ['asciiTheme','hAnsiTheme','eastAsiaTheme','cstheme']:
                fonts.attrib.pop(qn('w:'+key),None)
        for border in list(style.element.iter(qn('w:pBdr'))):
            border.getparent().remove(border)
normal = doc.styles['Normal'].paragraph_format
normal.space_after = Pt(6)
normal.line_spacing = 1.08
for name in ['Title','Subtitle','Heading 1','Heading 2','Caption']:
    doc.styles[name].font.color.rgb = RGBColor(0,0,0)
    doc.styles[name].font.size = Pt(12)
doc.styles['Title'].font.bold = True
for name in ['Heading 1','Heading 2']:
    doc.styles[name].font.bold = True
    doc.styles[name].paragraph_format.space_before = Pt(8)
    doc.styles[name].paragraph_format.space_after = Pt(6)
    doc.styles[name].paragraph_format.keep_with_next = True

def p(text='',bold=False,style=None):
    para=doc.add_paragraph(style=style)
    r=para.add_run(text)
    r.bold=bold
    return para
def h(text): return doc.add_heading(text,level=1)
def page(): doc.add_page_break()
def table(headers,rows,widths):
    t=doc.add_table(rows=1, cols=len(headers))
    t.autofit=False
    for col,w in zip(t.columns,widths): col.width=Inches(w)
    for cell,txt in zip(t.rows[0].cells,headers): cell.text=txt
    for row in rows:
        cells=t.add_row().cells
        for c,txt in zip(cells,row): c.text=str(txt)
    props=t._tbl.tblPr
    borders=OxmlElement('w:tblBorders')
    for name in ['top','left','bottom','right','insideH','insideV']:
        edge=OxmlElement('w:'+name)
        edge.set(qn('w:val'),'single'); edge.set(qn('w:sz'),'4'); edge.set(qn('w:color'),'000000')
        borders.append(edge)
    props.append(borders)
    for row in t.rows:
        trpr=row._tr.get_or_add_trPr()
        trpr.append(OxmlElement('w:cantSplit'))
        for cell,w in zip(row.cells,widths):
            cell.width=Inches(w)
            for para in cell.paragraphs:
                para.paragraph_format.space_after=Pt(3)
                para.paragraph_format.space_before=Pt(3)
                para.paragraph_format.line_spacing=1
    t.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:tblHeader'))
    for cell in t.rows[0].cells:
        for run in cell.paragraphs[0].runs: run.bold=True
    p().paragraph_format.space_after=Pt(0)
    return t
def picture(rel,width,caption):
    para=doc.add_paragraph()
    para.paragraph_format.space_after=Pt(2)
    para.alignment=WD_ALIGN_PARAGRAPH.CENTER
    run=para.add_run()
    inline=run.add_picture(str(BASE/rel),width=Inches(width))
    inline._inline.docPr.set('descr',caption)
    cp=p(caption,style='Caption')
    cp.paragraph_format.space_after=Pt(6)
def code(text):
    para=p(text)
    para.paragraph_format.line_spacing=1
    para.paragraph_format.space_after=Pt(8)
    return para

# 1 Cover
for _ in range(4): p()
title=p('Software Engineering Practice Work 09',style='Title')
title.alignment=WD_ALIGN_PARAGRAPH.CENTER
for text in ['Smart Campus Room Availability','Repository instructions and minimal refactoring','Lesson 09']:
    pp=p(text); pp.alignment=WD_ALIGN_PARAGRAPH.CENTER
p()
for text in ['Boranov Daniyar','Student ID 24B031718','Thursday, 14:00–17:00','5 November 2026']:
    pp=p(text); pp.alignment=WD_ALIGN_PARAGRAPH.CENTER
p()
p('The existing application was inspected, minimally refactored and verified locally. No new design pattern was needed. Bolt comparison and remote implementation evidence remain unavailable and are clearly identified in this report.')
p('AI tool: OpenAI Codex, GPT-6 model family. The exact model build and application version were not exposed in this session. No completed Bolt trial or Bolt model is reported.')
p('Published Bolt demo URL: [INSERT VERIFIED PUBLISHED BOLT DEMO URL]')
p('The report and URL field are editable. The submission email subject follows the instructor’s Practice #10 wording; the assignment itself is Practice Work #09.')
p('Submission recipient: b.azimkhanov@kbtu.kz. Required email subject: AI-Driven Software Engineering Practice #10, Boranov Daniyar, 24B031718. The draft is supplied; no email was sent.')
page()

# 2 and 3
h('2 Objective and project overview')
p('The objective was to continue the repaired Practice08 application, improve one real maintenance issue, and verify unchanged behaviour. The app is a React and TypeScript frontend with fictional room data and a supplied demo clock. It checks availability without creating or saving bookings. The existing five-room catalogue remains; A-102 is the single-room practice scenario.')
p('AC1 rejects invalid, reversed, zero-length and past requests, including a start equal to the current time. AC2 limits duration to 120 minutes. AC3 rejects blocked rooms. AC4 rejects actual overlaps and permits touching endpoints. AC5 preserves booking values, order, length and references. AC6 preserves clear desktop and mobile feedback.')
h('3 Baseline inspection')
p('Inspection and baseline tests preceded the application patch. The tracked working tree was clean at Git commit a2dff221bb65eeee5d1b20211292ed5d020905bc. The original tracked repository archive remains local. A compact frozen baseline source archive and hashes are included in the submission. Git history was preserved.')
table(['Location','Role'],[
('src/bookingLogic.ts','Pure validation, availability and time parsing. checkAvailability delegates to validateBooking.'),
('src/App.tsx','Demo state, fixed clock and component wiring. No booking setter or persistence.'),
('src/components/','BookingPanel feedback; RoomCard selection; Timeline schedule; CurrentTimeControl clock.'),
('src/sampleData.ts and src/types.ts','Five rooms and five bookings; one consistent Booking shape with start and end.'),
('tests/ and Vitest configurations','Original 17, improved 43, Practice08 six, legacy Node nine and real browser scripts.')
],[2.12,4.52])
p('Baseline results: 66/66 Vitest tests and 9/9 legacy tests passed. The original 17 and Practice08 six also passed separately; these are subsets of 66. Before refactoring, the browser suite passed 18/18 checks at 1440 × 900 and 375 × 812. Raw logs, command metadata and the source structure are in evidence/baseline and evidence/inspection.')
page()

# 4 and 5
h('4 Maintainability problems and pattern selection')
p('Three small, genuine findings were recorded before changes. None was a failing booking rule.')
table(['Finding and baseline reference','Decision'],[
('BookingPanel.tsx lines 30–43 validates directly and then calls an availability helper that validates again.','Selected: reuse the existing validation result.'),
('bookingLogic.ts lines 79 and 90 repeat the same numeric range guard.','Deferred to keep one focused change.'),
('The 120-minute literal appears in bookingLogic.ts, BookingPanel.tsx and App.tsx.','Deferred: all values currently agree.')
],[4.25,2.39])
p('ZERO new design patterns were selected. The pure booking module already separates rules from React and fixtures. There is only one required policy and one booking format, so Strategy and Adapter have no real need. Singleton, unnecessary Factory patterns and class hierarchies would add complexity.')
p('Two-sentence rationale',bold=True)
p((BASE/'pattern-rationale.md').read_text().split('# Two sentence rationale\n\n')[1].split('\n\n# Pattern rationale')[0])
h('5 AGENTS md repository instructions')
p('The root AGENTS.md names the real source files, AC1–AC6, small pure functions, immutable fixtures, responsive UI rules and the zero-pattern decision. It forbids authentication, a backend, database, saved bookings, extra features, UI redesign and unnecessary dependencies. It requires preserved tests, focused regressions, real outputs and before/after evidence.')
p('It lists npm ci, the original suite, Practice08 and Practice09 suites, full Vitest, legacy tests, typecheck, lint and build. Browser commands use port 5176, tests/practice09-browser.mjs and practice09/tools/compare-ui.mjs. Exact commands also appear in section 11 and in the supplied file.')
p('For the guided Bolt condition, the complete AGENTS.md is explicitly attached or pasted and Bolt is asked to summarize it before editing. This preparation does not show automatic AGENTS.md support in Bolt.')
page()

# 6
h('6 Bolt experiment without AGENTS md')
p('Condition A was prepared using the frozen baseline source without AGENTS.md. The exact inspection request is:')
p((BASE/'prompts/BOLT_A_WITHOUT_INSTRUCTIONS.txt').read_text().strip())
p('No valid Practice09 response was obtained. The browser extension control host was unavailable. Native Chrome inspection showed an existing Bolt project whose visible history ended at Version 3 on 8 October. Its identity as the current Practice08 source could not be verified. Attempts to establish an independent copy met changed-window-state and no-window errors. No A or B prompt was submitted and no remote source change or publication was requested.')
picture('evidence/bolt-a/bolt-access.png',6.55,'Figure 1 Actual Bolt access state. Historical chat is access evidence only, not a Practice09 experiment response.')
p('The complete access record is evidence/bolt-a/access-check.md. The old publication address visible in the screenshot is not used as a verified revised project URL.')
page()

# 7 and 8
h('7 Bolt experiment with AGENTS md')
p('Condition B is prepared for a separate conversation or independent checkpoint using the same frozen source and the same inspection task. The prompt explicitly includes the full root AGENTS.md and asks Bolt to summarize project constraints, required behaviour, exact test commands and forbidden changes. The complete prompt is prompts/BOLT_B_WITH_EXPLICIT_AGENTS.txt; the supplied instructions are also in prompts/AGENTS_EXPLICIT_CONTEXT.md.')
p('The explicit read request follows the instructor’s step:')
p((BASE/'prompts/BOLT_EXPLICIT_READ.txt').read_text().strip())
p('No real B response or model information was obtained because an independent same-source Bolt project could not be established. There is no claim that Bolt read the file or implemented this refactoring. The implementation demonstration prompt is prepared separately in prompts/BOLT_IMPLEMENTATION.txt.')
h('8 Comparison and reflection')
table(['Criterion','A without instructions','B with instructions'],[
('Scope control','Not observed','Not observed'),
('Unnecessary patterns','Not observed','Not observed'),
('Test quality','Not observed','Not observed'),
('Explanation clarity','Not observed','Not observed')
],[2.1,2.27,2.27])
p('No measured comparison is possible. Explicit instructions are expected to clarify the fixed clock, non-mutation rule, existing module and exact verification commands, but this benefit was not measured here. A fair trial must use the same baseline and task in separate conversations. It cannot prove automatic instruction loading.')
p('Local complexity fell slightly because one duplicate validation pass and one memoized calculation were removed. There is no evidence about unsolicited Bolt edits or the effect of guided instructions because the trials did not run. The actual preservation evidence comes from unchanged source hashes, component regressions and browser comparisons. Exact remaining external steps are in UNAVAILABLE_EVIDENCE.md.')
page()

# 9
h('9 Refactoring implementation')
p('The local implementation changed only BookingPanel.tsx in the application source. The panel already computed liveValidation for messages. Its second memo called checkAvailability, which repeated the same validation. The new expression derives the selected-room status from the existing result. The existing pure booking module and public helper remain unchanged.')
p('Before change',bold=True)
baseline_component=(BASE/'evidence/implementation/BookingPanel.before.tsx.txt').read_text()
code('const liveAvailability = useMemo'+baseline_component.split('const liveAvailability = useMemo',1)[1].split('\n\n  const duration',1)[0])
p('After change',bold=True)
code("const liveAvailability: AvailabilityStatus | null = !room\n  ? null\n  : startMin === null || endMin === null\n    ? 'unavailable'\n    : liveValidation?.valid\n      ? 'available'\n      : room.blocked ? 'blocked' : 'unavailable';")
p('The availability type import was added and the unused helper import removed. The exact patch and full before/after component copies are in evidence/implementation. All JSX, props, labels, messages and CSS classes remain byte-identical.')
p('Status order is preserved: no room gives no status; malformed time gives unavailable even for a blocked room; parsed invalid input in a blocked room gives blocked; valid input gives available. Blocked remains displayed as “Unavailable” with its existing amber styling. The focused component suite tests these combinations.')
p('The 15 new tests passed on an isolated copy of the original component and on the refactored component. They are characterization tests, not a claim of a newly repaired booking defect. OpenAI Codex performed the local change; a Bolt implementation demonstration remains unavailable.')
page()

# 10
h('10 Changed files and rationale')
table(['File','Change and reason'],[
('src/components/BookingPanel.tsx','Reuse existing validation for status; remove redundant calculation.'),
('vitest.config.ts','Include the new focused component suite.'),
('tests/practice09.refactoring.test.tsx','15 regressions for feedback, precedence and fixture preservation.'),
('tests/practice09-browser.mjs','18 real browser checks with preserved before/after evidence.'),
('AGENTS.md','Repository-specific rules, scope and exact verification commands.'),
('README.md','Update test count and explain Practice09 verification and evidence.')
],[2.7,3.94])
p('New practice09 files contain the report, source export, prompts, rationale, comparison and real evidence. The full changed-file list and working-source patch are supplied. No package, lockfile, core booking rule, fixture or previous test changed. No commit or history rewrite was made.')
p('Pattern rationale 136 words',bold=True)
rationale=(BASE/'pattern-rationale.md').read_text().split('# Pattern rationale\n\n')[1].strip()
assert 100 <= len(rationale.split()) <= 150
p(rationale)
p('A separate source review found no blocking correctness issue. It verified unchanged core files, fixtures, previous suites and component JSX. The reviewer also authored the new tests, so this was not an independent audit of their own test design. SSR checks are complemented by real interactive browser checks.')
page()

# 11
h('11 Regression tests')
p('Commands ran in the real repository after the patch. All listed checks exited with code 0. Separate suites are subsets of the full Vitest count and must not be added again. The fresh source export was installed and tested in an isolated temporary directory.')
table(['Exact command','Baseline','After'],[
('npm run test:original','17/17','17/17'),
('npx vitest run tests/practice08.regression.test.ts','6/6','6/6'),
('npx vitest run tests/practice09.refactoring.test.tsx','15/15 in isolated baseline','15/15'),
('npx vitest run','66/66','81/81'),
('npm run test:legacy','9/9','9/9'),
('npm run typecheck','Pass in frozen export','Pass'),
('npm run lint','Not separately run','Pass'),
('npm run build','Not separately run','Pass'),
('node tests/practice09-browser.mjs before','18/18','—'),
('node tests/practice09-browser.mjs after','—','18/18'),
('node practice09/tools/compare-ui.mjs','—','25/25 equal'),
('npm ci then npx vitest run in fresh export','—','Install pass; 81/81')
],[4.02,1.31,1.31])
p('Coverage and expected outcomes',bold=True)
p('Past and reversed requests fail AC1; 121 minutes fails AC2 while 120 passes; blocked rooms fail AC3; overlap fails AC4 while both touching endpoints pass. Repeated calls with all five frozen bookings preserve values, order, length and references for AC5. No-room, malformed-input and combined blocked cases preserve exact component feedback. Browser desktop/mobile checks support AC6.')
p('Actual raw outputs and adjacent metadata record commands, directories, UTC times and exit codes in evidence/baseline and evidence/regression. Node was 22.22.0, npm 10.9.4, Vitest 2.1.9, Vite 5.4.8 and Chrome 156.0.8078.80. The build passed with an outdated Browserslist data notice. Fresh npm ci reported 25 existing dependency advisories; dependencies were not changed.')
page()

# 12 Desktop
h('12 Desktop and mobile verification')
p('Both browser runs passed 18/18 checks. All 25 recorded comparisons match, including 14 feedback states, messages, classes, computed colours, input flags, layout measurements, fixture displays and browser storage. These are deterministic Chrome checks, not a physical-device usability study.')
picture('evidence/ui-before/01-desktop.png',6.35,'Figure 2 Desktop before refactoring at 1440 × 900.')
picture('evidence/ui-after/01-desktop.png',6.35,'Figure 3 Desktop after refactoring at 1440 × 900. This initial desktop PNG is byte-identical to the baseline.')
page()

# 12 Mobile continued and conclusion
p('Mobile verification',bold=True)
p('The viewport is 375 × 812. The page scrolls vertically; the timeline scrolls within its own panel. Validation feedback and controls remain usable without document-level horizontal overflow. The following actual screenshots show the mobile feedback viewport before and after.')
para=doc.add_paragraph()
para.alignment=WD_ALIGN_PARAGRAPH.CENTER
for i,phase in enumerate(['ui-before','ui-after']):
    if i: para.add_run('     ')
    shape=para.add_run().add_picture(str(BASE/'evidence'/phase/'mobile-feedback-viewport.png'),width=Inches(2.74))
    shape._inline.docPr.set('descr',f'Mobile feedback viewport {phase}')
p('Figures 4 and 5 Mobile before on the left and after on the right. These viewport PNGs are byte-identical.',style='Caption')
p('Three of eight screenshot pairs are byte-identical. Five pairs contain pixel differences outside the booking panel; unchanged room-card transitions are a plausible timing cause. The evidence does not claim every screenshot pixel is identical. Recorded feedback, layout and fixture comparisons all match.')
h('13 Conclusion')
p('The smallest justified improvement removed duplicate validation and preserved AC1–AC6, the UI and project history. No additional pattern was needed. Real tests and browser evidence support the local result. Bolt A/B responses, a Bolt implementation demonstration and a verified revised publication remain missing; exact prompts and the original source are ready for those external steps.')
p('Published Bolt demo URL: [INSERT VERIFIED PUBLISHED BOLT DEMO URL]')

# Enforce user formatting on all text; keep editable document and page numbers.
for para in list(doc.paragraphs)+[p for t in doc.tables for row in t.rows for c in row.cells for p in c.paragraphs]:
    for run in para.runs:
        run.font.name='Times New Roman'; run.font.size=Pt(12); run.font.color.rgb=RGBColor(0,0,0)
footer=sec.footer.paragraphs[0]
footer.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=footer.add_run(); r.font.name='Times New Roman'; r.font.size=Pt(12); r.font.color.rgb=RGBColor(0,0,0)
field=OxmlElement('w:fldSimple'); field.set(qn('w:instr'),'PAGE'); r._r.addnext(field)
doc.core_properties.title='Software Engineering Practice Work 09'
doc.core_properties.subject='Smart Campus Room Availability repository instructions and refactoring'
doc.core_properties.author='Boranov Daniyar'
doc.core_properties.keywords='Practice09, Smart Campus, AGENTS.md, regression testing'
OUT.parent.mkdir(exist_ok=True)
doc.save(OUT)
print(OUT)
