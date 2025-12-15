# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GedcomApi, '.people' do
  let(:api_url) { 'https://api.gedcom-parser.com' }
  let(:auth_secret) { 'test_secret_xyz' }
  let(:blob_key) { 'test_file_key_123' }

  let(:expected_endpoint) { "#{api_url}/persons" }

  before do
    allow(GedcomClient).to receive(:url).and_return(api_url)
    allow(GedcomClient).to receive(:key).and_return(auth_secret)
  end

  context 'when request succeeds' do
    let(:people_response) do
      {
        'persons' => ['I001', 'I002', 'I003']
      }
    end

    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key })
        .to_return(
          status: 200,
          headers: { 'Content-Type' => 'application/json' },
          body: people_response.to_json
        )
    end

    it 'makes GET request to correct endpoint with correct parameters' do
      described_class.people(blob_key)

      expect(
        a_request(:get, expected_endpoint)
          .with(query: { file: blob_key })
      ).to have_been_made.once
    end

    it 'returns response body with persons list' do
      result = described_class.people(blob_key)

      expect(result).to eq(people_response)
      expect(result['persons']).to be_an(Array)
      expect(result['persons'].size).to eq(3)
    end
  end

  context 'when persons list is empty' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key })
        .to_return(
          status: 200,
          headers: { 'Content-Type' => 'application/json' },
          body: { 'persons' => [] }.to_json
        )
    end

    it 'returns empty persons array' do
      result = described_class.people(blob_key)

      expect(result['persons']).to eq([])
    end
  end

  context 'when request fails with 404 not found' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key })
        .to_return(
          status: 404,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'File not found' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.people(blob_key) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '404 File not found'
      )
    end
  end

  context 'when request fails with 422 invalid file' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key })
        .to_return(
          status: 422,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Invalid GEDCOM file' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.people(blob_key) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '422 Invalid GEDCOM file'
      )
    end
  end

  context 'when request fails with 401 unauthorized' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key })
        .to_return(
          status: 401,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Unauthorized' }.to_json
        )
    end

    it 'raises ClientError with authentication message' do
      expect { described_class.people(blob_key) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '401 Unauthorized'
      )
    end
  end

  context 'when request fails with 5xx error' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key })
        .to_return(
          status: 503,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Service Unavailable' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.people(blob_key) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '503 Service Unavailable'
      )
    end
  end

  context 'when network error occurs' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key })
        .to_raise(Faraday::ConnectionFailed.new('Connection refused'))
    end

    it 'raises Transport Error' do
      expect { described_class.people(blob_key) }.to raise_error(
        GedcomApi::Transport::Error,
        'Connection refused'
      )
    end
  end

  context 'when timeout occurs' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key })
        .to_raise(Faraday::TimeoutError.new('Request timeout'))
    end

    it 'raises Transport Error on timeout' do
      expect { described_class.people(blob_key) }.to raise_error(
        GedcomApi::Transport::Error,
        'Request timeout'
      )
    end
  end

  context 'when response body is not JSON' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key })
        .to_return(
          status: 500,
          headers: { 'Content-Type' => 'text/html' },
          body: '<html><body>Internal Server Error</body></html>'
        )
    end

    it 'raises ClientError with response body as message' do
      expect { described_class.people(blob_key) }.to raise_error(
        GedcomApi::Transport::ClientError,
        /500/
      )
    end
  end
end
