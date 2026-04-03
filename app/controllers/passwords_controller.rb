class PasswordsController < ApplicationController
  allow_unauthenticated_access
  before_action :set_user_by_token, only: %i[edit update]

  def new
    render inertia: 'ForgotPassword'
  end

  def create
    Passwords::SendResetInstructionsJob.perform_later(normalized_email)
    render inertia: 'ForgotPassword', props: { sent: true }
  end

  def edit
    render inertia: 'ResetPassword', props: { token: params[:token] }
  end

  def update
    if @user.update(params.permit(:password, :password_confirmation))
      redirect_to new_session_path, notice: t('passwords.update.success')
    else
      redirect_to edit_password_path(params[:token]),
                  alert: @user.errors.full_messages.to_sentence
    end
  end

  private

  def set_user_by_token
    @user = User.find_by_token_for(:password_reset, params[:token])
    raise ActiveSupport::MessageVerifier::InvalidSignature if @user.blank?
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    redirect_to new_password_path, alert: t('passwords.invalid_token')
  end

  def normalized_email
    params[:email].to_s.strip.downcase
  end
end
