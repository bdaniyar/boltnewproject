"""Build the editable report from the preserved real Practice08 evidence."""
from pathlib import Path
import hashlib
import json
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'practice08'
EVIDENCE = WORK / 'evidence'
OUT = WORK / 'reports/Practice08_Boranov_Daniyar_Report.docx'
doc = Document()
section = doc.sections[0]
section.page_width = Inches(8.5)
section.page_height = Inches(11)
section.top_margin = Inches(.7)
section.bottom_margin = Inches(.65)
section.left_margin = section.right_margin = Inches(.7)
for name, size in [('Normal',11), ('Title',22), ('Subtitle',12), ('Heading 1',15), ('Heading 2',12), ('Heading 3',11), ('Caption',11)]:
    style = doc.styles[name]
    style.font.name = 'Arial'
    style.font.size = Pt(size)
    style.font.color.rgb = RGBColor(0,0,0)
    style.paragraph_format.space_after = Pt(6 if name == 'Normal' else 9)
    style.paragraph_format.line_spacing = 1.05
    style.element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),'Arial')
for name in ['Heading 1','Heading 2','Heading 3']:
    doc.styles[name].paragraph_format.keep_with_next = True
for border in list(doc.styles.element.iter(qn('w:pBdr'))):
    border.getparent().remove(border)
doc.core_properties.title = 'Software Engineering Practice 08 Smart Campus Debugging'
doc.core_properties.subject = 'Controlled defects regression tests and Agent Skill comparison'
doc.core_properties.author = 'Boranov Daniyar'
footer=section.footer.paragraphs[0]
footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
r=footer.add_run('Practice 08  |  ');r.font.name='Arial';r.font.size=Pt(9)
field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)

def p(text='',bold=False):
    para=doc.add_paragraph()
    run=para.add_run(text);run.bold=bold
    return para

def h(text,level=1):
    return doc.add_heading(text,level)

def table(headers,rows,widths=None):
    t=doc.add_table(rows=1,cols=len(headers));t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
    if widths:
        for col,width in zip(t.columns,widths):col.width=Inches(width)
    for i,head in enumerate(headers):t.rows[0].cells[i].text=head
    for row in rows:
        cells=t.add_row().cells
        for i,value in enumerate(row):cells[i].text=str(value)
    for ri,row in enumerate(t.rows):
        pr=row._tr.get_or_add_trPr()
        if ri==0:
            repeat=OxmlElement('w:tblHeader');pr.append(repeat)
        cant=OxmlElement('w:cantSplit');pr.append(cant)
        for ci,cell in enumerate(row.cells):
            if widths:cell.width=Inches(widths[ci])
            cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            cp=cell._tc.get_or_add_tcPr()
            borders=OxmlElement('w:tcBorders')
            for side in ['top','left','bottom','right']:
                edge=OxmlElement('w:'+side);edge.set(qn('w:val'),'single');edge.set(qn('w:sz'),'5');edge.set(qn('w:color'),'D9D9D9');borders.append(edge)
            cp.append(borders)
            margins=OxmlElement('w:tcMar')
            for side in ['top','left','bottom','right']:
                edge=OxmlElement('w:'+side);edge.set(qn('w:w'),'95');edge.set(qn('w:type'),'dxa');margins.append(edge)
            cp.append(margins)
            fill=OxmlElement('w:shd');fill.set(qn('w:fill'),'E6E6E6' if ri==0 else 'FFFFFF');cp.append(fill)
            for para in cell.paragraphs:
                para.paragraph_format.space_after=Pt(2)
                para.paragraph_format.line_spacing=1.0
                for run in para.runs:run.font.size=Pt(11);run.bold=(ri==0)
    p()
    return t

def block(text):
    # Each line remains editable; automatic Word wrapping never changes source text.
    for line in text.splitlines():
        para=doc.add_paragraph()
        para.paragraph_format.space_after=Pt(0)
        para.paragraph_format.line_spacing=1.0
        para.paragraph_format.left_indent=Inches(.08)
        run=para.add_run(line)
        run.font.name='Arial';run.font.size=Pt(11)
    p()

def read(rel):return (EVIDENCE/rel).read_text()

def image(rel,caption,width=6.8,height=4.6):
    path=EVIDENCE/rel
    w,hh=Image.open(path).size
    chosen=min(width,height*w/hh)
    para=doc.add_paragraph();para.alignment=WD_ALIGN_PARAGRAPH.CENTER
    para.paragraph_format.keep_with_next=True
    run=para.add_run();run.add_picture(str(path),width=Inches(chosen))
    # Set real image description for Word accessibility.
    inline=run._r.xpath('.//wp:docPr')
    if inline:inline[0].set('descr',caption)
    doc.add_paragraph(caption,'Caption')

