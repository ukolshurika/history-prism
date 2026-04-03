# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SignatureValidation, type: :controller do
  controller(ActionController::API) do
    include SignatureValidation

    def create
      render json: { success: true }
    end
  end

  let(:callback_secret) { 'test_callback_secret' }
  let(:request_body) { { data: 'test' }.to_json }

  before do
    routes.draw { post 'create' => 'anonymous#create' }
    allow(BookClient).to receive(:callback_secret).and_return(callback_secret)
  end

  def generate_signature(body)
    OpenSSL::HMAC.hexdigest('SHA256', callback_secret, body)
  end

  describe '#validate_signature!' do
    context 'with valid signature' do
      it 'allows the request to proceed' do
        signature = generate_signature(request_body)

        request.headers['X-Signature'] = signature
        post :create, body: request_body

        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body)['success']).to be true
      end
    end

    context 'with invalid signature' do
      it 'returns unauthorized' do
        request.headers['X-Signature'] = 'invalid_signature'
        post :create, body: request_body

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('Invalid signature')
      end
    end

    context 'with missing signature' do
      it 'returns unauthorized' do
        post :create, body: request_body

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('Invalid signature')
      end
    end

    context 'with empty signature' do
      it 'returns unauthorized' do
        request.headers['X-Signature'] = ''
        post :create, body: request_body

        expect(response).to have_http_status(:unauthorized)
        expect(JSON.parse(response.body)['error']).to eq('Invalid signature')
      end
    end

    context 'with different request body' do
      it 'returns unauthorized when signature does not match body' do
        different_body = { data: 'different' }.to_json
        signature = generate_signature(request_body)

        request.headers['X-Signature'] = signature
        post :create, body: different_body

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'when ENV variable is not set' do
      before do
        allow(BookClient).to receive(:callback_secret).and_return(nil)
      end

      it 'returns unauthorized' do
        signature = generate_signature(request_body)
        request.headers['X-Signature'] = signature
        post :create, body: request_body

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
