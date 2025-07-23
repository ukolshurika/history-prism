# frozen_string_literal: true

module FaradayClient
  VERBOSE = ENV['LOG_FARADAY'].present?

  module_function

  def json(url, **opts)
    Faraday.new(url, opts) do |faraday|
      faraday.request :json
      faraday.response :logger, ::Logger.new($stdout), bodies: true if VERBOSE
      yield faraday if block_given?
      faraday.response :json, content_type: /\bjson$/
      faraday.adapter Faraday.default_adapter
    end
  end
end
