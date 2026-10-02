from pathlib import Path
from shutil import copyfile

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output' / 'pdf' / 'Vignesh_Kumar_Ekambaram_Resume.pdf'

NAVY = colors.HexColor('#0B1220')
INDIGO = colors.HexColor('#4F46E5')
SKY = colors.HexColor('#0284C7')
SLATE = colors.HexColor('#475569')
LIGHT = colors.HexColor('#E2E8F0')
PALE = colors.HexColor('#F8FAFC')


def paragraph(text, style):
    return Paragraph(text, style)


def bullets(items, styles):
    return [paragraph(f'<bullet>&bull;</bullet> {item}', styles['bullet']) for item in items]


def section(title, content, styles):
    header = Table([[paragraph(title.upper(), styles['section'])]], colWidths=[170 * mm])
    header.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PALE),
        ('LINEBELOW', (0, 0), (-1, -1), 1, INDIGO),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    return [Spacer(1, 5 * mm), header, Spacer(1, 2.2 * mm), *content]


def role(title, company, period, points, styles):
    heading = Table([[paragraph(title, styles['role']), paragraph(f'{company}<br/><font color="#64748B">{period}</font>', styles['meta'])]], colWidths=[118 * mm, 52 * mm])
    heading.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))
    items = bullets(points, styles)
    return [KeepTogether([heading, items[0]]), *items[1:], Spacer(1, 2 * mm)]


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT), pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm,
        topMargin=15 * mm, bottomMargin=15 * mm,
        title='Vignesh Kumar Ekambaram - Resume', author='Vignesh Kumar Ekambaram'
    )
    base = getSampleStyleSheet()
    styles = {
        'name': ParagraphStyle('name', parent=base['Title'], fontName='Helvetica-Bold', fontSize=25, leading=29, textColor=colors.white, spaceAfter=2),
        'headline': ParagraphStyle('headline', parent=base['Normal'], fontName='Helvetica', fontSize=10.5, leading=14, textColor=colors.HexColor('#C7D2FE')),
        'contact': ParagraphStyle('contact', parent=base['Normal'], fontName='Helvetica', fontSize=8.5, leading=11, textColor=colors.HexColor('#CBD5E1')),
        'section': ParagraphStyle('section', parent=base['Normal'], fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=INDIGO, tracking=1.2),
        'body': ParagraphStyle('body', parent=base['BodyText'], fontName='Helvetica', fontSize=9.15, leading=13.1, textColor=NAVY, alignment=TA_LEFT),
        'role': ParagraphStyle('role', parent=base['BodyText'], fontName='Helvetica-Bold', fontSize=10.2, leading=12.5, textColor=NAVY),
        'meta': ParagraphStyle('meta', parent=base['BodyText'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=SKY, alignment=2),
        'bullet': ParagraphStyle('bullet', parent=base['BodyText'], fontName='Helvetica', fontSize=8.9, leading=12.2, leftIndent=10, firstLineIndent=-7, spaceAfter=2.3, textColor=NAVY),
        'skill': ParagraphStyle('skill', parent=base['BodyText'], fontName='Helvetica', fontSize=8.5, leading=11.5, textColor=NAVY),
        'footer': ParagraphStyle('footer', parent=base['Normal'], fontName='Helvetica', fontSize=7.5, textColor=SLATE, alignment=2),
    }

    story = []
    hero = Table([[paragraph('VIGNESH KUMAR EKAMBARAM', styles['name'])], [paragraph('<b>TECH LEAD</b><br/>Full-Stack Architecture | Client Delivery | Team Leadership', styles['headline'])], [paragraph('Chennai, Tamil Nadu, India  |  12+ years in software development  |  Open to international and on-site assignments', styles['contact'])]], colWidths=[170 * mm])
    hero.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), NAVY), ('LEFTPADDING', (0, 0), (-1, -1), 8 * mm), ('RIGHTPADDING', (0, 0), (-1, -1), 8 * mm),
        ('TOPPADDING', (0, 0), (-1, 0), 6 * mm), ('BOTTOMPADDING', (0, -1), (-1, -1), 6 * mm), ('BOTTOMPADDING', (0, 0), (-1, 1), 1 * mm),
    ]))
    story.append(hero)
    story.append(Spacer(1, 2 * mm))
    story.append(paragraph('<b>WhatsApp:</b> <link href="https://wa.me/919042818052" color="#0284C7">+91 9042818052</link> | <link href="mailto:vigneshacme@gmail.com" color="#0284C7">vigneshacme@gmail.com</link>', styles['body']))
    story += section('Professional Profile', [paragraph('Tech Lead with 12+ years of experience across full-stack web applications, desktop software, and Android development. Leads a five-member team and coordinates client requirements, sprint planning, releases, and delivery. Combines .NET Core, Angular, React, and AWS experience with machine-learning and AI support initiatives. International experience includes client support in Thailand and a three-month assignment in Japan.', styles['body'])], styles)
    skills = [
        [paragraph('<b>Languages & Frameworks</b><br/>C#, TypeScript, JavaScript, Python, SQL, .NET Core, Web API, EF Core, WCF, WPF, Angular, React, Node.js, Express.js, YARP', styles['skill']), paragraph('<b>Cloud & DevOps</b><br/>AWS EC2, S3, ELB/ALB, CloudSearch, RDS, WAF, Docker, GitLab CI/CD, Firebase, Vercel, IIS, Nginx, Apache, Linux', styles['skill'])],
        [paragraph('<b>Data & Distributed Systems</b><br/>SQL Server, MySQL, SQLite, Oracle, Query Store, Redis, RabbitMQ, AWS SQS, SignalR, WebSockets', styles['skill']), paragraph('<b>AI, ML & Quality</b><br/>Qdrant, RAG, AI Agents, MCP, HOG, YOLO, scikit-learn, DecisionTreeRegressor, Playwright, SOLID, design patterns', styles['skill'])],
    ]
    skill_table = Table(skills, colWidths=[85 * mm, 85 * mm], hAlign='LEFT')
    skill_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PALE), ('GRID', (0, 0), (-1, -1), 0.35, LIGHT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4 * mm), ('RIGHTPADDING', (0, 0), (-1, -1), 4 * mm), ('TOPPADDING', (0, 0), (-1, -1), 3 * mm), ('BOTTOMPADDING', (0, 0), (-1, -1), 3 * mm),
    ]))
    story += section('Technical Skills', [skill_table], styles)

    story += section('Professional Experience', [
        *role('Tech Lead', 'alfaTKG', '2022 - Present', [
            '<b>Projects:</b> Quote, JQMS, GSQ, PTE, Viewer, and Ticket Tracker. <b>Technologies:</b> Angular, React, .NET Core, Node.js, SQL Server, MySQL, AWS, and machine learning.',
            '<b>Team leadership:</b> Lead a five-member engineering team, assign responsibilities, track progress, and review code to maintain delivery quality.',
            '<b>Client and project delivery:</b> Work directly with clients and support teams to gather requirements, plan development, and coordinate delivery. Manage sprint plans, release schedules, and deliverable reviews.',
            '<b>Task management:</b> Develop Ticket Tracker and coordinate issue tracking, task allocation, and team workloads.',
            '<b>On-site client support:</b> Visit client sites in Thailand to support implementation, resolve issues, and keep project delivery aligned with client expectations.',
            '<b>Machine learning:</b> Train decision-tree regression models on historical data to predict manufacturing process times and quotation costs. Collaborate with the AI team to evaluate deep-learning approaches for model improvement.',
            '<b>AI-assisted support:</b> Support the development of application-specific agents and an agent orchestrator for chat support across multiple applications.',
            '<b>Test automation:</b> Use Playwright with MCP-enabled workflows to automate testing, reduce manual testing effort and execution time, and improve test quality.',
        ], styles),
        *role('Senior Full-Stack Developer', 'alfaTKG', '2018 - 2022', [
            '<b>Projects:</b> GPN Scheduler and Inspection. <b>Technologies:</b> Angular, React, .NET Core, Node.js, SQL Server, MySQL, and AWS.',
            '<b>Backend and cloud development:</b> Developed backend APIs and managed AWS EC2, RDS, CloudSearch, Elastic Load Balancing (ELB), and S3 resources.',
            '<b>Application design:</b> Planned Angular components, API controllers, business logic, and SQL table structures to support maintainable application development.',
            '<b>Production support:</b> Investigated and resolved application-server and database issues in production.',
            '<b>International client engagement:</b> Completed a three-month assignment in Japan, coordinated with clients, supported the company booth at the MF-Tokyo manufacturing exhibition, and installed software at three client sites in different locations.',
            '<b>Team coordination and deployment:</b> Coordinated developers and tracked delivery progress. Developed a shared deployment system for use across projects.',
        ], styles),
        *role('Software Development Engineer', 'alfaTKG', 'Aug 2015 - 2018', [
            '<b>alfaDOCK:</b> Developed Angular UI features and contributed to .NET Core API development, SQL Server queries, and database access.',
            '<b>Plugin architecture:</b> Contributed to a design in which the alfaDOCK .NET Core API acted as the master API and other project APIs operated as plugins. Used Observer/subscriber patterns to communicate notifications and actions from the master API to plugins.',
            '<b>Engineering practices:</b> Applied object-oriented programming and software design principles when developing application features.',
            '<b>Socket App:</b> Developed a WPF desktop application with SQLite to configure different socket connections and collect data from multiple sources at client sites.',
        ], styles),
        *role('Software Engineer', 'Sirpi Software Pvt. Ltd.', 'Oct 2013 - Aug 2015', [
            '<b>SPCAD:</b> Implemented small application features, fixed defects, and worked on C++ wrapper classes for integration with .NET applications. Reported progress and issues to a senior developer.',
            '<b>Grocery Delivery App (Java):</b> Developed UI features for customer and delivery-agent Android applications, integrated Google Maps, and resolved UI defects.',
            '<b>Android game development:</b> Implemented functions for updating and tracking object positions and contributed to game-loop logic.',
        ], styles),
    ], styles)

    story += section('Education', [paragraph('<b>B.E. in Electronics and Communication Engineering</b> | 2009 - 2013<br/>Hidusthan College, Coimbatore, Anna University | GPA: 8.4', styles['body'])], styles)
    story.append(Spacer(1, 5 * mm))
    story.append(paragraph('Vignesh Kumar Ekambaram  |  Tech Lead', styles['footer']))
    doc.build(story)
    copyfile(OUTPUT, ROOT / 'public' / OUTPUT.name)
    print(OUTPUT)


if __name__ == '__main__':
    build()
