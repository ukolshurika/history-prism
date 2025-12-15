# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GedcomApi, '.timeline' do
  let(:api_url) { 'https://api.gedcom-parser.com' }
  let(:auth_secret) { 'test_secret_xyz' }
  let(:blob_key) { 'test_file_key_123' }
  let(:person_id) { 'I001' }

  let(:expected_endpoint) { "#{api_url}/timeline" }
  let(:query_params) { "file=#{blob_key}&gedcom_id=#{person_id}" }
  let(:expected_signature) { OpenSSL::HMAC.hexdigest('SHA256', auth_secret, "/timeline?#{query_params}") }

  before do
    allow(GedcomClient).to receive(:url).and_return(api_url)
    allow(GedcomClient).to receive(:key).and_return(auth_secret)
  end

  context 'when request succeeds' do
    let(:timeline_response) do
      {
        'timeline' => [
          {
            'name' => 'Birth',
            'date' => '1 JAN 1900',
            'description' => 'Born in London',
            'place' => 'London, England',
            'notes' => 'Birth certificate available'
          },
          {
            'name' => 'Marriage',
            'date' => '15 JUN 1925',
            'description' => 'Married to Jane Doe',
            'place' => 'Westminster, London',
            'notes' => 'Marriage certificate ref: 123'
          },
          {
            'name' => 'Death',
            'date' => '31 DEC 1980',
            'description' => 'Died peacefully',
            'place' => 'London, England',
            'notes' => ''
          }
        ]
      }
    end

    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_return(
          status: 200,
          headers: { 'Content-Type' => 'application/json' },
          body: timeline_response.to_json
        )
    end

    it 'makes GET request to correct endpoint with correct parameters' do
      described_class.timeline(blob_key, person_id)

      expect(
        a_request(:get, expected_endpoint)
          .with(query: { file: blob_key, gedcom_id: person_id })
      ).to have_been_made.once
    end

    it 'returns array of Event objects' do
      result = described_class.timeline(blob_key, person_id)

      expect(result).to be_an(Array)
      expect(result.size).to eq(3)
      expect(result).to all(be_a(GedcomApi::Event))
    end

    it 'correctly parses event data' do
      result = described_class.timeline(blob_key, person_id)

      expect(result[0].name).to eq('Birth')
      expect(result[0].date).to eq('1 JAN 1900')
      expect(result[0].description).to eq('Born in London')
      expect(result[0].place).to eq('London, England')
      expect(result[0].notes).to eq('Birth certificate available')

      expect(result[1].name).to eq('Marriage')
      expect(result[1].date).to eq('15 JUN 1925')

      expect(result[2].name).to eq('Death')
      expect(result[2].date).to eq('31 DEC 1980')
    end
  end

  context 'when timeline is empty' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_return(
          status: 200,
          headers: { 'Content-Type' => 'application/json' },
          body: { 'timeline' => [] }.to_json
        )
    end

    it 'returns empty array' do
      result = described_class.timeline(blob_key, person_id)

      expect(result).to eq([])
    end
  end

  context 'when request fails with 404 not found' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_return(
          status: 404,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Person not found' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.timeline(blob_key, person_id) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '404 Person not found'
      )
    end
  end

  context 'when request fails with 422 invalid parameters' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_return(
          status: 422,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Invalid GEDCOM file' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.timeline(blob_key, person_id) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '422 Invalid GEDCOM file'
      )
    end
  end

  context 'when request fails with 401 unauthorized' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_return(
          status: 401,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Unauthorized' }.to_json
        )
    end

    it 'raises ClientError with authentication message' do
      expect { described_class.timeline(blob_key, person_id) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '401 Unauthorized'
      )
    end
  end

  context 'when request fails with 5xx error' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_return(
          status: 503,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Service Unavailable' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.timeline(blob_key, person_id) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '503 Service Unavailable'
      )
    end
  end

  context 'when network error occurs' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_raise(Faraday::ConnectionFailed.new('Connection refused'))
    end

    it 'raises Transport Error' do
      expect { described_class.timeline(blob_key, person_id) }.to raise_error(
        GedcomApi::Transport::Error,
        'Connection refused'
      )
    end
  end

  context 'when timeout occurs' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_raise(Faraday::TimeoutError.new('Request timeout'))
    end

    it 'raises Transport Error on timeout' do
      expect { described_class.timeline(blob_key, person_id) }.to raise_error(
        GedcomApi::Transport::Error,
        'Request timeout'
      )
    end
  end

  context 'when response body is not JSON' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_return(
          status: 500,
          headers: { 'Content-Type' => 'text/html' },
          body: '<html><body>Internal Server Error</body></html>'
        )
    end

    it 'raises ClientError with response body as message' do
      expect { described_class.timeline(blob_key, person_id) }.to raise_error(
        GedcomApi::Transport::ClientError,
        /500/
      )
    end
  end

  context 'when response has invalid structure' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, gedcom_id: person_id })
        .to_return(
          status: 200,
          headers: { 'Content-Type' => 'application/json' },
          body: { events: [] }.to_json
        )
    end

    it 'raises error when timeline key is missing' do
      expect { described_class.timeline(blob_key, person_id) }.to raise_error(
        NoMethodError
      )
    end
  end
end
