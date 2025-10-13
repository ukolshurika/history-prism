# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Authentication
  include InertiaRails::Controller
  include Pundit::Authorization

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  inertia_share do
        {
          flash: {
            notice: flash.notice,
            alert: flash.alert
          },
          current_user: Current.user&.slice(:id, :email)
        }
      end

  before_action :set_layout

  def set_layout
    return 'application'

    # @layout = user_signed_in? ? 'application' : 'authentication'
  end

  private

  def current_user
    @current_user ||= User.find(Current.session.user_id)
  end

  def user_not_authorized
    flash[:alert] = 'You are not authorized to perform this action.'
    redirect_back(fallback_location: root_path)
  end

end
