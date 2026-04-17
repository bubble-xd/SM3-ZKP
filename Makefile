.PHONY: backend-install frontend-install backend-dev frontend-dev test setup-circuit prove-sample benchmark

backend-install:
	python3 -m pip install -r backend/requirements.txt

frontend-install:
	cd frontend && npm install

backend-dev:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend-dev:
	cd frontend && npm run dev

test:
	pytest backend/tests -q

setup-circuit:
	python3 scripts/setup_circuit.py

prove-sample:
	python3 scripts/prove.py --message abc

benchmark:
	python3 scripts/benchmark.py

