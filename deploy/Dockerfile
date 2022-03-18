FROM python:3.10-buster

LABEL maintainer="contact@caleydo.org"
WORKDIR /phovea

# install dependencies last step such that everything before can be cached
COPY requirements*.txt docker_packages.txt docker_script*.sh _docker_data* ./
RUN (!(test -s docker_packages.txt) || (apt-get update && \
    (cat docker_packages.txt | xargs apt-get install -y))) && \
    (pip install --no-cache-dir -r requirements.txt)
RUN (!(test -s docker_script.sh) || (bash ./docker_script.sh))


# Start <app> directly
# ENV PYTHON_PATH /phovea/tdp_core:$PYTHON_PATH
# CMD ["uvicorn", "<app>.main:app", "--app-dir", "/phovea/<app>", "--host", "0.0.0.0", "--port", "80"]

# Start tdp_core directly
CMD ["uvicorn", "tdp_core.server.main:app", "--app-dir", "/phovea/tdp_core", "--host", "0.0.0.0", "--port", "80"]

EXPOSE 80