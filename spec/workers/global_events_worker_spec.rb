# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GlobalEventsWorker, type: :worker do
  let(:user) { create(:user) }
  let(:person) { create(:person, user: user) }
  let(:timeline) do
    create(:timeline, person: person, user: user,
                      start_at: Date.new(1900, 1, 1),
                      end_at: Date.new(1950, 12, 31))
  end
  let(:worker) { described_class.new }

  def event_for_year(year, **attrs)
    fd = create(:fuzzy_date, year: year)
    create(:event, start_date: fd, end_date: fd, **attrs)
  end

  describe '#perform' do
    context 'when global events exist within the date range' do
      let!(:world_event) { event_for_year(1920, category: :world) }
      let!(:country_event) { event_for_year(1930, category: :country) }
      let!(:old_world_event) { event_for_year(1800, category: :world) }

      it 'adds in-range world and country events to cached_events_for_display' do
        worker.perform(timeline.id)
        timeline.reload

        expect(timeline.cached_events_for_display['world']).to include(world_event.id)
        expect(timeline.cached_events_for_display['country']).to include(country_event.id)
        expect(timeline.cached_events_for_display['world']).not_to include(old_world_event.id)
      end
    end

    context 'when timeline has no start_at date' do
      let(:timeline) { create(:timeline, person: person, user: user, start_at: nil, end_at: nil) }
      let!(:person_event) do
        fd = create(:fuzzy_date, year: 1900)
        create(:event, start_date: fd, end_date: fd, category: :person, creator: user, people: [person])
      end
      let!(:world_event) { event_for_year(1910, category: :world) }

      it 'falls back to person events to determine the date range' do
        worker.perform(timeline.id)
        timeline.reload

        expect(timeline.cached_events_for_display['world']).to include(world_event.id)
      end
    end

    context 'when no date range can be determined' do
      let(:timeline) { create(:timeline, person: person, user: user, start_at: nil, end_at: nil) }

      it 'returns early without modifying cached_events_for_display' do
        expect { worker.perform(timeline.id) }
          .not_to change { timeline.reload.cached_events_for_display }
      end
    end
  end
end
