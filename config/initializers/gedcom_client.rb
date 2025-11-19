# frozen_string_literal: true

Rails.application.config.gedcom = Rails.application.config_for(:gedcom)

class GedcomClient
  class << self
    def key
      config[:api_key]
    end

    def url
      config[:api_url]
    end

    def callback_url
      config[:callback_url]
    end

    private

    def config
      Rails.application.config.gedcom
    end
  end

  def initialize
    @key = self.class.key
    @url = self.class.url
    @callback_url = self.class.callback_url
  end
end
