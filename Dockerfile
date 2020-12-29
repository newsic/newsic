# based on https://www.docker.com/blog/containerized-python-development-part-1/
FROM python:slim AS builder
COPY requirements.txt .
COPY requirements-env.txt .
COPY requirements-performance.txt .

RUN pip install --user -r requirements.txt
RUN pip install --user -r requirements-env.txt
RUN pip install --user -r requirements-performance.txt
RUN pip install --user gunicorn

FROM python:slim
WORKDIR /newsic

COPY --from=builder /root/.local /root/.local
COPY . /newsic

ENV PATH=/root/.local/bin:$PATH

EXPOSE 80
CMD ["gunicorn", "-b", "0.0.0.0:80", "deployment:app"]