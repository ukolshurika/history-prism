# frozen_string_literal: true

require 'open3'
require 'timeout'

module TimelinePdf
  class PdfGenerator
    class ValidationError < StandardError; end
    class CompilationError < StandardError; end
    COMPILATION_TIMEOUT = 60

    def initialize(timeline)
      @timeline = timeline
      @timestamp = Time.current.strftime('%Y%m%d%H%M%S')
    end

    def call
      validate!
      prepare_directory
      grouped_events = group_events
      latex_content = generate_latex(grouped_events)
      write_latex_file(latex_content)
      compile_latex
      pdf_path
    rescue StandardError => e
      cleanup_files(keep_for_debug: true)
      raise e
    end

    private

    attr_reader :timeline, :timestamp

    def validate!
      raise ValidationError, "Timeline has no events" if timeline.cached_events_for_display.blank?
      raise ValidationError, "Timeline has no start date" if timeline.start_at.nil?
      raise ValidationError, "Timeline has no end date" if timeline.end_at.nil?
      raise ValidationError, "Timeline date range is invalid" if timeline.start_at > timeline.end_at
    end

    def prepare_directory
      FileUtils.mkdir_p(work_dir)
    end

    def group_events
      EventGrouper.new(timeline).call
    end

    def generate_latex(grouped_events)
      LatexTemplate.new(timeline, grouped_events).generate
    end

    def write_latex_file(content)
      File.write(tex_path, content)
    end

    def compile_latex
      # Compile twice for proper references
      2.times do
        stdout, stderr, status = run_pdflatex

        unless status.success?
          log_content = File.exist?(log_path) ? File.read(log_path) : "No log file found"
          output = [stdout, stderr].reject(&:blank?).join("\n")
          raise CompilationError, "LaTeX compilation failed. Check log: #{log_path}\n#{log_content.lines.last(20).join}\n#{output}".strip
        end
      end

      raise CompilationError, "PDF file was not created" unless File.exist?(pdf_path)

      cleanup_files(keep_for_debug: false)
    rescue Timeout::Error
      raise CompilationError, "LaTeX compilation timed out after #{COMPILATION_TIMEOUT} seconds"
    end

    def cleanup_files(keep_for_debug: false)
      if keep_for_debug
        # Keep .tex and .log for debugging
        FileUtils.rm_f(aux_path) if File.exist?(aux_path)
      else
        # Clean up auxiliary files after successful compilation
        FileUtils.rm_f(aux_path) if File.exist?(aux_path)
        FileUtils.rm_f(log_path) if File.exist?(log_path)
        FileUtils.rm_f(tex_path) if File.exist?(tex_path)
      end
    end

    def work_dir
      @work_dir ||= Rails.root.join('tmp', 'pdf_exports', "timeline_#{timeline.id}")
    end

    def run_pdflatex
      Timeout.timeout(COMPILATION_TIMEOUT) do
        Open3.capture3(
          'pdflatex',
          '-interaction=nonstopmode',
          '-halt-on-error',
          tex_filename,
          chdir: work_dir.to_s
        )
      end
    end

    def base_filename
      @base_filename ||= "timeline_#{timeline.id}_#{timestamp}"
    end

    def tex_filename
      "#{base_filename}.tex"
    end

    def tex_path
      work_dir.join(tex_filename)
    end

    def pdf_path
      work_dir.join("#{base_filename}.pdf")
    end

    def log_path
      work_dir.join("#{base_filename}.log")
    end

    def aux_path
      work_dir.join("#{base_filename}.aux")
    end
  end
end
