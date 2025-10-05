test:
	bun test

test-integration:
	TEST_INTEGRATION=1 bun test

test-watch:
	reflex -r '^src/' -- make test

test-integration-watch:
	reflex -r '^src/' -- make test-integration

serve:
	bun run dev --host
