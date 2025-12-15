# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GedcomApi, '.person' do
  let(:api_url) { 'https://api.gedcom-parser.com' }
  let(:auth_secret) { 'test_secret_xyz' }
  let(:blob_key) { 'test_file_key_123' }
  let(:person_gedid) { 'I001' }

  let(:expected_endpoint) { "#{api_url}/person" }

  before do
    allow(GedcomClient).to receive(:url).and_return(api_url)
    allow(GedcomClient).to receive(:key).and_return(auth_secret)
  end

  context 'when request succeeds' do
    let(:person_response) do
      {
        'name' => 'John Doe',
        'givn' => 'John',
        'surn' => 'Doe',
        'id' => 'I001',
        'gender' => 'M'
      }
    end

    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, id: person_gedid })
        .to_return(
          status: 200,
          headers: { 'Content-Type' => 'application/json' },
          body: person_response.to_json
        )
    end

    it 'makes GET request to correct endpoint with correct parameters' do
      described_class.person(blob_key, person_gedid)

      expect(
        a_request(:get, expected_endpoint)
          .with(query: { file: blob_key, id: person_gedid })
      ).to have_been_made.once
    end

    it 'returns Person object with correct data' do
      result = described_class.person(blob_key, person_gedid)

      expect(result).to be_a(GedcomApi::Person)
      expect(result.name).to eq('John Doe')
      expect(result.givn).to eq('John')
      expect(result.surn).to eq('Doe')
      expect(result.id).to eq('I001')
      expect(result.gender).to eq('M')
    end
  end

  context 'when person has optional fields missing' do
    let(:person_response) do
      {
        'name' => 'Jane Smith',
        'id' => 'I002'
      }
    end

    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, id: person_gedid })
        .to_return(
          status: 200,
          headers: { 'Content-Type' => 'application/json' },
          body: person_response.to_json
        )
    end

    it 'returns Person object with nil for optional fields' do
      result = described_class.person(blob_key, person_gedid)

      expect(result).to be_a(GedcomApi::Person)
      expect(result.name).to eq('Jane Smith')
      expect(result.id).to eq('I002')
      expect(result.givn).to be_nil
      expect(result.surn).to be_nil
      expect(result.gender).to be_nil
    end
  end

  context 'when request fails with 404 not found' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, id: person_gedid })
        .to_return(
          status: 404,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Person not found' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.person(blob_key, person_gedid) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '404 Person not found'
      )
    end
  end

  context 'when request fails with 422 invalid parameters' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, id: person_gedid })
        .to_return(
          status: 422,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Invalid person ID' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.person(blob_key, person_gedid) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '422 Invalid person ID'
      )
    end
  end

  context 'when request fails with 401 unauthorized' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, id: person_gedid })
        .to_return(
          status: 401,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Unauthorized' }.to_json
        )
    end

    it 'raises ClientError with authentication message' do
      expect { described_class.person(blob_key, person_gedid) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '401 Unauthorized'
      )
    end
  end

  context 'when request fails with 5xx error' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, id: person_gedid })
        .to_return(
          status: 503,
          headers: { 'Content-Type' => 'application/json' },
          body: { error: 'Service Unavailable' }.to_json
        )
    end

    it 'raises ClientError' do
      expect { described_class.person(blob_key, person_gedid) }.to raise_error(
        GedcomApi::Transport::ClientError,
        '503 Service Unavailable'
      )
    end
  end

  context 'when network error occurs' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, id: person_gedid })
        .to_raise(Faraday::ConnectionFailed.new('Connection refused'))
    end

    it 'raises Transport Error' do
      expect { described_class.person(blob_key, person_gedid) }.to raise_error(
        GedcomApi::Transport::Error,
        'Connection refused'
      )
    end
  end

  context 'when timeout occurs' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, id: person_gedid })
        .to_raise(Faraday::TimeoutError.new('Request timeout'))
    end

    it 'raises Transport Error on timeout' do
      expect { described_class.person(blob_key, person_gedid) }.to raise_error(
        GedcomApi::Transport::Error,
        'Request timeout'
      )
    end
  end

  context 'when response body is not JSON' do
    before do
      stub_request(:get, expected_endpoint)
        .with(query: { file: blob_key, id: person_gedid })
        .to_return(
          status: 500,
          headers: { 'Content-Type' => 'text/html' },
          body: '<html><body>Internal Server Error</body></html>'
        )
    end

    it 'raises ClientError with response body as message' do
      expect { described_class.person(blob_key, person_gedid) }.to raise_error(
        GedcomApi::Transport::ClientError,
        /500/
      )
    end
  end
end
