from tdp_core.cdc.filter import Filter
from sqlalchemy import Column, Integer, DateTime, TEXT, Boolean, JSON
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import EXCLUDE, post_load, Schema
from sqlalchemy.ext.declarative import declarative_base

from marshmallow import fields

Base = declarative_base()


class CDCAlert(Base):
    __tablename__ = 'CDCAlert'
    __table_args__ = {
        # TODO: Enable in postgres
        #'schema': 'tdp_core',
        'extend_existing': True
    }

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(TEXT, nullable=False)
    cdc_id = Column(TEXT, nullable=False)
    # TODO: Change to JSONB in postgres
    filter = Column(JSON, nullable=False)
    enable_mail_notification = Column(Boolean, nullable=False)

    latest_compare_date = Column(DateTime, nullable=True)
    latest_diff = Column(JSON, nullable=True)
    latest_fetched_data = Column(JSON, nullable=True)
    compare_columns = Column(JSON, nullable=True)

    confirmation_date = Column(DateTime, nullable=True)  # date of confirmation
    confirmed_data = Column(JSON, nullable=True)  # your confirmed data
    #security
    creator = Column(TEXT, nullable=False)  # NOQA: N815
    creation_date = Column(DateTime, nullable=False)  # NOQA: N815
    group = Column(TEXT, nullable=False)  # NOQA: N815
    permissions = Column(Integer, nullable=False, default=7700)  # NOQA: N815
    #buddies
    modifier = Column(TEXT)  # NOQA: N815
    modification_date = Column(DateTime)  # NOQA: N815

    # TODO: Avoid loading latest_diff, latest_fetch_data, latest_confirmed_data, use flags instead and load individually
    # def has_latest_diff(self):
    #     return self.latest_diff is not None


class CDCAlertSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = CDCAlert
        load_instance = True
        unknown = EXCLUDE


class CDCAlertArgsSchema(Schema):
    id = fields.String()
    name = fields.String()
    enable_mail_notification = fields.Boolean()
    cdc_id = fields.String()
    filter = fields.Nested(Filter, required=True)
    compare = fields.List(fields.String())


# TODO: Remove and use postgres
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine('sqlite:////:memory:')
# Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
create_session = sessionmaker(engine)
