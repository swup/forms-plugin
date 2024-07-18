import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

/**
 * Mock server
 */

const server = setupServer(
	http.get('https://example.net/form', ({ params }) => {
		return HttpResponse.text('', { headers: { 'Content-Type': 'text/html' } });
	})
);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());
