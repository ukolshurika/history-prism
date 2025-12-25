# frozen_string_literal: true

namespace :events do
  desc 'Import Russian history events from JSON file (17th-21st centuries)'
  task import_russian_history: :environment do
    puts "\n=========================================="
    puts "Russian History Events Import Task"
    puts "==========================================\n"

    # Configuration
    json_file_path = Rails.root.join('events_data', 'russia_history_17_21.json')

    # Check if file exists
    unless File.exist?(json_file_path)
      puts "ERROR: JSON file not found at: #{json_file_path}"
      exit 1
    end

    # Get the user who will be the creator of these events
    # You can modify this to use a specific user
    creator = User.first
    unless creator
      puts "ERROR: No users found in database. Please create a user first."
      exit 1
    end

    puts "Import Configuration:"
    puts "  - JSON File: #{json_file_path}"
    puts "  - Creator: #{creator.email} (ID: #{creator.id})"
    puts "\n"

    # Read and parse JSON
    begin
      json_data = File.read(json_file_path)
      events_data = JSON.parse(json_data)
      puts "Successfully loaded #{events_data.size} events from JSON file\n"
    rescue JSON::ParserError => e
      puts "ERROR: Failed to parse JSON file: #{e.message}"
      exit 1
    end

    # Statistics tracking
    stats = {
      total: events_data.size,
      created: 0,
      skipped: 0,
      errors: 0
    }

    # Import events with transaction
    ActiveRecord::Base.transaction do
      events_data.each_with_index do |event_data, index|
        begin
          # Map JSON type to Rails category enum
          category = map_category(event_data['type'])

          # Create FuzzyDate for start_date
          start_date = create_fuzzy_date_for_event(
            year: event_data['year_start'],
            year_end: event_data['year_end'],
            original_text: build_date_text(event_data)
          )

          # Create FuzzyDate for end_date (if year_end exists)
          end_date = if event_data['year_end']
                       create_fuzzy_date_for_event(
                         year: event_data['year_end'],
                         year_end: nil,
                         original_text: build_end_date_text(event_data)
                       )
                     else
                       start_date # Same as start_date if no end year
                     end

          # Check if event already exists (to avoid duplicates)
          existing_event = Event.find_by(
            title: event_data['name'],
            category: category,
            start_date: start_date
          )

          if existing_event
            puts "[#{index + 1}/#{stats[:total]}] SKIPPED: '#{event_data['name']}' (already exists)"
            stats[:skipped] += 1
            next
          end

          # Create the Event
          event = Event.create!(
            title: event_data['name'],
            description: build_description(event_data),
            category: category,
            creator: creator,
            start_date: start_date,
            end_date: end_date
          )

          puts "[#{index + 1}/#{stats[:total]}] CREATED: '#{event.title}' (#{event.category})"
          stats[:created] += 1

        rescue StandardError => e
          puts "[#{index + 1}/#{stats[:total]}] ERROR: Failed to import '#{event_data['name']}'"
          puts "  Reason: #{e.message}"
          stats[:errors] += 1

          # Optionally: rollback and exit on first error
          # raise e
        end
      end
    end

    # Print summary
    puts "\n=========================================="
    puts "Import Summary"
    puts "==========================================\n"
    puts "Total events in file: #{stats[:total]}"
    puts "Successfully created: #{stats[:created]}"
    puts "Skipped (duplicates): #{stats[:skipped]}"
    puts "Errors: #{stats[:errors]}"
    puts "\nImport completed!\n"

  rescue StandardError => e
    puts "\nFATAL ERROR: #{e.message}"
    puts e.backtrace.join("\n")
    exit 1
  end

  # Helper method to map JSON type to Rails category enum
  def map_category(type)
    case type
    when 'country'
      :country
    when 'world'
      :world
    when 'local'
      :local
    when 'person'
      :person
    else
      :country # default to country if type is missing
    end
  end

  # Helper method to create FuzzyDate for an event
  def create_fuzzy_date_for_event(year:, year_end:, original_text:)
    # Check if this exact fuzzy date already exists to avoid duplicates
    existing_date = FuzzyDate.find_by(
      year: year,
      year_end: year_end,
      date_type: determine_date_type(year, year_end),
      original_text: original_text
    )

    return existing_date if existing_date

    # Determine the date type based on available information
    date_type = determine_date_type(year, year_end)

    FuzzyDate.create!(
      original_text: original_text,
      year: year,
      year_end: year_end,
      month: nil, # We only have year information
      day: nil,
      date_type: date_type,
      calendar_type: :gregorian
    )
  end

  # Helper method to determine date type
  def determine_date_type(year, year_end)
    if year_end.present?
      :from_to
    else
      :year
    end
  end

  # Helper method to build original_text for start date
  def build_date_text(event_data)
    if event_data['year_end']
      "#{event_data['year_start']}-#{event_data['year_end']}"
    else
      event_data['year_start'].to_s
    end
  end

  # Helper method to build original_text for end date
  def build_end_date_text(event_data)
    event_data['year_end'].to_s
  end

  # Helper method to build event description
  def build_description(event_data)
    description_parts = []

    # Add the event name as the main description
    description_parts << event_data['name']

    # Add time period information
    if event_data['year_end']
      description_parts << "\n\nПериод: #{event_data['year_start']}-#{event_data['year_end']}"
    else
      description_parts << "\n\nГод: #{event_data['year_start']}"
    end

    # Add category/type information
    type_label = case event_data['type']
                 when 'country' then 'Событие национального масштаба'
                 when 'world' then 'Мировое событие'
                 when 'local' then 'Локальное событие'
                 when 'person' then 'Персональное событие'
                 else 'Историческое событие'
                 end
    description_parts << "Категория: #{type_label}"

    # Add country information if available
    if event_data['country']
      description_parts << "Страна: #{event_data['country']}"
    end

    description_parts << "\n\nИсточник: Импортировано из базы данных русской истории XVII-XXI веков"

    description_parts.join("\n")
  end
end
