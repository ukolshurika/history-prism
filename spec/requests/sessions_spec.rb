require 'rails_helper'
require 'time'

RSpec.describe 'Sessions', type: :request do
  describe 'POST /session' do
    let(:user) do
      create(:user,
             email: 'ttl@example.com',
             password: 'TestPassword123',
             password_confirmation: 'TestPassword123',
             confirmed_at: Time.current)
    end

    it 'sets a finite expiration on the session cookie' do
      Timecop.freeze(Time.zone.local(2026, 3, 27, 12, 0, 0)) do
        post session_path, params: { email: user.email, password: 'TestPassword123' }

        expect(response).to redirect_to(root_path)

        set_cookie = response.headers['Set-Cookie']
        expires_at = Time.httpdate(set_cookie[/expires=([^;]+)/i, 1])

        expect(expires_at).to be_within(1.second).of(Session::SESSION_TTL.from_now.utc)
      end
    end
  end

  describe 'expired session handling' do
    let(:user) { create(:user, confirmed_at: Time.current) }
    let!(:expired_session) do
      user.sessions.create!(user_agent: 'RSpec', ip_address: '127.0.0.1').tap do |session|
        session.update_column(:created_at, Session::SESSION_TTL.ago - 1.minute)
      end
    end

    it 'rejects expired sessions and removes them' do
      cookies.signed[:session_id] = expired_session.id

      expect {
        get timelines_path
      }.to change(Session, :count).by(-1)

      expect(response).to redirect_to(new_session_path)
      expect(cookies[:session_id]).to be_nil
    end
  end
end
