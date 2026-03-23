class PasswordsController < ApplicationController
  allow_unauthenticated_access
  before_action :set_user_by_token, only: %i[edit update]

  def new
    render inertia: 'ForgotPassword'
  end

  def create
    if (user = User.find_by(email: params[:email]))
      UserMailer.password_reset_instructions(user).deliver_later
    end
    render inertia: 'ForgotPassword', props: { sent: true }
  end

  def edit
    render inertia: 'ResetPassword', props: { token: params[:token] }
  end

  def update
    if @user.update(params.permit(:password, :password_confirmation))
      redirect_to new_session_path, notice: 'Пароль успешно изменён. Войдите с новым паролем.'
    else
      redirect_to edit_password_path(params[:token]),
                  alert: @user.errors.full_messages.to_sentence
    end
  end

  private

  def set_user_by_token
    @user = User.find_by_password_reset_token!(params[:token])
  rescue ActiveSupport::MessageVerifier::InvalidSignature
    redirect_to new_password_path, alert: 'Ссылка для сброса пароля недействительна или истекла.'
  end
end
