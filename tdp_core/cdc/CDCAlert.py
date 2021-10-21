
from sqlalchemy import Column, Integer, DateTime, TEXT, Boolean, BLOB, PickleType
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql.schema import ForeignKey
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from marshmallow import EXCLUDE, fields
from sqlalchemy.ext.declarative import declarative_base


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
    # filter_dump = Column(PickleType, nullable=False)
    filter = Column(TEXT, nullable=False)
    enable_mail_notification = Column(Boolean, nullable=False)

    latest_compare_date = Column(DateTime, nullable=True)
    latest_diff = Column(PickleType, nullable=True)
    latest_fetched_data = Column(PickleType, nullable=True)

    confirmation_date = Column(DateTime, nullable=True)  # date of confirmation
    confirmed_data = Column(PickleType, nullable=True)  # your confirmed data
    #security
    creator = Column(TEXT, nullable=False)  # NOQA: N815
    creation_date = Column(DateTime, nullable=False)  # NOQA: N815
    group = Column(TEXT, nullable=False)  # NOQA: N815
    permissions = Column(Integer, nullable=False, default=7700)  # NOQA: N815
    #buddies
    modifier = Column(TEXT)  # NOQA: N815
    modification_date = Column(DateTime)  # NOQA: N815


class CDCAlertSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = CDCAlert
        load_instance = True
        unknown = EXCLUDE


class CDCAlertArgsSchema(CDCAlertSchema):
    class Meta(CDCAlertSchema.Meta):
        load_instance = False
        # TODO: Update to include all read-only fields
        exclude = (
            'id',
            'latest_compare_date',
            'latest_diff',
            'latest_fetched_data',
            'confirmation_date',
            'confirmed_data',
            # Security fields
            'creator',
            'creation_date',
            'modifier',
            'modification_date',
            'permissions',
            'group'
        )

# TODO: Remove and use postgres
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine('sqlite:////:memory:')
# Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
create_session = sessionmaker(engine)
