# frozen_string_literal: true

module TimelineWorkers
  class PdfGeneratorWorker
    include Sidekiq::Worker

    sidekiq_options retry: 3, queue: :default

    def perform(timeline_id)
      timeline = ::Timeline.find(timeline_id)
      timeline.update!(pdf_status: 'processing', pdf_error: nil)

      pdf_path = TimelinePdf::PdfGenerator.new(timeline).call

      # For now, store the local file path
      # In production, this should upload to S3 and store the S3 URL
      timeline.update!(
        pdf_url: pdf_path.to_s,
        pdf_generated_at: Time.current,
        pdf_status: 'completed',
        pdf_error: nil
      )

      Rails.logger.info "PDF generated successfully for timeline #{timeline_id} at #{pdf_path}"
    rescue TimelinePdf::PdfGenerator::ValidationError => e
      timeline&.update_columns(pdf_status: 'failed', pdf_error: e.message)
      Rails.logger.error "PDF generation validation failed for timeline #{timeline_id}: #{e.message}"
      raise e
    rescue TimelinePdf::PdfGenerator::CompilationError => e
      timeline&.update_columns(pdf_status: 'failed', pdf_error: e.message)
      Rails.logger.error "PDF compilation failed for timeline #{timeline_id}: #{e.message}"
      raise e
    rescue StandardError => e
      timeline&.update_columns(pdf_status: 'failed', pdf_error: e.message)
      Rails.logger.error "PDF generation failed for timeline #{timeline_id}: #{e.class} - #{e.message}"
      raise e
    end
  end
end