def pending(text):p(text,True)

ac=[
('AC1','reject start >= end and requests in the past.'),
('AC2','enforce maximum duration of 120 minutes.'),
('AC3','reject a blocked room.'),
('AC4','reject overlaps but allow time intervals touching at endpoints.'),
('AC5','return Available/Unavailable without modifying original booking data.'),
('AC6','preserve clear responsive desktop/mobile UI feedback.'),
]

doc.add_paragraph('Software Engineering Practice 08','Title')
doc.add_paragraph('Smart Campus Room Availability','Subtitle')
p('AI-Driven Software Engineering',True)
p('Lesson #08 — Practice Work #08')
p('Fix and Improve a Buggy Codebase')
p('Student: Boranov Daniyar\nStudent ID: 24B031718\nClass: Thursday, 14:00–17:00\nDate: 29 October 2026')
p('AI tool: OpenAI Codex\nExact model and application version: [INSERT VERIFIED MODEL AND VERSION]')
p('Published demo: [INSERT CORRECT PUBLISHED DEMO URL]',True)
p('The existing booking logic passed the baseline checks. Two deliberate defects were reproduced and repaired in separate copies of the saved project. The final project keeps the correct booking logic and adds regression coverage. The independent AI comparison and student account evidence remain pending.')
pending('PENDING STUDENT MANUAL STEP: personally recreate SKILL.md, collect the two independent AI responses and activation or simulation evidence, and fill the published URL.')

h('1 Objective and project overview')
p('The purpose is to debug the Smart Campus application using acceptance criteria, failing tests and a small repair. Practice #06 supplied the room checker and interface. Practice #07 supplied the original and improved tests that are preserved in this repository. This practice follows REPRODUCE → LOCALIZE → EXPLAIN → PATCH → VERIFY → IMPROVE.')
p('The project uses React 18, TypeScript and Vite. It contains fictional bookings, a supplied editable clock, and no login or database. A-102 is the single room used for the controlled cases. The existing five-room catalogue is preserved. The public interface displays Available or Unavailable; the helper also returns blocked for blocked rooms, which the interface presents as Unavailable.')
table(['Criterion','Required behaviour'],ac,[.8,6.3])
p('The test clock is 540 minutes, or 09:00. Requests are minutes from midnight on the same fictional day. The existing rule also rejects a start exactly at the supplied current time. No result depends on the real wall clock.')

h('2 Baseline and original test results')
p('The initial working tree was clean. The original project is preserved in evidence/baseline/SmartCampus_Baseline.zip. Git baseline reference: afcff636e723e7549f039ef688bf58b6ed9a7656. No existing source or uncommitted work was reset.')
p('The first npm ci failed because package.json declared Vitest 2.1.9 but package-lock.json did not include it. The original lock is retained in the baseline archive. Before changing any booking logic, npm install --package-lock-only --ignore-scripts --no-audit --no-fund synchronized the lock. npm ci --no-audit --no-fund then installed 322 packages. This was an installation repair, separate from BUG-A and BUG-B. The real failed installation output and lock diff are included in the evidence.')
table(['Baseline command','Observed result'],[
('npm run test:original','17 passed, 0 failed'),
('npx vitest run before Practice08 config change','43 passed, 0 failed'),
('npm run test:legacy','9 passed, 0 failed'),
],[4.9,2.2])
p('Verbatim original Practice07 output')
block(read('baseline/practice07-original.txt'))
image('baseline/practice07-original-browser-view.png','Figure 1  Genuine browser view of the saved baseline output. It is a log viewer, not a terminal capture.',height=3.9)
p('The baseline already allowed touching endpoints and preserved original bookings. Both defects below are controlled teaching cases. They were not present in the delivered application.')

