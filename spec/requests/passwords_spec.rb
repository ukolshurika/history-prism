require 'rails_helper'

RSpec.describe 'Passwords', type: :request do
  describe 'POST /passwords' do
    let!(:user) { create(:user, email: 'person@example.com') }

    it 'always enqueues the reset worker for an existing email' do
      expect {
        post passwords_path, params: { email: user.email }
      }.to change(Passwords::SendResetInstructionsWorker.jobs, :size).by(1)

      expect(Passwords::SendResetInstructionsWorker.jobs.last['args']).to eq([user.email])

      expect(response).to have_http_status(:success)
    end

    it 'enqueues the same worker for a missing email' do
      expect {
        post passwords_path, params: { email: 'missing@example.com' }
      }.to change(Passwords::SendResetInstructionsWorker.jobs, :size).by(1)

      expect(Passwords::SendResetInstructionsWorker.jobs.last['args']).to eq(['missing@example.com'])

      expect(response).to have_http_status(:success)
    end

    it 'normalizes the email before enqueuing' do
      expect {
        post passwords_path, params: { email: '  PERSON@EXAMPLE.COM  ' }
      }.to change(Passwords::SendResetInstructionsWorker.jobs, :size).by(1)

      expect(Passwords::SendResetInstructionsWorker.jobs.last['args']).to eq(['person@example.com'])
    end
  end
end
