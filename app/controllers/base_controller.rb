# frozen_string_literal: true

require 'active_storage/service/disk_service'

class BaseController < ActionController::Base
  protect_from_forgery with: :exception

  DEFAULT_LOCALE = 'en'
end
