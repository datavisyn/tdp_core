from marshmallow import EXCLUDE, Schema
from marshmallow import fields
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from sqlalchemy import Column, Integer, DateTime, TEXT, Boolean, JSON
# TODO: Remove and use postgres
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from typing import List, Dict

from tdp_core.cdc.filter import Filter
from . import api

Base = declarative_base()


class CDCAlert(Base):
    __tablename__ = 'CDCAlert'
    __table_args__ = {
        # TODO: Enable in postgres
        # 'schema': 'tdp_core',
        'extend_existing': True
    }

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(TEXT, nullable=False)
    cdc_id = Column(TEXT, nullable=False)
    filter = Column(JSON, nullable=False)

    enable_mail_notification = Column(Boolean, nullable=False)
    latest_email_notification = Column(DateTime, nullable=True)

    latest_compare_date = Column(DateTime, nullable=True)
    latest_diff = Column(JSON, nullable=True)
    latest_fetched_data = Column(JSON, nullable=True)
    compare_columns = Column(JSON, nullable=True)

    latest_error_date = Column(DateTime, nullable=True)
    latest_error = Column(JSON, nullable=True)

    confirmation_date = Column(DateTime, nullable=True)  # date of confirmation
    confirmed_data = Column(JSON, nullable=True)  # your confirmed data
    # security
    creator = Column(TEXT, nullable=False)  # NOQA: N815
    creation_date = Column(DateTime, nullable=False)  # NOQA: N815
    group = Column(TEXT, nullable=False)  # NOQA: N815
    permissions = Column(Integer, nullable=False, default=7700)  # NOQA: N815
    # buddies
    modifier = Column(TEXT)  # NOQA: N815
    modification_date = Column(DateTime)  # NOQA: N815

    def apply_filter(self, data: List[Dict]):
      """ Re-computes the filter on every call, by recursive marshmallow loading """
      filt = Filter().load(self.filter)
      return list(filter(filt, data))


class CDCAlertSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = CDCAlert
        load_instance = True
        unknown = EXCLUDE


class CDCAlertArgsSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    id = fields.Integer()
    name = fields.String()
    enable_mail_notification = fields.Boolean()
    cdc_id = fields.String(validate=lambda name: name in api.cdcs.keys())
    filter = fields.Dict(required=True, validate=Filter().load)
    compare_columns = fields.List(fields.String())


class RunAllAlertsSchema(Schema):
  success = fields.List(fields.Integer(), required=True)
  error = fields.List(fields.Integer(), required=True)


engine = create_engine('sqlite:////:memory:')
# Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
create_session = sessionmaker(engine)