h('3 Controlled BUG A')
p('Test P08-A01 uses unblocked room A-102, existing booking [600,660), request [660,720), and fixed clock 540. The request is after the clock and lasts 60 minutes. It shares no occupied minute with the existing booking, so AC4 requires Available.')
p('Only the overlap condition was changed in a fresh extraction of the baseline. At src/bookingLogic.ts line 54, both strict comparisons were changed to <=. The smallest test then returned unavailable. This confirms that equality at the endpoint was incorrectly treated as a conflict.')
block("test('P08-A01 endpoint after 10:00-11:00 remains available', () => {\n  expect(checkAvailability(660, 720, roomFixture(), [bookingFixture()], NOW)).toBe('available');\n});")
p('Verbatim failure excerpt from evidence/bug-a/red-targeted.txt')
red_a=read('bug-a/red-targeted.txt')
block('\n'.join(line for line in red_a.splitlines() if any(term in line for term in ['AssertionError:', 'Expected:', 'Received:', 'Tests  ', 'Test Files'])))
image('bug-a/red-targeted-browser-view.png','Figure 2  Genuine browser view of the BUG A RED output.',height=4.9)
p('The initial hypothesis was an inclusive endpoint condition. The injection diff and the failed equality check confirmed it. The diagnosis and proposed patch were saved before the repair in evidence/bug-a/diagnosis-before-patch.md. The minimal patch restored start < b.end && b.start < end in that single condition. No clock, fixture or room-state change was required.')

h('4 Controlled BUG B')
p('Test P08-B01 uses the same clock, room and request. Its input array is deliberately unsorted: later-2 is [780,810), followed by existing-1 [600,660). AC5 requires the same order and values after the availability check.')
p('A separate fresh baseline copy received one defect at src/bookingLogic.ts line 114: existingBookings.sort((a, b) => a.start - b.start). This call sorts the caller array in place. Availability remained available, but the data assertion failed: [later-2, existing-1] became [existing-1, later-2]. BUG-A was absent from this copy.')
block("test('P08-B01 availability preserves the original unsorted bookings', () => {\n  const bookings = unsortedFixture();\n  const before = bookings.map((booking) => ({ ...booking }));\n  expect(checkAvailability(660, 720, roomFixture(), bookings, NOW)).toBe('available');\n  expect(bookings).toEqual(before);\n});")
p('Verbatim failure excerpt from evidence/bug-b/red-targeted.txt')
red_b=read('bug-b/red-targeted.txt')
block('\n'.join(line for line in red_b.splitlines() if any(term in line for term in ['AssertionError:', 'Tests  ', 'Test Files'])))
image('bug-b/red-targeted-browser-view.png','Figure 3  Genuine browser view of the BUG B failure showing the changed array order.',height=5.8)
p('The hypothesis was a write through the caller array reference. The one-line injection and the observed sort order confirmed the cause. The smallest repair removed the unnecessary sort. Validation already scans every booking, so sorting is not needed. The saved diagnosis was corrected with a separate note: the actual numbered source location is line 114.')
p('The full defect log is included as defect_log.md. Each case records the exact input, expected and observed result, suspected cause, confirmed source location, evidence paths and regression status. The snapshot source files and case metadata preserve the state of each isolated experiment.')

h('5 Bug detector Skill')
p('The assignment files use the exact supplied UTF-8 text. Frontmatter and openai.yaml were parsed as YAML, compared byte for byte with the starter, and checked for the lowercase name and allow_implicit_invocation: false. The two files contain no credentials. Validation results are in evidence/skill/validation.json.')
p('Exact SKILL.md contents')
block((ROOT/'bug-detector/SKILL.md').read_text())
p('Exact agents/openai.yaml contents')
block((ROOT/'bug-detector/agents/openai.yaml').read_text())
p('The ZIP was inspected with zipfile.namelist and unzip. Its top-level paths are bug-detector/SKILL.md and bug-detector/agents/openai.yaml.')
image('skill/zip-structure.png','Figure 4  Genuine browser view of actual ZIP inspection output.',height=4.5)
p('The local diagnostic workflow used the seven supplied steps and saved the required defect | evidence | root cause | fix | test format before each patch. This is not evidence of installing or activating the Skill in ChatGPT or Claude. No external installation or prompt-only comparison trial has been completed in this run.')
p('A real browser access check at chatgpt.com displayed Log in and Sign up for free, followed by the login form. There was no authenticated browser session for Skill installation and verified comparison controls. The access screenshot is retained in evidence/comparison/chatgpt-access-check.png. No credentials were entered and no comparison prompt was submitted.')
pending('[INSERT REAL SCREENSHOT: Skill installation and activation OR prompt only simulation]')
p('If installation is unavailable, the instructor permits a prompt-only simulation. In condition B, paste the exact SKILL.md instructions before the frozen shared input and label the condition as simulation. Do not treat it as an installed Skill.')
pending('Slide 14 requires the student to create SKILL.md by hand. Boranov Daniyar must personally recreate or retype the prepared file in an editor before submission. The generated template is not evidence of manual student authorship.')

