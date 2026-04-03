# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BookApi, '.process' do
  let(:api_url) { 'http://book-events-parser:8001' }
  let(:auth_secret) { 'book_secret_key' }
  let(:blob_key) { 'test_pdf_key_123' }
  let(:book_id) { 42 }
  let(:callback_url) { 'http://example.com/books/42/events' }

  let(:expected_endpoint) { "#{api_url}/book" }

  before do
    allow(BookClient).to receive(:url).and_return(api_url)
    allow(BookClient).to receive(:key).and_return(auth_secret)
  end

  context 'when request succeeds' do
    let(:success_response) do
      {
        'success' => true,
        'message' => 'Processing started'
      }
    end

    before do
      stub_request(:post, expected_endpoint)
        .with(
          body: {
            blob_key: blob_key,
            book_id: book_id,
            callback_url: callback_url,
            language: 'ru'
          }.to_json
        )
        .to_return(
          status: 200,
          headers: { 'Content-Type' => 'application/json' },
          body: success_response.to_json
        )
    end

    it 'makes POST request to correct endpoint with correct parameters' do
      described_class.process(blob_key, book_id, callback_url)

      expect(
        a_request(:post, expected_endpoint)
          .with(
            body: {
              blob_key: blob_key,
              book_id: book_id,
              callback_url: callback_url,
              language: 'ru'
            }.to_json
          )
      ).to have_been_made.once
    end

    it 'returns response body' do
      result = described_class.process(blob_key, book_id, callback_url)

      expect(result).to eq(success_response)
      expect(result['success']).to be true
    end

    it 'includes HMAC signature in request headers' do
      described_class.process(blob_key, book_id, callback_url)

      expect(
        a_request(:post, expected_endpoint)
          .with(headers: { 'X-Signature' => /^[a-f0-9]{64}$/ })
      ).to have_been_made.once
    end
  end

  context 'when request fails with 404 not found' do
    before do
      stub_request(:post, expected_endpoint)
        .to_return(
          status: 404,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Endpoint not found' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.process(blob_key, book_id, callback_url) }.to raise_error(
        BookApi::Transport::ClientError,
        '404 Endpoint not found'
      )
    end
  end

  context 'when request fails with 422 invalid file' do
    before do
      stub_request(:post, expected_endpoint)
        .to_return(
          status: 422,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Invalid PDF file' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.process(blob_key, book_id, callback_url) }.to raise_error(
        BookApi::Transport::ClientError,
        '422 Invalid PDF file'
      )
    end
  end

  context 'when request fails with 401 unauthorized' do
    before do
      stub_request(:post, expected_endpoint)
        .to_return(
          status: 401,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Unauthorized' }.to_json
        )
    end

    it 'raises ClientError with authentication message' do
      expect { described_class.process(blob_key, book_id, callback_url) }.to raise_error(
        BookApi::Transport::ClientError,
        '401 Unauthorized'
      )
    end
  end

  context 'when request fails with 5xx error' do
    before do
      stub_request(:post, expected_endpoint)
        .to_return(
          status: 503,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Service Unavailable' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.process(blob_key, book_id, callback_url) }.to raise_error(
        BookApi::Transport::ClientError,
        '503 Service Unavailable'
      )
    end
  end

  context 'when network error occurs' do
    before do
      stub_request(:post, expected_endpoint)
        .to_raise(Faraday::ConnectionFailed.new('Connection refused'))
    end

    it 'raises Transport Error' do
      expect { described_class.process(blob_key, book_id, callback_url) }.to raise_error(
        BookApi::Transport::Error,
        'Connection refused'
      )
    end
  end

  context 'when timeout occurs' do
    before do
      stub_request(:post, expected_endpoint)
        .to_raise(Faraday::TimeoutError.new('Request timeout'))
    end

    it 'raises Transport Error on timeout' do
      expect { described_class.process(blob_key, book_id, callback_url) }.to raise_error(
        BookApi::Transport::Error,
        'Request timeout'
      )
    end
  end

  context 'when response body is not JSON' do
    before do
      stub_request(:post, expected_endpoint)
        .to_return(
          status: 500,
          headers: { 'Content-Type' => 'text/html' },
          body: '<html><body>Internal Server Error</body></html>'
        )
    end

    it 'raises ClientError with response body as message' do
      expect { described_class.process(blob_key, book_id, callback_url) }.to raise_error(
        BookApi::Transport::ClientError,
        /500/
      )
    end
  end
end
