# frozen_string_literal: true

namespace :timeline do
  desc "Cleanup old PDF temporary files (older than 24 hours)"
  task cleanup_pdf_exports: :environment do
    dir = Rails.root.join('tmp', 'pdf_exports')
    cutoff = 24.hours.ago

    return unless Dir.exist?(dir)

    cleaned_count = 0
    Dir.glob(dir.join('timeline_*')).each do |timeline_dir|
      next unless File.directory?(timeline_dir)

      if File.mtime(timeline_dir) < cutoff
        FileUtils.rm_rf(timeline_dir)
        puts "Removed: #{timeline_dir}"
        cleaned_count += 1
      end
    end

    puts "Cleanup complete. Removed #{cleaned_count} directory/directories."
  end
end
