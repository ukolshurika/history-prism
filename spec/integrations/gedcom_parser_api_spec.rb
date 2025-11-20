# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GedcomParserApi, '.get_events' do
  let(:api_url) { 'https://api.gedcom-parser.com' }
  let(:auth_secret) { 'test_secret_xyz' }
  let(:file_id) { 123 }
  let(:user_id) { 456 }

  let(:file_blob) do
    instance_double(
      ActiveStorage::Blob,
      id: file_id,
      key: 'test_file_key_123',
      filename: 'family_tree.ged',
      byte_size: 1024
    )
  end

  let(:request_body) { { file: file_blob.key, user_id: user_id } }

  let(:expected_endpoint) { "#{api_url}/events" }
  let(:expected_request_body) { request_body.to_json }
  let(:expected_signature) { OpenSSL::HMAC.hexdigest('SHA256', auth_secret, expected_request_body) }

  before do
    allow(GedcomClient).to receive(:url).and_return(api_url)
    allow(GedcomClient).to receive(:key).and_return(auth_secret)
    allow(ActiveStorage::Blob).to receive(:find).with(file_id).and_return(file_blob)
  end

  context 'when request succeeds' do
    let(:correct_request) do
      headers = { 'Content-Type' => 'application/json', 'X-Signature' => expected_signature }
      body = expected_request_body
      a_request(:post, expected_endpoint).with(headers: headers, body: body)
    end

    before do
      stub_request(:post, expected_endpoint).with(
        body: expected_request_body,
        headers: {
          'X-Signature' => expected_signature,
          'Content-Type' => 'application/json'
        }
      ).to_return(
        status: 200,
        headers: {
          'Content-Type' => 'application/json'
        },
        body: { status: 'Ok' }.to_json
      )
    end

    it 'makes POST request to correct endpoint' do
      described_class.get_events(file_blob.key, user_id)

      expect(correct_request).to have_been_made.once
    end
  end

  context 'when request returns fail status' do
    before do
      stub_request(:post, expected_endpoint).to_return(
        status: 422,
        headers: {
          'Content-Type' => 'application/json'
        },
        body: { status: 'fail', error: 'Invalid GEDCOM file format' }.to_json
      )
    end

    it 'raises ClientError with fail status' do
      expect { described_class.get_events(file_blob.key, user_id) }.to raise_error(
        GedcomParserApi::Transport::ClientError,
        /422/
      )
    end
  end

  context 'when request fails with 4xx error' do
    before do
      stub_request(:post, expected_endpoint).to_return(
        status: 422,
        headers: {
          'Content-Type' => 'application/json'
        },
        body: { error: 'Invalid GEDCOM file format' }.to_json
      )
    end

    it 'raises ClientError' do
      expect { described_class.get_events(file_blob.key, user_id) }.to raise_error(
        GedcomParserApi::Transport::ClientError,
        '422 Invalid GEDCOM file format'
      )
    end
  end

  context 'when request fails with 401 unauthorized' do
    before do
      stub_request(:post, expected_endpoint).to_return(
        status: 401,
        headers: {
          'Content-Type' => 'application/json'
        },
        body: { error: 'Unauthorized' }.to_json
      )
    end

    it 'raises ClientError with authentication message' do
      expect { described_class.get_events(file_blob.key, user_id) }.to raise_error(
        GedcomParserApi::Transport::ClientError,
        '401 Unauthorized'
      )
    end
  end

  context 'when request fails with 5xx error' do
    before do
      stub_request(:post, expected_endpoint).to_return(
        status: 503,
        headers: {
          'Content-Type' => 'application/json'
        },
        body: { error: 'Service Unavailable' }.to_json
      )
    end

    it 'raises ClientError' do
      expect { described_class.get_events(file_blob.key, user_id) }.to raise_error(
        GedcomParserApi::Transport::ClientError
      )
    end
  end

  context 'when network error occurs' do
    before do
      stub_request(:post, expected_endpoint).to_raise(Faraday::ConnectionFailed.new('Connection refused'))
    end

    it 'raises Transport Error' do
      expect { described_class.get_events(file_blob.key, user_id) }.to raise_error(
        GedcomParserApi::Transport::Error,
        'Connection refused'
      )
    end
  end

  context 'when timeout occurs' do
    before { stub_request(:post, expected_endpoint).to_raise(Faraday::TimeoutError.new('Request timeout')) }

    it 'raises Transport Error on timeout' do
      expect { described_class.get_events(file_blob.key, user_id) }.to raise_error(
        GedcomParserApi::Transport::Error,
        'Request timeout'
      )
    end
  end

  context 'when response body is not JSON' do
    before do
      stub_request(:post, expected_endpoint).to_return(
        status: 500,
        headers: {
          'Content-Type' => 'text/html'
        },
        body: '<html><body>Internal Server Error</body></html>'
      )
    end

    it 'raises ClientError with response body as message' do
      expect { described_class.get_events(file_blob.key, user_id) }.to raise_error(
        GedcomParserApi::Transport::ClientError,
        /500/
      )
    end
  end
end
