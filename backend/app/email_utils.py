import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Template
from dotenv import load_dotenv

load_dotenv()

EMAIL_SENDER = os.getenv('EMAIL_SENDER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 465))


def send_template_email(to_email: str, subject: str, template_name: str, context: dict):
    """
    Send an email using any HTML template in email_templates folder.
    :param to_email: Recipient email address
    :param subject: Email subject
    :param template_name: HTML template filename (e.g. 'welcome.html')
    :param context: Dict of variables to render in template
    """
    template_path = os.path.join(os.path.dirname(__file__), 'email_templates', template_name)
    template_path = os.path.abspath(template_path)
    with open(template_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    template = Template(html_content)
    rendered_html = template.render(**context)

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = EMAIL_SENDER
    msg['To'] = to_email
    part = MIMEText(rendered_html, 'html')
    msg.attach(part)

    with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT) as server:
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_SENDER, to_email, msg.as_string())

# For backward compatibility, keep OTP function
def send_otp_email(to_email: str, name: str, otp: str):
    send_template_email(
        to_email=to_email,
        subject='Your OTP Code for YatraOne',
        template_name='otp_email.html',
        context={'name': name, 'otp': otp}
    )
    def send_otp_email(to_email: str, name: str, otp: str, purpose: str = "register"):
        if purpose == "register":
            subject = 'Your OTP Code for YatraOne Registration'
            template_name = 'otp_email.html'
        elif purpose == "forgot_password":
            subject = 'Reset Your YatraOne Password'
            template_name = 'otp_email_forgot.html'  # You need to create this template
        else:
            subject = 'Your OTP Code for YatraOne'
            template_name = 'otp_email.html'
        send_template_email(
            to_email=to_email,
            subject=subject,
            template_name=template_name,
            context={'name': name, 'otp': otp}
        )