h('6 AI analysis without Skill')
pending('PENDING STUDENT MANUAL STEP — no external session A response has been collected.')
p('Open a fresh independent chat where bug-detector is inactive. Use the same model and settings as condition B. Provide the complete frozen input reproduced in Appendix A, unchanged. Do not attach, invoke or paste Skill instructions. Record the actual model and a real screenshot showing the condition.')
p('Exact diagnostic question in both conditions')
block('Find the root cause of the failed room-booking test. Propose minimal patch and regression test. Do not edit code.')
p('The ready-to-copy session instructions are prompts/NO_SKILL_CHAT.md. The exact shared code, criteria, failing test, real output and deterministic inputs are in prompts/COMPARE_SHARED_INPUT.md and Appendix A.')
pending('[INSERT FULL UNEDITED AI RESPONSE WITHOUT SKILL]')
pending('[INSERT REAL SCREENSHOT: No Skill chat and response]')
p('Actual model and settings: [INSERT VERIFIED MODEL VERSION AND SETTINGS]')

h('7 AI analysis with Skill')
pending('PENDING STUDENT MANUAL STEP — no external session B response has been collected.')
p('Use a second fresh independent chat with the same model and settings. Explicitly activate bug-detector, or use the clearly labelled prompt-only simulation. Then provide the identical Appendix A input and the identical diagnostic question shown in Section 6. The shared input is not rewritten for condition B.')
p('The ready-to-copy instructions are prompts/WITH_SKILL_CHAT.md and prompts/PROMPT_ONLY_SIMULATION.md. Save the full actual response without editing. A local sub-agent or this ongoing debugging conversation is not an independent external trial.')
pending('[INSERT FULL UNEDITED AI RESPONSE WITH SKILL]')
pending('[INSERT REAL SCREENSHOT: With Skill chat and response]')
p('Actual model and settings: [INSERT VERIFIED MODEL VERSION AND SETTINGS]')
p('Actual condition: [INSTALLED SKILL OR EXPLICIT PROMPT ONLY SIMULATION]')

h('8 Comparison of the two conditions')
table(['Criterion','No Skill','With Skill'],[
('Correct root cause','pending actual response','pending actual response'),
('Reproducible test','pending actual response','pending actual response'),
('Minimal proposed patch','pending actual response','pending actual response'),
('Unsupported claims','pending actual response','pending actual response'),
('Clarity of explanation','pending actual response','pending actual response'),
],[2.7,2.2,2.2])
p('The input is frozen before either manual trial. Its SHA-256 is '+hashlib.sha256((WORK/'prompts/COMPARE_SHARED_INPUT.md').read_bytes()).hexdigest()+'. Compare each actual answer against the preserved defect and repair. Count unsupported claims, including invented test execution. The Skill is not assumed to perform better. No comparison finding is claimed until both real responses exist.')

h('9 Minimal repair and final source changes')
p('Each diagnosis was saved after RED and before editing the defective copy. BUG-A restores two strict operators in one condition. BUG-B removes one unnecessary sort line. Each repaired bookingLogic.ts is byte for byte identical to the baseline, and the production source stays identical to the original correct code.')
p('Actual BUG A repair diff')
block(read('bug-a/minimal-repair.patch'))
p('Actual BUG B repair diff')
block(read('bug-b/minimal-repair.patch'))
p('The final repository changes add six meaningful Practice08 tests, include all three Vitest suites in the default test command, add a browser verification script, synchronize the existing lock file, and update the README test instructions. The two Practice07 test files are unchanged. Full source changes are retained in evidence/regression/final-project.patch. No new application feature or booking write operation was added.')

