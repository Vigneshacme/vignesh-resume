from pathlib import Path

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
    return KeepTogether([heading, *bullets(points, styles), Spacer(1, 2 * mm)])


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
    hero = Table([[paragraph('VIGNESH KUMAR EKAMBARAM', styles['name'])], [paragraph('TECH LEAD | FULL-STACK SOLUTION ARCHITECT | CLIENT DELIVERY LEAD', styles['headline'])], [paragraph('Chennai, Tamil Nadu, India  |  12+ years in software development  |  Open to international and on-site assignments', styles['contact'])]], colWidths=[170 * mm])
    hero.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), NAVY), ('LEFTPADDING', (0, 0), (-1, -1), 8 * mm), ('RIGHTPADDING', (0, 0), (-1, -1), 8 * mm),
        ('TOPPADDING', (0, 0), (-1, 0), 6 * mm), ('BOTTOMPADDING', (0, -1), (-1, -1), 6 * mm), ('BOTTOMPADDING', (0, 0), (-1, 1), 1 * mm),
    ]))
    story.append(hero)
    story += section('Professional Profile', [paragraph('Tech Lead and Full-Stack Solution Architect with 12+ years of experience delivering distributed, high-performance enterprise software. Leads a five-member engineering team, manages client priorities and delivery coordination, and combines hands-on expertise in .NET, Angular, SQL Server, AWS, automation, machine learning, and AI/RAG initiatives. Has supported client engagements through multiple on-site visits to Thailand and a client visit to Japan.', styles['body'])], styles)
    story += section('Leadership & Delivery Strengths', bullets([
        '<b>Team leadership:</b> Lead a five-member engineering team; plan work, unblock delivery, coordinate stakeholders, and manage client requests.',
        '<b>International client support:</b> Supported client visits and delivery activities in Thailand and Japan.',
        '<b>Quality engineering:</b> Improved browser-level regression coverage using Playwright automation and MCP-enabled testing workflows.',
        '<b>Cloud delivery:</b> Experience with AWS EC2, S3, ELB/load balancing, CloudSearch, WAF, and RDS for SQL Server and MySQL.'
    ], styles), styles)
    story += section('Professional Experience', [
        role('Tech Lead', 'alfaTKG', '2022 - Present', [
            'Lead the engineering delivery of JQMS, PTE, and AlfaDock using .NET, Angular, Node.js, and SQL Server.',
            'Manage a five-member team, prioritize client requirements, coordinate delivery, and provide direct client support.',
            'Designed asynchronous processing with RabbitMQ, AWS SQS, and .NET worker services; used SignalR/WebSockets for live feedback.',
            'Optimized high-concurrency SQL Server workloads through Query Store analysis, execution plans, locking analysis, and indexing.',
            'Architected AWS deployments and automated GitLab CI/CD pipelines for multi-tenant IIS environments.'
        ], styles),
        role('Senior Software Engineer', 'alfaTKG', '2018 - 2022', [
            'Built machine-learning workflows for sheet-metal quotation and machine-cycle-time prediction.',
            'Applied HOG feature extraction, YOLO-based visual detection, and regression approaches including DecisionTreeRegressor to manufacturing data.',
            'Designed modular quotation engines for laser cutting, punching, bending, welding, cost estimation, and BOM generation.',
            'Developed core architecture for AlfaDock and PTE, and mentored engineers on testing and design practices.'
        ], styles),
        role('Software Development Engineer', 'alfaTKG', '2015 - 2018', [
            'Developed .NET and SQL Server applications, REST APIs, optimized database access, and provided production incident support.'
        ], styles),
        role('Software Engineer', 'Sirpi', '2013 - 2015', [
            'Built backend APIs and relational database structures with C# and SQL Server across the full software-development lifecycle.'
        ], styles),
    ], styles)

    story += section('Selected Engineering Highlights', [
        paragraph('<b>Manufacturing quotation intelligence.</b> Automated sheet-metal quotation workflows with CAD-driven inputs, nesting calculations, laser-cutting paths, bending operations, and machine-runtime estimation.', styles['body']), Spacer(1, 2 * mm),
        paragraph('<b>AI agents and RAG.</b> Designed specialized quotation, production scheduling, and machine-data agents coordinated through an orchestrator using Qdrant retrieval and LLM reasoning.', styles['body']), Spacer(1, 2 * mm),
        paragraph('<b>Resilient enterprise systems.</b> Implemented YARP API gateway patterns, JWT authentication, Redis caching, rate limiting, and decoupled worker-based processing.', styles['body']),
    ], styles)

    skills = [
        [paragraph('<b>Languages & Frameworks</b><br/>C#, TypeScript, JavaScript, SQL, ASP.NET Core, Web API, EF Core, Angular, Node.js, Express.js, YARP', styles['skill']), paragraph('<b>Cloud & DevOps</b><br/>AWS EC2, S3, ELB/ALB, CloudSearch, RDS, WAF, Docker, GitLab CI/CD, Firebase, Vercel, IIS, Linux', styles['skill'])],
        [paragraph('<b>Data & Distributed Systems</b><br/>SQL Server, MySQL, Oracle, Query Store, Redis, RabbitMQ, AWS SQS, SignalR, WebSockets', styles['skill']), paragraph('<b>AI, ML & Quality</b><br/>Qdrant, RAG, AI Agents, MCP, HOG, YOLO, DecisionTreeRegressor, Playwright automation', styles['skill'])],
    ]
    skill_table = Table(skills, colWidths=[85 * mm, 85 * mm], hAlign='LEFT')
    skill_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PALE), ('GRID', (0, 0), (-1, -1), 0.35, LIGHT), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4 * mm), ('RIGHTPADDING', (0, 0), (-1, -1), 4 * mm), ('TOPPADDING', (0, 0), (-1, -1), 3 * mm), ('BOTTOMPADDING', (0, 0), (-1, -1), 3 * mm),
    ]))
    story += section('Technical Skills', [skill_table], styles)
    story.append(Spacer(1, 5 * mm))
    story.append(paragraph('Vignesh Kumar Ekambaram  |  Tech Lead & Full-Stack Solution Architect', styles['footer']))
    doc.build(story)
    print(OUTPUT)


if __name__ == '__main__':
    build()
