# frozen_string_literal: true

module SignatureValidation
  extend ActiveSupport::Concern

  included do
    before_action :validate_signature!
  end

  private

  def validate_signature!
    signature = request.headers['X-Signature']
    expected_signature = compute_signature(request.raw_post)

    unless ActiveSupport::SecurityUtils.secure_compare(signature.to_s, expected_signature)
      render json: { error: 'Invalid signature' }, status: :unauthorized
    end
  end

  def compute_signature(body)
    OpenSSL::HMAC.hexdigest('SHA256', callback_secret, body)
  end

  def callback_secret
    BookClient.callback_secret
  end
end
