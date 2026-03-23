class UserMailer < ApplicationMailer
  def confirmation_instructions(user)
    @user = user
    @token = user.generate_token_for(:email_confirmation)
    mail(to: user.email, subject: 'Подтвердите ваш email — History Prism')
  end

  def password_reset_instructions(user)
    @user = user
    @token = user.generate_password_reset_token
    mail(to: user.email, subject: 'Сброс пароля — History Prism')
  end
end
