#frozen_string_literal: true

class RegistrationController < ApplicationController
  allow_unauthenticated_access

  def new
    render inertia: 'Registration', props: {}
  end

  def create
    @user = User.new(user_params)
    if @user.save
      start_new_session_for @user
      redirect_to root_path, notice: 'Successfully signed up!'
    else
      render inertia: 'Registration', props: {
        errors: @user.errors.full_messages
      }
    end
  end

  private

  def user_params
    params.require(:user).permit(:email_address, :password, :password_confirmation)
  end
end