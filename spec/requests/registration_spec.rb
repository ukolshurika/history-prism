require 'rails_helper'

RSpec.describe 'Registration', type: :request do
  describe 'GET /registration/new' do
    it 'renders the registration page' do
      get new_registration_path
      expect(response).to have_http_status(:success)
      expect(response.headers['X-Inertia']).to eq('true')
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
      end

      it 'redirects to root path' do
        post registration_path, params: valid_params
        expect(response).to redirect_to(root_path)
      end

      it 'creates a user with correct email' do
        post registration_path, params: valid_params
        expect(User.last.email).to eq('test@example.com')
      end

      it 'starts a new session for the user' do
        post registration_path, params: valid_params
        expect(session[:user_id]).to eq(User.last.id)
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

      it 'does not create a new user' do
        expect {
          post registration_path, params: invalid_params
        }.not_to change(User, :count)
      end

      it 'renders the registration page' do
        post registration_path, params: invalid_params
        expect(response).to have_http_status(:success)
        expect(response.headers['X-Inertia']).to eq('true')
      end
    end

    context 'with mismatched password confirmation' do
      let(:mismatched_params) do
        {
          user: {
            email: 'test@example.com',
            password: 'password123',
            password_confirmation: 'different123'
          }
        }
      end

      it 'does not create a new user' do
        expect {
          post registration_path, params: mismatched_params
        }.not_to change(User, :count)
      end
    end

    context 'with duplicate email' do
      before do
        User.create!(
          email: 'existing@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        )
      end

      it 'does not create a duplicate user' do
        expect {
          post registration_path, params: valid_params.merge(user: { email: 'existing@example.com', password: 'password123', password_confirmation: 'password123' })
        }.not_to change(User, :count)
      end
    end
  end
end
