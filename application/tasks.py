from application.workers import celery
from datetime import datetime
from flask import render_template,current_app as app
from .models import db, User
from celery.schedules import crontab
from .models import Shows,Venue
import pandas as pd
import os
import requests
from jinja2 import Template
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from celery.schedules import crontab
from weasyprint import HTML
from email import encoders
from email.mime.base import MIMEBase

# SMPTP_SERVER_HOST = "localhost"
# SMPTP_SERVER_PORT = 1025
# SENDER_ADDRESS = "noreply.ticketshow@gmail.com"
# SENDER_PASSWORD = ""

# @celery.on_after_finalize.connect
# def setup_periodic_tasks(sender, **kwargs):
#     sender.add_periodic_task(crontab(hour=17, minute=30, day_of_week='*'), sendDailyReminder.s(), name='Send reminder everyday at 5:30PM')
#     sender.add_periodic_task(crontab(day_of_month='1', hour=7, minute=30), sendMonthlyReport.s(), name='Send monthly report every month at 7:30AM')

def send_email (message):
    s = smtplib.SMTP(host=SMPTP_SERVER_HOST, port=SMPTP_SERVER_PORT)
    s.login(SENDER_ADDRESS, SENDER_PASSWORD)
    s.send_message (message)
    s.quit()
    return True

@celery.task()
def sendDailyReminder():
    users = User.query.all()
    current_time = datetime.now()
    d1 = datetime(current_time.year,current_time.month,current_time.day)
    users = User.query.all()
    response = requests.get('http://127.0.0.1:5050/userDashboardAPI')
    data = response.json()
    current_dir = os.path.abspath(os.path.dirname(__file__))
    template_file_path = os.path.join(current_dir, 'templates', 'dailyReminderMail.html')   
    with open(template_file_path) as file:
        template = Template(file.read())
        message = template.render(data=data)

    for user in users:
        lastBooking = user.lastBooked.split("-")
        d2 = datetime(int(lastBooking[0]),int(lastBooking[1]),int(lastBooking[2]))

        if not user.admin and d1 > d2:
            msg = MIMEMultipart()
            msg["From"] = SENDER_ADDRESS
            msg[ "To"] = user.email
            msg["Subject"]= "Daily Reminder"

            msg.attach(MIMEText(message, "html"))

            send_email(msg)

def generate_pdf_report(html_content):
    current_dir = os.path.abspath(os.path.dirname(__file__))
    pdf_file_path = os.path.join(current_dir, 'admin_dashboard_report.pdf')   

    pdf_bytes = HTML(string=html_content).write_pdf()
    with open(pdf_file_path, 'wb') as pdf_file:
        pdf_file.write(pdf_bytes)


@celery.task()
def sendMonthlyReport():
    response = requests.get('http://127.0.0.1:5050/userDashboardAPI')
    data = response.json()
    current_dir = os.path.abspath(os.path.dirname(__file__))
    template_file_path = os.path.join(current_dir, 'templates', 'adminReport.html')

    with open(template_file_path) as file:
        template = Template(file.read())
        message = template.render(data=data)

    html_content = render_template("adminReport.html",data=data)
    generate_pdf_report(html_content)

    pdf_file_path = os.path.join(current_dir, 'admin_dashboard_report.pdf')
    users = User.query.all()

    for user in users:
        if user.admin:
            msg = MIMEMultipart()
            msg["From"] = SENDER_ADDRESS
            msg[ "To"] = user.email
            msg["Subject"]= "Monthly Report"

            msg.attach(MIMEText(message, "html"))

            with open(pdf_file_path, 'rb') as pdf_file:
                attachment = MIMEBase('application', 'pdf')
                attachment.set_payload(pdf_file.read())
                encoders.encode_base64(attachment)
                attachment.add_header('Content-Disposition', f'attachment; filename="admin_dashboard_report.pdf"')
                msg.attach(attachment)

            send_email(msg)

    os.remove(pdf_file_path)
    

@celery.task()
def generateReport(venue_id):
    csv_data = {'Shows':[], 'Tickets Booked': [], 'User Rating': [], 'Tickets Left':[], 'Tags':[], 'Tickets Price':[]}
    
    shows = Shows.query.filter_by(venueId=venue_id).all()
    for show in shows:
        csv_data['Shows'].append(show.nameOfShow)
        csv_data['Tickets Booked'].append(show.bookedSeats)
        csv_data['Tickets Price'].append(show.ticketPrice)
        csv_data['Tickets Left'].append(show.venue.totalSeats - show.bookedSeats)
        csv_data['Tags'].append(show.tags)
        venueName = show.venue.name

        str = show.ratings.split(",")
        avgRating = 0
        count = 0
        for i in range(10):
            avgRating += (i+1)*int(str[i])
            count += int(str[i])
            
        if count == 0:
            csv_data['User Rating'].append(0.0)
        else:
            csv_data['User Rating'].append(avgRating/count)

    df = pd.DataFrame(csv_data)
    df.to_csv(f'{venueName} Report.csv', index=False)
    
