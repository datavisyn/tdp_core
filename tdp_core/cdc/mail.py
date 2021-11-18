from collections import defaultdict
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from smtplib import SMTP
from sqlalchemy import and_, or_

from phovea_server.config import view
from tdp_core.cdc.CDCAlert import create_session, CDCAlert

conf = view("tdp_core").get("mail")


def smtp_server():
  assert type(conf) == dict, "No conf found"
  assert all(k in conf and conf[k] for k in ["host", "port", "username", "password", "sender"]), f"Invalid conf {conf}"
  server = SMTP(host=conf["host"], port=int(conf["port"]))
  server.starttls()
  server.login(user=conf["username"], password=conf["password"])
  return server


def send_mail(receiver: str, subject: str, message: str, server: SMTP):
  if receiver == "admin":  # todo: remove after testing
    receiver = "markus.vogl@datavisyn.io"

  assert "@" in receiver and "." in receiver, "Invalid email"
  msg = MIMEMultipart()  # this allows files/images to be attached
  msg['Subject'] = subject
  msg['From'] = conf.get("sender")
  msg['To'] = receiver
  msg.attach(MIMEText(message, 'html'))
  server.sendmail(from_addr=msg['From'], to_addrs=msg['To'], msg=msg.as_string())


def cdc_mail():
  from tdp_core.cdc.api import app  # resolve import-loop by late-importing
  with app.app_context():
    session = create_session()
    empty_old = or_(CDCAlert.latest_email_notification.is_(None),
                    CDCAlert.latest_email_notification < CDCAlert.latest_compare_date)
    alerts = session.query(CDCAlert).filter(and_(CDCAlert.enable_mail_notification.is_(True), empty_old)).all()
    if not alerts:
      return
    print(f"Sending mails for {len(alerts)}...")

    srv = smtp_server()  # if we fail here, we just exit
    # group alerts by sender, so every user only gets 1 mail
    user_alert = defaultdict(list)
    for alert in alerts:
      user_alert[alert.creator].append(alert)

    for user, alerts in user_alert.items():
      msg = f"New alerts for {' '.join(a.name for a in alerts)}"  # TOOD: better message
      send_mail(receiver=user, subject=f"You have {len(alerts)} new CDC alerts", message=msg, server=srv)
      for a in alerts:
        a.latest_email_notification = datetime.utcnow()
    srv.close()
    session.commit()
