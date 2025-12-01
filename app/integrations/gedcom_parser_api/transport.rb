# frozen_string_literal: true

module GedcomParserApi
  class Transport
    Error = Class.new GedcomParserApi::Error
    ClientError = Class.new Error

    class << self
      delegate :get, :post, :put, to: :http

      def message(response)
        body = response.body
        error = (body.is_a?(Hash) && body['error'].presence) || body.to_s
        "#{response.status} #{error}".strip
      end

      %i[get post put delete].each do |method|
        define_method method do |*args|
          response = http.public_send(method, *args)
          raise ClientError, message(response) unless response.success?

          response
        rescue Faraday::Error => e
          raise Error, e.message
        end
      end

      private

      def http
        logger = Logger.new(STDOUT)

        @http ||= FaradayClient.json(GedcomClient.url) do |conn|
          conn.use SignatureMiddleware
          conn.response :detailed_logger, logger
        end
      end

      class SignatureMiddleware < ::Faraday::Middleware
        def call(env)
          p GedcomClient.key
          p data(env)
          p OpenSSL::HMAC.hexdigest(
            'SHA256',
            GedcomClient.key,
            data(env)
          )
          env[:request_headers]['X-Signature'] = OpenSSL::HMAC.hexdigest(
            'SHA256',
            GedcomClient.key,
            data(env)
          )
          @app.call env
        end

        def data(env)
          return env.url.request_uri if env.method == :get

          env[:body].to_s
        end
      end
    end
  end
end
