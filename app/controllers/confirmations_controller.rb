# frozen_string_literal: true

class ConfirmationsController < ApplicationController
  allow_unauthenticated_access

  def new
    email = session.delete(:pending_confirmation_email)
    render inertia: 'ConfirmEmail', props: { email: email }
  end

  def create
    user = User.find_by(email: params[:email])
    if user && !user.confirmed?
      UserMailer.confirmation_instructions(user).deliver_later
    end
    render inertia: 'ConfirmEmail', props: { email: params[:email], sent: true }
  end

  def update
    user = User.find_by_token_for(:email_confirmation, params[:token])
    if user
      user.update!(confirmed_at: Time.current)
      redirect_to new_session_path, notice: 'Email подтверждён! Теперь вы можете войти.'
    else
      redirect_to new_confirmation_path, alert: 'Ссылка недействительна или истекла. Запросите новое письмо.'
    end
  end
end
