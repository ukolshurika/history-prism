require 'rails_helper'

RSpec.describe 'Registration', type: :request do
  describe 'GET /registration/new' do
    it 'renders the registration page' do
      get new_registration_path
      expect(response).to have_http_status(:success)
    end
  end

  describe 'POST /registration' do
    let(:valid_params) do
      {
        user: {
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        }
      }
    end

    context 'with valid parameters' do
      it 'creates a new user' do
        expect {
          post registration_path, params: valid_params
        }.to change(User, :count).by(1)
        expect(response).to redirect_to(root_path)
        expect(User.last.email).to eq('test@example.com')
      end
    end

    shared_examples 'invalid parms response' do
      it 'does not create a new user' do
        expect {
          post registration_path, params: invalid_params
        }.not_to change(User, :count)
        expect(response).to have_http_status(:success)
      end
    end

    context 'with invalid parameters' do
      let(:invalid_params) do
        {
          user: {
            email: 'invalid',
            password: 'short',
            password_confirmation: 'different'
          }
        }
      end

      it_behaves_like 'invalid parms response'
    end

    context 'with mismatched password confirmation' do
      let(:invalid_params) do
        {
          user: {
            email: 'test@example.com',
            password: 'password123',
            password_confirmation: 'different123'
          }
        }
      end

      it_behaves_like 'invalid parms response'
    end

    context 'with duplicate email' do
      let(:invalid_params) { valid_params }
      before do
        User.create!(
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        )
      end

      it_behaves_like 'invalid parms response'
    end
  end
end
