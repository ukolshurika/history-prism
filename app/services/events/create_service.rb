# frozen_string_literal: true

module Events
  class CreateService
    Result = Struct.new(:event, :timeline, keyword_init: true)

    def initialize(user:, params:)
      @user = user
      @params = params.to_h.deep_symbolize_keys
    end

    def call
      ActiveRecord::Base.transaction do
        event = user.events.build(base_attributes)
        assign_fuzzy_date(event, :start_date, params[:start_date_attributes])
        assign_fuzzy_date(event, :end_date, params[:end_date_attributes])
        event.save!

        Result.new(event: event, timeline: update_timeline_cache(event))
      end
    end

    private

    attr_reader :user, :params

    def base_attributes
      params.except(:start_date, :end_date, :start_date_attributes, :end_date_attributes, :timeline_id)
    end

    def assign_fuzzy_date(event, association_name, attrs)
      return unless attrs.present?
      return unless attrs[:year].present?

      event.public_send("#{association_name}=", create_fuzzy_date(attrs))
    end

    def create_fuzzy_date(attrs)
      date_parts = []
      date_parts << attrs[:year] if attrs[:year].present?
      date_parts << attrs[:month].to_s.rjust(2, '0') if attrs[:month].present?
      date_parts << attrs[:day].to_s.rjust(2, '0') if attrs[:day].present?

      FuzzyDate.create!(
        original_text: date_parts.join('-'),
        year: attrs[:year].presence&.to_i,
        month: attrs[:month].presence&.to_i,
        day: attrs[:day].presence&.to_i,
        date_type: attrs[:date_type].presence || 'exact',
        calendar_type: attrs[:calendar_type].presence || 'gregorian'
      )
    end

    def update_timeline_cache(event)
      return unless params[:timeline_id].present?

      timeline = Timeline.find(params[:timeline_id])
      category_key = event.category.to_s

      timeline.with_lock do
        cached_events = timeline.cached_events_for_display || {}
        current_events = Array(cached_events[category_key])

        timeline.update!(
          cached_events_for_display: cached_events.merge(
            category_key => (current_events + [event.id]).uniq
          )
        )
      end

      timeline
    end
  end
end
