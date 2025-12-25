# frozen_string_literal: true

module TimelinePdf
  class EventGrouper
    def initialize(timeline)
      @timeline = timeline
      @serializer = TimelineSerializer.new(timeline)
    end

    def call
      group_events_by_year
    end

    private

    attr_reader :timeline, :serializer

    def group_events_by_year
      grouped = Hash.new { |h, k| h[k] = { personal: [], local: [], world: [], total_count: 0 } }

      categorized_events = serializer.categorized_events

      # Process personal events
      categorized_events[:personal]&.each do |event|
        add_event_to_year(grouped, event, :personal)
      end

      # Process local events
      categorized_events[:local]&.each do |event|
        add_event_to_year(grouped, event, :local)
      end

      # Process world events
      categorized_events[:world]&.each do |event|
        add_event_to_year(grouped, event, :world)
      end

      # Calculate overflow flags
      grouped.each do |year, data|
        data[:has_overflow] = data[:total_count] > 2
      end

      grouped.sort.to_h
    end

    def add_event_to_year(grouped, event, category)
      start_year = event[:start_year]
      end_year = event[:end_year]

      return unless start_year

      # Add event to start year
      event_copy = event.dup
      event_copy[:is_start] = true
      event_copy[:is_end] = false

      if event[:is_multi_year] && end_year && end_year != start_year
        # Multi-year event: add marker for start
        event_copy[:display_title] = ">> #{event[:title]}"
        grouped[start_year][category] << event_copy
        grouped[start_year][:total_count] += 1

        # Add event to end year with different marker
        event_end_copy = event.dup
        event_end_copy[:is_start] = false
        event_end_copy[:is_end] = true
        event_end_copy[:display_title] = "<< #{event[:title]}"
        grouped[end_year][category] << event_end_copy
        grouped[end_year][:total_count] += 1
      else
        # Single year event
        event_copy[:display_title] = event[:title]
        grouped[start_year][category] << event_copy
        grouped[start_year][:total_count] += 1
      end
    end
  end
end
