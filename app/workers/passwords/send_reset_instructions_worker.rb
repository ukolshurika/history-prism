# frozen_string_literal: true

module Passwords
  class SendResetInstructionsWorker
    include Sidekiq::Worker

    sidekiq_options queue: :default

    def perform(email)
      return if email.blank?

      user = User.find_by(email: email)
      return unless user

      UserMailer.password_reset_instructions(user).deliver_now
    end
  end
end
