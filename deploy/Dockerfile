FROM python:3.10-buster

LABEL maintainer="contact@datavisyn.io"
WORKDIR /phovea

# install dependencies last step such that everything before can be cached
COPY requirements*.txt .
RUN apt-get update && pip install --no-cache-dir -r requirements.txt

CMD ["uvicorn", "tdp_core.server.main:app", "--host", "0.0.0.0", "--port", "9000"]

EXPOSE 9000