h('10 Regression and acceptance verification')
table(['Execution','Actual result'],[
('BUG-A RED targeted','1 failed; 5 filtered out'),
('BUG-A repaired targeted and full','1 passed targeted; 66 passed full'),
('BUG-B RED targeted','1 failed; 5 filtered out'),
('BUG-B repaired targeted and full','1 passed targeted; 66 passed full'),
('Final Practice08 targeted regression file','6 passed, 0 failed'),
('Final npx vitest run','66 passed, 0 failed across 3 files'),
('Final legacy Node suite','9 passed, 0 failed'),
('Chrome UI verification','14 passed, 0 failed'),
('Typecheck lint and build','all exit 0'),
],[4.8,2.3])
p('Filtered tests in RED runs were not executed and are not counted as passing. The full runs include the original 17, improved 43 and new 6 tests. Legacy and browser totals are separate and should not be added as unique unit-test coverage.')
p('Verbatim final targeted output')
block(read('regression/practice08-targeted.txt'))
p('Verbatim final full Vitest output')
block(read('regression/full-vitest.txt'))
table(['AC','Evidence and observed behaviour'],[
('AC1','Practice07 T02–T04, T21; Chrome AC1-PAST and AC1-ORDER reject past, equal and reversed times.'),
('AC2','T06 accepts 120 minutes; T07 rejects 121; Chrome INT01 and INT02 confirm feedback.'),
('AC3','T13 and Chrome UI02 reject a blocked room through the real room state.'),
('AC4','P08-A01/A02 accept both endpoint cases; P08-A03 rejects a real overlap; Chrome UI01/INT03/INT04 agree.'),
('AC5','P08-B01/B02/B03 preserve values, order, length and references, including frozen data; Chrome UI05 preserves five records and storage.'),
('AC6','Chrome desktop 1440×900 and mobile 375×812 show clear status and error feedback without horizontal document overflow.'),
],[.6,6.5])
p('Chrome 156.0.8078.48 tested the real Vite app at http://127.0.0.1:5174. Port 5173 belonged to another local project, so it was left untouched. The correct origin was verified before the accepted run. These are automated browser checks with a mobile viewport, not a physical phone usability session.')
image('ui/02-available.png','Figure 5  Actual desktop UI accepting 11:00–12:00 after the 10:00–11:00 booking.',height=4.3)
image('ui/07-overlap.png','Figure 6  Actual UI showing overlap feedback for 10:30–11:30.',height=4.3)
if (EVIDENCE/'ui/mobile-feedback-viewport.png').exists():
    image('ui/mobile-feedback-viewport.png','Figure 7  Actual mobile viewport with the selected room and availability feedback.',width=3.1,height=6.3)
else:
    image('ui/05-mobile.png','Figure 7  Actual full mobile page; the original image is supplied in evidence/ui.',width=2.0,height=7.2)
p('The build emitted the existing Browserslist data warning and still completed successfully. No dependency update was made merely to suppress that warning. Raw logs and exit-code metadata for typecheck, lint and build are supplied in evidence/regression.')

h('11 Limitation of AI assisted debugging')
p('An AI explanation alone does not establish a defect or a successful repair. In this run, the first diagnosis for BUG-B estimated line 120, while the numbered source snapshot shows line 114. The original diagnosis was preserved and a separate correction was added. Real logs, exact diffs and regression tests were needed to confirm the cause and correct the source location. This local correction also shows why an unverified AI answer should not be treated as evidence.')
p('The independent WITHOUT and WITH Skill responses are still missing. Therefore this work cannot measure whether the Skill improves diagnosis quality. A real comparison needs two fresh sessions, the same input and actual activation or labelled simulation evidence.')

h('12 Conclusion')
p('The saved baseline already met the booking rules tested in this practice. Separate controlled failures showed that inclusive endpoint comparisons break AC4 and an in-place sort breaks AC5. After the minimal repairs, each isolated full suite passed 66 tests, and the final project passed 66 Vitest tests, 9 legacy tests and 14 browser checks. The effect of the Skill remains unmeasured because the two independent comparison responses are pending.')

h('Submission completion checklist')
p('Prepared locally: editable Word report, exact Skill and ZIP, baseline archive, real RED/GREEN logs, diagnoses, repair diffs, frozen prompts, genuine screenshots, source export and unsent email draft. See PENDING_MANUAL_STEPS.md for the remaining student actions. The report and email keep the published URL editable. The required email subject is AI-Driven Software Engineering Practice #09, Boranov Daniyar, 24B031718, as stated on the submission slide.')

doc.add_page_break()
h('Appendix A Exact frozen shared input')
p('The following text is reproduced without editing from prompts/COMPARE_SHARED_INPUT.md. The same file must be used in both independent trials. Word may wrap long lines; the source Markdown remains the copy-and-paste authority.')
block((WORK/'prompts/COMPARE_SHARED_INPUT.md').read_text())
OUT.parent.mkdir(parents=True,exist_ok=True)
doc.save(OUT)
print(OUT)
print('Frozen input SHA256:',hashlib.sha256((WORK/'prompts/COMPARE_SHARED_INPUT.md').read_bytes()).hexdigest())
