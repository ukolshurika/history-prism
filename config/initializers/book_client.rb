# frozen_string_literal: true

Rails.application.config.book = Rails.application.config_for(:book)

class BookClient
  class << self
    def key
      config[:api_key]
    end

    def url
      config[:api_url]
    end

    def callback_host
      config[:callback_host]
    end

    def callback_secret
      config[:callback_secret]
    end

    private

    def config
      Rails.application.config.book
    end
  end

  def initialize
    @key = self.class.key
    @url = self.class.url
    @callback_secret = self.class.callback_secret
  end
end
