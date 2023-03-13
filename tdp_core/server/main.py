from fastapi import FastAPI
from visyn_core.server.visyn_server import create_visyn_server

app: FastAPI = create_visyn_server()
