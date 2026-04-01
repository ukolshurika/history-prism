# frozen_string_literal: true

module WorkerErrorHandling
  extend ActiveSupport::Concern

  included do
    sidekiq_options retry: 5

    sidekiq_retries_exhausted do |job, ex|
      Rails.logger.error("[#{job['class']}] exhausted retries for args=#{job['args'].inspect}: #{ex.class} - #{ex.message}")
    end
  end

  private

  def with_worker_error_handling(context = {})
    yield
  rescue StandardError => e
    Rails.logger.error("[#{self.class.name}] failed with #{context.inspect}: #{e.class} - #{e.message}")
    raise
  end
end
