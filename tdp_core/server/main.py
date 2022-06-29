from fastapi import FastAPI

from .visyn_server import create_visyn_server

app = FastAPI()  # needed for pycharm to detect this main
app = create_visyn_server()
