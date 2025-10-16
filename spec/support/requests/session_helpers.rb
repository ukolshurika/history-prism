# frozen_string_literal: true

module Requests
  module SessionHelpers
    def log_in_as_user(user = nil)
      (user || create(:user, password: 'TestPassword123', password_confirmation: 'TestPassword123'))
        .tap do |u|

        post session_path, params: { email: u.email, password: 'TestPassword123' }
        expect(response).to redirect_to('/')
      end
    end

    def log_in_as_admin
      admin = create(:user, :admin, password: 'TestPassword123', password_confirmation: 'TestPassword123')
      log_in_as_user admin
    end
  end
end

RSpec.configure { |config| config.include Requests::SessionHelpers, type: :request }
