require 'rails_helper'

RSpec.describe 'Passwords', type: :request do
  include ActiveJob::TestHelper

  before { clear_enqueued_jobs }

  describe 'POST /passwords' do
    let!(:user) { create(:user, email: 'person@example.com') }

    it 'always enqueues the reset job for an existing email' do
      expect {
        post passwords_path, params: { email: user.email }
      }.to have_enqueued_job(Passwords::SendResetInstructionsJob).with(user.email)

      expect(response).to have_http_status(:success)
    end

    it 'enqueues the same job for a missing email' do
      expect {
        post passwords_path, params: { email: 'missing@example.com' }
      }.to have_enqueued_job(Passwords::SendResetInstructionsJob).with('missing@example.com')

      expect(response).to have_http_status(:success)
    end

    it 'normalizes the email before enqueuing' do
      expect {
        post passwords_path, params: { email: '  PERSON@EXAMPLE.COM  ' }
      }.to have_enqueued_job(Passwords::SendResetInstructionsJob).with('person@example.com')
    end
  end
end
