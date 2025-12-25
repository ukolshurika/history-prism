# frozen_string_literal: true

module TimelineWorkers
  class PdfGeneratorWorker
    include Sidekiq::Worker

    sidekiq_options retry: 3, queue: :default

    def perform(timeline_id)
      timeline = ::Timeline.find(timeline_id)

      pdf_path = TimelinePdf::PdfGenerator.new(timeline).call

      # For now, store the local file path
      # In production, this should upload to S3 and store the S3 URL
      timeline.update!(
        pdf_url: pdf_path.to_s,
        pdf_generated_at: Time.current
      )

      Rails.logger.info "PDF generated successfully for timeline #{timeline_id} at #{pdf_path}"
    rescue TimelinePdf::PdfGenerator::ValidationError => e
      Rails.logger.error "PDF generation validation failed for timeline #{timeline_id}: #{e.message}"
      raise e
    rescue TimelinePdf::PdfGenerator::CompilationError => e
      Rails.logger.error "PDF compilation failed for timeline #{timeline_id}: #{e.message}"
      raise e
    rescue StandardError => e
      Rails.logger.error "PDF generation failed for timeline #{timeline_id}: #{e.class} - #{e.message}"
      raise e
    end
  end
end
