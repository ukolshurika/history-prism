#frozen_string_literal: true

class RegistrationController < ApplicationController
  allow_unauthenticated_access

  def new
    render inertia: 'Registration', props: {}
  end

  def create
    user = User.new(user_params)
    if user.save
      UserMailer.confirmation_instructions(user).deliver_later
      session[:pending_confirmation_email] = user.email
      redirect_to new_confirmation_path, notice: 'Регистрация успешна! Проверьте почту для подтверждения.'
    else
      render inertia: 'Registration', props: {
        errors: user.errors.full_messages
      }
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end