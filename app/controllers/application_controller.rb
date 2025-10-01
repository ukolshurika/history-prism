# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Authentication
  include InertiaRails::Controller

  before_action :set_layout

  def set_layout
    return 'application'

    @layout = user_signed_in? ? 'application' : 'authentication'
  end

end
